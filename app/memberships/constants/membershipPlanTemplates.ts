import { Dumbbell, Star, Trophy, Infinity } from "lucide-react";

export const membershipPlanTemplates = [
  {
    id: "basic",
    type: "basic",
    name: "Базовый",
    description: "Идеально для начинающих",
    price: 2990,
    duration: 30,
    features: [
      "Доступ в тренажерный зал",
      "Базовые групповые занятия",
      "Раздевалка и душ",
      "Консультация тренера"
    ],
    limitations: [
      "Без персональных тренировок",
      "Ограниченное время посещения"
    ],
    color: "from-gray-500 to-gray-600",
    icon: Dumbbell
  },
  {
    id: "premium",
    type: "premium",
    name: "Премиум",
    description: "Для активных спортсменов",
    price: 4990,
    duration: 30,
    features: [
      "Всё из Базового",
      "Все групповые программы",
      "Сауна и бассейн",
      "2 персональные тренировки",
      "Приоритетная запись"
    ],
    color: "from-blue-500 to-indigo-600",
    icon: Star,
    popular: true
  },
  {
    id: "vip",
    type: "vip",
    name: "VIP",
    description: "Максимум возможностей",
    price: 7990,
    duration: 30,
    features: [
      "Всё из Премиум",
      "8 персональных тренировок",
      "Личный шкафчик",
      "Питание в фитнес-баре",
      "Массаж 2 раза в месяц",
      "Приоритетная парковка"
    ],
    color: "from-purple-500 to-pink-600",
    icon: Trophy,
    discount: 10
  },
  {
    id: "unlimited",
    type: "unlimited",
    name: "Безлимит",
    description: "Годовой абонемент",
    price: 39900,
    duration: 365,
    features: [
      "Все возможности VIP",
      "Безлимитные тренировки",
      "Гостевые визиты",
      "Заморозка до 30 дней",
      "Специальные мероприятия",
      "Подарочный фитнес-набор"
    ],
    color: "from-yellow-500 to-orange-600",
    icon: Infinity,
    discount: 25
  }
];