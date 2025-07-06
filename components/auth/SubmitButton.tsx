// components/auth/SubmitButton.tsx
"use client";

import { UniversalSubmitButton } from './UniversalSubmitButton';

// Экспортируем UniversalSubmitButton как SubmitButton для обратной совместимости
export const SubmitButton = UniversalSubmitButton;

// Реэкспортируем тип если нужно
export type { UniversalSubmitButtonProps as SubmitButtonProps } from './UniversalSubmitButton';