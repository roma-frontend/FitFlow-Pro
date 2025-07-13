// components/auth/face-auth/CameraView.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FaceAuthMode } from '@/types/face-auth.types';

interface CameraViewProps {
  isActive: boolean;
  mode: FaceAuthMode;
  className?: string;
  onCameraReady?: () => void;
  onCameraError?: (error: Error) => void;
}

export function CameraView({ 
  isActive, 
  mode, 
  className,
  onCameraReady,
  onCameraError 
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isActive && cameraState === 'idle') {
      startCamera();
    } else if (!isActive && streamRef.current) {
      stopCamera();
    }

    return () => {
      if (streamRef.current) {
        stopCamera();
      }
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      setCameraState('loading');
      setErrorMessage('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Ждем, пока видео будет готово
        videoRef.current.onloadedmetadata = () => {
          setCameraState('ready');
          onCameraReady?.();
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraState('error');
      
      let message = 'Не удалось получить доступ к камере';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          message = 'Доступ к камере запрещен. Разрешите доступ в настройках браузера.';
        } else if (error.name === 'NotFoundError') {
          message = 'Камера не найдена. Проверьте подключение камеры.';
        }
      }
      
      setErrorMessage(message);
      onCameraError?.(error as Error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('idle');
  };

  return (
    <div className={cn("relative w-full h-full bg-gray-900", className)}>
      {/* Видео элемент */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "w-full h-full object-cover",
          cameraState !== 'ready' && "hidden"
        )}
      />

      {/* Состояние загрузки */}
      {cameraState === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <p className="text-lg">Запуск камеры...</p>
        </div>
      )}

      {/* Состояние ожидания */}
      {cameraState === 'idle' && !isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <Camera className="h-16 w-16 mb-4" />
          <p className="text-lg">
            {mode === 'login' 
              ? 'Нажмите для входа через Face ID' 
              : 'Нажмите для регистрации Face ID'
            }
          </p>
        </div>
      )}

      {/* Состояние ошибки */}
      {cameraState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-6">
          <CameraOff className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium mb-2">Ошибка камеры</p>
          <p className="text-sm text-center text-gray-400">{errorMessage}</p>
        </div>
      )}

      {/* Оверлей для визуальных эффектов */}
      {isActive && cameraState === 'ready' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Виньетка */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30" />
          
          {/* Сканирующая линия */}
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan" />
        </div>
      )}
    </div>
  );
}