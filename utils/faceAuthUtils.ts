// utils/faceAuthUtils.ts - Утилиты для Face Auth

import {
  BoundingBox,
  Landmark,
  QualityMetrics,
  FaceDetectionData,
  Detection
} from '@/types/face-auth.types';

// Создание BoundingBox с правильными свойствами
export function createBoundingBox(
  x: number,
  y: number,
  width: number,
  height: number
): BoundingBox {
  return { 
    x, 
    y, 
    width, 
    height,
    top: y,
    left: x,
    bottom: y + height,
    right: x + width
  };
}

// Генерация случайных ключевых точек лица для демо (с типом, так как он обязательный)
export function generateRandomLandmarks(boundingBox: BoundingBox): Landmark[] {
  const { x, y, width, height } = boundingBox;
  
  return [
    // Глаза
    { x: x + width * 0.3, y: y + height * 0.35, type: 'eye' as const, confidence: 0.9 },
    { x: x + width * 0.7, y: y + height * 0.35, type: 'eye' as const, confidence: 0.9 },
    // Нос
    { x: x + width * 0.5, y: y + height * 0.5, type: 'nose' as const, confidence: 0.85 },
    // Рот
    { x: x + width * 0.3, y: y + height * 0.7, type: 'mouth' as const, confidence: 0.8 },
    { x: x + width * 0.5, y: y + height * 0.75, type: 'mouth' as const, confidence: 0.8 },
    { x: x + width * 0.7, y: y + height * 0.7, type: 'mouth' as const, confidence: 0.8 },
    // Контур лица
    { x: x, y: y + height * 0.5, type: 'face' as const, confidence: 0.7 },
    { x: x + width, y: y + height * 0.5, type: 'face' as const, confidence: 0.7 },
    { x: x + width * 0.5, y: y, type: 'face' as const, confidence: 0.7 },
    { x: x + width * 0.5, y: y + height, type: 'face' as const, confidence: 0.7 },
  ];
}

// Расчет качества детекции
export function calculateDetectionQuality(
  boundingBox: BoundingBox,
  landmarks: Landmark[]
): QualityMetrics {
  // Симуляция расчета качества
  const lighting = 0.7 + Math.random() * 0.3; // 70-100%
  const stability = 0.8 + Math.random() * 0.2; // 80-100%
  const clarity = 0.75 + Math.random() * 0.25; // 75-100%
  
  return {
    lighting: Math.min(1, lighting),
    stability: Math.min(1, stability),
    clarity: Math.min(1, clarity)
  };
}

// Создание данных детекции лица согласно типу FaceDetectionData
export function createFaceDetectionData(
  descriptor: Float32Array,
  confidence: number,
  boundingBox: BoundingBox,
  landmarks?: Landmark[]
): FaceDetectionData {
  const generatedLandmarks = landmarks || generateRandomLandmarks(boundingBox);
  
  // Создаем Detection объект согласно актуальному интерфейсу Detection
  const detection: Detection = {
    detected: true,
    boundingBox: boundingBox,
    landmarks: generatedLandmarks,
    quality: calculateDetectionQuality(boundingBox, generatedLandmarks)
  };

  return {
    descriptor,
    confidence,
    landmarks: generatedLandmarks,
    boundingBox,
    detection,
    box: boundingBox // Дублируем boundingBox как box согласно интерфейсу
  };
}

// Проверка качества для принятия решения
export function isQualityAcceptable(quality: QualityMetrics): boolean {
  const avgQuality = (quality.lighting + quality.stability + quality.clarity) / 3;
  return avgQuality >= 0.6; // 60% минимальное среднее качество
}

// Форматирование процентов качества
export function formatQualityPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

// Преобразование дескриптора в строку для сравнения
export function descriptorToString(descriptor: Float32Array | number[]): string {
  return Array.from(descriptor).map(v => v.toFixed(4)).join(',');
}

// Сравнение дескрипторов (простое косинусное сходство)
export function compareDescriptors(
  desc1: Float32Array | number[],
  desc2: Float32Array | number[]
): number {
  const arr1 = Array.from(desc1);
  const arr2 = Array.from(desc2);
  
  if (arr1.length !== arr2.length) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < arr1.length; i++) {
    dotProduct += arr1[i] * arr2[i];
    norm1 += arr1[i] * arr1[i];
    norm2 += arr2[i] * arr2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  if (norm1 === 0 || norm2 === 0) return 0;
  
  const cosineSimilarity = dotProduct / (norm1 * norm2);
  return (cosineSimilarity + 1) / 2; // Нормализуем к [0, 1]
}

// Валидация дескриптора
export function isValidDescriptor(descriptor: any): boolean {
  return (
    descriptor &&
    (descriptor instanceof Float32Array || Array.isArray(descriptor)) &&
    descriptor.length === 128
  );
}

// Создание пустой детекции согласно актуальному типу Detection
export function createEmptyDetection(): Detection {
  return {
    detected: false,
    boundingBox: null,
    landmarks: [],
    quality: {
      lighting: 0,
      stability: 0,
      clarity: 0
    }
  };
}

// Создание полной пустой детекции для состояния
export function createEmptyFaceDetection(): Detection {
  return {
    detected: false,
    boundingBox: null,
    landmarks: [],
    quality: {
      lighting: 0,
      stability: 0,
      clarity: 0
    }
  };
}

// Создание простой детекции с базовыми свойствами (если нужен первый тип Detection)
export function createSimpleDetection(): {
  box: BoundingBox;
  score: number;
  classScore: number;
  className: string;
} {
  const emptyBox: BoundingBox = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  };

  return {
    box: emptyBox,
    score: 0,
    classScore: 0,
    className: ''
  };
}

// Проверка поддержки getUserMedia
export function isCameraSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
}

// Получение сообщения об ошибке камеры
export function getCameraErrorMessage(error: Error): string {
  switch (error.name) {
    case 'NotAllowedError':
      return 'Доступ к камере запрещен. Разрешите доступ в настройках браузера.';
    case 'NotFoundError':
      return 'Камера не найдена. Проверьте подключение камеры.';
    case 'NotReadableError':
      return 'Камера уже используется другим приложением.';
    case 'OverconstrainedError':
      return 'Камера не поддерживает требуемые параметры.';
    default:
      return 'Не удалось получить доступ к камере.';
  }
}