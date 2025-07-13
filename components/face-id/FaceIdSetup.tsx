// components/face-id/FaceIdSetup.tsx - Интегрированная версия с API
"use client";

import { useState, useRef, useEffect } from 'react';
import { useFaceIdSmart } from '@/hooks/useFaceIdSmart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Camera,
  Shield,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Eye,
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaceIdSetupProps {
  onComplete?: (success: boolean, data?: any) => void;
  className?: string;
  showInstructions?: boolean;
}

export function FaceIdSetup({ 
  onComplete, 
  className,
  showInstructions = true 
}: FaceIdSetupProps) {
  const {
    isRegistering,
    registerFaceId,
    generateDescriptorFromVideo,
    user
  } = useFaceIdSmart();

  const [isActive, setIsActive] = useState(false);
  const [setupStep, setSetupStep] = useState<'idle' | 'camera' | 'scanning' | 'processing' | 'complete' | 'error'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [cameraReady, setCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      stopCamera();
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Запуск камеры
  const startCamera = async () => {
    try {
      setSetupStep('camera');
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
        setCameraReady(true);
        
        // Ждем стабилизации видео
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('❌ Ошибка доступа к камере:', error);
      setError('Не удалось получить доступ к камере');
      setSetupStep('error');
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
    setCameraReady(false);
  };

  // Начало процесса настройки
  const startSetup = async () => {
    if (!user) {
      setError('Необходимо войти в систему для настройки Face ID');
      setSetupStep('error');
      return;
    }

    setIsActive(true);
    setError('');
    setScanProgress(0);
    
    await startCamera();
  };

  // Начало сканирования
  const startScanning = async () => {
    if (!videoRef.current || !cameraReady) {
      setError('Камера не готова');
      return;
    }

    setSetupStep('scanning');
    setScanProgress(0);

    // Симуляция прогресса сканирования
    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      
      if (progress >= 100) {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
        }
        processScan();
      }
    }, 300);
  };

  // Обработка сканирования
  const processScan = async () => {
    setSetupStep('processing');

    try {
      // Генерируем дескриптор из видео
      const descriptorData = await generateDescriptorFromVideo(videoRef.current!);
      
      if (!descriptorData) {
        throw new Error('Не удалось получить биометрические данные');
      }

      const { descriptor, confidence } = descriptorData;

      // Регистрируем Face ID через API
      const success = await registerFaceId(
        descriptor,
        confidence,
        {
          source: 'face_id_setup_component',
          device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
        }
      );

      if (success) {
        setSetupStep('complete');
        stopCamera();
        
        // Уведомляем о завершении
        if (onComplete) {
          onComplete(true, {
            profileId: `face_${Date.now()}`,
            confidence,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        throw new Error('Не удалось зарегистрировать Face ID');
      }
    } catch (error) {
      console.error('❌ Ошибка обработки:', error);
      setError(error instanceof Error ? error.message : 'Ошибка регистрации Face ID');
      setSetupStep('error');
      
      if (onComplete) {
        onComplete(false);
      }
    }
  };

  // Повторная попытка
  const retry = () => {
    setError('');
    setScanProgress(0);
    setSetupStep('idle');
    setIsActive(false);
    stopCamera();
  };

  return (
    <Card className={cn("w-full max-w-lg mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-600" />
          Настройка Face ID
        </CardTitle>
        <CardDescription>
          Создайте биометрический профиль для быстрого и безопасного входа
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Статус пользователя */}
        {!user && setupStep === 'idle' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Для настройки Face ID необходимо войти в систему
            </AlertDescription>
          </Alert>
        )}

        {/* Экран приветствия */}
        {setupStep === 'idle' && (
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Eye className="w-12 h-12 text-blue-600" />
            </div>
            
            {showInstructions && (
              <div className="space-y-2 text-sm text-gray-600">
                <p>Face ID позволяет входить в систему за секунды</p>
                <p>Ваши данные надежно защищены</p>
              </div>
            )}

            <Button
              onClick={startSetup}
              disabled={!user || isRegistering}
              size="lg"
              className="w-full"
            >
              <Camera className="w-5 h-5 mr-2" />
              Начать настройку
            </Button>
          </div>
        )}

        {/* Камера */}
        {(setupStep === 'camera' || setupStep === 'scanning' || setupStep === 'processing') && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Рамка позиционирования */}
              {cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-56 border-2 border-white/50 rounded-2xl">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-white rounded-br" />
                  </div>
                </div>
              )}

              {/* Статус внизу */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-md rounded-lg p-3 text-white text-center">
                  {setupStep === 'camera' && 'Расположите лицо в рамке'}
                  {setupStep === 'scanning' && 'Сканирование...'}
                  {setupStep === 'processing' && 'Обработка данных...'}
                </div>
              </div>
            </div>

            {/* Прогресс сканирования */}
            {setupStep === 'scanning' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Прогресс сканирования</span>
                  <span>{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
            )}

            {/* Кнопка сканирования */}
            {setupStep === 'camera' && cameraReady && (
              <Button
                onClick={startScanning}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-500 hover:to-indigo-600"
              >
                <Camera className="w-5 h-5 mr-2" />
                Начать сканирование
              </Button>
            )}

            {/* Индикатор обработки */}
            {setupStep === 'processing' && (
              <div className="text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-sm text-gray-600">Создание биометрического профиля...</p>
              </div>
            )}
          </div>
        )}

        {/* Успешное завершение */}
        {setupStep === 'complete' && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Face ID настроен!</h3>
              <p className="text-sm text-gray-600">
                Теперь вы можете использовать Face ID для быстрого входа
              </p>
            </div>

            <Alert className="text-left">
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Вы можете управлять Face ID профилями в настройках безопасности
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Ошибка */}
        {setupStep === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <Button
              onClick={retry}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
          </div>
        )}

        {/* Информация о безопасности */}
        {showInstructions && setupStep === 'idle' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Face ID использует математическое представление вашего лица. 
              Фотографии не сохраняются, только зашифрованные биометрические данные.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}