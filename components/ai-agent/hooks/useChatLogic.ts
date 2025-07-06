import { useCallback } from 'react';
import { knowledgeBase } from '../config/knowledgeBase';
import { recoveryKnowledgeBase } from '../config/recoveryKnowledge';
import type { Message, AudioConfig, RecoveryData, ActivityData, Link, NutritionData } from '../types';

interface UseChatLogicProps {
  audioConfig: AudioConfig;
  recoveryData: RecoveryData;
  setRecoveryData: React.Dispatch<React.SetStateAction<RecoveryData>>;
  setActivityData: React.Dispatch<React.SetStateAction<ActivityData | null>>;
  connectAppleHealth: () => Promise<boolean>;
}

export const useChatLogic = ({
  audioConfig,
  recoveryData,
  setRecoveryData,
  setActivityData,
  connectAppleHealth
}: UseChatLogicProps) => {
  const voiceRssKey = process.env.NEXT_PUBLIC_VOICERSS_KEY || '';
  const nutritionixAppId = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_ID || '';
  const nutritionixAppKey = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_KEY || '';

  // Text-to-speech function
  const speak = useCallback(async (text: string) => {
    if (!audioConfig.enabled || !text.trim() || !voiceRssKey) return;

    try {
      const audio = new Audio();
      const url = `https://api.voicerss.org/?key=${voiceRssKey}&hl=ru-ru&v=${audioConfig.voice}&src=${encodeURIComponent(text)}`;
      audio.src = url;
      await audio.play();
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  }, [audioConfig, voiceRssKey]);

  // Calculate recovery score
  const calculateRecoveryScore = useCallback(() => {
    const now = new Date();
    const sleepQuality = Math.min(1, recoveryData.sleepHours / 8) * 40;
    
    const hoursSinceWorkout = recoveryData.lastWorkout
      ? (now.getTime() - recoveryData.lastWorkout.getTime()) / (1000 * 60 * 60)
      : 48;
    const workoutRecovery = (Math.min(hoursSinceWorkout, 72) / 72) * 30;

    const hoursSinceMeal = recoveryData.lastMeal
      ? (now.getTime() - recoveryData.lastMeal.getTime()) / (1000 * 60 * 60)
      : 3;
    const nutritionFactor = (1 - Math.min(hoursSinceMeal, 6) / 6) * 15;

    const waterFactor = (Math.min(recoveryData.waterIntake, 3000) / 3000) * 10;
    const stressFactor = (1 - (recoveryData.stressLevel - 1) / 4) * 5;

    const score = Math.round(Math.min(100,
      sleepQuality + workoutRecovery + nutritionFactor + waterFactor + stressFactor
    ));

    setRecoveryData(prev => ({ ...prev, recoveryScore: score }));
    return score;
  }, [recoveryData, setRecoveryData]);

  // Get nutrition info
  const getNutritionInfo = useCallback(async (query: string): Promise<NutritionData | null> => {
    if (!nutritionixAppId || !nutritionixAppKey) {
      console.error("Missing Nutritionix API keys");
      return null;
    }

    const foodDictionary: Record<string, string> = {
      'яблоко': 'apple',
      'банан': 'banana',
      'гречка': 'buckwheat',
      'куриная грудка': 'chicken breast',
      'говядина': 'beef',
      'рис': 'rice',
      'овсянка': 'oatmeal',
      'творог': 'cottage cheese',
      'яйцо': 'egg',
      'молоко': 'milk'
    };

    const normalizedQuery = query.trim().toLowerCase();
    const englishQuery = foodDictionary[normalizedQuery] || normalizedQuery;

    try {
      const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': nutritionixAppId,
          'x-app-key': nutritionixAppKey
        },
        body: JSON.stringify({
          query: englishQuery,
          timezone: "UTC"
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data?.foods?.length) {
        return null;
      }

      return {
        ...data.foods[0],
        food_name: query
      };
    } catch (error) {
      console.error("Nutrition API error:", error);
      return null;
    }
  }, [nutritionixAppId, nutritionixAppKey]);

  // Find trainer by specialty
  const findTrainerBySpecialty = useCallback((text: string) => {
    const specialtyMap: Record<string, keyof typeof knowledgeBase.trainers> = {
      'йога': 'anna-petrova',
      'силов': 'mikhail-volkov',
      'похуд': 'elena-smirnova',
      'функциональ': 'dmitriy-kozlov',
      'групп': 'olga-ivanova'
    };

    for (const [key, trainerId] of Object.entries(specialtyMap)) {
      if (text.includes(key)) {
        return knowledgeBase.trainers[trainerId];
      }
    }
    return null;
  }, []);

  // Generate bot response
  const generateBotResponse = useCallback(async (text: string): Promise<Message> => {
    const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    let responseText = "";
    let suggestions: string[] = [];
    let links: Link[] = [];

    // Nutrition queries
    if (text.match(/(калории|питание|еда|белк|жир|углев)/i)) {
      const foodQuery = text.replace(/(калории|питание|еда|сколько|в)/gi, '').trim();
      
      if (foodQuery) {
        const nutrition = await getNutritionInfo(foodQuery);
        
        if (nutrition) {
          responseText = `🍏 Пищевая ценность "${nutrition.food_name}":\n`
            + `🔹 Калории: ${Math.round(nutrition.nf_calories)} ккал\n`
            + `🔹 Белки: ${Math.round(nutrition.nf_protein)}г\n`
            + `🔹 Жиры: ${Math.round(nutrition.nf_total_fat)}г\n`
            + `🔹 Углеводы: ${Math.round(nutrition.nf_total_carbohydrate)}г`;
          
          suggestions = ["Дневная норма калорий", "Белковые продукты"];
        } else {
          responseText = "😕 Не удалось получить данные о питании. Попробуйте уточнить запрос.";
        }
      } else {
        responseText = "Укажите продукт для анализа";
        suggestions = ["Калории в банане", "Белки в твороге"];
      }
    }
    // Trainer queries
    else if (text.includes('тренер')) {
      const trainer = findTrainerBySpecialty(text);
      
      if (trainer) {
        responseText = `Рекомендую ${trainer.name}! ${trainer.description}. Цена ${trainer.price}`;
      } else {
        responseText = "У нас 6 профессиональных тренеров. Расскажите о ваших целях?";
        suggestions = ["Похудеть", "Набрать массу", "Йога"];
      }
    }
    // Recovery queries
    else if (text.includes('восстановлен') || text.includes('сон') || text.includes('вода')) {
      if (text.includes('записать сон')) {
        const hoursMatch = text.match(/(\d+[,.]?\d*)/);
        const hours = hoursMatch ? parseFloat(hoursMatch[0].replace(',', '.')) : null;
        
        if (hours) {
          setRecoveryData(prev => ({ ...prev, sleepHours: hours }));
          calculateRecoveryScore();
          responseText = `✅ Записал сон: ${hours} часов`;
        } else {
          responseText = "Укажите количество часов сна";
        }
      } else {
        responseText = `Ваш уровень восстановления: ${recoveryData.recoveryScore}/100`;
      }
    }
    // Default response
    else {
      responseText = "Я могу помочь с тренерами, программами тренировок, питанием и восстановлением.";
      suggestions = ["Тренеры", "Программы", "Питание"];
    }

    return {
      id: generateId(),
      text: responseText,
      isBot: true,
      timestamp: new Date(),
      suggestions,
      links
    };
  }, [getNutritionInfo, findTrainerBySpecialty, recoveryData, setRecoveryData, calculateRecoveryScore]);

  return {
    generateBotResponse,
    speak,
    calculateRecoveryScore
  };
};