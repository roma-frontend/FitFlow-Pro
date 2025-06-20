// hooks/useMobileScanning.ts
import { FaceDetectionData } from '@/types/face-auth.types';
import { useCallback, useRef } from 'react';

interface UseMobileScanningProps {
  onFaceDetected?: (data: FaceDetectionData) => void;
  onScanComplete?: (success: boolean) => void;
}

export const useMobileScanning = ({ onFaceDetected, onScanComplete }: UseMobileScanningProps) => {
  const streamRef = useRef<MediaStream | null>(null);

  const createBoundingBox = useCallback((x: number, y: number, width: number, height: number) => ({
    x, y, width, height,
    top: y,
    left: x,
    bottom: y + height,
    right: x + width
  }), []);

  const startMobileScanning = useCallback(async (
    videoRef: React.RefObject<HTMLVideoElement | null>,
    mode: 'login' | 'register'
  ) => {
    try {
      // Оптимизированные настройки для мобильного
      const constraints = {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user', // Фронтальная камера
          frameRate: { ideal: 15, max: 30 } // Ограничиваем FPS для экономии батареи
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Симуляция мобильного сканирования с оптимизацией
      return new Promise<boolean>((resolve) => {
        setTimeout(async () => {
          const success = Math.random() > 0.2; // Выше шанс успеха на мобильном
          const confidence = Math.random() * 100;
          const boundingBox = createBoundingBox(50, 50, 200, 200);

          const mockFaceData: FaceDetectionData = {
            descriptor: new Float32Array(Array.from({ length: 128 }, () => Math.random())),
            confidence: confidence,
            landmarks: [
              { x: 100, y: 80 }, { x: 140, y: 80 }, { x: 120, y: 100 },
              { x: 110, y: 130 }, { x: 130, y: 130 }
            ],
            boundingBox: boundingBox,
            detection: {
              box: boundingBox,
              score: confidence / 100,
              classScore: confidence / 100,
              className: 'face'
            },
            box: boundingBox
          };

          if (success && onFaceDetected) {
            onFaceDetected(mockFaceData);
          }

          onScanComplete?.(success);
          resolve(success);
        }, 2500); // Быстрее для мобильного
      });

    } catch (error) {
      console.error('Mobile scanning error:', error);
      onScanComplete?.(false);
      throw error;
    }
  }, [createBoundingBox, onFaceDetected, onScanComplete]);

  const stopMobileScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  return {
    startMobileScanning,
    stopMobileScanning
  };
};
