// components/auth/face-auth/types/index.ts (обновляем)
// Просто реэкспортируем из централизованного файла
export * from "@/types/face-auth.types";

// Для обратной совместимости
export type { FaceDetectionData, FaceAuthProps, SwitchModeType } from "@/types/face-auth.types";
