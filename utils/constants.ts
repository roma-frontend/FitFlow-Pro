// utils/constants.ts (константы для приложения)

import { Dumbbell, Star, Trophy, Infinity } from "lucide-react";

export const PLAN_ICONS = {
  basic: Dumbbell,
  premium: Star,
  vip: Trophy,
  unlimited: Infinity
} as const;

export const PLAN_COLORS = {
  basic: "from-gray-500 to-gray-600",
  premium: "from-blue-500 to-indigo-600", 
  vip: "from-purple-500 to-pink-600",
  unlimited: "from-yellow-500 to-orange-600"
} as const;

export const DURATION_LABELS = {
  30: "Месячный",
  90: "Квартальный", 
  180: "Полугодовой",
  365: "Годовой"
} as const;

export const PLAN_TYPES = [
  { value: "basic", label: "Базовый" },
  { value: "premium", label: "Премиум" },
  { value: "vip", label: "VIP" },
  { value: "unlimited", label: "Безлимит" }
] as const;


export const TRAINER_STATUS = {
  ACTIVE: 'active',
  BUSY: 'busy',
  INACTIVE: 'inactive',
  VACATION: 'vacation',
} as const;

export const TRAINER_STATUS_LABELS = {
  [TRAINER_STATUS.ACTIVE]: 'Активен',
  [TRAINER_STATUS.BUSY]: 'Занят',
  [TRAINER_STATUS.INACTIVE]: 'Неактивен',
  [TRAINER_STATUS.VACATION]: 'В отпуске',
} as const;

export const WORKOUT_TYPES = {
  PERSONAL: 'personal',
  GROUP: 'group',
  CARDIO: 'cardio',
  STRENGTH: 'strength',
  YOGA: 'yoga',
  PILATES: 'pilates',
  CROSSFIT: 'crossfit',
} as const;

export const WORKOUT_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  MISSED: 'missed',
} as const;

export const DEFAULT_WORKING_HOURS = {
  start: '09:00',
  end: '18:00',
  days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'],
};

export const PAGINATION_LIMITS = {
  TRAINERS: 12,
  CLIENTS: 20,
  WORKOUTS: 15,
  MESSAGES: 50,
} as const;

export const API_ENDPOINTS = {
  TRAINERS: '/api/trainers',
  CLIENTS: '/api/clients',
  WORKOUTS: '/api/workouts',
  BOOKINGS: '/api/bookings',
  MESSAGES: '/api/messages',
  STATS: '/api/stats',
} as const;
