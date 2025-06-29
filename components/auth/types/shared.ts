// types/shared.ts (для избежания дублирования типов)
export type FaceAuthMode = "login" | "register";
export type SwitchModeType = "mobile" | "modern" | "legacy";

// Экспортируем в оба места
export * from "@/types/face-auth.types";
