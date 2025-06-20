// utils/constants.ts (константы для приложения)
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
