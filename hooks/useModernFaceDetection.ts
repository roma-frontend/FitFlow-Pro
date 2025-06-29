// hooks/useModernFaceDetection.ts
"use client";

import { useState, useCallback, useRef } from 'react';
import { FaceLandmarker, FilesetResolver, ImageSource } from '@mediapipe/tasks-vision';

interface FaceKeypoint {
  x: number;
  y: number;
  z?: number;
  name?: string;
}

interface MediaPipeFaceData {
  confidence: number;
  boundingBox: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
  keypoints?: FaceKeypoint[];
  landmarks?: { x: number; y: number }[];
}

interface FaceDetectionHook {
  faceDetector: FaceLandmarker | null;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  initializeDetector: () => Promise<void>;
  detectFaces: (videoElement: HTMLVideoElement) => Promise<MediaPipeFaceData[]>;
}

export function useModernFaceDetection(): FaceDetectionHook {
  const [faceDetector, setFaceDetector] = useState<FaceLandmarker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detectorRef = useRef<FaceLandmarker | null>(null);

  const initializeDetector = useCallback(async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Initializing MediaPipe Face Detection...');

      // Загружаем основные файлы MediaPipe
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      // Создаем детектор лиц
      const detector = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
        runningMode: "VIDEO",
        numFaces: 1,
        minFaceDetectionConfidence: 0.7,
        minFacePresenceConfidence: 0.7,
        minTrackingConfidence: 0.7
      });

      detectorRef.current = detector;
      setFaceDetector(detector);
      setIsLoaded(true);
      console.log('✅ MediaPipe Face Detection initialized successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Failed to initialize face detection:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  const detectFaces = useCallback(async (videoElement: HTMLVideoElement): Promise<MediaPipeFaceData[]> => {
    if (!detectorRef.current || !videoElement) {
      return [];
    }

    try {
      const nowInMs = Date.now();
      const results = detectorRef.current.detectForVideo(videoElement as ImageSource, nowInMs);

      if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
        return [];
      }

      return results.faceLandmarks.map((landmarks, index) => {
        // Получаем bounding box из ландмарков
        const xCoords = landmarks.map(point => point.x);
        const yCoords = landmarks.map(point => point.y);
        
        const minX = Math.min(...xCoords);
        const maxX = Math.max(...xCoords);
        const minY = Math.min(...yCoords);
        const maxY = Math.max(...yCoords);

        // Конвертируем в пиксели
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;

        const boundingBox = {
          originX: minX * videoWidth,
          originY: minY * videoHeight,
          width: (maxX - minX) * videoWidth,
          height: (maxY - minY) * videoHeight
        };

        // Ключевые точки лица (глаза, нос, рот)
        const keypoints: FaceKeypoint[] = [
          // Левый глаз (ландмарк 33)
          { x: landmarks[33].x, y: landmarks[33].y, name: 'left_eye' },
          // Правый глаз (ландмарк 263)
          { x: landmarks[263].x, y: landmarks[263].y, name: 'right_eye' },
          // Кончик носа (ландмарк 1)
          { x: landmarks[1].x, y: landmarks[1].y, name: 'nose_tip' },
          // Левый уголок рта (ландмарк 61)
          { x: landmarks[61].x, y: landmarks[61].y, name: 'mouth_left' },
          // Правый уголок рта (ландмарк 291)
          { x: landmarks[291].x, y: landmarks[291].y, name: 'mouth_right' }
        ];

        return {
          confidence: 0.95, // MediaPipe не возвращает confidence напрямую, используем высокое значение
          boundingBox,
          keypoints,
          landmarks: landmarks.map(point => ({ x: point.x, y: point.y }))
        };
      });

    } catch (err) {
      console.error('❌ Face detection error:', err);
      return [];
    }
  }, []);

  return {
    faceDetector,
    isLoaded,
    isLoading,
    error,
    initializeDetector,
    detectFaces
  };
}

// Экспортируем типы
export type { MediaPipeFaceData, FaceKeypoint, FaceDetectionHook };
