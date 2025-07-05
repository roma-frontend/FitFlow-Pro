"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  X,
  Sparkles,
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
  ArrowUp,
  Mic,
  MicOff
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  links?: Array<{
    title: string;
    url: string;
    description: string;
    icon: any;
  }>;
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  action: string;
  color: string;
}

const AIAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Быстрые действия
  const quickActions: QuickAction[] = [
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
    }
  ];

  // База знаний агента
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
    },
    programs: {
      yoga: { name: "Йога и релакс", price: "от 800₽", description: "Гармония тела и духа" },
      strength: { name: "Силовой тренинг", price: "от 1000₽", description: "Наращивание мышечной массы" },
      cardio: { name: "Кардио и жиросжигание", price: "от 700₽", description: "Эффективное похудение" },
      functional: { name: "Функциональный тренинг", price: "от 900₽", description: "Развитие координации и силы" }
    },
    memberships: [
      { name: "Базовый", price: 2990, description: "Идеально для начинающих" },
      { name: "Премиум", price: 4990, description: "Для активных спортсменов", popular: true },
      { name: "VIP", price: 7990, description: "Максимум возможностей" },
      { name: "Безлимит", price: 39900, description: "Годовой абонемент", discount: 25 }
    ]
  };

  // Автопрокрутка к концу сообщений
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Приветственное сообщение
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

  // Обработка сообщений пользователя
  const processUserMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Симуляция обработки
    await new Promise(resolve => setTimeout(resolve, 1500));

    const botResponse = generateBotResponse(text.toLowerCase());
    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  // Генерация ответа бота
  const generateBotResponse = (text: string): Message => {
    let responseText = "";
    let suggestions: string[] = [];
    let links: Array<{ title: string; url: string; description: string; icon: any }> = [];

    // Анализ запроса
    if (text.includes('тренер') || text.includes('инструктор')) {
      if (text.includes('йога') || text.includes('стретчинг')) {
        responseText = "🧘‍♀️ Для йоги и стретчинга рекомендую Анну Петрову! Она сертифицированный инструктор с международным дипломом. Цена от 2000₽/час, рейтинг 4.9⭐";
        links.push({
          title: "Анна Петрова - Йога и стретчинг",
          url: "/trainers/anna-petrova",
          description: "Сертифицированный инструктор йоги",
          icon: Heart
        });
      } else if (text.includes('силов') || text.includes('масс') || text.includes('качать')) {
        responseText = "💪 Для силовых тренировок идеально подойдет Михаил Волков! Мастер спорта по пауэрлифтингу с 8+ летним опытом. Цена от 2500₽/час, рейтинг 4.8⭐";
        links.push({
          title: "Михаил Волков - Силовые тренировки",
          url: "/trainers/mikhail-volkov",
          description: "Мастер спорта по пауэрлифтингу",
          icon: Dumbbell
        });
      } else if (text.includes('похуд') || text.includes('кардио') || text.includes('жир')) {
        responseText = "🔥 Для похудения и кардио рекомендую Елену Смирнову! Специалист по жиросжиганию с научным подходом. Цена от 2200₽/час, рейтинг 5.0⭐";
        links.push({
          title: "Елена Смирнова - Кардио и похудение",
          url: "/trainers/elena-smirnova",
          description: "Специалист по жиросжиганию",
          icon: Zap
        });
      } else if (text.includes('функциональ') || text.includes('trx') || text.includes('реабилит')) {
        responseText = "🎯 Для функционального тренинга советую Дмитрия Козлова! Эксперт по TRX и реабилитации. Цена от 2300₽/час, рейтинг 4.7⭐";
        links.push({
          title: "Дмитрий Козлов - Функциональный тренинг",
          url: "/trainers/dmitriy-kozlov",
          description: "Эксперт функционального тренинга",
          icon: Target
        });
      } else if (text.includes('групп') || text.includes('аэроб') || text.includes('зумба')) {
        responseText = "💃 Для групповых занятий отлично подойдет Ольга Иванова! Энергичный тренер с невероятной харизмой. Цена от 1800₽/час, рейтинг 4.9⭐";
        links.push({
          title: "Ольга Иванова - Групповые программы",
          url: "/trainers/olga-ivanova",
          description: "Энергичный тренер групповых программ",
          icon: Users
        });
      } else if (text.includes('vip') || text.includes('элитн') || text.includes('премиум')) {
        responseText = "👑 Для VIP-тренировок рекомендую Александра Петрова! Элитный тренер с 10+ летним опытом работы со звездами. Цена от 5000₽/час, рейтинг 5.0⭐";
        links.push({
          title: "Александр Петров - VIP тренинг",
          url: "/trainers/aleksandr-petrov",
          description: "Элитный персональный тренер",
          icon: Star
        });
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
    } else if (text.includes('абонемент') || text.includes('членство') || text.includes('тариф')) {
      responseText = "💳 Отлично! У нас 4 типа абонементов:\n\n🥉 Базовый (2990₽) - для начинающих\n🥈 Премиум (4990₽) - самый популярный\n🥇 VIP (7990₽) - максимум возможностей\n♾️ Безлимит (39900₽/год) - скидка 25%";
      links.push({
        title: "Выбрать абонемент",
        url: "/memberships",
        description: "Подберите подходящий тарифный план",
        icon: CreditCard
      });
      suggestions = ["Базовый абонемент", "Премиум абонемент", "VIP абонемент", "Годовой безлимит"];
    } else if (text.includes('програм') || text.includes('занят') || text.includes('трениров')) {
      responseText = "🏃‍♂️ У нас есть разнообразные программы тренировок:\n\n🧘‍♀️ Йога и релакс (от 800₽)\n💪 Силовой тренинг (от 1000₽)\n🔥 Кардио и жиросжигание (от 700₽)\n🎯 Функциональный тренинг (от 900₽)";
      links.push({
        title: "Программы тренировок",
        url: "/programs",
        description: "Выберите подходящую программу",
        icon: Target
      });
      suggestions = ["Йога", "Силовые тренировки", "Кардио", "Функциональный тренинг"];
    } else if (text.includes('запис') || text.includes('бронир')) {
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
    } else if (text.includes('магазин') || text.includes('питан') || text.includes('протеин') || text.includes('купить')) {
      responseText = "🛒 В нашем магазине вы найдете:\n\n💊 Спортивное питание\n🥤 Протеины и гейнеры\n🏃‍♂️ Спортивные аксессуары\n👕 Одежда для фитнеса\n\nДоставка по всей России!";
      links.push({
        title: "Фитнес-магазин",
        url: "/shop",
        description: "Спортивное питание и аксессуары",
        icon: ShoppingBag
      });
      suggestions = ["Протеины", "Витамины", "Аксессуары", "Одежда"];
    } else if (text.includes('цена') || text.includes('стоимость') || text.includes('сколько')) {
      responseText = "💰 Наши цены:\n\n👨‍🏫 Тренеры: 1800₽ - 5000₽/час\n💳 Абонементы: 2990₽ - 39900₽\n🏃‍♂️ Программы: 700₽ - 1000₽\n🎯 Групповые: от 800₽\n\nПервая консультация - бесплатно!";
      suggestions = ["Цены на тренеров", "Стоимость абонементов", "Групповые занятия"];
    } else if (text.includes('время') || text.includes('график') || text.includes('когда')) {
      responseText = "🕐 Мы работаем:\n\n🌅 Пн-Пт: 06:00 - 24:00\n🌄 Сб-Вс: 08:00 - 22:00\n\nТренеры доступны с 07:00 до 21:00. Некоторые услуги 24/7!";
      suggestions = ["Расписание тренеров", "Групповые занятия", "Записаться"];
    } else if (text.includes('где') || text.includes('адрес') || text.includes('локация')) {
      responseText = "📍 Мы находимся в центре города!\n\n🏢 Адрес: г. Москва, ул. Фитнес, 15\n🚇 Метро: Спортивная (5 мин пешком)\n🅿️ Бесплатная парковка\n📞 Телефон: +7 (495) 123-45-67";
      suggestions = ["Как добраться", "Парковка", "Контакты"];
    } else if (text.includes('привет') || text.includes('здравств') || text.includes('добр')) {
      responseText = "👋 Привет! Рад вас видеть в FitFlow Pro! Готов помочь с любыми вопросами о тренировках, тренерах, абонементах или нашем фитнес-клубе. Что вас интересует?";
      suggestions = ["Подобрать тренера", "Выбрать абонемент", "Программы тренировок", "Записаться"];
    } else if (text.includes('спасибо') || text.includes('благодар')) {
      responseText = "😊 Пожалуйста! Всегда рад помочь! Если возникнут еще вопросы - обращайтесь. Удачных тренировок в FitFlow Pro! 💪";
      suggestions = ["Записаться на тренировку", "Посмотреть абонементы", "Выбрать тренера"];
    } else {
      responseText = "🤔 Интересный вопрос! Я постараюсь помочь. Возможно, вас интересует:\n\n👨‍🏫 Информация о тренерах\n💳 Абонементы и цены\n🏃‍♂️ Программы тренировок\n📅 Запись на занятия\n\nУточните, пожалуйста, что именно вы ищете?";
      suggestions = ["Тренеры", "Абонементы", "Программы", "Записаться"];
    }

    return {
      id: Date.now().toString(),
      text: responseText,
      isBot: true,
      timestamp: new Date(),
      suggestions,
      links
    };
  };

  // Обработка быстрых действий
  const handleQuickAction = (action: string) => {
    let text = "";
    switch (action) {
      case "find_trainer":
        text = "Помоги подобрать тренера";
        break;
      case "choose_membership":
        text = "Хочу выбрать абонемент";
        break;
      case "book_training":
        text = "Записаться на тренировку";
        break;
      case "visit_shop":
        text = "Показать магазин";
        break;
    }
    if (text) {
      processUserMessage(text);
    }
  };

  // Обработка предложений
  const handleSuggestion = (suggestion: string) => {
    processUserMessage(suggestion);
  };

  // Отправка сообщения
  const handleSendMessage = () => {
    if (inputText.trim()) {
      processUserMessage(inputText);
      setInputText('');
    }
  };

  // Голосовой ввод (заглушка)
  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Здесь будет интеграция с Web Speech API
  };

  return (
    <>
      {/* Кнопка открытия чата */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 0 rgba(59, 130, 246, 0.4)',
              animation: 'pulse-glow 2s infinite'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-8 w-8" />
            </motion.div>
            
            {/* Магические частицы */}
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

      {/* Чат-интерфейс */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Заголовок чата */}
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

            {/* Быстрые действия (только если нет сообщений) */}
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

            {/* Область сообщений */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ height: 'calc(100% - 140px)' }}>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] ${message.isBot ? 'order-1' : 'order-2'}`}>
                    {message.isBot && (
                      <div className="flex items-center space-x-2 mb-1">
                        <Bot className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-gray-500">FitFlow AI</span>
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl ${
                        message.isBot
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                    </div>
                    
                    {/* Ссылки */}
                    {message.links && message.links.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.links.map((link, linkIndex) => (
                          <motion.a
                            key={linkIndex}
                            href={link.url}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: linkIndex * 0.1 }}
                            className="block p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all group"
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

                    {/* Предложения */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, suggIndex) => (
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

              {/* Индикатор печатания */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
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
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Поле ввода */}
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
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                      isListening ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'
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
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
              
              {/* Индикатор статуса */}
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

      {/* Глобальные стили для анимаций */}
      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.1);
          }
        }
        
        .animate-sparkle-1 {
          animation: sparkle 1.5s ease-in-out infinite;
        }
        
        .animate-sparkle-2 {
          animation: sparkle 1.5s ease-in-out infinite 0.3s;
        }
        
        .animate-sparkle-3 {
          animation: sparkle 1.5s ease-in-out infinite 0.6s;
        }
        
        @keyframes sparkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0);
          }
          50% { 
            opacity: 1; 
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default AIAgent;