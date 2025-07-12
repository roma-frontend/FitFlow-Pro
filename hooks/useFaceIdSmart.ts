// hooks/useFaceIdSmart.ts - Умная логика работы с Face ID
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface FaceIdProfile {
  id: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution: string;
  };
  createdAt: string;
  lastUsedAt?: string;
  usageCount: number;
  isActive: boolean;
  confidence: number;
}

interface FaceIdStatus {
  registered: boolean;
  profile?: any;
  user?: any;
  stats?: any;
}

export function useFaceIdSmart() {
  const { user, login } = useAuth();
  const router = useRouter();
  
  const [isScanning, setIsScanning] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [faceIdStatus, setFaceIdStatus] = useState<FaceIdStatus | null>(null);
  const [profiles, setProfiles] = useState<FaceIdProfile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Проверка статуса Face ID при загрузке
  useEffect(() => {
    checkFaceIdStatus();
    if (user) {
      loadUserProfiles();
    }
  }, [user]);

  // ✅ Проверка статуса Face ID
  const checkFaceIdStatus = async () => {
    try {
      const response = await fetch('/api/auth/face-register', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setFaceIdStatus(data);
        
        if (data.profile?.id) {
          setCurrentProfileId(data.profile.id);
        }
      }
    } catch (error) {
      console.error('❌ Ошибка проверки статуса Face ID:', error);
    }
  };

  // ✅ Загрузка профилей пользователя
  const loadUserProfiles = async () => {
    try {
      const response = await fetch('/api/face-id/manage', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
        setCurrentProfileId(data.currentProfileId || null);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки профилей:', error);
    }
  };

  // ✅ Генерация дескриптора из видео (симуляция для демо)
  const generateDescriptorFromVideo = useCallback(async (
    video: HTMLVideoElement
  ): Promise<{ descriptor: number[]; confidence: number } | null> => {
    // В реальном приложении здесь будет face-api.js или MediaPipe
    
    // Симулируем анализ видео
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Генерируем уникальный дескриптор на основе времени и случайности
    const baseValue = Date.now() % 1000;
    const descriptor = Array.from({ length: 128 }, (_, i) => {
      // Создаем паттерн, который будет уникальным для каждого "лица"
      const angle = (i / 128) * Math.PI * 2;
      const value = Math.sin(angle + baseValue) * 0.5 + 0.5;
      return value + (Math.random() - 0.5) * 0.1; // Добавляем небольшой шум
    });
    
    // Оценка качества (зависит от "условий съемки")
    const confidence = 75 + Math.random() * 20; // 75-95%
    
    return { descriptor, confidence };
  }, []);

  // ✅ Регистрация Face ID
  const registerFaceId = useCallback(async (
    descriptor: number[],
    confidence: number,
    metadata?: any
  ): Promise<boolean> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Необходимо войти в систему"
      });
      return false;
    }

    setIsRegistering(true);

    try {
      const response = await fetch('/api/auth/face-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          descriptor,
          confidence,
          metadata: {
            source: 'smart_face_id',
            timestamp: Date.now(),
            ...metadata
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Face ID зарегистрирован!",
          description: data.message
        });

        // Обновляем статус и профили
        await checkFaceIdStatus();
        await loadUserProfiles();

        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка регистрации",
          description: data.message
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка регистрации Face ID:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось зарегистрировать Face ID"
      });
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, [user]);

  // ✅ Вход через Face ID
  const loginWithFaceId = useCallback(async (
    descriptor: number[],
    confidence: number,
    metadata?: any
  ): Promise<boolean> => {
    setIsScanning(true);

    try {
      const response = await fetch('/api/auth/face-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          descriptor,
          confidence,
          metadata: {
            source: 'smart_face_id',
            timestamp: Date.now(),
            ...metadata
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: `🎉 ${data.message}`,
          description: `Схожесть: ${data.metrics?.similarity}%`
        });

        // Небольшая задержка для показа сообщения
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Перенаправляем на дашборд
        router.push(data.dashboardUrl || '/member-dashboard');

        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Face ID не распознан",
          description: data.message
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка входа через Face ID:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось выполнить вход через Face ID"
      });
      return false;
    } finally {
      setIsScanning(false);
    }
  }, [router]);

  // ✅ Удаление Face ID профиля
  const deleteFaceIdProfile = useCallback(async (profileId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/face-id/manage?profileId=${profileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Профиль удален",
          description: "Face ID профиль успешно удален"
        });

        // Обновляем список профилей
        await loadUserProfiles();
        
        // Если удалили текущий профиль, обновляем статус
        if (profileId === currentProfileId) {
          await checkFaceIdStatus();
        }

        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: data.message
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка удаления профиля:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить профиль"
      });
      return false;
    }
  }, [currentProfileId]);

  // ✅ Удаление всех Face ID профилей
  const deleteAllFaceIdProfiles = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/face-register', {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Все профили удалены",
          description: `Удалено профилей: ${data.deactivatedCount}`
        });

        // Очищаем локальное состояние
        setProfiles([]);
        setCurrentProfileId(null);
        setFaceIdStatus({ registered: false });

        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: data.message
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка удаления всех профилей:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить профили"
      });
      return false;
    }
  }, []);

  // ✅ Умное сканирование с видео
  const smartScan = useCallback(async (
    mode: 'login' | 'register',
    video: HTMLVideoElement
  ): Promise<boolean> => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    try {
      // Генерируем дескриптор из видео
      const result = await generateDescriptorFromVideo(video);
      
      if (!result) {
        toast({
          variant: "destructive",
          title: "Ошибка сканирования",
          description: "Не удалось получить данные лица"
        });
        return false;
      }

      const { descriptor, confidence } = result;

      // В зависимости от режима выполняем вход или регистрацию
      if (mode === 'login') {
        return await loginWithFaceId(descriptor, confidence);
      } else {
        return await registerFaceId(descriptor, confidence);
      }
    } catch (error) {
      console.error('❌ Ошибка умного сканирования:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось выполнить сканирование"
      });
      return false;
    }
  }, [generateDescriptorFromVideo, loginWithFaceId, registerFaceId]);

  return {
    // Состояние
    isScanning,
    isRegistering,
    faceIdStatus,
    profiles,
    currentProfileId,
    isAuthenticated: !!user,
    isFaceIdRegistered: faceIdStatus?.registered || false,
    
    // Методы
    checkFaceIdStatus,
    loadUserProfiles,
    registerFaceId,
    loginWithFaceId,
    deleteFaceIdProfile,
    deleteAllFaceIdProfiles,
    smartScan,
    generateDescriptorFromVideo,
    
    // Информация о пользователе
    user
  };
}