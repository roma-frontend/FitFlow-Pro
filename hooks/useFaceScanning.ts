// hooks/useFaceScanning.ts - Умная версия с реальными API вызовами
"use client";

import { useCallback, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  FaceAuthMode,
  SwitchModeType,
  FaceDetectionData,
  BoundingBox,
  Landmark,
  Detection
} from '@/types/face-auth.types';
import { useFaceAuthContext } from '@/components/auth/face-auth/FaceAuthProvider';
import {
  createBoundingBox,
  createFaceDetectionData,
  generateRandomLandmarks,
  calculateDetectionQuality
} from '@/utils/faceAuthUtils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface UseFaceScanningProps {
  mode: FaceAuthMode;
  viewMode: SwitchModeType;
  onSuccess: (userData: any) => void;
  onFaceDetected?: (data: FaceDetectionData) => void;
}

export const useFaceScanning = ({ mode, viewMode, onSuccess, onFaceDetected }: UseFaceScanningProps) => {
  const { state, dispatch, actions } = useFaceAuthContext();
  const { user } = useAuth();
  const router = useRouter();
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ✅ Обработчик успешной аутентификации
  const handleAuthSuccess = useCallback((userData: any) => {
    console.log('🎉 Успешная аутентификация:', userData);
    
    if (userData.action === "face_login_success") {
      toast({
        title: "🎉 Добро пожаловать!",
        description: `Вход выполнен через Face ID`,
      });

      // Перенаправляем на дашборд
      setTimeout(() => {
        router.push(userData.dashboardUrl || "/member-dashboard");
      }, 1000);
    } else if (userData.action === "face_id_registered") {
      toast({
        title: "✅ Face ID настроен!",
        description: userData.message || "Face ID успешно зарегистрирован",
      });

      // Для регистрации остаемся на странице или переходим в настройки
      if (user) {
        setTimeout(() => {
          router.push("/member-dashboard");
        }, 1500);
      }
    } else {
      onSuccess(userData);
    }
  }, [onSuccess, router, user]);

  // ✅ Генерация уникального дескриптора из видео потока
  const generateDescriptorFromVideo = useCallback(async (): Promise<{
    descriptor: number[];
    confidence: number;
  } | null> => {
    if (!videoRef.current) return null;

    try {
      // В реальном приложении здесь будет face-api.js или MediaPipe
      // Сейчас симулируем уникальный дескриптор на основе времени
      
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      // Захватываем кадр
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Получаем данные изображения
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Создаем "уникальный" дескриптор на основе пикселей
      const descriptor: number[] = [];
      const step = Math.floor(pixels.length / 128 / 4); // 128 значений
      
      for (let i = 0; i < 128; i++) {
        const idx = i * step * 4;
        // Используем RGB значения для создания уникального паттерна
        const r = pixels[idx] || 0;
        const g = pixels[idx + 1] || 0;
        const b = pixels[idx + 2] || 0;
        
        // Нормализуем к диапазону [0, 1]
        const value = ((r + g + b) / 3) / 255;
        descriptor.push(value + (Math.random() - 0.5) * 0.1); // Небольшой шум
      }
      
      // Оценка качества (имитация)
      const brightness = descriptor.reduce((sum, val) => sum + val, 0) / descriptor.length;
      const confidence = 70 + brightness * 20 + Math.random() * 10; // 70-100%
      
      return {
        descriptor,
        confidence: Math.min(100, Math.max(70, confidence))
      };
    } catch (error) {
      console.error('❌ Ошибка генерации дескриптора:', error);
      return null;
    }
  }, []);

  // ✅ Симуляция детекции лица для визуализации
  const simulateFaceDetection = useCallback(() => {
    if (!state.isScanning || !isActiveRef.current) return;

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    console.log('🎯 Запуск детекции лица...');

    detectionIntervalRef.current = setInterval(() => {
      if (!state.isScanning || !isActiveRef.current) {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
          detectionIntervalRef.current = null;
        }
        return;
      }

      // Симулируем движение лица в кадре
      const time = Date.now() / 1000;
      const centerX = 320 + Math.sin(time) * 20;
      const centerY = 240 + Math.cos(time * 0.7) * 15;
      const faceWidth = 180 + Math.sin(time * 1.2) * 10;
      const faceHeight = 220 + Math.cos(time * 0.9) * 10;

      const boundingBox = createBoundingBox(
        centerX - faceWidth / 2,
        centerY - faceHeight / 2,
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
    }, 100); // Обновление каждые 100ms

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [state.isScanning, actions]);

  // ✅ Прогресс сканирования
  const runScanningSteps = useCallback(async () => {
    if (viewMode !== "modern" || !isActiveRef.current) return;

    console.log('📊 Запуск этапов сканирования...');

    const steps = [
      { stage: 'detecting' as const, duration: 1000, message: 'Поиск лица...' },
      { stage: 'analyzing' as const, duration: 2000, message: 'Анализ биометрии...' },
      { stage: 'processing' as const, duration: 1500, message: 'Обработка данных...' }
    ];

    for (const step of steps) {
      if (!isActiveRef.current) break;

      const currentProgress = { stage: step.stage, progress: 0, countdown: 0 };
      dispatch({ type: 'SET_SCAN_PROGRESS', payload: currentProgress });

      // Показываем сообщение
      if (step.message) {
        toast({
          description: step.message,
          duration: step.duration
        });
      }

      const startTime = Date.now();
      
      await new Promise<void>((resolve) => {
        const progressInterval = setInterval(() => {
          if (!isActiveRef.current) {
            clearInterval(progressInterval);
            resolve();
            return;
          }

          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / step.duration) * 100, 100);
          
          dispatch({ 
            type: 'SET_SCAN_PROGRESS', 
            payload: { ...currentProgress, progress } 
          });

          if (progress >= 100) {
            clearInterval(progressInterval);
            resolve();
          }
        }, 50);
      });
    }

    if (isActiveRef.current) {
      dispatch({ type: 'SET_SCAN_PROGRESS', payload: { stage: 'complete', progress: 100, countdown: 0 } });
    }
  }, [viewMode, dispatch]);

  // ✅ Начало сканирования
  const startScanning = useCallback(async () => {
    if (isActiveRef.current) {
      console.log('⚠️ Сканирование уже активно');
      return;
    }

    // Проверка авторизации для регистрации
    if (mode === "register" && !user) {
      toast({
        variant: "destructive",
        title: "Требуется авторизация",
        description: "Войдите в систему для регистрации Face ID"
      });
      return;
    }

    try {
      console.log('🚀 Начало сканирования...', { mode, viewMode });
      isActiveRef.current = true;

      actions.startScanning();

      if (mode === "register") {
        actions.setRegistering(true);
      }

      // Получаем доступ к видео элементу
      const videoElements = document.getElementsByTagName('video');
      if (videoElements.length > 0) {
        videoRef.current = videoElements[0];
      }

      // Небольшая задержка для инициализации
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!isActiveRef.current) return;

      // Запускаем визуальные эффекты
      if (viewMode === "modern") {
        dispatch({ type: 'SET_SCAN_PROGRESS', payload: { stage: 'initializing', progress: 0, countdown: 3 } });
        await runScanningSteps();
      }

      if (!isActiveRef.current) return;

      // Запускаем симуляцию детекции
      const cleanupDetection = simulateFaceDetection();

      // Основная логика сканирования
      const scanDuration = mode === "register" ? 4000 : 3000;

      timeoutRef.current = setTimeout(async () => {
        if (!isActiveRef.current) return;

        console.log('⏰ Завершение сканирования...');

        // Генерируем дескриптор из видео
        const descriptorData = await generateDescriptorFromVideo();
        
        if (!descriptorData) {
          toast({
            variant: "destructive",
            title: "Ошибка сканирования",
            description: "Не удалось получить данные лица. Проверьте камеру."
          });
          
          if (viewMode === "modern") {
            dispatch({ type: 'SET_SCAN_PROGRESS', payload: { stage: 'failed', progress: 0, countdown: 0 } });
          }
          
          actions.stopScanning();
          actions.setRegistering(false);
          isActiveRef.current = false;
          return;
        }

        const { descriptor, confidence } = descriptorData;

        // Создаем полные данные детекции
        const boundingBox = state.faceDetection.boundingBox || createBoundingBox(120, 120, 280, 280);
        const faceDetectionData = createFaceDetectionData(
          new Float32Array(descriptor),
          confidence,
          boundingBox
        );

        actions.setFaceData(faceDetectionData);
        dispatch({ type: 'INCREMENT_SCAN_COUNT' });
        dispatch({ type: 'SET_LAST_SCAN_TIME', payload: new Date() });

        if (onFaceDetected) {
          onFaceDetected(faceDetectionData);
        }

        // API вызовы в зависимости от режима
        if (mode === "register") {
          try {
            console.log('📝 Регистрация Face ID...');
            
            const response = await fetch("/api/auth/face-register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                descriptor,
                confidence,
                metadata: {
                  source: "face_auth_component",
                  viewMode,
                  timestamp: Date.now()
                }
              })
            });

            const result = await response.json();
            
            if (result.success) {
              actions.setAuthStatus({
                authenticated: true,
                user: result.user,
                loading: false
              });
              
              handleAuthSuccess({
                authenticated: true,
                action: "face_id_registered",
                message: result.message,
                user: result.user,
                profileId: result.profileId
              });
            } else {
              throw new Error(result.message || "Ошибка регистрации");
            }
          } catch (error) {
            console.error("❌ Ошибка регистрации Face ID:", error);
            toast({
              variant: "destructive",
              title: "Ошибка регистрации",
              description: error instanceof Error ? error.message : "Не удалось зарегистрировать Face ID"
            });
          } finally {
            actions.setRegistering(false);
          }
        } else if (mode === "login") {
          try {
            console.log('🔐 Вход через Face ID...');
            
            const response = await fetch("/api/auth/face-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                descriptor,
                confidence,
                metadata: {
                  source: "face_auth_component",
                  viewMode,
                  timestamp: Date.now()
                }
              })
            });

            const result = await response.json();
            
            if (result.success) {
              actions.setAuthStatus({
                authenticated: true,
                user: result.user,
                loading: false
              });

              handleAuthSuccess({
                authenticated: true,
                action: "face_login_success",
                user: result.user,
                dashboardUrl: result.dashboardUrl,
                metrics: result.metrics
              });
            } else {
              throw new Error(result.message || "Face ID не распознан");
            }
          } catch (error) {
            console.error("❌ Ошибка Face ID входа:", error);
            toast({
              variant: "destructive",
              title: "Ошибка входа",
              description: error instanceof Error ? error.message : "Не удалось войти через Face ID"
            });
          }
        }

        // Очистка
        if (cleanupDetection) {
          cleanupDetection();
        }
        
        actions.stopScanning();
        isActiveRef.current = false;
      }, scanDuration);
    } catch (error) {
      console.error("❌ Ошибка сканирования:", error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось запустить сканирование"
      });
      
      actions.stopScanning();
      actions.setRegistering(false);
      isActiveRef.current = false;
    }
  }, [mode, viewMode, user, actions, dispatch, simulateFaceDetection, runScanningSteps, generateDescriptorFromVideo, handleAuthSuccess, onFaceDetected, state.faceDetection.boundingBox]);

  // ✅ Остановка сканирования
  const stopScanning = useCallback(() => {
    console.log('🛑 Остановка сканирования...');
    
    isActiveRef.current = false;
    videoRef.current = null;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    actions.stopScanning();
    actions.setRegistering(false);

    if (viewMode === "modern") {
      dispatch({ type: 'SET_SCAN_PROGRESS', payload: { stage: 'initializing', progress: 0, countdown: 3 } });
    }

    // Сбрасываем детекцию
    actions.setFaceDetection({
      detected: false,
      boundingBox: null,
      landmarks: [],
      quality: { lighting: 0, stability: 0, clarity: 0 }
    });
  }, [actions, dispatch, viewMode]);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      console.log('🧹 Cleanup useFaceScanning');
      isActiveRef.current = false;
      videoRef.current = null;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  return {
    startScanning,
    stopScanning,
    isScanning: state.isScanning,
    isRegistering: state.isRegistering,
    authStatus: state.authStatus,
    faceDetection: state.faceDetection,
    scanProgress: state.scanProgress,
    faceData: state.faceData
  };
};