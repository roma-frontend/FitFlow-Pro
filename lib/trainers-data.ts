// lib/trainers-data.ts (полная версия)
import { Heart, Dumbbell, Flame, Target, Users, Crown } from "lucide-react";

export const trainersData = [
    {
        name: "Анна Петрова",
        slug: "anna-petrova",
        specialty: "Йога и стретчинг",
        rating: "4.9",
        experience: "5+ лет опыта",
        price: "от 2000₽/час",
        icon: Heart,
        gradient: "from-pink-400 to-purple-600",
        hoverGradient: "hover:from-pink-600 hover:to-purple-700",
        textColor: "text-pink-100",
        iconColor: "text-purple-600",
        badgeColor: "bg-pink-100 text-pink-800",
        description: "Сертифицированный инструктор йоги. Поможет обрести гармонию тела и духа.",
        badges: ["Йога", "Пилатес", "Стретчинг"],
        category: "Йога",
        link: "/trainers/anna-petrova",
        bookingLink: "/book-trainer/anna-petrova",
        bio: "Анна - сертифицированный инструктор йоги с международным сертификатом RYT-500. Специализируется на хатха-йоге, виньяса-флоу и инь-йоге. Помогает клиентам не только улучшить физическую форму, но и найти внутреннее равновесие.",
        education: [
            "RYT-500 Yoga Alliance (США)",
            "Сертификат по анатомии и физиологии",
            "Курс медитации випассана",
            "Обучение пранаяме и дыхательным техникам"
        ],
        achievements: [
            "Более 1000 проведенных занятий",
            "Участник международных семинаров по йоге",
            "Автор курса 'Йога для начинающих'",
            "Ведущая корпоративных программ wellness"
        ],
    },
    {
        name: "Михаил Волков",
        slug: "mikhail-volkov",
        specialty: "Силовые тренировки",
        rating: "4.8",
        experience: "8+ лет опыта",
        price: "от 2500₽/час",
        icon: Dumbbell,
        gradient: "from-blue-500 to-indigo-700",
        hoverGradient: "hover:from-blue-600 hover:to-indigo-800",
        textColor: "text-blue-100",
        iconColor: "text-blue-600",
        badgeColor: "bg-blue-100 text-blue-800",
        description: "Мастер спорта по пауэрлифтингу. Поможет набрать мышечную массу и силу.",
        badges: ["Силовые", "Кроссфит", "Пауэрлифтинг"],
        category: "Силовые",
        link: "/trainers/mikhail-volkov",
        bookingLink: "/book-trainer/mikhail-volkov",
        bio: "Михаил - мастер спорта по пауэрлифтингу, чемпион региона. Специализируется на силовых тренировках, наборе мышечной массы и подготовке к соревнованиям. Работает с клиентами любого уровня подготовки.",
        education: [
            "Высшее физкультурное образование (РГУФК)",
            "Сертификат тренера по пауэрлифтингу",
            "Курс спортивного питания и фармакологии",
            "Обучение реабилитационным методикам"
        ],
        achievements: [
            "Мастер спорта по пауэрлифтингу",
            "Чемпион региона 2019-2021",
            "Подготовил 15+ спортсменов-разрядников",
            "Рекордсмен клуба в жиме лежа (180 кг)"
        ],
    },
    {
        name: "Елена Смирнова",
        slug: "elena-smirnova",
        specialty: "Кардио и похудение",
        rating: "5.0",
        experience: "6+ лет опыта",
        price: "от 2200₽/час",
        icon: Flame,
        gradient: "from-green-400 to-emerald-600",
        hoverGradient: "hover:from-green-600 hover:to-emerald-700",
        textColor: "text-green-100",
        iconColor: "text-green-600",
        badgeColor: "bg-green-100 text-green-800",
        description: "Специалист по жиросжиганию. Поможет достичь идеальной формы.",
        badges: ["Кардио", "HIIT", "Похудение"],
        category: "Кардио",
        link: "/trainers/elena-smirnova",
        bookingLink: "/book-trainer/elena-smirnova",
        bio: "Елена - эксперт по кардиотренировкам и жиросжиганию. Разрабатывает индивидуальные программы для похудения, специализируется на HIIT и функциональных тренировках. Помогла более чем 200 клиентам достичь желаемого веса.",
        education: [
            "Диплом фитнес-тренера международного образца",
            "Сертификат по HIIT тренировкам",
            "Курс диетологии и правильного питания",
            "Обучение психологии мотивации"
        ],
        achievements: [
            "Более 200 успешных программ похудения",
            "Автор методики 'Жиросжигание за 30 дней'",
            "Ведущая онлайн-марафонов по похудению",
            "Сертифицированный нутрициолог"
        ],
    },
    {
        name: "Дмитрий Козлов",
        slug: "dmitriy-kozlov",
        specialty: "Функциональный тренинг",
        rating: "4.7",
        experience: "7+ лет опыта",
        price: "от 2300₽/час",
        icon: Target,
        gradient: "from-orange-400 to-red-600",
        hoverGradient: "hover:from-orange-600 hover:to-red-700",
        textColor: "text-orange-100",
        iconColor: "text-orange-600",
        badgeColor: "bg-orange-100 text-orange-800",
        description: "Эксперт функционального тренинга. Улучшит координацию и выносливость.",
        badges: ["TRX", "Функциональный", "Реабилитация"],
        category: "Функциональный",
        link: "/trainers/dmitriy-kozlov",
        bookingLink: "/book-trainer/dmitriy-kozlov",
        bio: "Дмитрий - специалист по функциональному тренингу и реабилитации. Работает с профессиональными спортсменами и людьми после травм. Эксперт по TRX, кроссфиту и движениям с собственным весом.",
        education: [
            "Высшее медицинское образование (ЛФК)",
            "Сертификат TRX Suspension Trainer",
            "Курс спортивной реабилитации",
            "Обучение кинезиотерапии"
        ],
        achievements: [
            "Реабилитировал более 100 спортсменов",
            "Сертифицированный TRX-инструктор",
            "Работал с олимпийскими сборными",
            "Автор программ восстановления после травм"
        ],
    },
    {
        name: "Ольга Иванова",
        slug: "olga-ivanova",
        specialty: "Групповые программы",
        rating: "4.9",
        experience: "4+ года опыта",
        price: "от 1800₽/час",
        icon: Users,
        gradient: "from-teal-400 to-cyan-600",
        hoverGradient: "hover:from-teal-600 hover:to-cyan-700",
        textColor: "text-teal-100",
        iconColor: "text-teal-600",
        badgeColor: "bg-teal-100 text-teal-800",
        description: "Энергичный тренер групповых программ. Сделает тренировки веселыми!",
        badges: ["Аэробика", "Зумба", "Степ"],
        category: "Групповые",
        link: "/trainers/olga-ivanova",
        bookingLink: "/book-trainer/olga-ivanova",
        bio: "Ольга - энергичный и мотивирующий тренер групповых программ. Специализируется на аэробике, зумбе и танцевальных направлениях. Создает позитивную атмосферу и помогает клиентам полюбить фитнес.",
        education: [
            "Диплом хореографа",
            "Сертификат Zumba Instructor",
            "Курс групповых фитнес-программ",
            "Обучение степ-аэробике"
        ],
        achievements: [
            "Ведет более 20 групповых занятий в неделю",
            "Организатор фитнес-марафонов",
            "Призер соревнований по аэробике",
            "Любимый тренер клиентов (рейтинг 4.9/5)"
        ],
    },
    {
        name: "Александр Петров",
        slug: "aleksandr-petrov",
        specialty: "Персональный тренинг",
        rating: "5.0",
        experience: "10+ лет опыта",
        price: "от 5000₽/час",
        icon: Crown,
        gradient: "from-violet-500 to-purple-700",
        hoverGradient: "hover:from-violet-600 hover:to-purple-800",
        textColor: "text-violet-100",
        iconColor: "text-violet-600",
        badgeColor: "bg-violet-100 text-violet-800",
        description: "Элитный персональный тренер. Работает с VIP-клиентами.",
        badges: ["VIP", "Элитный", "Премиум"],
        category: "VIP",
        link: "/trainers/aleksandr-petrov",
        bookingLink: "/book-trainer/aleksandr-petrov",
        bio: "Александр - элитный персональный тренер с 10-летним опытом работы с VIP-клиентами. Обладает уникальной методикой, сочетающей различные направления фитнеса для достижения максимальных результатов.",
        education: [
            "Магистр спортивных наук",
            "Международный сертификат ACSM",
            "Курс спортивной психологии",
            "Обучение элитному персональному тренингу"
        ],
        achievements: [
            "10+ лет работы с VIP-клиентами",
            "Персональный тренер звезд шоу-бизнеса",
            "Автор эксклюзивных тренировочных программ",
            "Консультант ведущих фитнес-клубов Москвы"
        ],
    },
];

export const getTrainerBySlug = (slug: string) => {
  return trainersData.find(trainer => trainer.slug === slug);
};

export const getAllTrainers = () => {
  return trainersData;
};

export const getTrainersByCategory = (category: string) => {
    if (category === "Все") return trainersData;
    return trainersData.filter(trainer => trainer.category === category);
};
