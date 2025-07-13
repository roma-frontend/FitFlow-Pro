// @/types/face-auth.types.ts - ИСПРАВЛЕННАЯ версия
export type FaceAuthMode = "login" | "register";
export type SwitchModeType = "mobile" | "desktop" | "modern" | "legacy";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface Landmark {
  x: number;
  y: number;
}

export interface Detection {
  box: BoundingBox;
  score: number;
  classScore: number;
  className: string;
}

// 🔥 ДОБАВЛЕН тип для AuthStatus
export type AuthStatusType = {
  authenticated: boolean;
  user?: any;
  loading?: boolean;
} | null | undefined;

// ✅ Унифицированная версия FaceDetectionData
export interface FaceDetectionData {
  descriptor: Float32Array;
  confidence: number;
  landmarks: Landmark[]; // ✅ Убираем optional, делаем обязательным
  boundingBox: BoundingBox;
  detection: Detection;
  box: BoundingBox;
}

// 🔥 ИСПРАВЛЕНО: Добавлен setIsRegistering согласно паттерну React.Dispatch<React.SetStateAction<boolean>>
export interface OptimizedFaceAuthProps {
  mode: FaceAuthMode;
  onSuccess: (userData: any) => void;
  viewMode?: SwitchModeType;
  setMode?: (mode: FaceAuthMode) => void;
  sessionId?: string;
  onSwitchMode?: (mode: SwitchModeType) => void;
  onFaceDetected?: (data: FaceDetectionData) => void;
  className?: string;
  isMobile?: boolean;
}

// Оригинальный FaceAuthProps остается без изменений для совместимости
export interface FaceAuthProps {
  mode?: FaceAuthMode;
  setMode?: (mode: FaceAuthMode) => void;
  faceData?: FaceDetectionData | null;
  sessionId?: string;
  scanCount?: number;
  lastScanTime?: Date | null;
  onFaceDetected?: (data: FaceDetectionData) => void;
  onSwitchMode?: (mode: SwitchModeType) => void;
  isMobile?: boolean;
  router?: any;
  isRegistering?: boolean;
  setIsRegistering?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  authStatus?: AuthStatusType;
}

// Остальные интерфейсы остаются без изменений...
export interface HeaderProps {
  mode: FaceAuthMode;
}

export interface ModeSwitchProps {
  mode: FaceAuthMode;
  setMode?: (mode: FaceAuthMode) => void;
}

export interface CameraSectionProps {
  mode: FaceAuthMode;
  isScanning: boolean;
  onStartScanning: () => Promise<void>;
  onStopScanning: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export interface PlatformSwitcherProps {
  onSwitchMode?: (mode: SwitchModeType) => void;
  onModernSwitch?: () => void;
}

export interface StatusPanelProps {
  authenticated: boolean;
  mode: FaceAuthMode;
}

export interface StatisticsPanelProps {
  scanCount: number;
  mode: FaceAuthMode;
  sessionId: string;
  lastScanTime: Date | null;
}

export interface SettingsPanelProps {
  showDebugInfo: boolean;
  onToggleDebug: (show: boolean) => void;
}

export interface DebugPanelProps {
  mode: FaceAuthMode;
  isScanning: boolean;
  authenticated: boolean;
  sessionId: string;
  scanCount: number;
  faceData: FaceDetectionData | null;
  lastScanTime: Date | null;
  props: FaceAuthProps;
}

export interface FooterProps {
  sessionId: string;
  onSwitchMode?: (mode: SwitchModeType) => void;
}

export type VideoCameraViewMode = "mobile" | "desktop" | "modern";