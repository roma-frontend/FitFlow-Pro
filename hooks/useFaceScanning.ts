// hooks/useFaceScanning.ts - ИСПРАВЛЕННАЯ версия БЕЗ циклов
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
import { Router } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UseFaceScanningProps {
  mode: FaceAuthMode;
  viewMode: SwitchModeType;
  onSuccess: (userData: any) => void;
  onFaceDetected?: (data: FaceDetectionData) => void;
}

export const useFaceScanning = ({ mode, viewMode, onSuccess, onFaceDetected }: UseFaceScanningProps) => {
  const { state, dispatch, actions } = useFaceAuthContext();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);
  const router = useRouter()

  // 🔥 УБРАНО: Пассивная детекция - она создавала циклы

  const handleAuthSuccess = useCallback((userData: any) => {
    if (userData.action === "face_login_success") {
      toast({
        title: "🎉 Добро пожаловать!",
        description: `Вход выполнен через Face ID`,
      });

      setTimeout(() => {
        router.push("/member-dashboard");
      }, 1000);
    } else if (userData.action === "face_id_registered") {
      toast({
        title: "✅ Face ID настроен!",
        description: userData.message || "Face ID успешно зарегистрирован",
      });

      setTimeout(() => {
        router.push("/member-dashboard");
      }, 1500);
    } else {
      onSuccess(userData);
    }
  }, [onSuccess]);

  // 🔥 ИСПРАВЛЕНО: Упрощенная детекция только во время сканирования
  const simulateFaceDetection = useCallback(() => {
    if (!state.isScanning || !isActiveRef.current) return;

    // Очищаем предыдущий интервал
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    console.log('🎯 Запуск детекции лица...');

    detectionIntervalRef.current = setInterval(() => {
      if (!state.isScanning || !isActiveRef.current) {
        console.log('🛑 Остановка детекции - сканирование неактивно');
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
          detectionIntervalRef.current = null;
        }
        return;
      }

      const centerX = 320;
      const centerY = 240;
      const faceWidth = 180 + Math.random() * 40;
      const faceHeight = 220 + Math.random() * 40;

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
    }, 300); // 🔥 Увеличили интервал до 300ms

    return () => {
      console.log('🧹 Cleanup детекции');
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [state.isScanning, actions]);

  // 🔥 ИСПРАВЛЕНО: Упрощенный прогресс без циклических зависимостей
  const runScanningSteps = useCallback(async () => {
    if (viewMode !== "modern" || !isActiveRef.current) return;

    console.log('📊 Запуск этапов сканирования...');

    const steps = [
      { stage: 'detecting' as const, duration: 1000 },
      { stage: 'analyzing' as const, duration: 2500 },
      { stage: 'processing' as const, duration: 1500 }
    ];

    for (const step of steps) {
      if (!isActiveRef.current) break; // Проверяем активность

      const currentProgress = { stage: step.stage, progress: 0, countdown: 0 };
      dispatch({ type: 'SET_SCAN_PROGRESS', payload: currentProgress });

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
        }, 100);
      });
    }

    if (isActiveRef.current) {
      dispatch({ type: 'SET_SCAN_PROGRESS', payload: { stage: 'complete', progress: 100, countdown: 0 } });
    }
  }, [viewMode, dispatch]);

  const startScanning = useCallback(async () => {
    if (isActiveRef.current) {
      console.log('⚠️ Сканирование уже активно');
      return;
    }

    try {
      console.log('🚀 Начало сканирования...');
      isActiveRef.current = true;

      actions.startScanning();

      if (mode === "register") {
        actions.setRegistering(true);
      }

      // Небольшая задержка для инициализации
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!isActiveRef.current) return; // Проверяем что не отменили

      if (viewMode === "modern") {
        dispatch({ type: 'SET_SCAN_PROGRESS', payload: { stage: 'initializing', progress: 0, countdown: 3 } });
        await runScanningSteps();
      }

      if (!isActiveRef.current) return; // Проверяем что не отменили

      // Запускаем детекцию
      const cleanupDetection = simulateFaceDetection();

      const scanDuration = viewMode === "mobile" ? 4000 : viewMode === "desktop" ? 3500 : 2000;

      timeoutRef.current = setTimeout(async () => {
        if (!isActiveRef.current) return;

        console.log('⏰ Завершение сканирования...');

        // Очищаем детекцию
        if (cleanupDetection) {
          cleanupDetection();
        }

        const success = Math.random() > 0.15;
        const confidence = 80 + Math.random() * 20;

        if (!success) {
          if (viewMode === "modern") {
            dispatch({ type: 'SET_SCAN_PROGRESS', payload: { stage: 'failed', progress: 0, countdown: 0 } });
          }
          actions.stopScanning();
          actions.setRegistering(false);
          actions.setAuthStatus({
            authenticated: false,
            user: undefined,
            loading: false,
          });
          isActiveRef.current = false;
          return;
        }

        const mockDescriptor = new Float32Array(Array.from({ length: 128 }, () => Math.random()));
        const boundingBox = createBoundingBox(
          viewMode === "mobile" ? 60 : 120,
          viewMode === "mobile" ? 60 : 120,
          viewMode === "mobile" ? 180 : 280,
          viewMode === "mobile" ? 180 : 280
        );

        const faceDetectionData = createFaceDetectionData(mockDescriptor, confidence, boundingBox);

        actions.setFaceData(faceDetectionData);
        dispatch({ type: 'INCREMENT_SCAN_COUNT' });
        dispatch({ type: 'SET_LAST_SCAN_TIME', payload: new Date() });

        if (onFaceDetected) {
          onFaceDetected(faceDetectionData);
        }

        const userData = {
          authenticated: success,
          confidence: confidence,
          user: undefined,
          mode,
          timestamp: new Date().toISOString(),
          descriptor: Array.from(mockDescriptor),
        };

        actions.setAuthStatus({
          authenticated: true,
          user: undefined,
          loading: false
        });

        // API вызовы
        if (mode === "register") {
          try {
            const response = await fetch("/api/face-id/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                descriptor: Array.from(mockDescriptor),
                confidence: confidence,
                metadata: { source: "optimized_component", timestamp: Date.now() },
              }),
            });

            const result = await response.json();
            if (result.success) {
              handleAuthSuccess({
                ...userData,
                action: "face_id_registered",
                message: "Face ID успешно зарегистрирован!",
              });
            }
          } catch (error) {
            console.error("❌ Ошибка регистрации Face ID:", error);
          } finally {
            actions.setRegistering(false);
          }
        } else if (mode === "login") {
          try {
            const response = await fetch("/api/auth/face-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                descriptor: Array.from(mockDescriptor),
                confidence: confidence,
                faceFingerprint: "demo_fingerprint",
              }),
            });

            const result = await response.json();
            if (result.success) {
              actions.setAuthStatus({
                authenticated: true,
                user: result.user,
                loading: false
              });

              handleAuthSuccess({
                ...userData,
                action: "face_login_success",
                user: result.user,
                authenticated: true,
              });
            }
          } catch (error) {
            console.error("❌ Ошибка Face ID входа:", error);
          }
        }

        actions.stopScanning();
        isActiveRef.current = false;
      }, scanDuration);
    } catch (error) {
      console.error("❌ Ошибка доступа к камере:", error);
      actions.stopScanning();
      actions.setRegistering(false);
      isActiveRef.current = false;
    }
  }, [mode, viewMode, actions, dispatch, simulateFaceDetection, runScanningSteps, handleAuthSuccess, onFaceDetected]);

  const stopScanning = useCallback(() => {
    console.log('🛑 Остановка сканирования...');
    
    isActiveRef.current = false; // 🔥 ВАЖНО: Сначала отключаем флаг

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

    // 🔥 ИСПРАВЛЕНО: Сбрасываем детекцию только при остановке сканирования
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
