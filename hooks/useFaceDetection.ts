// hooks/useFaceDetection.ts - ОПТИМИЗИРОВАННАЯ ЛОГИКА ДЕТЕКЦИИ
import { useState, useRef, useCallback, useEffect } from 'react';

interface FaceDetection {
  detected: boolean;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  landmarks: Array<{ x: number; y: number; type: string }>;
  quality: { lighting: number; stability: number; clarity: number };
}

interface ScanProgress {
  stage: 'initializing' | 'detecting' | 'analyzing' | 'processing' | 'complete' | 'failed';
  progress: number;
  countdown: number;
}

export function useFaceDetection() {
  const [faceDetection, setFaceDetection] = useState<FaceDetection>({
    detected: false,
    boundingBox: null,
    landmarks: [],
    quality: { lighting: 0, stability: 0, clarity: 0 }
  });
  
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    stage: 'initializing',
    progress: 0,
    countdown: 3
  });

  const animationRef = useRef<number | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ МЕМОИЗИРОВАННАЯ функция симуляции
  const startDetection = useCallback((isScanning: boolean) => {
    if (!isScanning) return;

    // Очищаем предыдущий интервал
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(() => {
      if (!isScanning) {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
        return;
      }

      // Генерируем данные детекции
      const centerX = 320; // Фиксированная позиция для оптимизации
      const centerY = 240;
      const faceWidth = 180 + Math.random() * 40;
      const faceHeight = 220 + Math.random() * 40;
      
      const lighting = 60 + Math.random() * 40;
      const stability = 70 + Math.random() * 30;
      const clarity = 65 + Math.random() * 35;
      
      setFaceDetection({
        detected: true,
        boundingBox: {
          x: centerX - faceWidth/2,
          y: centerY - faceHeight/2,
          width: faceWidth,
          height: faceHeight
        },
        landmarks: [
          { x: centerX - 25, y: centerY - 30, type: 'left_eye' },
          { x: centerX + 25, y: centerY - 30, type: 'right_eye' },
          { x: centerX, y: centerY - 5, type: 'nose' },
          { x: centerX - 15, y: centerY + 25, type: 'mouth_left' },
          { x: centerX + 15, y: centerY + 25, type: 'mouth_right' },
        ],
        quality: { lighting, stability, clarity }
      });
    }, 200); // Увеличили интервал для оптимизации
  }, []);

  // ✅ ОПТИМИЗИРОВАННЫЙ рендер детекции
  const renderDetection = useCallback((
    canvas: HTMLCanvasElement | null,
    video: HTMLVideoElement | null
  ) => {
    if (!canvas || !video || !faceDetection.detected) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Используем requestAnimationFrame только при необходимости
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { boundingBox, landmarks, quality } = faceDetection;
    
    if (boundingBox) {
      const avgQuality = (quality.lighting + quality.stability + quality.clarity) / 3;
      const color = avgQuality > 80 ? '#10B981' : avgQuality > 60 ? '#F59E0B' : '#EF4444';
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.lineDashOffset = -Date.now() / 50;
      
      // Рамка
      ctx.strokeRect(
        boundingBox.x * (canvas.width / 640),
        boundingBox.y * (canvas.height / 480),
        boundingBox.width * (canvas.width / 640),
        boundingBox.height * (canvas.height / 480)
      );
      
      // Упрощенные углы (без сложной геометрии)
      ctx.setLineDash([]);
      ctx.lineWidth = 4;
      
      // Точки лица (упрощенные)
      landmarks.forEach((landmark, index) => {
        const x = landmark.x * (canvas.width / 640);
        const y = landmark.y * (canvas.height / 480);
        
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [faceDetection]);

  // ✅ Прогресс сканирования
  const runScanProgress = useCallback(async () => {
    const steps = [
      { stage: 'detecting' as const, duration: 800 },
      { stage: 'analyzing' as const, duration: 2000 },
      { stage: 'processing' as const, duration: 1200 }
    ];

    for (const step of steps) {
      setScanProgress(prev => ({ ...prev, stage: step.stage, progress: 0 }));
      
      const startTime = Date.now();
      await new Promise<void>((resolve) => {
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / step.duration) * 100, 100);
          setScanProgress(prev => ({ ...prev, progress }));
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            resolve();
          }
        }, 100); // Увеличили интервал
      });
    }

    setScanProgress({ stage: 'complete', progress: 100, countdown: 0 });
  }, []);

  // ✅ Очистка
  const cleanup = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setFaceDetection({
      detected: false,
      boundingBox: null,
      landmarks: [],
      quality: { lighting: 0, stability: 0, clarity: 0 }
    });
    setScanProgress({ stage: 'initializing', progress: 0, countdown: 3 });
  }, []);

  return {
    faceDetection,
    scanProgress,
    startDetection,
    renderDetection,
    runScanProgress,
    cleanup,
    setScanProgress
  };
}
