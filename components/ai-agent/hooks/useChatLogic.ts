// components/ai-agent/hooks/useChatLogic.ts

import { useCallback, useState } from 'react';
import { knowledgeBase } from '../config/knowledgeBase';
import { recoveryKnowledgeBase } from '../config/recoveryKnowledge';
import type { Message, AudioConfig, RecoveryData, ActivityData, Link, NutritionData, Trainer } from '../types';
import { Heart, Dumbbell, Zap, Target, Users, Star, Moon, Droplet, AlertCircle, Activity, Calendar, User, ShoppingBag, CreditCard } from 'lucide-react';
import { useAIShopStore } from '@/stores/aiShopStore';
import { ShopProduct } from '@/types/shopAI';

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
  const [currentContext, setCurrentContext] = useState<{
    trainer?: any;
    program?: any;
  }>({});
  
  // Добавляем shop store
  const { 
    analyzeUserGoals, 
    findProductsByQuery, 
    compareProducts,
    setRecommendations,
    currentProducts 
  } = useAIShopStore();

  const voiceRssKey = process.env.NEXT_PUBLIC_VOICERSS_KEY || '';
  const nutritionixAppId = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_ID || '';
  const nutritionixAppKey = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_KEY || '';

  const resetContext = useCallback(() => {
    setCurrentContext({});
  }, []);

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

  // Get recovery emoji
  const getRecoveryEmoji = (score: number): string => {
    return score < 30 ? "😫" :
      score < 50 ? "😟" :
        score < 70 ? "😐" : "😊";
  };

  // Get recovery tips
  const getRecoveryTips = (data: RecoveryData): string => {
    const tips = [];

    if (data.sleepHours < 7) tips.push("• Старайтесь спать 7-9 часов");
    if (data.waterIntake < 2000) tips.push(`• Пейте больше воды, сегодня выпито: ${data.waterIntake}мл`);
    if (data.stressLevel > 3) tips.push("• Попробуйте техники дыхания для снижения стресса");

    return tips.length ? tips.join('\n') : "Вы отлично восстанавливаетесь! Продолжайте в том же духе!";
  };

  // Get nutrition info
  const getNutritionInfo = useCallback(async (query: string): Promise<NutritionData | null> => {
    if (!nutritionixAppId || !nutritionixAppKey || nutritionixAppId === 'your_id' || nutritionixAppKey === 'your_key') {
      console.warn("Nutritionix API keys not configured, using fallback data");
      return null;
    }

    const foodDictionary: Record<string, string> = {
      'яблоко': 'apple',
      'яблоки': 'apples',
      'банан': 'banana',
      'бананы': 'bananas',
      'гречка': 'buckwheat',
      'куриная грудка': 'chicken breast',
      'курица': 'chicken',
      'говядина': 'beef',
      'рис': 'rice',
      'овсянка': 'oatmeal',
      'овсяная каша': 'oatmeal',
      'творог': 'cottage cheese',
      'яйцо': 'egg',
      'яйца': 'eggs',
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
        console.error(`Nutrition API error: ${response.status} ${response.statusText}`);
        return null;
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
  const findTrainerBySpecialty = useCallback((text: string): Trainer | null => {
    const specialtyMap: Record<string, keyof typeof knowledgeBase.trainers> = {
      'йога': 'anna-petrova',
      'йогу': 'anna-petrova',
      'йоге': 'anna-petrova',
      'стретчинг': 'anna-petrova',
      'растяжка': 'anna-petrova',
      'растяжку': 'anna-petrova',
      'гибкость': 'anna-petrova',
      'силов': 'mikhail-volkov',
      'силу': 'mikhail-volkov',
      'масс': 'mikhail-volkov',
      'массу': 'mikhail-volkov',
      'мышц': 'mikhail-volkov',
      'мышечн': 'mikhail-volkov',
      'качать': 'mikhail-volkov',
      'качалк': 'mikhail-volkov',
      'пауэрлифтинг': 'mikhail-volkov',
      'похуд': 'elena-smirnova',
      'похудеть': 'elena-smirnova',
      'похудение': 'elena-smirnova',
      'сброс': 'elena-smirnova',
      'сбросить': 'elena-smirnova',
      'вес': 'elena-smirnova',
      'кардио': 'elena-smirnova',
      'жир': 'elena-smirnova',
      'жиросжигание': 'elena-smirnova',
      'функциональ': 'dmitriy-kozlov',
      'функциональный': 'dmitriy-kozlov',
      'trx': 'dmitriy-kozlov',
      'реабилит': 'dmitriy-kozlov',
      'восстановление': 'dmitriy-kozlov',
      'травм': 'dmitriy-kozlov',
      'групп': 'olga-ivanova',
      'групповые': 'olga-ivanova',
      'групповых': 'olga-ivanova',
      'аэроб': 'olga-ivanova',
      'зумба': 'olga-ivanova',
      'zumba': 'olga-ivanova',
      'танц': 'olga-ivanova'
    };

    for (const [key, trainerId] of Object.entries(specialtyMap)) {
      if (text.includes(key)) {
        return knowledgeBase.trainers[trainerId];
      }
    }
    return null;
  }, []);

  // Handle recovery command
  const handleRecoveryCommand = (command: string, params?: any): string => {
    switch (command) {
      case 'log_sleep':
        setRecoveryData(prev => ({
          ...prev,
          sleepHours: params?.hours || prev.sleepHours
        }));
        return `Записал сон: ${params?.hours || recoveryData.sleepHours} часов`;

      case 'log_water':
        setRecoveryData(prev => ({
          ...prev,
          waterIntake: prev.waterIntake + (params?.ml || 0)
        }));
        return `Добавлено ${params?.ml} мл воды. Всего сегодня: ${recoveryData.waterIntake + (params?.ml || 0)} мл`;

      case 'start_stretching':
        return `Начинаем программу растяжки:\n${recoveryKnowledgeBase.stretchingPrograms[0].exercises
          .map(ex => `${ex.name} - ${ex.duration} мин`)
          .join('\n')
          }`;

      case 'recovery_status':
        return `Ваш уровень восстановления: ${recoveryData.recoveryScore}/100\n` +
          `${getRecoveryEmoji(recoveryData.recoveryScore)} ${recoveryData.recoveryScore < 30 ? "Критический уровень" :
            recoveryData.recoveryScore < 50 ? "Низкий уровень" :
              recoveryData.recoveryScore < 70 ? "Средний уровень" : "Отличное восстановление"
          }`;

      default:
        return "Неизвестная команда восстановления";
    }
  };

  // Generate bot response - ИСПРАВЛЕНО: убрали рекурсивную зависимость
  const generateBotResponse = useCallback(async (text: string): Promise<Message> => {
    const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let responseText = "";
    let suggestions: string[] = [];
    let links: Link[] = [];

    // Shop-specific queries
    if (text.match(/(магазин|купить|протеин|спортпит|питание.*спорт|bcaa|креатин|гейнер|добавк|витамин)/i)) {
      // Поиск продуктов
      if (text.match(/(покаж|найд|есть|какие)/i)) {
        const searchQuery = text.replace(/(покажи|найди|есть|какие|в магазине|продукты)/gi, '').trim();
        
        try {
          const foundProducts = await findProductsByQuery(searchQuery || 'все');
          
          if (foundProducts.length > 0) {
            responseText = `🛒 Нашел ${foundProducts.length} товаров по вашему запросу:\n\n`;
            
            foundProducts.slice(0, 5).forEach((product: ShopProduct) => {
              responseText += `**${product.name}**\n`;
              responseText += `💰 ${product.price.toLocaleString()}₽`;
              if (product.rating) responseText += ` ⭐ ${product.rating}`;
              responseText += `\n📦 В наличии: ${product.inStock} шт.\n\n`;
            });
            
            suggestions = [
              "Показать все товары",
              "Помоги выбрать",
              "Сравнить товары",
              "Что подойдет для похудения?"
            ];
          } else {
            responseText = "😕 К сожалению, не нашел товаров по вашему запросу. Попробуйте другой поиск.";
            suggestions = ["Показать все товары", "Популярные товары", "Категории товаров"];
          }
        } catch (error) {
          responseText = "Произошла ошибка при поиске товаров. Попробуйте еще раз.";
        }
      }
      // Рекомендации по целям
      else if (text.match(/(для похудения|похудеть|сбросить вес|жиросжигание)/i)) {
        try {
          const recommendations = await analyzeUserGoals(['похудение']);
          setRecommendations(recommendations);
          
          responseText = "🎯 Для похудения рекомендую:\n\n";
          recommendations.slice(0, 3).forEach(rec => {
            responseText += `**${rec.product.name}**\n`;
            responseText += `${rec.reason}\n`;
            responseText += `💰 ${rec.product.price.toLocaleString()}₽\n\n`;
          });
          
          suggestions = ["Добавить в корзину", "Подробнее о продукте", "Другие цели"];
        } catch (error) {
          responseText = "Не удалось подобрать рекомендации. Попробуйте еще раз.";
        }
      }
      else if (text.match(/(для массы|набрать массу|набор массы|мышечная масса)/i)) {
        try {
          const recommendations = await analyzeUserGoals(['набор_массы']);
          setRecommendations(recommendations);
          
          responseText = "💪 Для набора массы рекомендую:\n\n";
          recommendations.slice(0, 3).forEach(rec => {
            responseText += `**${rec.product.name}**\n`;
            responseText += `${rec.reason}\n`;
            responseText += `💰 ${rec.product.price.toLocaleString()}₽\n\n`;
          });
          
          suggestions = ["Добавить в корзину", "Программа питания", "Схема приема"];
        } catch (error) {
          responseText = "Не удалось подобрать рекомендации. Попробуйте еще раз.";
        }
      }
      // Сравнение товаров
      else if (text.match(/(сравни|что лучше|выбрать между)/i)) {
        responseText = "🔍 Для сравнения товаров:\n\n" +
          "1. Назовите конкретные товары\n" +
          "2. Или выберите категорию для сравнения\n\n" +
          "Например: 'Сравни протеин Gold Standard и Syntha-6'";
        
        suggestions = ["Сравнить протеины", "Сравнить креатин", "Лучшие BCAA"];
      }
      // Общий запрос о магазине
      else {
        responseText = "🛒 В нашем магазине спортивного питания:\n\n" +
          "💊 **Протеины и гейнеры**\n" +
          "🔥 **Жиросжигатели и L-карнитин**\n" +
          "⚡ **Предтренировочные комплексы**\n" +
          "💪 **Креатин и аминокислоты**\n" +
          "🌱 **Витамины и минералы**\n\n" +
          "Чем могу помочь в выборе?";
        
        links.push({
          title: "Открыть магазин",
          url: "/shop",
          description: "Перейти к покупкам",
          icon: ShoppingBag
        });
        
        suggestions = [
          "Что нужно для похудения?",
          "Товары для набора массы",
          "Популярные товары",
          "Помощь с выбором"
        ];
      }
    }
    // Конкретные вопросы о продуктах
    else if (text.match(/(протеин|bcaa|креатин|гейнер|жиросжигатель|витамины|омега|глютамин)/i)) {
      const productType = text.match(/(протеин|bcaa|креатин|гейнер|жиросжигатель|витамины|омега|глютамин)/i)?.[0] || '';
      
      responseText = `📊 Информация о ${productType}:\n\n`;
      
      const productInfo: Record<string, string> = {
        'протеин': '**Протеин** - основной строительный материал для мышц.\n\n' +
          '✅ Способствует росту мышечной массы\n' +
          '✅ Ускоряет восстановление\n' +
          '✅ Помогает сохранить мышцы при похудении\n\n' +
          '📋 Принимать: 1-2 порции в день (утром и после тренировки)',
          
        'bcaa': '**BCAA** - незаменимые аминокислоты.\n\n' +
          '✅ Защищают мышцы от разрушения\n' +
          '✅ Уменьшают усталость\n' +
          '✅ Ускоряют восстановление\n\n' +
          '📋 Принимать: до, во время и после тренировки',
          
        'креатин': '**Креатин** - увеличивает силу и выносливость.\n\n' +
          '✅ Повышает силовые показатели\n' +
          '✅ Увеличивает мышечную массу\n' +
          '✅ Улучшает выносливость\n\n' +
          '📋 Принимать: 3-5г ежедневно',
      };
      
      responseText += productInfo[productType.toLowerCase()] || 
        `${productType} - популярная спортивная добавка. Хотите узнать больше?`;
      
      suggestions = [
        `Показать все ${productType}`,
        "Как выбрать?",
        "Схема приема",
        "Лучшие бренды"
      ];
    }
    // Quick recovery commands
    else if (text === 'записать сон' || text === 'трекер сна') {
      responseText = "Сколько часов вы спали? Например:\n• Спал 7 часов\n• Проспал 8.5 часов";
      suggestions = ["Спал 7 часов", "Спал 8 часов", "Спал 6.5 часов"];
    }
    else if (text === 'добавить воду' || text === 'питьевой режим') {
      responseText = "Сколько воды вы выпили? Например:\n• Выпил 500 мл\n• Выпил 1 литр\n• Добавить 250 мл воды";
      suggestions = ["Выпил 500 мл", "Выпил 1 литр", "Выпил 250 мл"];
    }
    else if (text === 'оценить стресс') {
      responseText = "Оцените уровень стресса от 1 до 5:\n• 1 - полное спокойствие\n• 3 - умеренный стресс\n• 5 - сильный стресс";
      suggestions = ["Мой стресс 2", "Мой стресс 3", "Мой стресс 4"];
    }
    else if (text === 'программа растяжки' || text === 'начать растяжку') {
      const program = recoveryKnowledgeBase.stretchingPrograms[0];
      responseText = `🧘 Начинаем программу растяжки:\n\n`;
      program.exercises.forEach((ex, i) => {
        responseText += `${i + 1}. **${ex.name}** (${ex.duration} мин)\n   ${ex.instructions}\n\n`;
      });
      suggestions = ["Завершить растяжку", "Советы по растяжке", "Мой статус восстановления"];
    }
    // Greetings
    else if (text.match(/(привет|здравств|добр|хай|hello|hi)/i)) {
      responseText = "👋 Привет! Рад вас видеть в FitFlow Pro! Готов помочь с любыми вопросами о тренировках, тренерах, абонементах или нашем фитнес-клубе. Что вас интересует?";
      suggestions = ["Подобрать тренера", "Выбрать абонемент", "Программы тренировок", "Записаться"];
    }
    // Thanks
    else if (text.match(/(спасибо|благодар|спс|thanks)/i)) {
      responseText = "😊 Пожалуйста! Всегда рад помочь! Если возникнут еще вопросы - обращайтесь. Удачных тренировок в FitFlow Pro! 💪";
      suggestions = ["Записаться на тренировку", "Посмотреть абонементы", "Выбрать тренера"];
    }
    // Nutrition queries
    else if (text.match(/(калори|ккал|белк|жир|углевод|питательн|пищев|нутриент|состав|сколько.*в\s|энергетическ)/i)) {
      const foodMatch = text.match(/(?:калори[ий]?|ккал|белк[иов]?|жир[ыов]?|углевод[ыов]?|состав|сколько.*)?(?:\s+в\s+|\s+)([а-яА-Я\s]+?)(?:\?|$)/i);
      const foodQuery = foodMatch ? foodMatch[1].trim() : text.replace(/(калори[ий]?|ккал|питание|еда|сколько|состав|пищевая|ценность|нутриенты|в)/gi, '').trim();

      if (foodQuery && foodQuery.length > 2) {
        const nutrition = await getNutritionInfo(foodQuery);

        if (nutrition) {
          responseText = `🍏 Пищевая ценность "${nutrition.food_name}":\n`
            + `🔹 Калории: ${Math.round(nutrition.nf_calories)} ккал\n`
            + `🔹 Белки: ${Math.round(nutrition.nf_protein)}г\n`
            + `🔹 Жиры: ${Math.round(nutrition.nf_total_fat)}г\n`
            + `🔹 Углеводы: ${Math.round(nutrition.nf_total_carbohydrate)}г\n`
            + (nutrition.serving_weight_grams ?
              `📊 На 100г: ${Math.round(nutrition.nf_calories * 100 / nutrition.serving_weight_grams)} ккал` :
              '');

          suggestions = ["Дневная норма калорий", "Белковые продукты", "Рецепты для похудения"];
        } else {
          // Fallback response with common foods nutrition data
          const commonFoods: Record<string, { calories: number; protein: number; fat: number; carbs: number }> = {
            'яблоко': { calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
            'банан': { calories: 89, protein: 1.1, fat: 0.3, carbs: 23 },
            'гречка': { calories: 343, protein: 13, fat: 3.4, carbs: 72 },
            'куриная грудка': { calories: 165, protein: 31, fat: 3.6, carbs: 0 },
            'творог': { calories: 98, protein: 11, fat: 4.3, carbs: 3.4 },
            'яйцо': { calories: 155, protein: 13, fat: 11, carbs: 1.1 },
            'овсянка': { calories: 389, protein: 17, fat: 7, carbs: 66 },
            'рис': { calories: 130, protein: 2.7, fat: 0.3, carbs: 28 }
          };

          const normalizedFood = foodQuery.toLowerCase();
          const foodData = commonFoods[normalizedFood];

          if (foodData) {
            responseText = `🍏 Пищевая ценность "${foodQuery}" (на 100г):\n`
              + `🔹 Калории: ${foodData.calories} ккал\n`
              + `🔹 Белки: ${foodData.protein}г\n`
              + `🔹 Жиры: ${foodData.fat}г\n`
              + `🔹 Углеводы: ${foodData.carbs}г\n\n`
              + `ℹ️ Данные из локальной базы`;

            suggestions = ["Дневная норма калорий", "Белковые продукты", "Низкокалорийные продукты"];
          } else {
            responseText = `😕 К сожалению, не могу найти данные о "${foodQuery}".\n\n`
              + `Попробуйте спросить о популярных продуктах:\n`
              + `• Яблоко, банан, апельсин\n`
              + `• Гречка, рис, овсянка\n`
              + `• Куриная грудка, говядина, рыба\n`
              + `• Творог, молоко, яйца`;

            suggestions = ["Калории в яблоке", "Белки в твороге", "Калории в гречке"];
          }
        }
      } else {
        responseText = "Укажите продукт для анализа пищевой ценности:\n"
          + "• Калории в овсянке\n"
          + "• Белки в куриной грудке\n"
          + "• Сколько калорий в твороге";
        suggestions = ["Калории в банане", "Белки в яйце", "Углеводы в рисе"];
      }
    }
    // Trainer queries
    else if (text.match(/(тренер|инструктор|наставник|coach)/i)) {
      const trainer = findTrainerBySpecialty(text);

      if (trainer) {
        const trainerId = Object.keys(knowledgeBase.trainers).find(
          id => knowledgeBase.trainers[id as keyof typeof knowledgeBase.trainers] === trainer
        );

        const emoji: Record<string, string> = {
          'anna-petrova': '🧘‍♀️',
          'mikhail-volkov': '💪',
          'elena-smirnova': '🔥',
          'dmitriy-kozlov': '🎯',
          'olga-ivanova': '💃'
        };

        responseText = `${trainerId ? emoji[trainerId] : '⭐'} Для ${trainer.specialty.toLowerCase()} рекомендую ${trainer.name}!\n\n` +
          `${trainer.description}\n` +
          `💰 Цена: ${trainer.price}\n` +
          `⭐ Рейтинг: ${trainer.rating}/5`;

        links.push({
          title: `${trainer.name}`,
          url: `/trainers/${trainerId}`,
          description: trainer.specialty,
          icon: trainer.specialty.includes('йога') ? Heart :
            trainer.specialty.includes('силов') ? Dumbbell :
              trainer.specialty.includes('кардио') ? Zap :
                trainer.specialty.includes('функциональ') ? Target :
                  trainer.specialty.includes('групп') ? Users : Star
        });

        suggestions = ["Записаться к тренеру", "Все тренеры", "Расписание тренера"];
      } else {
        responseText = "👥 У нас работают 6 профессиональных тренеров разных специализаций!\n\n" +
          "Расскажите, какие у вас цели, и я подберу идеального тренера:\n" +
          "• Похудение и жиросжигание\n" +
          "• Набор мышечной массы\n" +
          "• Улучшение гибкости\n" +
          "• Функциональный тренинг\n" +
          "• Групповые занятия";

        links.push({
          title: "Все тренеры FitFlow Pro",
          url: "/trainers",
          description: "Выберите своего идеального тренера",
          icon: Users
        });

        suggestions = ["Похудеть", "Набрать массу", "Йога", "Групповые занятия"];
      }
    }
    // Membership/subscription queries
    else if (text.match(/(абонемент|подписк|членств|тариф|membership|стоимость.*абонемент)/i)) {
      responseText = "💳 Наши абонементы:\n\n";

      knowledgeBase.memberships.forEach(membership => {
        const emoji = membership.popular ? '🔥' : membership.discount ? '🎯' : '✨';
        responseText += `${emoji} **${membership.name}** - ${membership.price.toLocaleString()}₽\n`;
        responseText += `   ${membership.description}`;
        if (membership.discount) responseText += ` (скидка ${membership.discount}%)`;
        responseText += '\n\n';
      });

      responseText += "🎁 Первое занятие - БЕСПЛАТНО!";

      links.push({
        title: "Оформить абонемент",
        url: "/memberships",
        description: "Выберите подходящий план",
        icon: CreditCard
      });

      suggestions = ["Базовый абонемент", "Премиум абонемент", "Безлимит"];
    }
    // Programs queries  
    else if (text.match(/(програм|занят|трениров|класс|направлен)/i) && !text.match(/(запис|бронир)/i)) {
      const programs = knowledgeBase.programs;
      responseText = "🏃‍♂️ Наши программы тренировок:\n\n";

      const programEmoji: Record<string, string> = {
        yoga: '🧘‍♀️',
        strength: '💪',
        cardio: '🔥',
        functional: '🎯'
      };

      Object.entries(programs).forEach(([key, program]) => {
        responseText += `${programEmoji[key]} **${program.name}**\n`;
        responseText += `   ${program.description}\n`;
        responseText += `   💰 ${program.price}\n\n`;
      });

      links.push({
        title: "Расписание программ",
        url: "/programs",
        description: "Выберите подходящую программу",
        icon: Target
      });

      suggestions = ["Йога", "Силовые тренировки", "Кардио", "Функциональный тренинг"];
    }
    // Booking queries
    else if (text.match(/(запис|бронир|записаться|забронировать|резерв)/i)) {
      responseText = "📅 Для записи на тренировку:\n\n" +
        "1️⃣ Выберите тренера или программу\n" +
        "2️⃣ Укажите удобную дату и время\n" +
        "3️⃣ Подтвердите бронирование\n\n" +
        "💡 Также можете записаться через личный кабинет или по телефону!";

      links.push(
        {
          title: "Записаться к тренеру",
          url: "/trainers",
          description: "Выберите тренера и время",
          icon: Calendar
        },
        {
          title: "Личный кабинет",
          url: "/member-dashboard",
          description: "Управляйте записями онлайн",
          icon: User
        }
      );

      suggestions = ["Выбрать тренера", "Мои записи", "Расписание на неделю"];
    }
    // Shop queries
    else if (text.match(/(магазин|купить|протеин|спортпит|питание.*спорт|bcaa|креатин|гейнер|добавк)/i)) {
      responseText = "🛒 В нашем фитнес-магазине:\n\n" +
        "💊 **Спортивное питание**\n" +
        "• Протеины и гейнеры\n" +
        "• BCAA и аминокислоты\n" +
        "• Креатин и предтреники\n" +
        "• Витамины и минералы\n\n" +
        "🏃‍♂️ **Спортивные аксессуары**\n" +
        "• Перчатки и пояса\n" +
        "• Шейкеры и бутылки\n" +
        "• Эспандеры и резинки\n\n" +
        "👕 **Одежда для фитнеса**\n" +
        "• Спортивная форма\n" +
        "• Обувь для тренировок\n\n" +
        "🚚 Доставка по всей России!";

      links.push({
        title: "Фитнес-магазин",
        url: "/shop",
        description: "Спортивное питание и аксессуары",
        icon: ShoppingBag
      });

      suggestions = ["Протеины", "Витамины", "Спортивная одежда", "Аксессуары"];
    }
    // Price queries
    else if (text.match(/(цен|стоимост|сколько.*стоит|тариф|прайс)/i)) {
      responseText = "💰 Наши цены:\n\n" +
        "**Персональные тренировки:**\n" +
        "• Начинающий тренер: от 1800₽/час\n" +
        "• Опытный тренер: 2200-2500₽/час\n" +
        "• Элитный тренер: от 5000₽/час\n\n" +
        "**Абонементы:**\n" +
        "• Базовый: 2990₽/месяц\n" +
        "• Премиум: 4990₽/месяц\n" +
        "• VIP: 7990₽/месяц\n" +
        "• Безлимит годовой: 39900₽ (скидка 25%)\n\n" +
        "**Групповые программы:**\n" +
        "• Разовое занятие: 700-1000₽\n" +
        "• Абонемент на месяц: от 4000₽\n\n" +
        "🎁 Первая тренировка - БЕСПЛАТНО!";

      suggestions = ["Цены на тренеров", "Стоимость абонементов", "Акции и скидки"];
    }
    // Schedule queries
    else if (text.match(/(время|график|расписан|когда.*работ|режим)/i)) {
      responseText = "🕐 График работы FitFlow Pro:\n\n" +
        "**Фитнес-клуб:**\n" +
        "🌅 Пн-Пт: 06:00 - 24:00\n" +
        "🌄 Сб-Вс: 08:00 - 22:00\n\n" +
        "**Персональные тренировки:**\n" +
        "📅 Ежедневно: 07:00 - 21:00\n\n" +
        "**Групповые программы:**\n" +
        "🏃‍♂️ Утро: 07:00, 08:00, 09:00\n" +
        "☀️ День: 12:00, 13:00\n" +
        "🌆 Вечер: 18:00, 19:00, 20:00\n\n" +
        "💡 Некоторые услуги доступны 24/7 для VIP-клиентов!";

      suggestions = ["Расписание тренеров", "Групповые занятия сегодня", "Записаться на завтра"];
    }
    // Location queries
    else if (text.match(/(где|адрес|локац|местонахожден|как.*добрать|находит)/i)) {
      responseText = "📍 Мы находимся в самом центре города!\n\n" +
        "🏢 **Адрес:** г. Москва, ул. Фитнес, 15\n" +
        "🚇 **Метро:** Спортивная (5 мин пешком)\n" +
        "🚌 **Автобусы:** №15, №27, №44\n\n" +
        "🅿️ **Парковка:**\n" +
        "• Бесплатная для клиентов\n" +
        "• 50 мест\n" +
        "• Охраняемая территория\n\n" +
        "📞 **Контакты:**\n" +
        "• Телефон: +7 (495) 123-45-67\n" +
        "• WhatsApp: +7 (925) 123-45-67\n" +
        "• Email: info@fitflowpro.ru";

      links.push({
        title: "Показать на карте",
        url: "/contacts",
        description: "Схема проезда",
        icon: Target
      });

      suggestions = ["Как добраться на метро", "Есть ли парковка", "Телефон для связи"];
    }
    // Recovery queries
    else if (text.match(/(восстановлен|отдых|регенерац|устал|болят.*мышц|крепатур)/i) ||
      text.match(/(сон|спал|спать|записать.*сон)/i) ||
      text.match(/(вода|вод[ыу]|пить|выпил|гидратац|добавить.*вод)/i) ||
      text.match(/(стресс|напряж|тревог|беспоко|мой.*стресс)/i) ||
      text.match(/(растяжк|стретч|размин|программа.*растяж)/i)) {

      // Sleep logging
      if (text.match(/(записать.*сон|спал|проспал|сон.*\d+)/i)) {
        const hoursMatch = text.match(/(\d+[,.]?\d*)\s*(?:час|ч)?/i) || text.match(/(\d+[,.]?\d*)/);
        const hours = hoursMatch ? parseFloat(hoursMatch[1].replace(',', '.')) : null;

        if (hours && !isNaN(hours) && hours > 0 && hours < 24) {
          setRecoveryData(prev => ({ ...prev, sleepHours: hours }));
          calculateRecoveryScore();
          responseText = `✅ Записал ваш сон: ${hours} часов\n\n`;

          if (hours < 7) {
            responseText += '⚠️ Рекомендую увеличить продолжительность сна до 7-9 часов для лучшего восстановления.';
          } else if (hours > 9) {
            responseText += '💡 Вы хорошо выспались! Но слишком долгий сон может вызывать вялость.';
          } else {
            responseText += '👍 Отличная продолжительность сна для восстановления!';
          }

          suggestions = ["Мой статус восстановления", "Советы по сну", "Добавить воду"];
        } else {
          responseText = "Сколько часов вы спали? Укажите количество, например:\n• Спал 7.5 часов\n• Проспал 8 часов\n• Записать сон 6 часов";
          suggestions = ["Спал 7 часов", "Спал 8.5 часов", "Спал 6 часов"];
        }
      }
      // Water logging
      else if (text.match(/(выпил.*вод|добав.*вод|вода.*\d+|пил.*вод|вод[ыу].*\d+|\d+.*(?:мл|ml|литр|л))/i)) {
        const mlMatch = text.match(/(\d+)\s*(?:мл|ml)/i);
        const litersMatch = text.match(/(\d+[,.]?\d*)\s*(?:литр|л)(?!итр)/i);
        const plainNumberMatch = text.match(/(\d+)/);

        let ml = 0;
        if (litersMatch) {
          ml = parseFloat(litersMatch[1].replace(',', '.')) * 1000;
        } else if (mlMatch) {
          ml = parseInt(mlMatch[1]);
        } else if (plainNumberMatch && text.match(/вод/i)) {
          ml = parseInt(plainNumberMatch[1]);
        }

        if (ml && !isNaN(ml) && ml > 0) {
          const total = recoveryData.waterIntake + ml;
          setRecoveryData(prev => ({ ...prev, waterIntake: total }));
          calculateRecoveryScore();

          responseText = `✅ Добавлено ${ml} мл воды\n💧 Всего сегодня: ${total} мл\n\n`;

          if (total < 1500) {
            responseText += '⚠️ Старайтесь выпивать не менее 2 литров воды в день!';
          } else if (total < 2500) {
            responseText += '👍 Хороший результат! Можно еще немного воды для оптимальной гидратации.';
          } else {
            responseText += '💯 Отличное количество! Вы хорошо гидратированы!';
          }

          suggestions = ["Мой статус восстановления", "Добавить еще воду", "Записать сон"];
        } else {
          responseText = "Сколько воды вы выпили? Укажите количество:\n• Выпил 500 мл воды\n• Выпил 1 литр воды\n• Добавить 250 мл";
          suggestions = ["Выпил 500 мл", "Выпил 1 литр", "Выпил 250 мл"];
        }
      }
      // Stress level
      else if ((text.match(/(стресс|напряжен)/i) && text.match(/[1-5]|один|два|три|четыре|пять/)) ||
        text.match(/(мой.*стресс|оценить.*стресс|уровень.*стресс)/i)) {
        let level = null;

        const numberMatch = text.match(/[1-5]/);
        if (numberMatch) {
          level = parseInt(numberMatch[0]);
        } else {
          const wordNumbers: Record<string, number> = {
            'один': 1, 'одна': 1,
            'два': 2, 'две': 2,
            'три': 3,
            'четыре': 4,
            'пять': 5
          };

          for (const [word, num] of Object.entries(wordNumbers)) {
            if (text.includes(word)) {
              level = num;
              break;
            }
          }
        }

        if (level && level >= 1 && level <= 5) {
          setRecoveryData(prev => ({ ...prev, stressLevel: level }));
          calculateRecoveryScore();

          responseText = `✅ Записал уровень стресса: ${level}/5\n\n`;

          if (level >= 4) {
            responseText += '😰 Высокий уровень стресса!\n\nРекомендации:\n• Сделайте дыхательные упражнения\n• Попробуйте короткую медитацию\n• Прогуляйтесь на свежем воздухе';
          } else if (level >= 3) {
            responseText += '😐 Умеренный стресс. Попробуйте расслабляющие техники.';
          } else {
            responseText += '😊 Хороший показатель! Поддерживайте этот уровень спокойствия.';
          }

          suggestions = ["Техники дыхания", "Мой статус восстановления", "Программа растяжки"];
        } else {
          responseText = "Оцените ваш уровень стресса от 1 до 5:\n• 1 - полное спокойствие\n• 3 - умеренный стресс\n• 5 - сильный стресс";
          suggestions = ["Мой стресс 2", "Мой стресс 3", "Мой стресс 4"];
        }
      }
      // Recovery status
      else if (text.match(/(статус.*восстановлен|мо[ий].*восстановлен|уровень.*восстановлен)/i)) {
        calculateRecoveryScore();
        responseText = handleRecoveryCommand('recovery_status');
        responseText += `\n\n**Детали:**\n`;
        responseText += `😴 Сон: ${recoveryData.sleepHours} часов\n`;
        responseText += `💧 Вода: ${recoveryData.waterIntake} мл\n`;
        responseText += `😰 Стресс: ${recoveryData.stressLevel}/5\n`;
        responseText += `\n${getRecoveryTips(recoveryData)}`;

        suggestions = ["Записать сон", "Добавить воду", "Программа растяжки"];
      }
      // Sleep tips
      else if (text.match(/(сон|спать|бессонниц)/i)) {
        const sleepData = recoveryKnowledgeBase.sleep;
        responseText = `💤 Рекомендации для качественного сна:\n\n` +
          `⏰ **Оптимальное время:**\n` +
          `• Ложитесь: 22:00-23:00\n` +
          `• Вставайте: 6:00-7:00\n` +
          `• Длительность: ${sleepData.optimalHours} часов\n\n` +
          `💡 **Советы для улучшения сна:**\n` +
          sleepData.qualityTips.map(tip => `• ${tip}`).join('\n') +
          `\n\n📊 **Ваша статистика:**\n` +
          `• Последний сон: ${recoveryData.sleepHours} часов`;

        suggestions = ["Записать сон", "Техники засыпания", "Мой статус восстановления"];
      }
      // Stretching
      else if (text.match(/(растяжк|стретч|размин)/i)) {
        const program = recoveryKnowledgeBase.stretchingPrograms[0];
        responseText = `🧘 Программа растяжки для восстановления:\n\n`;

        program.exercises.forEach((ex, index) => {
          responseText += `${index + 1}. **${ex.name}** (${ex.duration} мин)\n`;
          responseText += `   ${ex.instructions}\n\n`;
        });

        responseText += `💡 Выполняйте эту программу:\n• После каждой тренировки\n• Перед сном для расслабления\n• При мышечном напряжении`;

        links.push({
          title: "Видео-инструкции",
          url: "/recovery/stretching",
          description: "Правильная техника растяжки",
          icon: Activity
        });

        suggestions = ["Начать растяжку", "Йога для восстановления", "Массаж и восстановление"];
      }
      // Water/hydration
      else if (text.match(/(вод[аы]|гидратац|пить|жажд)/i)) {
        responseText = `💧 Правильная гидратация для спортсменов:\n\n` +
          `**Норма потребления:**\n` +
          `• Базовая норма: 30-35 мл на кг веса\n` +
          `• При тренировках: +500-1000 мл\n` +
          `• В жару: +500 мл\n\n` +
          `**Когда пить:**\n` +
          `• За 2 часа до тренировки: 500 мл\n` +
          `• Во время тренировки: 150-200 мл каждые 15 мин\n` +
          `• После тренировки: 500-700 мл\n\n` +
          `📊 **Ваш показатель сегодня:** ${recoveryData.waterIntake} мл\n` +
          `${recoveryData.waterIntake < 2000 ? '⚠️ Нужно пить больше воды!' : '✅ Хорошая гидратация!'}`;

        suggestions = ["Добавить воду", "Польза воды", "Спортивные напитки"];
      }
      // General recovery
      else {
        const method = recoveryKnowledgeBase.recoveryMethods[0];
        responseText = `🔄 Комплексное восстановление после тренировок:\n\n` +
          `**1. ${method.title}**\n${method.description}\n\n` +
          `📋 Инструкция:\n` +
          method.steps!.map((s, i) => `${i + 1}. ${s}`).join('\n') +
          `\n\n**2. Питание для восстановления:**\n` +
          `• Белки: в течение 30 мин после тренировки\n` +
          `• Углеводы: для восполнения энергии\n` +
          `• Вода: минимум 2-3 литра в день\n\n` +
          `**3. Отдых:**\n` +
          `• Сон 7-9 часов\n` +
          `• День отдыха между интенсивными тренировками`;

        suggestions = ["Мой статус восстановления", "Программа растяжки", "Массаж"];
      }

      // Add recovery action links
      if (!links.length) {
        links.push(
          {
            title: "Трекер сна",
            url: "#",
            description: "Записать продолжительность сна",
            icon: Moon
          },
          {
            title: "Гидратация",
            url: "#",
            description: "Добавить выпитую воду",
            icon: Droplet
          },
          {
            title: "Оценить стресс",
            url: "#",
            description: "Уровень стресса 1-5",
            icon: AlertCircle
          }
        );
      }
    }
    // Default response with comprehensive help
    else {
      responseText = "🤔 Не совсем понял ваш вопрос. Вот что я могу вам предложить:\n\n" +
        "**🏋️ Тренировки:**\n" +
        "• Подобрать персонального тренера\n" +
        "• Выбрать программу тренировок\n" +
        "• Записаться на занятие\n\n" +
        "**💳 Услуги и цены:**\n" +
        "• Абонементы и их стоимость\n" +
        "• Цены на тренеров\n" +
        "• Акции и скидки\n\n" +
        "**🍏 Питание и восстановление:**\n" +
        "• Анализ калорийности продуктов\n" +
        "• Спортивное питание в магазине\n" +
        "• Советы по восстановлению\n\n" +
        "**📍 Информация о клубе:**\n" +
        "• Адрес и как добраться\n" +
        "• График работы\n" +
        "• Контакты\n\n" +
        "Что именно вас интересует?";

      suggestions = ["Тренеры", "Абонементы", "Расписание", "Как добраться"];
    }

    return {
      id: generateId(),
      text: responseText || "Не понял ваш запрос. Попробуйте переформулировать.",
      isBot: true,
      timestamp: new Date(),
      suggestions,
      links
    };
  }, [
    findProductsByQuery, 
    analyzeUserGoals, 
    setRecommendations, 
    currentProducts,
    recoveryData,
    setRecoveryData,
    calculateRecoveryScore,
    getNutritionInfo,
    findTrainerBySpecialty,
    handleRecoveryCommand,
    getRecoveryTips,
    getRecoveryEmoji,
    recoveryKnowledgeBase,
    knowledgeBase
  ]);

  return {
    generateBotResponse,
    speak,
    calculateRecoveryScore,
    resetContext
  };
};