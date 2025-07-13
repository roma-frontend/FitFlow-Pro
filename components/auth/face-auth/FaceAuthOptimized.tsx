// components/auth/face-auth/FaceAuthOptimized.tsx - Интегрированная версия
"use client";

import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Shield, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Lock,
  Sparkles
} from 'lucide-react';

import { FaceAuthProvider } from './FaceAuthProvider';
import { CameraView } from './CameraView';
import { FaceDetectionOverlay } from './FaceDetectionOverlay';
import { useFaceScanning } from '@/hooks/useFaceScanning';
import { useAuth } from '@/hooks/useAuth';
import { 
  FaceAuthMode, 
  SwitchModeType,
  FaceDetectionData 
} from '@/types/face-auth.types';
import { cn } from '@/lib/utils';

interface FaceAuthOptimizedProps {
  mode: FaceAuthMode;
  onSuccess: (userData: any) => void;
  viewMode: SwitchModeType;
  onSwitchMode: (mode: SwitchModeType) => void;
}

function FaceAuthContent({
  mode,
  onSuccess,
  viewMode,
  onSwitchMode
}: FaceAuthOptimizedProps) {
  const { user } = useAuth();
  
  const {
    startScanning,
    stopScanning,
    isScanning,
    isRegistering,
    authStatus,
    faceDetection,
    scanProgress,
    faceData
  } = useFaceScanning({
    mode,
    viewMode,
    onSuccess,
    onFaceDetected: (data: FaceDetectionData) => {
      console.log('Face detected:', data);
    }
  });

  // Обработчик кнопки действия
  const handleActionClick = useCallback(() => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  }, [isScanning, startScanning, stopScanning]);

  // Проверка готовности к регистрации
  const canRegister = mode === 'register' && user;
  const showRegisterWarning = mode === 'register' && !user;

  // Получение текста для кнопки
  const getButtonText = () => {
    if (isScanning) {
      if (isRegistering) return 'Регистрация Face ID...';
      if (scanProgress.stage === 'processing') return 'Обработка...';
      return 'Остановить сканирование';
    }
    return mode === 'register' ? 'Начать регистрацию Face ID' : 'Войти через Face ID';
  };

  // Получение описания режима
  const getModeDescription = () => {
    if (mode === 'register') {
      return user 
        ? 'Создайте биометрический профиль для быстрого входа в будущем'
        : 'Для регистрации Face ID необходимо войти в систему';
    }
    return 'Используйте Face ID для мгновенного входа в систему';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {mode === 'register' ? (
              <>
                <Shield className="h-6 w-6 mr-2" />
                Регистрация Face ID
              </>
            ) : (
              <>
                <Eye className="h-6 w-6 mr-2" />
                Face ID вход
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={viewMode === 'modern' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => onSwitchMode(viewMode === 'modern' ? 'desktop' : 'modern')}
            >
              {viewMode === 'modern' ? 'Современный' : 'Минималистичный'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {/* Описание */}
        <div className="text-center mb-6">
          <p className="text-gray-600">{getModeDescription()}</p>
          {user && mode === 'register' && (
            <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Вы вошли как: {user.email}
            </p>
          )}
        </div>

        {/* Предупреждение для неавторизованных пользователей */}
        {showRegisterWarning && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Требуется авторизация</AlertTitle>
            <AlertDescription>
              Пожалуйста, войдите в систему перед настройкой Face ID
            </AlertDescription>
          </Alert>
        )}

        {/* Камера */}
        <div className="relative mb-6">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <CameraView 
              isActive={isScanning}
              mode={mode}
            />
            
            {/* Оверлей детекции лица */}
            {isScanning && faceDetection.detected && (
              <FaceDetectionOverlay
                boundingBox={faceDetection.boundingBox}
                landmarks={faceDetection.landmarks}
                quality={faceDetection.quality}
              />
            )}

            {/* Статус сканирования */}
            {isScanning && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 text-white">
                  {viewMode === 'modern' && scanProgress.stage !== 'initializing' && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {scanProgress.stage === 'detecting' && 'Поиск лица...'}
                          {scanProgress.stage === 'analyzing' && 'Анализ биометрии...'}
                          {scanProgress.stage === 'processing' && 'Обработка данных...'}
                          {scanProgress.stage === 'complete' && 'Завершено!'}
                          {scanProgress.stage === 'failed' && 'Ошибка сканирования'}
                        </span>
                        <span className="text-sm">{Math.round(scanProgress.progress)}%</span>
                      </div>
                      <Progress value={scanProgress.progress} className="h-2" />
                    </>
                  )}
                  
                  {viewMode === 'desktop' && (
                    <div className="flex items-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      <span>Сканирование активно...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Индикатор качества */}
            {isScanning && faceDetection.detected && (
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md rounded-lg p-3">
                <div className="space-y-2 text-xs text-white">
                  <div className="flex items-center justify-between">
                    <span>Освещение</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${faceDetection.quality.lighting * 100}%` }}
                        />
                      </div>
                      <span className="ml-2">{Math.round(faceDetection.quality.lighting * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Стабильность</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${faceDetection.quality.stability * 100}%` }}
                        />
                      </div>
                      <span className="ml-2">{Math.round(faceDetection.quality.stability * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Основная кнопка действия */}
        <Button
          onClick={handleActionClick}
          disabled={!canRegister && mode === 'register'}
          className={cn(
            "w-full",
            isScanning && "bg-red-500 hover:bg-red-600"
          )}
          size="lg"
        >
          {isScanning ? (
            <>
              {isRegistering ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Camera className="h-5 w-5 mr-2" />
              )}
              {getButtonText()}
            </>
          ) : (
            <>
              <Camera className="h-5 w-5 mr-2" />
              {getButtonText()}
            </>
          )}
        </Button>

        {/* Инструкции */}
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
            Советы для лучшего результата:
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Убедитесь, что ваше лицо хорошо освещено</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Смотрите прямо в камеру</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Держите лицо в центре кадра</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Не двигайтесь во время сканирования</span>
            </li>
          </ul>
        </div>

        {/* Информация о безопасности */}
        <Alert className="mt-6">
          <Lock className="h-4 w-4" />
          <AlertTitle>Ваши данные защищены</AlertTitle>
          <AlertDescription>
            Face ID использует математическое представление вашего лица. 
            Мы не храним фотографии, только зашифрованные биометрические данные.
          </AlertDescription>
        </Alert>

        {/* Результат сканирования */}
        {faceData && !isScanning && authStatus && (
          <Alert className="mt-6" variant={authStatus.authenticated ? "default" : "destructive"}>
            {authStatus.authenticated ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Успешно!</AlertTitle>
                <AlertDescription>
                  {mode === 'register' 
                    ? 'Face ID успешно зарегистрирован. Теперь вы можете использовать его для входа.'
                    : 'Вход выполнен успешно. Перенаправление...'
                  }
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>
                  {mode === 'register'
                    ? 'Не удалось зарегистрировать Face ID. Попробуйте еще раз.'
                    : 'Face ID не распознан. Убедитесь, что вы зарегистрировали Face ID.'
                  }
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default function FaceAuthOptimized(props: FaceAuthOptimizedProps) {
  return (
    <FaceAuthProvider>
      <FaceAuthContent {...props} />
    </FaceAuthProvider>
  );
}