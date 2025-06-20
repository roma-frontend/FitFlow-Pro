// utils/faceAuthUtils.ts
import { BoundingBox, Landmark, FaceDetectionData, Detection } from '@/types/face-auth.types';

export const createBoundingBox = (
  x: number, 
  y: number, 
  width: number, 
  height: number
): BoundingBox => ({
  x,
  y,
  width,
  height,
  top: y,
  left: x,
  bottom: y + height,
  right: x + width
});

// 🔥 ДОБАВЛЕНО: Функция создания FaceDetectionData
export const createFaceDetectionData = (
  descriptor: Float32Array,
  confidence: number,
  boundingBox: BoundingBox
): FaceDetectionData => {
  const landmarks: Landmark[] = [
    { x: boundingBox.x + boundingBox.width * 0.3, y: boundingBox.y + boundingBox.height * 0.3 }, // left eye
    { x: boundingBox.x + boundingBox.width * 0.7, y: boundingBox.y + boundingBox.height * 0.3 }, // right eye
    { x: boundingBox.x + boundingBox.width * 0.5, y: boundingBox.y + boundingBox.height * 0.5 }, // nose
    { x: boundingBox.x + boundingBox.width * 0.4, y: boundingBox.y + boundingBox.height * 0.7 }, // mouth left
    { x: boundingBox.x + boundingBox.width * 0.6, y: boundingBox.y + boundingBox.height * 0.7 }, // mouth right
  ];

  const detection: Detection = {
    box: boundingBox,
    score: confidence / 100,
    classScore: confidence / 100,
    className: 'face'
  };

  return {
    descriptor,
    confidence,
    landmarks,
    boundingBox,
    detection,
    box: boundingBox
  };
};

export const calculateFaceCenter = (boundingBox: BoundingBox): { x: number; y: number } => ({
  x: boundingBox.x + boundingBox.width / 2,
  y: boundingBox.y + boundingBox.height / 2
});

export const calculateDistance = (point1: Landmark, point2: Landmark): number => {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

export const validateFaceData = (faceData: FaceDetectionData): boolean => {
  return (
    faceData.confidence > 0 &&
    faceData.landmarks.length >= 5 &&
    faceData.descriptor.length > 0 &&
    faceData.boundingBox.width > 0 &&
    faceData.boundingBox.height > 0
  );
};

export const formatConfidence = (confidence: number): string => {
  return `${confidence.toFixed(1)}%`;
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 🔥 ДОБАВЛЕНО: Функция генерации случайных ландмарков
export const generateRandomLandmarks = (boundingBox: BoundingBox): Landmark[] => {
  const centerX = boundingBox.x + boundingBox.width / 2;
  const centerY = boundingBox.y + boundingBox.height / 2;
  
  return [
    { x: centerX - 25 + (Math.random() - 0.5) * 10, y: centerY - 30 + (Math.random() - 0.5) * 10 }, // left eye
    { x: centerX + 25 + (Math.random() - 0.5) * 10, y: centerY - 30 + (Math.random() - 0.5) * 10 }, // right eye
    { x: centerX + (Math.random() - 0.5) * 10, y: centerY - 5 + (Math.random() - 0.5) * 10 }, // nose
    { x: centerX - 15 + (Math.random() - 0.5) * 10, y: centerY + 25 + (Math.random() - 0.5) * 10 }, // mouth left
    { x: centerX + 15 + (Math.random() - 0.5) * 10, y: centerY + 25 + (Math.random() - 0.5) * 10 }, // mouth right
  ];
};

// 🔥 ДОБАВЛЕНО: Функция расчета качества детекции
export const calculateDetectionQuality = (boundingBox: BoundingBox, landmarks: Landmark[]): {
  lighting: number;
  stability: number;
  clarity: number;
} => {
  // Симуляция качества на основе размера лица и количества ландмарков
  const faceSize = boundingBox.width * boundingBox.height;
  const optimalSize = 200 * 200; // Оптимальный размер лица
  
  const sizeQuality = Math.min(100, (faceSize / optimalSize) * 100);
  const landmarkQuality = Math.min(100, (landmarks.length / 5) * 100);
  
  return {
    lighting: 60 + Math.random() * 40,
    stability: Math.max(50, sizeQuality + (Math.random() - 0.5) * 20),
    clarity: Math.max(50, landmarkQuality + (Math.random() - 0.5) * 20)
  };
};
