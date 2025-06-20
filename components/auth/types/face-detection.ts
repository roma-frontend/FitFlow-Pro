// components/auth/face-scanner/types/face-detection.ts (расширенная версия)
export interface MediaPipeBoundingBox {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export interface MediaPipeKeypoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  label?: 'RIGHT_EYE' | 'LEFT_EYE' | 'NOSE_TIP' | 'MOUTH_CENTER' | 'RIGHT_EAR_TRAGION' | 'LEFT_EAR_TRAGION';
}

// ✅ Официальная структура MediaPipe Face Detection
export interface MediaPipeFaceDetection {
  boundingBox: MediaPipeBoundingBox;
  keypoints: MediaPipeKeypoint[];
  confidence: number;
  categories?: Array<{
    index: number;
    score: number;
    categoryName?: string;
  }>;
}

// ✅ Результат от MediaPipe Face Detector
export interface MediaPipeFaceDetectionResult {
  detections: MediaPipeFaceDetection[];
  timestamp?: number;
}

// ✅ Ваш адаптированный интерфейс
export interface MediaPipeFaceData {
  boundingBox: MediaPipeBoundingBox;
  keypoints?: MediaPipeKeypoint[];
  confidence: number;
  detections?: MediaPipeFaceDetection[];
  landmarks?: any[];
  categories?: Array<{
    index: number;
    score: number;
    categoryName?: string;
  }>;
  // ✅ Дополнительные поля для обратной совместимости
  box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DetectionResults {
  faces: MediaPipeFaceData[];
  timestamp: number;
  processingTime: number;
  width?: number;
  height?: number;
}

// ✅ Настройки камеры
export interface CameraSettings {
  resolution: '720p' | '1080p' | '4k';
  frameRate: number;
  facingMode: 'user' | 'environment';
  minDetectionConfidence?: number;
  maxNumFaces?: number;
  modelSelection?: 0 | 1;
}

// ✅ Дескриптор лица
export interface FaceDescriptor {
  id: string;
  name: string;
  email?: string;
  faceDescriptor: number[];
  createdAt?: Date;
  userId?: string;
  thumbnail?: string;
  metadata?: {
    quality: number;
    landmarks: MediaPipeKeypoint[];
    captureDevice?: string;
  };
}

// ✅ Type guards для безопасности типов
export function isMediaPipeFaceDetection(obj: any): obj is MediaPipeFaceDetection {
  return obj && 
         typeof obj.confidence === 'number' && 
         obj.boundingBox &&
         typeof obj.boundingBox.originX === 'number' &&
         typeof obj.boundingBox.originY === 'number' &&
         typeof obj.boundingBox.width === 'number' &&
         typeof obj.boundingBox.height === 'number' &&
         Array.isArray(obj.keypoints);
}

export function isMediaPipeFaceData(obj: any): obj is MediaPipeFaceData {
  return obj && 
         typeof obj.confidence === 'number' && 
         obj.boundingBox &&
         typeof obj.boundingBox.originX === 'number';
}

export function isFaceDescriptor(obj: any): obj is FaceDescriptor {
  return obj && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string' && 
         Array.isArray(obj.faceDescriptor) &&
         obj.faceDescriptor.length > 0;
}

// ✅ Утилитарные типы
export type FaceDetectionCallback = (results: DetectionResults) => void;
export type ErrorCallback = (error: Error) => void;
export type ViewMode = 'desktop' | 'mobile' | 'modern';
export type AuthMode = 'login' | 'register';

// ✅ Перечисления для ясности
export enum DetectionModel {
  SHORT_RANGE = 0,
  FULL_RANGE = 1
}

export enum KeypointType {
  RIGHT_EYE = 0,
  LEFT_EYE = 1,
  NOSE_TIP = 2,
  MOUTH_CENTER = 3,
  RIGHT_EAR_TRAGION = 4,
  LEFT_EAR_TRAGION = 5
}

// ✅ Конфигурация MediaPipe
export interface MediaPipeConfig {
  modelAssetPath?: string;
  minDetectionConfidence: number;
  maxNumFaces: number;
  modelSelection: DetectionModel;
  runningMode: 'IMAGE' | 'VIDEO';
}

// ✅ Метрики производительности
export interface PerformanceMetrics {
  fps: number;
  detectionTime: number;
  renderTime: number;
  memoryUsage?: number;
  modelLoadTime?: number;
}

// ✅ Состояния детекции
export enum DetectionState {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  DETECTING = 'detecting',
  ERROR = 'error'
}

export interface DetectionStatus {
  state: DetectionState;
  message?: string;
  progress?: number;
  error?: Error;
}
