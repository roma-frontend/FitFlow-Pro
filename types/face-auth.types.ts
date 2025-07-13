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
  detected: boolean;
  boundingBox: BoundingBox | null;
  landmarks: Landmark[];
  quality: QualityMetrics;
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

export interface QualityMetrics {
  lighting: number;    // 0-1
  stability: number;   // 0-1
  clarity: number;     // 0-1
}

export interface Landmark {
  x: number;
  y: number;
  type: 'eye' | 'nose' | 'mouth' | 'face';
  confidence?: number;
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

export type ScanStage = 'initializing' | 'detecting' | 'analyzing' | 'processing' | 'complete' | 'failed';

export interface ScanProgress {
  stage: ScanStage;
  progress: number;
  countdown: number;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  loading: boolean;
  error?: string;
}

export interface QualityMetrics {
  lighting: number;    // 0-1
  stability: number;   // 0-1
  clarity: number;     // 0-1
}



// Детекция лица
export interface Detection {
  detected: boolean;
  boundingBox: BoundingBox | null;
  landmarks: Landmark[];
  quality: QualityMetrics;
}

export interface FaceAuthState {
  isScanning: boolean;
  isRegistering: boolean;
  faceDetection: Detection;
  faceData: FaceDetectionData | null;
  authStatus: AuthStatus | null;
  scanProgress: ScanProgress;
  scanCount: number;
  lastScanTime: Date | null;
}

export type FaceAuthAction =
  | { type: 'START_SCANNING' }
  | { type: 'STOP_SCANNING' }
  | { type: 'SET_REGISTERING'; payload: boolean }
  | { type: 'SET_FACE_DETECTION'; payload: Detection }
  | { type: 'SET_FACE_DATA'; payload: FaceDetectionData | null }
  | { type: 'SET_AUTH_STATUS'; payload: AuthStatus }
  | { type: 'SET_SCAN_PROGRESS'; payload: ScanProgress }
  | { type: 'INCREMENT_SCAN_COUNT' }
  | { type: 'SET_LAST_SCAN_TIME'; payload: Date }
  | { type: 'RESET_STATE' };

// Действия контекста
export interface FaceAuthActions {
  startScanning: () => void;
  stopScanning: () => void;
  setRegistering: (value: boolean) => void;
  setFaceDetection: (detection: Detection) => void;
  setFaceData: (data: FaceDetectionData | null) => void;
  setAuthStatus: (status: AuthStatus) => void;
  resetState: () => void;
}

export interface FaceAuthContextValue {
  state: FaceAuthState;
  dispatch: React.Dispatch<FaceAuthAction>;
  actions: FaceAuthActions;
}

export const faceAuthAnimations = {
  keyframes: {
    scan: {
      '0%': { transform: 'translateY(-100%)' },
      '100%': { transform: 'translateY(100%)' }
    },
    'scan-vertical': {
      '0%': { transform: 'translateY(-100%)' },
      '50%': { transform: 'translateY(100%)' },
      '100%': { transform: 'translateY(-100%)' }
    }
  },
  animation: {
    scan: 'scan 2s ease-in-out infinite',
    'scan-vertical': 'scan-vertical 3s ease-in-out infinite'
  }
};

export type VideoCameraViewMode = "mobile" | "desktop" | "modern";