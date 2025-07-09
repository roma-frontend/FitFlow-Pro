// stores/useAIAgentStore.ts (обновленная версия)
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Типы для контекста
interface TrainerContext {
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  price: string;
  badges: string[];
  category: string;
}

interface UserPreferences {
  categories?: string[];
  searchQuery?: string;
  priceRange?: { min: number; max: number };
  experience?: string;
  rating?: number;
}

interface AnalysisResult {
  id: string;
  progressPotential: number;
  bodyType: string;
  estimatedBodyFat: number;
  estimatedMuscleMass: number;
  fitnessScore: number;
  recommendations: {
    primaryGoal: string;
    secondaryGoals: string[];
    estimatedTimeToGoal: number;
    weeklyTrainingHours: number;
  };
  futureProjections?: any;
  bodyComposition?: any;
  comparisonWithOriginal?: any;
  [key: string]: any;
}

interface AIContext {
  page?: string;
  selectedTrainer?: TrainerContext;
  userPreferences?: UserPreferences;
  availableTrainers?: any[];
  categories?: string[];
  searchTerm?: string;
  selectedCategory?: string;
  intent?: string;
  lastInteraction?: Date;
  conversationHistory?: Array<{
    message: string;
    timestamp: Date;
    type: 'user' | 'system';
  }>;
  // Поля для магазина
  query?: string;
  goals?: string[];
  mode?: string;
  products?: any[];
  selectedProduct?: any;
  compareProducts?: any[];
  cartItems?: any[];
  productId?: string;
  productIds?: string[];
  // Поля для анализа тела и прогресса
  personalizedPlan?: any;
  analysisResult?: AnalysisResult;
  concerns?: string[];
  bodyType?: string;
  comparison?: any;
  analysisId?: string;
  originalAnalysisId?: string;
  currentMetrics?: {
    bodyFat: number;
    muscleMass: number;
    fitnessScore?: number;
  };
  projectedResults?: any;
  newAnalysis?: any;
}

interface AIAgentState {
  isOpen: boolean;
  pendingAction: string | null;
  context: AIContext;
  isInitialized: boolean;

  // Actions
  openAgent: (action?: string, context?: AIContext) => void;
  closeAgent: () => void;
  clearPendingAction: () => void;
  setContext: (context: Partial<AIContext>) => void;
  addToHistory: (message: string, type: 'user' | 'system') => void;
  resetContext: () => void;
}

export const useAIAgentStore = create<AIAgentState>()(
  devtools(
    persist(
      (set, get) => ({
        isOpen: false,
        pendingAction: null,
        context: {},
        isInitialized: false,

        openAgent: (action, context) => {
          console.log('🤖 Opening AI Agent:', { action, context });

          set({
            isOpen: true,
            pendingAction: action || null,
            context: {
              ...get().context,
              ...context,
              lastInteraction: new Date()
            },
            isInitialized: true
          });
        },

        closeAgent: () => {
          console.log('🤖 Closing AI Agent');
          set({
            isOpen: false,
            pendingAction: null
          });
        },

        clearPendingAction: () => {
          set({ pendingAction: null });
        },

        setContext: (context) => {
          set(state => ({
            context: {
              ...state.context,
              ...context,
              lastInteraction: new Date()
            }
          }));
        },

        addToHistory: (message, type) => {
          set(state => ({
            context: {
              ...state.context,
              conversationHistory: [
                ...(state.context.conversationHistory || []),
                {
                  message,
                  timestamp: new Date(),
                  type
                }
              ].slice(-20) // Храним последние 20 сообщений
            }
          }));
        },

        resetContext: () => {
          set({
            context: {},
            pendingAction: null
          });
        }
      }),
      {
        name: 'ai-agent-store',
        partialize: (state) => ({
          context: state.context,
          isInitialized: state.isInitialized
        })
      }
    ),
    { name: 'AIAgentStore' }
  )
);

// Предопределенные действия для разных страниц
export const AI_ACTIONS = {
  CONSULTATION: 'consultation',
  FIND_TRAINER: 'find_trainer',
  CHOOSE_MEMBERSHIP: 'choose_membership',
  BOOK_TRAINING: 'book_training',
  NUTRITION_HELP: 'nutrition_help',
  PROGRAM_SELECTION: 'program_selection',
  RECOVERY_ANALYSIS: 'recovery_analysis',
  TRAINER_CONSULTATION: 'trainer_consultation',
  GENERAL_CONSULTATION: 'general_consultation',
  TRAINER_SELECTION: 'trainer_selection',
  // Новые действия для магазина
  SHOP_CONSULTATION: 'shop_consultation',
  PRODUCT_CONSULTATION: 'product_consultation',
  PRODUCT_COMPARISON: 'product_comparison',
  PURCHASE_ASSISTANCE: 'purchase_assistance',
  BODY_ANALYSIS_CONSULTATION: 'body_analysis_consultation',
  PLAN_ADJUSTMENT: 'plan_adjustment',
  COMPARE_PROGRESS: 'compare_progress',
  PROGRESS_UPDATE: 'progress_update',
} as const;

// Типы для TypeScript
export type AIAction = typeof AI_ACTIONS[keyof typeof AI_ACTIONS];

// Хук для удобного использования в компонентах
export const useAIAgent = () => {
  const store = useAIAgentStore();

  // Общая консультация (например, по нажатию "Получить консультацию")
  const openConsultation = (context?: AIContext) => {
    const finalContext = {
      ...context,
      intent: 'general_consultation'
    };
    store.openAgent(AI_ACTIONS.GENERAL_CONSULTATION, finalContext);
  };

  // Консультация по конкретному тренеру (по нажатию AI кнопки на карточке)
  const openTrainerConsultation = (trainer: TrainerContext) => {
    store.openAgent(AI_ACTIONS.TRAINER_CONSULTATION, {
      selectedTrainer: trainer,
      intent: 'trainer_consultation',
      page: 'trainers'
    });
  };

  // Подбор тренера (AI подбор)
  const openTrainerSelection = (availableTrainers: any[], categories: string[]) => {
    store.openAgent(AI_ACTIONS.TRAINER_SELECTION, {
      availableTrainers,
      categories,
      intent: 'trainer_selection',
      page: 'trainers'
    });
  };

  // Открытие с определенным действием
  const openWithAction = (action: AIAction, context?: AIContext) => {
    store.openAgent(action, context);
  };

  return {
    ...store,
    openConsultation,
    openTrainerConsultation,
    openTrainerSelection,
    openWithAction
  };
};

// Утилита для генерации начальных сообщений на основе контекста
export const generateInitialMessage = (action: string, context: AIContext): string => {
  switch (action) {
    case AI_ACTIONS.TRAINER_CONSULTATION:
      if (context.selectedTrainer) {
        return `Расскажи мне больше о тренере ${context.selectedTrainer.name}. Подойдет ли он мне?`;
      }
      return "Помоги выбрать подходящего тренера";

    case AI_ACTIONS.TRAINER_SELECTION:
      return "Помоги подобрать персонального тренера под мои цели";

    case AI_ACTIONS.GENERAL_CONSULTATION:
      if (context.selectedCategory && context.selectedCategory !== "Все") {
        return `Интересуюсь тренерами в категории "${context.selectedCategory}". Что можешь посоветовать?`;
      }
      if (context.searchTerm) {
        return `Ищу тренера по запросу "${context.searchTerm}". Помоги с выбором.`;
      }
      return "Хочу получить консультацию по выбору тренера";

    case AI_ACTIONS.FIND_TRAINER:
      return "Помоги найти подходящего тренера";

    case AI_ACTIONS.CONSULTATION:
      return "Нужна консультация по фитнесу";

    // Новые сообщения для магазина
    case AI_ACTIONS.SHOP_CONSULTATION:
      if (context.query) {
        return `Ищу продукты по запросу "${context.query}". Помоги с выбором.`;
      }
      if (context.goals && context.goals.length > 0) {
        return `Мои цели: ${context.goals.join(', ')}. Какие продукты мне подойдут?`;
      }
      return "Помоги выбрать подходящие продукты";

    case AI_ACTIONS.PRODUCT_CONSULTATION:
      if (context.selectedProduct) {
        return `Расскажи больше о продукте "${context.selectedProduct.name}". Подойдет ли он мне?`;
      }
      return "Помоги с выбором продукта";

    case AI_ACTIONS.PRODUCT_COMPARISON:
      if (context.compareProducts && context.compareProducts.length > 0) {
        const productNames = context.compareProducts.map(p => p.name).join(', ');
        return `Сравни эти продукты: ${productNames}. Что лучше выбрать?`;
      }
      return "Помоги сравнить продукты";

    case AI_ACTIONS.PURCHASE_ASSISTANCE:
      return "Помоги оформить заказ и проверить корзину";

    case AI_ACTIONS.BODY_ANALYSIS_CONSULTATION:
      if (context.personalizedPlan) {
        return `Отличные результаты анализа! Ваш потенциал трансформации ${context.analysisResult?.progressPotential}%. Давайте обсудим ваш персональный план.`;
      }
      return "Давайте обсудим результаты вашего AI анализа тела";

    case AI_ACTIONS.PLAN_ADJUSTMENT:
      return `Понимаю ваши опасения: ${context.concerns?.join(', ')}. Давайте скорректируем план под ваши потребности.`;

    case AI_ACTIONS.COMPARE_PROGRESS:
      return `Сравним ваши результаты с другими клиентами с типом телосложения ${context.bodyType}`;

    case AI_ACTIONS.PROGRESS_UPDATE:
      if (context.comparison) {
        return `Поздравляю с прогрессом! Давайте проанализируем ваши изменения за этот период.`;
      }
      return "Давайте оценим ваш прогресс";

    default:
      return "Привет! Чем могу помочь?";
  }
};

// Утилита для генерации контекстных подсказок
export const generateSuggestions = (action: string, context: AIContext): string[] => {
  switch (action) {

    case AI_ACTIONS.BODY_ANALYSIS_CONSULTATION:
      return [
        "Расскажи подробнее о плане",
        "Почему именно этот тренер?",
        "Можно изменить питание?",
        "Когда начинать?",
        "Сколько это будет стоить?"
      ];

    case AI_ACTIONS.PLAN_ADJUSTMENT:
      return [
        "У меня аллергия на...",
        "Не могу тренироваться так часто",
        "Бюджет меньше",
        "Предпочитаю другой тип тренировок",
        "Нужен женский тренер"
      ];

    case AI_ACTIONS.COMPARE_PROGRESS:
      return [
        "Покажи средние результаты",
        "Кто достиг лучших результатов?",
        "Что они делали по-другому?",
        "Мой прогресс нормальный?",
        "Как ускорить результаты?"
      ];

    case AI_ACTIONS.PROGRESS_UPDATE:
      return [
        "Что изменилось?",
        "Нужно корректировать план?",
        "Почему прогресс медленный?",
        "Что делать дальше?",
        "Новые рекомендации"
      ];

    case AI_ACTIONS.TRAINER_CONSULTATION:
      return [
        "Какой опыт у тренера?",
        "Подходит ли мне его стиль?",
        "Сколько стоят занятия?",
        "Когда можно записаться?",
        "Отзывы других клиентов"
      ];

    case AI_ACTIONS.TRAINER_SELECTION:
      return [
        "Хочу похудеть",
        "Набрать мышечную массу",
        "Улучшить выносливость",
        "Реабилитация после травмы",
        "Подготовка к соревнованиям"
      ];

    case AI_ACTIONS.GENERAL_CONSULTATION:
      const suggestions = [
        "Какие виды тренировок есть?",
        "Сколько стоят абонементы?",
        "Как часто нужно заниматься?",
        "Нужно ли спортивное питание?"
      ];

      // Добавляем контекстные подсказки
      if (context.selectedCategory && context.selectedCategory !== "Все") {
        suggestions.unshift(`Лучшие тренеры по ${context.selectedCategory}`);
      }

      return suggestions;

    // Новые подсказки для магазина
    case AI_ACTIONS.SHOP_CONSULTATION:
      return [
        "Что нужно для набора массы?",
        "Продукты для похудения",
        "Витамины и добавки",
        "Протеиновые коктейли",
        "Предтренировочные комплексы"
      ];

    case AI_ACTIONS.PRODUCT_CONSULTATION:
      return [
        "Как принимать этот продукт?",
        "Есть ли противопоказания?",
        "Подойдет ли для моих целей?",
        "Сколько нужно на курс?",
        "Аналоги этого продукта"
      ];

    case AI_ACTIONS.PRODUCT_COMPARISON:
      return [
        "В чем разница между продуктами?",
        "Что лучше по соотношению цена/качество?",
        "Какой быстрее действует?",
        "Что подойдет новичку?",
        "Рекомендации по выбору"
      ];

    case AI_ACTIONS.PURCHASE_ASSISTANCE:
      return [
        "Проверить совместимость продуктов",
        "Рассчитать общую стоимость",
        "Есть ли скидки?",
        "Когда лучше принимать?",
        "Нужно ли что-то добавить?"
      ];

    default:
      return [
        "Подобрать тренера",
        "Выбрать абонемент",
        "Программы тренировок",
        "Записаться на занятие"
      ];
  }
};