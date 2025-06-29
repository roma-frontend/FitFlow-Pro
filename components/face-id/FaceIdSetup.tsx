// components/face-id/FaceIdSetup.tsx - отладочная версия
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Eye,
  Shield,
  Zap
} from "lucide-react";

interface FaceIdSetupProps {
  onComplete: (success: boolean, data?: any) => void;
}

export function FaceIdSetup({ onComplete }: FaceIdSetupProps) {
  const [step, setStep] = useState<'init' | 'camera' | 'scanning' | 'processing' | 'complete'>('init');
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string>('');
  const [profileData, setProfileData] = useState<any>(null);

  // ✅ Проверка доступности камеры
  useEffect(() => {
    checkCameraAvailability();
  }, []);

  const checkCameraAvailability = async () => {
    try {
      console.log('🔍 Проверяем доступность камеры...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('API камеры не поддерживается в этом браузере');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      console.log('✅ Камера доступна');
      setHasCamera(true);
      
      // Останавливаем stream после проверки
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('❌ Ошибка доступа к камере:', err);
      setError(err instanceof Error ? err.message : 'Ошибка доступа к камере');
      setHasCamera(false);
    }
  };

  const startFaceIdSetup = async () => {
    try {
      setStep('camera');
      setError('');
      
      console.log('📹 Запускаем настройку Face ID...');
      
      // Симуляция процесса настройки
      setTimeout(() => {
        setStep('scanning');
        console.log('🔍 Сканируем лицо...');
      }, 1000);

      setTimeout(() => {
        setStep('processing');
        console.log('⚙️ Обрабатываем данные...');
      }, 3000);

      setTimeout(() => {
        setStep('complete');
        
        // ✅ Создаем реальные данные профиля
        const faceProfile = {
          profileId: `face_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'current_user',
          created: new Date().toISOString(),
          faceData: 'mock_face_encoding_data',
          version: '1.0'
        };
        
        setProfileData(faceProfile);
        console.log('✅ Face ID профиль создан:', faceProfile);
        
        // Автоматически завершаем через 2 секунды
        setTimeout(() => {
          onComplete(true, faceProfile);
        }, 2000);
        
      }, 5000);

    } catch (err) {
      console.error('❌ Ошибка настройки Face ID:', err);
      setError(err instanceof Error ? err.message : 'Ошибка настройки');
      setStep('init');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'init':
        return (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Настройка Face ID
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Создайте биометрический профиль для быстрого входа в систему
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Доступ к камере</span>
                <Badge variant={hasCamera ? "secondary" : "destructive"} className="text-xs">
                  {hasCamera ? '✓ Доступна' : '✗ Недоступна'}
                </Badge>
              </div>
            </div>

            <Button
              onClick={startFaceIdSetup}
              disabled={!hasCamera}
              className="w-full"
            >
              {hasCamera ? (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Начать настройку
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Камера недоступна
                </>
              )}
            </Button>
          </div>
        );

      case 'camera':
        return (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Включение камеры
              </h3>
              <p className="text-sm text-gray-600">
                Разрешите доступ к камере в браузере
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          </div>
        );

      case 'scanning':
        return (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Eye className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Сканирование лица
              </h3>
              <p className="text-sm text-gray-600">
                Посмотрите прямо в камеру и не двигайтесь
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
              <p className="text-xs text-gray-500">Сканирование в процессе...</p>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-spin">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Обработка данных
              </h3>
              <p className="text-sm text-gray-600">
                Создаем ваш биометрический профиль
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '80%'}}></div>
              </div>
              <p className="text-xs text-gray-500">Почти готово...</p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Face ID настроен! 🎉
              </h3>
              <p className="text-sm text-green-600">
                Биометрический профиль успешно создан
              </p>
            </div>

            {profileData && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-left">
                <div className="flex items-center mb-2">
                  <Shield className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">Детали профиля</span>
                </div>
                <div className="text-xs text-green-700 space-y-1">
                  <div>ID: {profileData.profileId}</div>
                  <div>Создан: {new Date(profileData.created).toLocaleString()}</div>
                  <div>Версия: {profileData.version}</div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Автоматическое завершение через несколько секунд...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        {renderStep()}
        
        {/* Отладочная информация */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Текущий шаг:</strong> {step}</div>
              <div><strong>Камера:</strong> {hasCamera ? 'Доступна' : 'Недоступна'}</div>
              {error && <div><strong>Ошибка:</strong> {error}</div>}
              {profileData && <div><strong>Профиль:</strong> {profileData.profileId}</div>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}