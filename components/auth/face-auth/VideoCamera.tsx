// components/face-auth/VideoCamera.tsx - ИСПРАВИТЬ useEffect зависимости
"use client";

import React, { useRef, useEffect, useCallback, memo } from 'react';
import { useFaceAuthContext } from './FaceAuthProvider';
import { generateRandomLandmarks, calculateDetectionQuality, createBoundingBox } from '@/utils/faceAuthUtils';

interface VideoCameraProps {
  viewMode: "desktop" | "mobile" | "modern";
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

const VideoCamera = memo(({ 
  viewMode, 
  videoRef: externalVideoRef, 
  canvasRef: externalCanvasRef 
}: VideoCameraProps) => {
  const { state, actions } = useFaceAuthContext();
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const internalDetectionRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);
  const passiveDetectionRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🔥 ДОБАВЛЕНО: Рефы для предотвращения циклов
  const cameraActiveRef = useRef(state.cameraActive);
  const isScanningRef = useRef(state.isScanning);

  const videoRef = externalVideoRef || internalVideoRef;
  const detectionRef = externalCanvasRef || internalDetectionRef;

  // 🔥 ИСПРАВЛЕНО: Обновляем рефы при изменении состояния
  useEffect(() => {
    cameraActiveRef.current = state.cameraActive;
  }, [state.cameraActive]);

  useEffect(() => {
    isScanningRef.current = state.isScanning;
  }, [state.isScanning]);

  const getVideoConstraints = useCallback(() => {
    switch (viewMode) {
      case "mobile":
        return { 
          width: { ideal: 640, max: 1280 }, 
          height: { ideal: 480, max: 720 }, 
          facingMode: 'user',
          frameRate: { ideal: 15, max: 30 }
        };
      case "desktop":
        return { 
          width: { ideal: 1280, max: 1920 }, 
          height: { ideal: 720, max: 1080 }, 
          facingMode: 'user',
          frameRate: { ideal: 30, max: 60 }
        };
      default:
        return { 
          width: { ideal: 640, max: 1280 }, 
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 15, max: 30 }
        };
    }
  }, [viewMode]);

  // 🔥 ИСПРАВЛЕНО: Используем рефы вместо state для предотвращения циклов
  const startPassiveDetection = useCallback(() => {
    if (passiveDetectionRef.current || isScanningRef.current) return;

    console.log('👁️ Запуск пассивной детекции...');
    
    passiveDetectionRef.current = setInterval(() => {
      // Используем рефы вместо state
      if (isScanningRef.current) {
        if (passiveDetectionRef.current) {
          clearInterval(passiveDetectionRef.current);
          passiveDetectionRef.current = null;
        }
        return;
      }

      const detected = Math.random() > 0.4;
      
      if (detected) {
        const centerX = 320;
        const centerY = 240;
        const faceWidth = 160 + Math.random() * 30;
        const faceHeight = 200 + Math.random() * 30;
        
        const boundingBox = createBoundingBox(
          centerX - faceWidth/2,
          centerY - faceHeight/2,
          faceWidth,
          faceHeight
        );

        const landmarks = generateRandomLandmarks(boundingBox);
        const quality = calculateDetectionQuality(boundingBox, landmarks);

        actions.setFaceDetection({
          detected: true,
          boundingBox,
          landmarks,
          quality
        });
      } else {
        actions.setFaceDetection({
          detected: false,
          boundingBox: null,
          landmarks: [],
          quality: { lighting: 0, stability: 0, clarity: 0 }
        });
      }
    }, 1000);
  }, [actions]); // 🔥 УБРАЛИ state зависимости

  const stopPassiveDetection = useCallback(() => {
    if (passiveDetectionRef.current) {
      console.log('🛑 Остановка пассивной детекции...');
      clearInterval(passiveDetectionRef.current);
      passiveDetectionRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (isInitializedRef.current || !videoRef.current || !isMountedRef.current) {
      console.log('🎥 Камера уже инициализирована или компонент размонтирован');
      return;
    }
    
    try {
      console.log('🎥 Запуск камеры...');
      
      actions.setCameraStatus(false);
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('Камера не найдена');
      }

      const constraints = {
        video: getVideoConstraints(),
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!isMountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current;
          if (!video) {
            reject(new Error('Video element not available'));
            return;
          }

          const handleLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            console.log('✅ Метаданные видео загружены');
            isInitializedRef.current = true;
            actions.setCameraStatus(true);
            
            // 🔥 ИСПРАВЛЕНО: Запускаем пассивную детекцию через таймаут
            setTimeout(() => {
              if (isInitializedRef.current && !isScanningRef.current) {
                startPassiveDetection();
              }
            }, 1000);
            
            resolve();
          };

          const handleError = (e: Event) => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            actions.setCameraStatus(false);
            reject(new Error('Ошибка загрузки видео'));
          };

          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          video.addEventListener('error', handleError);
          
          setTimeout(() => {
            if (!isInitializedRef.current) {
              video.removeEventListener('loadedmetadata', handleLoadedMetadata);
              video.removeEventListener('error', handleError);
              actions.setCameraStatus(false);
              reject(new Error('Timeout loading video metadata'));
            }
          }, 5000);
        });

        console.log('✅ Камера успешно запущена');
      }
    } catch (error) {
      console.error("❌ Ошибка доступа к камере:", error);
      actions.setCameraStatus(false);
      isInitializedRef.current = false;
    }
  }, [getVideoConstraints, videoRef, actions, startPassiveDetection]); // 🔥 УБРАЛИ state.isScanning

  const stopCamera = useCallback(() => {
    console.log('🛑 Остановка камеры...');
    
    stopPassiveDetection();
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    actions.setCameraStatus(false);
    isInitializedRef.current = false;
    console.log('✅ Камера остановлена');
  }, [videoRef, actions, stopPassiveDetection]);

  // 🔥 ИСПРАВЛЕНО: Убираем проблемный useEffect
  // Управление пассивной детекцией теперь через отдельные эффекты
  useEffect(() => {
    if (state.cameraActive && !state.isScanning) {
      // Небольшая задержка для предотвращения циклов
      const timer = setTimeout(() => {
        if (cameraActiveRef.current && !isScanningRef.current) {
          startPassiveDetection();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      stopPassiveDetection();
    }
  }, [state.cameraActive]); // 🔥 УБРАЛИ state.isScanning из зависимостей

  // 🔥 ДОБАВЛЕНО: Отдельный эффект для остановки детекции при сканировании
  useEffect(() => {
    if (state.isScanning) {
      stopPassiveDetection();
    }
  }, [state.isScanning, stopPassiveDetection]);

  // Рендеринг детекции для активного сканирования
  const renderDetection = useCallback(() => {
    if (viewMode !== "modern" || !isScanningRef.current) return;
    
    const canvas = detectionRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video || video.readyState < 2) {
      if (isScanningRef.current) {
        animationRef.current = requestAnimationFrame(renderDetection);
      }
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;
    
    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (state.faceDetection.detected && state.faceDetection.boundingBox) {
      const { boundingBox, landmarks, quality } = state.faceDetection;
      
      const avgQuality = (quality.lighting + quality.stability + quality.clarity) / 3;
      const color = avgQuality > 80 ? '#10B981' : avgQuality > 60 ? '#F59E0B' : '#EF4444';
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      
      const scaleX = canvas.width / 640;
      const scaleY = canvas.height / 480;
      
      ctx.strokeRect(
        boundingBox.x * scaleX,
        boundingBox.y * scaleY,
        boundingBox.width * scaleX,
        boundingBox.height * scaleY
      );
      
      ctx.setLineDash([]);
      
      landmarks.forEach((landmark) => {
        const x = landmark.x * scaleX;
        const y = landmark.y * scaleY;
        
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    
    if (isScanningRef.current) {
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(renderDetection);
      }, 1000 / 15);
    }
  }, [viewMode, state.faceDetection, videoRef, detectionRef]); // 🔥 УБРАЛИ state.isScanning

  // 🔥 ИСПРАВЛЕНО: Упрощенный эффект инициализации
  useEffect(() => {
    isMountedRef.current = true;
    
    // Запускаем камеру с задержкой
    const initTimer = setTimeout(() => {
      if (isMountedRef.current) {
        startCamera();
      }
    }, 100);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initTimer);
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (state.isScanning && viewMode === "modern" && isInitializedRef.current) {
      const timer = setTimeout(() => {
        renderDetection();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [state.isScanning, viewMode]);

  return (
    <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
      {/* Индикатор статуса камеры */}
      <div className="absolute top-2 right-2 z-20 flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          state.cameraActive ? 'bg-green-500' : 'bg-red-500'
        } shadow-lg`}></div>
        <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
          {state.cameraActive ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* Индикатор детекции лица */}
      {state.cameraActive && (
        <div className="absolute top-2 left-2 z-20 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            state.faceDetection.detected ? 'bg-blue-500' : 'bg-gray-400'
          } shadow-lg`}></div>
          <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
            {state.faceDetection.detected ? 'FACE' : 'NO FACE'}
          </span>
        </div>
      )}

      {/* Индикатор загрузки */}
      {!state.cameraActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Подключение к камере...</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ 
          transform: 'scaleX(-1)',
          opacity: state.cameraActive ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
      
      <canvas
        ref={detectionRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ 
          transform: 'scaleX(-1)',
          opacity: state.isScanning && state.cameraActive ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />

      {/* Статические уголки рамки */}
      {!state.isScanning && state.cameraActive && (
        <>
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-lg opacity-50"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-lg opacity-50"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-lg opacity-50"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-lg opacity-50"></div>
        </>
      )}
    </div>
  );
});

VideoCamera.displayName = 'VideoCamera';

export default VideoCamera;
