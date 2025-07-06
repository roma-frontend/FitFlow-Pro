// config/quickActions.ts
import { Apple, Users, CreditCard, Calendar, ShoppingBag, Moon, Droplet, Activity } from 'lucide-react';
import type { QuickAction } from '../types';

export const quickActionsConfig: QuickAction[] = [
  {
    title: "Apple Health",
    description: "Синхронизация с HealthKit",
    icon: Apple,
    action: "connect_apple_health",
    color: "from-gray-800 to-gray-600"
  },
  {
    title: "Анализ питания",
    description: "Калории и нутриенты",
    icon: Apple,
    action: "analyze_nutrition",
    color: "from-green-500 to-teal-600"
  },
  {
    title: "Подобрать тренера",
    description: "Найдем идеального тренера",
    icon: Users,
    action: "find_trainer",
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Выбрать абонемент",
    description: "Подберем тарифный план",
    icon: CreditCard,
    action: "choose_membership",
    color: "from-green-500 to-emerald-600"
  },
  {
    title: "Записаться",
    description: "Быстрая запись к тренеру",
    icon: Calendar,
    action: "book_training",
    color: "from-purple-500 to-pink-600"
  },
  {
    title: "Магазин",
    description: "Спортивное питание",
    icon: ShoppingBag,
    action: "visit_shop",
    color: "from-orange-500 to-red-600"
  },
  {
    title: "Трекер сна",
    description: "Записать сон",
    icon: Moon,
    action: "log_sleep",
    color: "from-indigo-500 to-blue-600"
  },
  {
    title: "Питьевой режим",
    description: "Добавить воду",
    icon: Droplet,
    action: "log_water",
    color: "from-blue-400 to-cyan-500"
  },
  {
    title: "Растяжка",
    description: "Программа восстановления",
    icon: Activity,
    action: "start_stretching",
    color: "from-purple-400 to-fuchsia-500"
  }
];