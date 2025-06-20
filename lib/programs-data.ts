// lib/programs-data.ts (полная версия)
import { Heart, Dumbbell, Flame, Target } from "lucide-react";

export const programsData = [
  {
    slug: "yoga",
    title: "Йога и релакс",
    description: "Гармония тела и духа через древние практики йоги и медитации",
    shortDescription: "Гармония тела и духа через древние практики",
    fullDescription: "Наша программа йоги сочетает в себе традиционные асаны, дыхательные техники и медитацию. Подходит для всех уровней подготовки - от новичков до продвинутых практиков. Занятия помогают улучшить гибкость, силу, баланс и внутреннее спокойствие.",
    duration: "60-90 мин",
    level: "Все уровни",
    participants: "До 15 человек",
    price: "от 800₽",
    icon: Heart,
    bgGradient: "bg-gradient-to-br from-pink-50 to-rose-100",
    borderColor: "border-pink-200",
    iconGradient: "from-pink-400 to-rose-500",
    buttonGradient: "from-pink-500 to-rose-600",
    buttonHover: "hover:from-pink-600 hover:to-rose-700",
    link: "/programs/yoga",
    features: ["Хатха-йога", "Виньяса", "Медитация", "Пранаяма"],
    benefits: [
      "Улучшение гибкости и подвижности суставов",
      "Снижение уровня стресса и тревожности",
      "Укрепление мышц кора и улучшение осанки",
      "Развитие концентрации и внимательности",
      "Нормализация сна и общего самочувствия"
    ],
    schedule: [
      { day: "Понедельник", time: "09:00-10:30", instructor: "Анна Петрова", type: "Хатха-йога" },
      { day: "Среда", time: "18:00-19:30", instructor: "Анна Петрова", type: "Виньяса-флоу" },
      { day: "Пятница", time: "19:00-20:30", instructor: "Мария Соколова", type: "Инь-йога" },
      { day: "Суббота", time: "10:00-11:30", instructor: "Анна Петрова", type: "Йога для начинающих" },
    ],
    equipment: ["Коврик для йоги", "Блоки", "Ремни", "Болстеры"],
    contraindications: [
      "Острые травмы позвоночника",
      "Высокое артериальное давление (для некоторых асан)",
      "Беременность (требуется специальная программа)"
    ],
    instructors: ["anna-petrova", "maria-sokolova"],
  },
  {
    slug: "strength",
    title: "Силовой тренинг",
    description: "Наращивание мышечной массы и увеличение силовых показателей",
    shortDescription: "Наращивание мышечной массы и увеличение силы",
    fullDescription: "Комплексная программа силовых тренировок, направленная на развитие всех групп мышц. Включает базовые и изолирующие упражнения с использованием свободных весов и тренажеров. Программа адаптируется под индивидуальные цели и уровень подготовки.",
    duration: "45-60 мин",
    level: "Средний/Продвинутый",
    participants: "До 10 человек",
    price: "от 1000₽",
    icon: Dumbbell,
    bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-100",
    borderColor: "border-blue-200",
    iconGradient: "from-blue-500 to-indigo-600",
    buttonGradient: "from-blue-500 to-indigo-600",
    buttonHover: "hover:from-blue-600 hover:to-indigo-700",
    link: "/programs/strength",
    features: ["Базовые упражнения", "Изоляция", "Прогрессия нагрузок", "Техника"],
    benefits: [
      "Увеличение мышечной массы и силы",
      "Ускорение метаболизма",
      "Укрепление костной системы",
      "Улучшение композиции тела",
      "Повышение функциональной силы"
    ],
    schedule: [
      { day: "Понедельник", time: "18:00-19:00", instructor: "Михаил Волков", type: "Верх тела" },
      { day: "Среда", time: "19:00-20:00", instructor: "Михаил Волков", type: "Низ тела" },
      { day: "Пятница", time: "18:00-19:00", instructor: "Михаил Волков", type: "Full Body" },
      { day: "Суббота", time: "11:00-12:00", instructor: "Михаил Волков", type: "Пауэрлифтинг" },
    ],
    equipment: ["Штанги", "Гантели", "Тренажеры", "Скамьи"],
    contraindications: [
      "Острые травмы опорно-двигательного аппарата",
      "Сердечно-сосудистые заболевания в стадии обострения",
      "Высокое артериальное давление"
    ],
    instructors: ["mikhail-volkov"],
  },
  {
    slug: "cardio",
    title: "Кардио и жиросжигание",
    description: "Интенсивные кардио-тренировки для быстрого похудения",
    shortDescription: "Интенсивные кардио-тренировки для быстрого похудения",
    fullDescription: "Высокоинтенсивные интервальные тренировки (HIIT), направленные на максимальное жиросжигание. Программа включает различные виды кардио-упражнений, круговые тренировки и функциональные движения для эффективного снижения веса.",
    duration: "30-45 мин",
    level: "Все уровни",
    participants: "До 20 человек",
    price: "от 700₽",
    icon: Flame,
    bgGradient: "bg-gradient-to-br from-green-50 to-emerald-100",
    borderColor: "border-green-200",
    iconGradient: "from-green-500 to-emerald-600",
    buttonGradient: "from-green-500 to-emerald-600",
    buttonHover: "hover:from-green-600 hover:to-emerald-700",
    link: "/programs/cardio",
    features: ["HIIT тренировки", "Табата", "Круговые тренировки", "Аэробика"],
    benefits: [
      "Быстрое сжигание калорий и жира",
      "Улучшение сердечно-сосудистой системы",
      "Повышение выносливости",
      "Ускорение метаболизма на 24-48 часов",
      "Улучшение композиции тела"
    ],
    schedule: [
      { day: "Вторник", time: "07:00-07:45", instructor: "Елена Смирнова", type: "HIIT Morning" },
      { day: "Четверг", time: "18:30-19:15", instructor: "Елена Смирнова", type: "Табата" },
      { day: "Суббота", time: "09:00-09:45", instructor: "Елена Смирнова", type: "Кардио-микс" },
      { day: "Воскресенье", time: "10:00-10:45", instructor: "Ольга Иванова", type: "Аэробика" },
    ],
    equipment: ["Степ-платформы", "Гантели", "Медболы", "Скакалки"],
    contraindications: [
      "Серьезные заболевания сердца",
      "Острые респираторные заболевания",
      "Травмы суставов нижних конечностей"
    ],
    instructors: ["elena-smirnova", "olga-ivanova"],
  },
  {
    slug: "functional",
    title: "Функциональный тренинг",
    description: "Тренировка движений для повседневной активности и спорта",
    shortDescription: "Тренировка движений для повседневной активности",
    fullDescription: "Функциональный тренинг развивает силу, координацию, баланс и выносливость через естественные движения. Программа включает упражнения с собственным весом, TRX, медболами и другим функциональным оборудованием.",
    duration: "50-70 мин",
    level: "Средний",
    participants: "До 12 человек",
    price: "от 900₽",
    icon: Target,
    bgGradient: "bg-gradient-to-br from-orange-50 to-red-100",
    borderColor: "border-orange-200",
    iconGradient: "from-orange-500 to-red-600",
    buttonGradient: "from-orange-500 to-red-600",
    buttonHover: "hover:from-orange-600 hover:to-red-700",
    link: "/programs/functional",
    features: ["TRX", "Функциональные движения", "Координация", "Баланс"],
    benefits: [
      "Улучшение функциональной силы",
      "Развитие координации и баланса",
      "Профилактика травм в повседневной жизни",
      "Улучшение спортивных показателей",
      "Развитие стабильности кора"
    ],
    schedule: [
      { day: "Понедельник", time: "19:00-20:10", instructor: "Дмитрий Козлов", type: "TRX Training" },
      { day: "Среда", time: "20:00-21:10", instructor: "Дмитрий Козлов", type: "Functional Mix" },
      { day: "Пятница", time: "19:30-20:40", instructor: "Дмитрий Козлов", type: "Core & Balance" },
      { day: "Воскресенье", time: "11:00-12:10", instructor: "Дмитрий Козлов", type: "Реабилитация" },
    ],
    equipment: ["TRX", "Медболы", "Босу", "Канаты", "Кольца"],
    contraindications: [
      "Острые травмы позвоночника",
      "Нестабильность суставов",
      "Головокружения и нарушения вестибулярного аппарата"
    ],
    instructors: ["dmitriy-kozlov"],
  },
];

export const getProgramBySlug = (slug: string) => {
  return programsData.find(program => program.slug === slug);
};

export const getAllPrograms = () => {
  return programsData;
};

export const getProgramsByCategory = (category: string) => {
  // Можно добавить категории в будущем
  return programsData;
};

