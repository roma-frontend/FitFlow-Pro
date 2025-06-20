// components/member/header/config/navigationItems.ts
import { 
  Home, 
  Calendar, 
  BarChart3, 
  Users, 
  Settings,
  type LucideIcon 
} from 'lucide-react';
import type { NavigationItem } from '../types';

export const navigationItems: NavigationItem[] = [
  {
    href: '/schedule',
    label: 'Расписание',
    icon: Calendar as LucideIcon,
    badge: '3',
    badgeColor: 'bg-blue-500 text-white',
    visible: true
  },
  {
    href: '/progress',
    label: 'Прогресс',
    icon: BarChart3 as LucideIcon,
    badge: null,
    visible: true
  },
  {
    href: '/community',
    label: 'Сообщество',
    icon: Users as LucideIcon,
    badge: 'NEW',
    badgeColor: 'bg-green-500 text-white',
    visible: true
  },
  {
    href: '/settings',
    label: 'Настройки',
    icon: Settings as LucideIcon,
    badge: null,
    visible: true
  }
];
