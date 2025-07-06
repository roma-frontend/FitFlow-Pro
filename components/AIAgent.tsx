"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  Brain,
  Dumbbell,
  Users,
  CreditCard,
  Calendar,
  ShoppingBag,
  Target,
  Heart,
  Zap,
  Star,
  ChevronRight,
  Loader2,
  Bot,
  User,
  Mic,
  MicOff,
  Apple,
  Volume2,
  Moon,
  Droplet,
  Activity,
  AlertCircle,
  LucideIcon
} from 'lucide-react';

// Types
interface AudioConfig {
  enabled: boolean;
  voice: "Mary" | "Peter";
}

interface NutritionData {
  food_name: string;
  nf_calories: number;
  nf_protein: number;
  nf_total_fat: number;
  nf_total_carbohydrate: number;
  serving_weight_grams: number;
}

interface NutritionResponse {
  foods: NutritionData[];
}

interface Link {
  title: string;
  url: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  links?: Link[];
}

interface Trainer {
  name: string;
  specialty: string;
  price: string;
  rating: number;
  description: string;
}

interface Program {
  name: string;
  price: string;
  description: string;
}

interface Membership {
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  discount?: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  action: string;
  color: string;
}

interface RecoveryAdvice {
  type: 'sleep' | 'stretching' | 'recovery';
  title: string;
  description: string;
  duration?: number;
  steps?: string[];
  tips?: string[];
}

interface SleepData {
  optimalHours: string;
  bestTime: string;
  qualityTips: string[];
}

interface StretchingProgram {
  level: 'beginner' | 'intermediate' | 'advanced';
  muscles: string[];
  exercises: Array<{
    name: string;
    duration: number;
    instructions: string;
    image?: string;
  }>;
}

interface RecoveryData {
  lastWorkout: Date | null;
  sleepHours: number;
  recoveryScore: number;
  lastMeal: Date | null;
  waterIntake: number;
  stressLevel: number;
}

// Simple Select component
interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-24 h-8 px-2 text-xs border rounded flex items-center justify-between"
      >
        {value}
        <ChevronRight className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded shadow-lg z-10">
          {React.Children.map(children, child => 
            React.isValidElement(child) 
              ? React.cloneElement(child as React.ReactElement<any>, { onValueChange, setIsOpen })
              : child
          )}
        </div>
      )}
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  setIsOpen?: (open: boolean) => void;
}

const SelectItem: React.FC<SelectItemProps> = ({ value, children, onValueChange, setIsOpen }) => {
  return (
    <button
      className="w-full px-2 py-1 text-xs text-left hover:bg-gray-100"
      onClick={() => {
        onValueChange?.(value);
        setIsOpen?.(false);
      }}
    >
      {children}
    </button>
  );
};

// Main component
const AIAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    enabled: false,
    voice: 'Mary'
  });
  const [nutritionCache] = useState(new Map<string, NutritionData>());
  const [recoveryData, setRecoveryData] = useState<RecoveryData>({
    lastWorkout: null,
    sleepHours: 7,
    recoveryScore: 75,
    lastMeal: null,
    waterIntake: 0,
    stressLevel: 3
  });

  const voiceRssKey = process.env.NEXT_PUBLIC_VOICERSS_KEY || '';
  const nutritionixAppId = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_ID || '';
  const nutritionixAppKey = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_KEY || '';

  const calculateRecoveryScore = () => {
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

    const score = Math.min(100,
      sleepQuality +
      workoutRecovery +
      nutritionFactor +
      waterFactor +
      stressFactor
    );

    setRecoveryData(prev => ({ ...prev, recoveryScore: Math.round(score) }));
  };

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
          }\n\nРекомендации:\n${getRecoveryTips(recoveryData)
          }`;

      default:
        return "Неизвестная команда восстановления";
    }
  };

  const getRecoveryEmoji = (score: number): string => {
    return score < 30 ? "😫" :
      score < 50 ? "😟" :
        score < 70 ? "😐" : "😊";
  };

  const getRecoveryTips = (data: RecoveryData): string => {
    const tips = [];

    if (data.sleepHours < 7) tips.push("• Старайтесь спать 7-9 часов");
    if (data.waterIntake < 2000) tips.push(`• Пейте больше воды, сегодня выпито: ${data.waterIntake}мл`);
    if (data.stressLevel > 3) tips.push("• Попробуйте техники дыхания для снижения стресса");

    return tips.length ? tips.join('\n') : "Вы отлично восстанавливаетесь! Продолжайте в том же духе!";
  };

  useEffect(() => {
    calculateRecoveryScore();
  }, [recoveryData.sleepHours, recoveryData.waterIntake, recoveryData.stressLevel]);

  const recoveryKnowledgeBase = {
    sleep: {
      optimalHours: "7-9",
      bestTime: "22:00 - 6:00",
      qualityTips: [
        "За 1 час до сна избегайте синего света (телефон/телевизор)",
        "Поддерживайте температуру в спальне 18-21°C",
        "Используйте техники 4-7-8 дыхания для засыпания"
      ]
    } as SleepData,
    stretchingPrograms: [
      {
        level: "beginner",
        muscles: ["whole body"],
        exercises: [
          {
            name: "Кошка-корова",
            duration: 2,
            instructions: "На четвереньках попеременно прогибайте и выгибайте спину"
          },
          {
            name: "Растяжка шеи",
            duration: 1,
            instructions: "Медленные наклоны головы в стороны"
          }
        ]
      }
    ] as StretchingProgram[],
    recoveryMethods: [
      {
        type: "recovery",
        title: "Контрастный душ",
        description: "Чередование горячей и холодной воды для улучшения кровообращения",
        steps: [
          "30 секунд горячая вода (38-40°C)",
          "30 секунд холодная вода (15-20°C)",
          "Повторить 5-7 циклов"
        ],
        tips: [
          "Заканчивайте всегда холодной водой",
          "Не используйте при простуде"
        ]
      }
    ] as RecoveryAdvice[]
  };

  const speak = async (text: string) => {
    if (!audioConfig.enabled || !text.trim() || !voiceRssKey) return;

    try {
      const audio = new Audio();
      const url = `https://api.voicerss.org/?key=${voiceRssKey}&hl=ru-ru&v=${audioConfig.voice}&src=${encodeURIComponent(text)}`;
      audio.src = url;

      await audio.play().catch(e => {
        console.error("Playback failed:", e);
      });
    } catch (error) {
      console.error("Audio initialization error:", error);
    }
  };

  const getCachedNutrition = async (query: string): Promise<NutritionData | null> => {
    if (nutritionCache.has(query)) {
      return nutritionCache.get(query)!;
    }
    const data = await getNutritionInfo(query);
    if (data) nutritionCache.set(query, data);
    return data;
  };

  const quickActions: QuickAction[] = [
    {
      title: "Анализ питания",
      description: "Например: 'Сколько калорий в банане?'",
      icon: Apple,
      action: "analyze_nutrition",
      color: "from-green-500 to-teal-600"
    },
    {
      title: "Подобрать тренера",
      description: "Найдем идеального тренера для ваших целей",
      icon: Users,
      action: "find_trainer",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Выбрать абонемент",
      description: "Подберем подходящий тарифный план",
      icon: CreditCard,
      action: "choose_membership",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Записаться на тренировку",
      description: "Быстрая запись к тренеру",
      icon: Calendar,
      action: "book_training",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Посетить магазин",
      description: "Спортивное питание и аксессуары",
      icon: ShoppingBag,
      action: "visit_shop",
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Трекер сна",
      description: "Записать продолжительность сна",
      icon: Moon,
      action: "log_sleep",
      color: "from-indigo-500 to-blue-600"
    },
    {
      title: "Питьевой режим",
      description: "Добавить выпитую воду",
      icon: Droplet,
      action: "log_water",
      color: "from-blue-400 to-cyan-500"
    },
    {
      title: "Программа растяжки",
      description: "Рекомендации по восстановлению",
      icon: Activity,
      action: "start_stretching",
      color: "from-purple-400 to-fuchsia-500"
    }
  ];

  const knowledgeBase = {
    trainers: {
      "anna-petrova": {
        name: "Анна Петрова",
        specialty: "Йога и стретчинг",
        price: "от 2000₽/час",
        rating: 4.9,
        description: "Сертифицированный инструктор йоги с международным дипломом"
      },
      "mikhail-volkov": {
        name: "Михаил Волков",
        specialty: "Силовые тренировки",
        price: "от 2500₽/час",
        rating: 4.8,
        description: "Мастер спорта по пауэрлифтингу"
      },
      "elena-smirnova": {
        name: "Елена Смирнова",
        specialty: "Кардио и похудение",
        price: "от 2200₽/час",
        rating: 5.0,
        description: "Специалист по жиросжиганию и метаболическим тренировкам"
      },
      "dmitriy-kozlov": {
        name: "Дмитрий Козлов",
        specialty: "Функциональный тренинг",
        price: "от 2300₽/час",
        rating: 4.7,
        description: "Эксперт функционального тренинга и реабилитации"
      },
      "olga-ivanova": {
        name: "Ольга Иванова",
        specialty: "Групповые программы",
        price: "от 1800₽/час",
        rating: 4.9,
        description: "Энергичный тренер групповых программ"
      },
      "aleksandr-petrov": {
        name: "Александр Петров",
        specialty: "Персональный тренинг",
        price: "от 5000₽/час",
        rating: 5.0,
        description: "Элитный персональный тренер с 10-летним опытом"
      }
    } as Record<string, Trainer>,
    programs: {
      yoga: { name: "Йога и релакс", price: "от 800₽", description: "Гармония тела и духа" },
      strength: { name: "Силовой тренинг", price: "от 1000₽", description: "Наращивание мышечной массы" },
      cardio: { name: "Кардио и жиросжигание", price: "от 700₽", description: "Эффективное похудение" },
      functional: { name: "Функциональный тренинг", price: "от 900₽", description: "Развитие координации и силы" }
    } as Record<string, Program>,
    memberships: [
      { name: "Базовый", price: 2990, description: "Идеально для начинающих" },
      { name: "Премиум", price: 4990, description: "Для активных спортсменов", popular: true },
      { name: "VIP", price: 7990, description: "Максимум возможностей" },
      { name: "Безлимит", price: 39900, description: "Годовой абонемент", discount: 25 }
    ] as Membership[]
  };

  const getNutritionInfo = async (query: string): Promise<NutritionData | null> => {
    const foodDictionary: Record<string, string> = {
      'яблоко': 'apple',
      'банан': 'banana',
      'гречка': 'buckwheat',
      'куринная грудка': 'chicken breast',
      'говядина': 'beef',
      'рис': 'rice',
      'овсянка': 'oatmeal',
      'творог': 'cottage cheese',
      'яйцо': 'egg',
      'молоко': 'milk',
      'хлеб': 'bread',
      'картофель': 'potato',
      'помидор': 'tomato',
      'огурец': 'cucumber',
      'сыр': 'cheese',
      'рыба': 'fish',
      'свинина': 'pork',
      'масло': 'butter',
      'мед': 'honey',
      'сахар': 'sugar',
      'макароны': 'pasta',
      'кофе': 'coffee',
      'чай': 'tea',
      'сок': 'juice'
    };

    const normalizedQuery = query
      .trim()
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/gi, '');

    if (!normalizedQuery) {
      console.error("Пустой запрос после нормализации");
      return null;
    }

    if (!nutritionixAppId || !nutritionixAppKey) {
      console.error("Отсутствуют ключи API");
      return null;
    }

    const translateQuery = (q: string): string => {
      if (foodDictionary[q]) return foodDictionary[q];

      for (const [rus, eng] of Object.entries(foodDictionary)) {
        if (q.includes(rus)) {
          return q.replace(rus, eng);
        }
      }

      return q;
    };

    const englishQuery = translateQuery(normalizedQuery);

    try {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('x-app-id', nutritionixAppId);
      headers.append('x-app-key', nutritionixAppKey);

      const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          query: englishQuery,
          timezone: "UTC"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Nutrition API error:", {
          status: response.status,
          originalQuery: query,
          englishQuery,
          error: errorData.message || 'Unknown error'
        });
        return null;
      }

      const data: NutritionResponse = await response.json();

      if (!data?.foods?.length) {
        console.error("Нет данных о пищевой ценности для:", {
          originalQuery: query,
          englishQuery
        });
        return null;
      }

      return {
        ...data.foods[0],
        food_name: query.split(' ')[0]
      };

    } catch (error) {
      console.error("Request failed:", {
        error: error instanceof Error ? error.message : 'Unknown error',
        originalQuery: query,
        englishQuery
      });
      return null;
    }
  };

  const addToFoodDiary = (food: NutritionData) => {
    try {
      const diary = JSON.parse(localStorage.getItem('foodDiary') || '[]');
      diary.push({
        ...food,
        date: new Date().toISOString()
      });
      localStorage.setItem('foodDiary', JSON.stringify(diary));
    } catch (error) {
      console.error("Error saving to food diary:", error);
    }
  };

  const findTrainerBySpecialty = (specialty: string): Trainer | null => {
    const trainerMap: Record<string, keyof typeof knowledgeBase.trainers> = {
      'йога': 'anna-petrova',
      'стретчинг': 'anna-petrova',
      'силов': 'mikhail-volkov',
      'масс': 'mikhail-volkov',
      'качать': 'mikhail-volkov',
      'похуд': 'elena-smirnova',
      'кардио': 'elena-smirnova',
      'жир': 'elena-smirnova',
      'функциональ': 'dmitriy-kozlov',
      'trx': 'dmitriy-kozlov',
      'реабилит': 'dmitriy-kozlov',
      'групп': 'olga-ivanova',
      'аэроб': 'olga-ivanova',
      'зумба': 'olga-ivanova',
      'vip': 'aleksandr-petrov',
      'элитн': 'aleksandr-petrov',
      'премиум': 'aleksandr-petrov'
    };

    for (const [key, trainerId] of Object.entries(trainerMap)) {
      if (specialty.includes(key)) {
        return knowledgeBase.trainers[trainerId];
      }
    }
    return null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: "👋 Привет! Я ваш персональный фитнес-помощник FitFlow Pro! Помогу подобрать тренера, выбрать программу тренировок, записаться на занятие или ответить на любые вопросы о нашем клубе. Чем могу помочь?",
          isBot: true,
          timestamp: new Date(),
          suggestions: [
            "Подобрать тренера",
            "Выбрать абонемент",
            "Программы тренировок",
            "Записаться на занятие"
          ]
        };
        setMessages([welcomeMessage]);
      }, 500);
    }
  }, [isOpen]);

  const processUserMessage = async (text: string) => {
    const generateUniqueId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const userMessage: Message = {
      id: generateUniqueId(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const botResponse = await generateBotResponse(text.toLowerCase());
    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);

    if (audioConfig.enabled) {
      speak(botResponse.text);
    }
  };

  const generateBotResponse = async (text: string): Promise<Message> => {
    const generateUniqueId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let responseText = "";
    let suggestions: string[] = [];
    let links: Link[] = [];

    // Nutrition queries
    if (text.match(/(калории|питание|еда|сколько.*(калори|белк|жир|углев)|состав|пищевая|ценность|нутриенты)/i)) {
      const foodQuery = text.replace(/(калории|питание|еда|сколько|состав|пищевая|ценность|нутриенты)/gi, '').trim();

      if (foodQuery) {
        const nutrition = await getCachedNutrition(foodQuery);

        if (nutrition) {
          addToFoodDiary(nutrition);
          responseText = `🍏 Пищевая ценность "${nutrition.food_name}":\n`
            + `🔹 Калории: ${Math.round(nutrition.nf_calories)} ккал\n`
            + `🔹 Белки: ${Math.round(nutrition.nf_protein)}г\n`
            + `🔹 Жиры: ${Math.round(nutrition.nf_total_fat)}г\n`
            + `🔹 Углеводы: ${Math.round(nutrition.nf_total_carbohydrate)}г\n`
            + (nutrition.serving_weight_grams ?
              `📊 На 100г: ${Math.round(nutrition.nf_calories * 100 / nutrition.serving_weight_grams)} ккал` :
              '');

          suggestions = [
            "Дневная норма калорий",
            "Белковые продукты",
            "Рецепты для похудения"
          ];
        } else {
          responseText = "😕 Не удалось получить данные о питании. Попробуйте уточнить запрос, например: 'Сколько калорий в гречке?'";
        }
      } else {
        responseText = "Укажите продукт для анализа, например:\n"
          + "• Калории в овсянке\n"
          + "• Питание куриной грудки\n"
          + "• Сколько белков в твороге";
      }
    }
    // Recovery status
    else if (text.startsWith('мой статус восстановления')) {
      responseText = handleRecoveryCommand('recovery_status');
    }
    // Trainer queries
    else if (text.includes('тренер') || text.includes('инструктор')) {
      const trainer = findTrainerBySpecialty(text);

      if (trainer) {
        const emoji: Record<string, string> = {
          'anna-petrova': '🧘‍♀️',
          'mikhail-volkov': '💪',
          'elena-smirnova': '🔥',
          'dmitriy-kozlov': '🎯',
          'olga-ivanova': '💃',
          'aleksandr-petrov': '👑'
        };

        const trainerId = Object.keys(knowledgeBase.trainers).find(
          id => knowledgeBase.trainers[id as keyof typeof knowledgeBase.trainers] === trainer
        );

        if (trainerId) {
          responseText = `${emoji[trainerId]} Для ${trainer.specialty.toLowerCase()} рекомендую ${trainer.name}! ${trainer.description}. Цена ${trainer.price}, рейтинг ${trainer.rating}⭐`;

          links.push({
            title: `${trainer.name} - ${trainer.specialty}`,
            url: `/trainers/${trainerId}`,
            description: trainer.description,
            icon: trainer.specialty.includes('йога') ? Heart :
              trainer.specialty.includes('силов') ? Dumbbell :
                trainer.specialty.includes('кардио') ? Zap :
                  trainer.specialty.includes('функциональ') ? Target :
                    trainer.specialty.includes('групп') ? Users : Star
          });
        }
      } else {
        responseText = "👥 У нас 6 профессиональных тренеров разных специализаций! Могу подобрать идеального тренера под ваши цели. Расскажите, чего хотите достичь?";
        links.push({
          title: "Все тренеры FitFlow Pro",
          url: "/trainers",
          description: "Выберите своего идеального тренера",
          icon: Users
        });
        suggestions = ["Похудеть", "Набрать массу", "Улучшить гибкость", "Групповые занятия"];
      }
    }
    // Programs queries
    else if (text.includes('програм') || text.includes('занят') || text.includes('трениров')) {
      const programs = knowledgeBase.programs;
      responseText = `🏃‍♂️ У нас есть разнообразные программы тренировок:\n\n`;

      const programEmoji: Record<string, string> = {
        yoga: '🧘‍♀️',
        strength: '💪',
        cardio: '🔥',
        functional: '🎯'
      };

      Object.entries(programs).forEach(([key, program]) => {
        responseText += `${programEmoji[key]} ${program.name} (${program.price})\n`;
      });

      links.push({
        title: "Программы тренировок",
        url: "/programs",
        description: "Выберите подходящую программу",
        icon: Target
      });
      suggestions = ["Йога", "Силовые тренировки", "Кардио", "Функциональный тренинг"];
    }
    // Booking queries
    else if (text.includes('запис') || text.includes('бронир')) {
      responseText = "📅 Для записи на тренировку:\n\n1️⃣ Выберите тренера\n2️⃣ Укажите дату и время\n3️⃣ Подтвердите бронирование\n\nТакже можете записаться через личный кабинет!";
      links.push(
        {
          title: "Записаться к тренеру",
          url: "/trainers",
          description: "Выберите тренера и запишитесь",
          icon: Calendar
        },
        {
          title: "Личный кабинет",
          url: "/member-dashboard",
          description: "Управляйте записями в кабинете",
          icon: User
        }
      );
      suggestions = ["Выбрать тренера", "Мои записи", "Расписание"];
    }
    // Shop queries
    else if (text.includes('магазин') || text.includes('питан') || text.includes('протеин') || text.includes('купить')) {
      responseText = "🛒 В нашем магазине вы найдете:\n\n💊 Спортивное питание\n🥤 Протеины и гейнеры\n🏃‍♂️ Спортивные аксессуары\n👕 Одежда для фитнеса\n\nДоставка по всей России!";
      links.push({
        title: "Фитнес-магазин",
        url: "/shop",
        description: "Спортивное питание и аксессуары",
        icon: ShoppingBag
      });
      suggestions = ["Протеины", "Витамины", "Аксессуары", "Одежда"];
    }
    // Price queries
    else if (text.includes('цена') || text.includes('стоимость') || text.includes('сколько')) {
      responseText = "💰 Наши цены:\n\n👨‍🏫 Тренеры: 1800₽ - 5000₽/час\n💳 Абонементы: 2990₽ - 39900₽\n🏃‍♂️ Программы: 700₽ - 1000₽\n🎯 Групповые: от 800₽\n\nПервая консультация - бесплатно!";
      suggestions = ["Цены на тренеров", "Стоимость абонементов", "Групповые занятия"];
    }
    // Schedule queries
    else if (text.includes('время') || text.includes('график') || text.includes('когда')) {
      responseText = "🕐 Мы работаем:\n\n🌅 Пн-Пт: 06:00 - 24:00\n🌄 Сб-Вс: 08:00 - 22:00\n\nТренеры доступны с 07:00 до 21:00. Некоторые услуги 24/7!";
      suggestions = ["Расписание тренеров", "Групповые занятия", "Записаться"];
    }
    // Location queries
    else if (text.includes('где') || text.includes('адрес') || text.includes('локация')) {
      responseText = "📍 Мы находимся в центре города!\n\n🏢 Адрес: г. Москва, ул. Фитнес, 15\n🚇 Метро: Спортивная (5 мин пешком)\n🅿️ Бесплатная парковка\n📞 Телефон: +7 (495) 123-45-67";
      suggestions = ["Как добраться", "Парковка", "Контакты"];
    }
    // Greetings
    else if (text.includes('привет') || text.includes('здравств') || text.includes('добр')) {
      responseText = "👋 Привет! Рад вас видеть в FitFlow Pro! Готов помочь с любыми вопросами о тренировках, тренерах, абонементах или нашем фитнес-клубе. Что вас интересует?";
      suggestions = ["Подобрать тренера", "Выбрать абонемент", "Программы тренировок", "Записаться"];
    }
    // Thanks
    else if (text.includes('спасибо') || text.includes('благодар')) {
      responseText = "😊 Пожалуйста! Всегда рад помочь! Если возникнут еще вопросы - обращайтесь. Удачных тренировок в FitFlow Pro! 💪";
      suggestions = ["Записаться на тренировку", "Посмотреть абонементы", "Выбрать тренера"];
    }
    // Recovery queries
    else if (
      text.includes('восстановлен') ||
      text.includes('отдых') ||
      text.includes('регенерац') ||
      text.includes('сон') ||
      text.includes('растяжк') ||
      text.includes('вода') ||
      text.includes('стресс') ||
      text.includes('устал')
    ) {
      if (text.includes('записать сон') || text.includes('спал')) {
        const hoursMatch = text.match(/(\d+[,.]?\d*)/);
        const hours = hoursMatch ? parseFloat(hoursMatch[0].replace(',', '.')) : null;

        if (hours && !isNaN(hours)) {
          setRecoveryData(prev => ({ ...prev, sleepHours: hours }));
          responseText = `✅ Записал ваш сон: ${hours} часов\n\n${hours < 7 ? 'Рекомендую увеличить продолжительность сна до 7-9 часов' :
            hours > 9 ? 'Вы хорошо выспались! Но слишком долгий сон может снижать продуктивность' :
              'Отличная продолжительность сна!'
            }`;
          calculateRecoveryScore();
        } else {
          responseText = "Сколько часов вы спали? Укажите количество, например: 'Спал 7.5 часов'";
        }
      }
      else if (text.includes('выпил воды') || text.includes('вода')) {
        const mlMatch = text.match(/(\d+)\s?м?л/);
        const ml = mlMatch ? parseInt(mlMatch[1]) : null;

        if (ml && !isNaN(ml)) {
          const total = recoveryData.waterIntake + ml;
          setRecoveryData(prev => ({ ...prev, waterIntake: total }));
          responseText = `✅ Добавлено ${ml} мл воды. Всего сегодня: ${total} мл\n\n${total < 1500 ? 'Старайтесь выпивать не менее 2 литров воды в день' :
            total < 2500 ? 'Хороший результат! Можно еще немного воды' :
              'Отличное количество! Вы хорошо гидратированы'
            }`;
          calculateRecoveryScore();
        } else {
          responseText = "Сколько воды вы выпили? Укажите количество, например: 'Выпил 500 мл воды'";
        }
      }
      else if (text.includes('стресс') || text.includes('напряж')) {
        const levelMatch = text.match(/[1-5]/);
        const level = levelMatch ? parseInt(levelMatch[0]) : null;

        if (level && level >= 1 && level <= 5) {
          setRecoveryData(prev => ({ ...prev, stressLevel: level }));
          responseText = `✅ Записал уровень стресса: ${level}/5\n\n${level >= 4 ? 'Рекомендую сделать дыхательные упражнения или короткую медитацию' :
            'Хороший показатель! Поддерживайте этот уровень'
            }`;
          calculateRecoveryScore();
        } else {
          responseText = "Оцените ваш уровень стресса от 1 до 5, например: 'Мой стресс 3'";
        }
      }
      else if (text.includes('статус') || text.includes('восстановлен')) {
        responseText = handleRecoveryCommand('recovery_status');
        const tips = getRecoveryTips(recoveryData);
        responseText += `\n\nРекомендации:\n${tips}`;
      }
      else {
        const recoveryType =
          text.includes('сон') ? 'sleep' :
            text.includes('растяжк') ? 'stretching' :
              text.includes('вод') ? 'water' :
                text.includes('метод') ? 'methods' :
                  'recovery';

        if (recoveryType === 'sleep') {
          const sleepData = recoveryKnowledgeBase.sleep;
          responseText = `💤 Советы по качественному сну:\n\n` +
            `⏳ Оптимальная продолжительность: ${sleepData.optimalHours} часов\n` +
            `⏰ Лучшее время для сна: ${sleepData.bestTime}\n\n` +
            `🔹 Советы для улучшения сна:\n` +
            sleepData.qualityTips.map(tip => `• ${tip}`).join('\n') +
            `\n\nВаша статистика:\n` +
            `• Сон: ${recoveryData.sleepHours} часов\n` +
            `• Вода: ${recoveryData.waterIntake} мл`;
        }
        else if (recoveryType === 'stretching') {
          const program = recoveryKnowledgeBase.stretchingPrograms[0];
          responseText = `🧘 Программа растяжки (${program.level}):\n\n` +
            program.exercises.map(ex =>
              `▫️ ${ex.name} - ${ex.duration} мин\n` +
              `   ${ex.instructions}\n`
            ).join('\n') +
            `\n💡 Выполняйте эту программу после тренировки или перед сном`;
        }
        else if (recoveryType === 'water') {
          responseText = `💧 Гидратация и восстановление:\n\n` +
            `• Рекомендуемая норма воды: 2-3 литра в день\n` +
            `• После тренировки добавляйте 500 мл воды\n` +
            `• Признаки обезвоживания: усталость, головная боль\n\n` +
            `Ваш сегодняшний показатель: ${recoveryData.waterIntake} мл\n` +
            `${recoveryData.waterIntake < 2000 ? 'Старайтесь пить больше воды!' : 'Отличный результат!'}`;
        }
        else {
          const method = recoveryKnowledgeBase.recoveryMethods[0];
          responseText = `🔹 ${method.title}:\n${method.description}\n\n` +
            `📋 Пошаговая инструкция:\n` +
            method.steps!.map((s, i) => `${i + 1}. ${s}`).join('\n') +
            `\n\n💡 Советы:\n${method.tips!.join('\n')}`;
        }
      }

      suggestions.push(
        "Записать сон",
        "Добавить воду",
        "Мой статус восстановления",
        "Программа растяжки"
      );

      links.push(
        {
          title: "Трекер сна",
          url: "#",
          description: "Записать продолжительность сна",
          icon: Moon,
          onClick: () => setInputText("Записать сон ")
        },
        {
          title: "Гидратация",
          url: "#",
          description: "Добавить выпитую воду",
          icon: Droplet,
          onClick: () => setInputText("Выпил воды ")
        },
        {
          title: "Оценить стресс",
          url: "#",
          description: "Уровень стресса 1-5",
          icon: AlertCircle,
          onClick: () => setInputText("Мой стресс ")
        }
      );

      if (!text.includes('статус')) {
        links.push({
          title: "Мой статус восстановления",
          url: "#",
          description: "Текущий уровень и рекомендации",
          icon: Activity,
          onClick: () => processUserMessage("Мой статус восстановления")
        });
      }
    }
    // Default response
    else {
      responseText = "Извините, я не понял ваш запрос. Вот что я могу:\n\n" +
        "• Подобрать тренера\n" +
        "• Показать программы тренировок\n" +
        "• Записать на занятие\n" +
        "• Дать советы по питанию\n" +
        "• Помочь с восстановлением";
      suggestions = ["Тренеры", "Программы", "Запись", "Питание"];
    }

    return {
      id: generateUniqueId(),
      text: responseText,
      isBot: true,
      timestamp: new Date(),
      suggestions,
      links
    };
  };

  const handleQuickAction = (action: string) => {
    const actionMap: Record<string, string> = {
      'analyze_nutrition': 'Сколько калорий в ',
      'find_trainer': 'Подобрать тренера',
      'choose_membership': 'Выбрать абонемент',
      'book_training': 'Записаться на тренировку',
      'visit_shop': 'Посетить магазин',
      'log_sleep': 'Записать сон',
      'log_water': 'Добавить воду',
      'start_stretching': 'Программа растяжки'
    };

    if (action === 'analyze_nutrition') {
      setInputText(actionMap[action]);
    } else {
      processUserMessage(actionMap[action]);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    processUserMessage(suggestion);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      processUserMessage(inputText);
      setInputText('');
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Здесь будет интеграция с Web Speech API
  };

  // Add CSS for pulse animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-glow {
        0% {
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 0 rgba(59, 130, 246, 0.4);
        }
        70% {
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 10px rgba(59, 130, 246, 0);
        }
        100% {
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 0 rgba(59, 130, 246, 0);
        }
      }
    `;
    if (!document.head.querySelector('#pulse-glow-style')) {
      style.id = 'pulse-glow-style';
      document.head.appendChild(style);
    }
    return () => {
      const existingStyle = document.head.querySelector('#pulse-glow-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 0 rgba(59, 130, 246, 0.4)',
              animation: 'pulse-glow 2s infinite'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-6 w-6" />
            </motion.div>

            <div className="absolute inset-0 rounded-full overflow-clip">
              <motion.div
                className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0
                }}
              />
              <motion.div
                className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-yellow-300 rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.7
                }}
              />
              <motion.div
                className="absolute top-3 left-1 w-1 h-1 bg-pink-300 rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1.4
                }}
              />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[760px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <Brain className="h-6 w-6" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">FitFlow AI</h3>
                    <p className="text-sm text-white/80">Ваш фитнес-помощник</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {messages.length <= 1 && (
              <div className="p-4 border-b bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Быстрые действия:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.action}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickAction(action.action)}
                      className={`p-3 rounded-lg bg-gradient-to-r ${action.color} text-white text-left hover:shadow-lg transition-all`}
                    >
                      <action.icon className="h-5 w-5 mb-1" />
                      <p className="text-xs font-medium">{action.title}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ height: 'calc(100% - 300px)' }}>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] ${msg.isBot ? 'order-1' : 'order-2'}`}>
                    {msg.isBot && (
                      <div className="flex items-center space-x-2 mb-1">
                        <Bot className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-gray-500">FitFlow AI</span>
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl ${msg.isBot
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>

                      {msg.text.includes('уровень восстановления') && (
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full ${recoveryData.recoveryScore < 30 ? 'bg-red-500' :
                              recoveryData.recoveryScore < 50 ? 'bg-yellow-500' :
                                recoveryData.recoveryScore < 70 ? 'bg-blue-500' : 'bg-green-500'
                              }`}
                            style={{ width: `${recoveryData.recoveryScore}%` }}
                          />
                          <div className="text-xs text-center mt-1 text-gray-600">
                            {recoveryData.recoveryScore < 30 ? "Критический уровень" :
                              recoveryData.recoveryScore < 50 ? "Низкий уровень" :
                                recoveryData.recoveryScore < 70 ? "Средний уровень" : "Отличное восстановление"}
                          </div>
                        </div>
                      )}
                    </div>

                    {msg.links && msg.links.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.links.map((link, linkIndex) => (
                          <motion.a
                            key={linkIndex}
                            href={link.url}
                            onClick={(e) => {
                              if (link.onClick) {
                                e.preventDefault();
                                link.onClick();
                              }
                            }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: linkIndex * 0.1 }}
                            className="block p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all group cursor-pointer"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <link.icon className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900">{link.title}</p>
                                <p className="text-xs text-gray-500">{link.description}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                            </div>
                          </motion.a>
                        ))}
                      </div>
                    )}

                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.suggestions.map((suggestion, suggIndex) => (
                          <motion.button
                            key={suggIndex}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: suggIndex * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSuggestion(suggestion)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%]">
                    <div className="flex items-center space-x-2 mb-1">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-gray-500">FitFlow AI печатает...</span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-gray-50 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Задайте вопрос..."
                    className="w-full p-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleVoiceInput}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  {isTyping ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </motion.button>

                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAudioConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`p-2 rounded-full flex items-center justify-center ${audioConfig.enabled
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </motion.button>

                  {audioConfig.enabled && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center"
                    >
                      <Select
                        value={audioConfig.voice}
                        onValueChange={(value) => setAudioConfig(prev => ({
                          ...prev,
                          voice: value as "Mary" | "Peter"
                        }))}
                      >
                        <SelectItem value="Mary">Женский</SelectItem>
                        <SelectItem value="Peter">Мужской</SelectItem>
                      </Select>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Онлайн • Powered by AI</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAgent;