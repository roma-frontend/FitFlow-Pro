// components/book-trainer/constants/index.ts
export const WORKOUT_TYPES = [
  "Персональная тренировка",
  "Консультация",
  "Составление программы",
  "Техника выполнения",
  "Растяжка",
] as const;

export const DURATION_OPTIONS = [
  { value: 30, label: "30 минут" },
  { value: 60, label: "60 минут" },
  { value: 90, label: "90 минут" },
  { value: 120, label: "120 минут" },
] as const;

export const SPECIALIZATIONS = [
  "Силовые тренировки",
  "Йога",
  "Кардио",
  "Кроссфит",
  "Пилатес",
  "Функциональный тренинг",
  "Растяжка",
  "Реабилитация",
] as const;

export const PRICE_FILTERS = [
  { value: "all", label: "Любая цена" },
  { value: "budget", label: "До 2000 ₽" },
  { value: "medium", label: "2000-3500 ₽" },
  { value: "premium", label: "От 3500 ₽" },
] as const;

export const BOOKING_STEPS = [
  { key: "select", label: "Выберите тренера" },
  { key: "schedule", label: "Выберите дату и время" },
  { key: "details", label: "Детали тренировки" },
  { key: "confirm", label: "Подтверждение записи" },
] as const;
