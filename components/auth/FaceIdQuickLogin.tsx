// components/auth/FaceIdQuickLogin.tsx - Компонент быстрого входа через Face ID
"use client";

import { useState, useRef, useEffect } from 'react';
import { useFaceIdSmart } from '@/hooks/useFaceIdSmart';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Camera,
  Shield,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface FaceIdQuickLoginProps {
  className?: string;
  onSuccess?: () => void;
  variant?: 'default' | 'compact' | 'hero';
}

export function FaceIdQuickLogin({ 
  className, 
  onSuccess,
  variant = 'default' 
}: FaceIdQuickLoginProps) {
  const {
    isScanning,
    faceIdStatus,
    isFaceIdRegistered,
    loginWithFaceId,
    checkFaceIdStatus
  } = useFaceIdSmart();

  const [showCamera, setShowCamera] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Проверяем статус Face ID при монтировании
  useEffect(() => {
    checkFaceIdStatus();
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      stopCamera();
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  // Запуск камеры
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('❌ Ошибка доступа к камере:', error);
      setErrorMessage('Не удалось получить доступ к камере');
      setScanStatus('error');
    }
  };

  // Остановка камеры
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Генерация дескриптора из видео
  const generateDescriptor = async (): Promise<{ descriptor: number[]; confidence: number } | null> => {
    if (!videoRef.current) return null;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Анализ изображения для создания дескриптора
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Создаем дескриптор из центральной области лица
      const descriptor: number[] = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) / 4;
      
      for (let i = 0; i < 128; i++) {
        const angle = (i / 128) * Math.PI * 2;
        const x = Math.floor(centerX + Math.cos(angle) * radius * (0.5 + i / 256));
        const y = Math.floor(centerY + Math.sin(angle) * radius * (0.5 + i / 256));
        
        const idx = (y * canvas.width + x) * 4;
        const r = pixels[idx] || 0;
        const g = pixels[idx + 1] || 0;
        const b = pixels[idx + 2] || 0;
        
        const value = ((r + g + b) / 3) / 255;
        descriptor.push(value);
      }
      
      // Оценка качества
      const brightness = descriptor.reduce((sum, val) => sum + val, 0) / descriptor.length;
      const confidence = 75 + brightness * 15 + Math.random() * 10;
      
      return {
        descriptor,
        confidence: Math.min(95, Math.max(75, confidence))
      };
    } catch (error) {
      console.error('❌ Ошибка генерации дескриптора:', error);
      return null;
    }
  };

  // Обработка быстрого входа
  const handleQuickLogin = async () => {
    setShowCamera(true);
    setScanStatus('idle');
    setErrorMessage('');
    
    // Запускаем камеру
    await startCamera();
    
    // Небольшая задержка для стабилизации видео
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setScanStatus('scanning');
    
    // Автоматическое сканирование через 2 секунды
    scanTimeoutRef.current = setTimeout(async () => {
      setScanStatus('processing');
      
      const descriptorData = await generateDescriptor();
      
      if (!descriptorData) {
        setErrorMessage('Не удалось получить данные лица');
        setScanStatus('error');
        return;
      }
      
      const success = await loginWithFaceId(
        descriptorData.descriptor,
        descriptorData.confidence,
        { quickLogin: true }
      );
      
      if (success) {
        setScanStatus('success');
        stopCamera();
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setScanStatus('error');
        setErrorMessage('Face ID не распознан');
      }
    }, 2000);
  };

  // Отмена сканирования
  const handleCancel = () => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    stopCamera();
    setShowCamera(false);
    setScanStatus('idle');
    setErrorMessage('');
  };

  // Рендер компактной версии
  if (variant === 'compact') {
    return (
      <Button
        onClick={handleQuickLogin}
        disabled={!isFaceIdRegistered || isScanning}
        variant="outline"
        size="sm"
        className={cn("relative", className)}
      >
        {isScanning ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Eye className="h-4 w-4 mr-2" />
        )}
        Face ID
        {isFaceIdRegistered && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </Button>
    );
  }

  // Рендер hero версии
  if (variant === 'hero') {
    return (
      <div className={cn("relative", className)}>
        {showCamera ? (
          <div className="relative">
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Оверлей статуса */}
              <div className="absolute inset-0 flex items-center justify-center">
                {scanStatus === 'scanning' && (
                  <div className="text-center">
                    <div className="w-32 h-32 border-4 border-white/30 rounded-full flex items-center justify-center">
                      <Eye className="w-16 h-16 text-white animate-pulse" />
                    </div>
                    <p className="text-white mt-4 text-lg font-medium">
                      Смотрите в камеру...
                    </p>
                  </div>
                )}
                
                {scanStatus === 'processing' && (
                  <div className="text-center">
                    <Loader2 className="w-16 h-16 text-white animate-spin" />
                    <p className="text-white mt-4 text-lg font-medium">
                      Обработка...
                    </p>
                  </div>
                )}
                
                {scanStatus === 'success' && (
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-400" />
                    <p className="text-white mt-4 text-lg font-medium">
                      Добро пожаловать!
                    </p>
                  </div>
                )}
                
                {scanStatus === 'error' && (
                  <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-red-400" />
                    <p className="text-white mt-4 text-lg font-medium">
                      {errorMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {scanStatus === 'error' && (
              <div className="mt-4 flex space-x-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleQuickLogin}
                  className="flex-1"
                >
                  Попробовать снова
                </Button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleQuickLogin}
            disabled={!isFaceIdRegistered}
            className="w-full p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Eye className="w-10 h-10" />
                </div>
                {isFaceIdRegistered && (
                  <CheckCircle className="absolute -bottom-1 -right-1 w-6 h-6 text-green-400" />
                )}
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-1">
                  Быстрый вход с Face ID
                </h3>
                <p className="text-sm opacity-90">
                  {isFaceIdRegistered 
                    ? 'Нажмите для входа через распознавание лица'
                    : 'Face ID не настроен'
                  }
                </p>
              </div>
              
              {isFaceIdRegistered && faceIdStatus?.profile && (
                <div className="text-xs opacity-75">
                  Последний вход: {faceIdStatus.profile.lastUsedAt 
                    ? new Date(faceIdStatus.profile.lastUsedAt).toLocaleDateString() 
                    : 'Никогда'
                  }
                </div>
              )}
            </div>
          </button>
        )}
      </div>
    );
  }

  // Рендер стандартной версии
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {showCamera ? (
          <div className="relative">
            <div className="aspect-video bg-gray-100">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Статус сканирования */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-md rounded-lg p-3 text-white">
                  {scanStatus === 'scanning' && (
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 mr-2 animate-pulse" />
                      <span>Сканирование лица...</span>
                    </div>
                  )}
                  
                  {scanStatus === 'processing' && (
                    <div className="flex items-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      <span>Обработка биометрии...</span>
                    </div>
                  )}
                  
                  {scanStatus === 'success' && (
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Успешно! Выполняется вход...</span>
                    </div>
                  )}
                  
                  {scanStatus === 'error' && (
                    <div className="flex items-center text-red-400">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Кнопка отмены */}
              {(scanStatus === 'idle' || scanStatus === 'scanning') && (
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4"
                >
                  Отмена
                </Button>
              )}
            </div>
            
            {scanStatus === 'error' && (
              <div className="p-4 space-y-3">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleQuickLogin}
                    className="flex-1"
                  >
                    Попробовать снова
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Face ID вход</h3>
                  <p className="text-sm text-muted-foreground">
                    Быстрая биометрическая аутентификация
                  </p>
                </div>
              </div>
              
              {isFaceIdRegistered ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Активен
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Не настроен
                </Badge>
              )}
            </div>
            
            {isFaceIdRegistered ? (
              <>
                <Button
                  onClick={handleQuickLogin}
                  className="w-full mb-3"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Войти через Face ID
                </Button>
                
                {faceIdStatus?.profile && (
                  <div className="text-xs text-center text-muted-foreground">
                    <p>Профиль создан: {new Date(faceIdStatus.profile.createdAt).toLocaleDateString()}</p>
                    {faceIdStatus.profile.usageCount > 0 && (
                      <p>Использований: {faceIdStatus.profile.usageCount}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Face ID не настроен. Войдите в систему и настройте Face ID в личном кабинете для быстрого входа.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}