// components/ui/body-photo-upload.tsx
"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, Image, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BodyPhotoUploadProps {
  currentUrl?: string;
  onUploadComplete: (url: string, file: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export function BodyPhotoUpload({
  currentUrl,
  onUploadComplete,
  onRemove,
  disabled = false,
  className = ""
}: BodyPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // ✅ ИСПРАВЛЕНИЕ: Централизованная функция получения токена
  const getStorageToken = (): string | null => {
    try {
      // Проверяем различные источники токенов
      const tokenSources = [
        'auth_token',
        'session_token', 
        'jwt_token',
        'token',
        'access_token',
        'session_id'
      ];

      for (const key of tokenSources) {
        // Сначала проверяем localStorage
        const localToken = localStorage.getItem(key);
        if (localToken?.trim()) {
          console.log(`🔑 Найден токен в localStorage[${key}]:`, localToken.substring(0, 20) + '...');
          return localToken;
        }

        // Затем проверяем sessionStorage
        const sessionToken = sessionStorage.getItem(key);
        if (sessionToken?.trim()) {
          console.log(`🔑 Найден токен в sessionStorage[${key}]:`, sessionToken.substring(0, 20) + '...');
          return sessionToken;
        }
      }

      // Проверяем cookies через document.cookie
      const cookieString = document.cookie;
      if (cookieString) {
        const cookies = cookieString.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        }, {} as Record<string, string>);

        for (const key of tokenSources) {
          if (cookies[key]?.trim()) {
            console.log(`🔑 Найден токен в cookies[${key}]:`, cookies[key].substring(0, 20) + '...');
            return cookies[key];
          }
        }
      }

      console.log('❌ Токен не найден ни в одном источнике');
      return null;
    } catch (error) {
      console.error('❌ Ошибка при получении токена:', error);
      return null;
    }
  };

  // ✅ ИСПРАВЛЕНИЕ: Проверка валидности токена
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      console.log('🔍 Проверяем валидность токена...');
      
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const isValid = response.ok;
      console.log(`${isValid ? '✅' : '❌'} Токен ${isValid ? 'валиден' : 'недействителен'}`);
      return isValid;
    } catch (error) {
      console.error('❌ Ошибка при валидации токена:', error);
      return false;
    }
  };

  // ✅ ИСПРАВЛЕНИЕ: Получение нового токена
  const getRefreshToken = async (): Promise<string | null> => {
    try {
      console.log('🔄 Попытка обновления токена...');
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token || data.access_token) {
          const newToken = data.token || data.access_token;
          // Сохраняем новый токен
          localStorage.setItem('auth_token', newToken);
          console.log('✅ Токен успешно обновлен');
          return newToken;
        }
      }

      console.log('❌ Не удалось обновить токен, статус:', response.status);
      return null;
    } catch (error) {
      console.error('❌ Ошибка при обновлении токена:', error);
      return null;
    }
  };

  // ✅ ИСПРАВЛЕНИЕ: Получение валидного токена с обновлением
  const getValidToken = async (): Promise<string | null> => {
    console.log('🔑 Получаем валидный токен...');
    
    let token = getStorageToken();
    
    if (!token) {
      console.log('❌ Токен отсутствует в хранилище');
      return null;
    }

    // Проверяем валидность токена
    const isValid = await validateToken(token);
    
    if (isValid) {
      console.log('✅ Токен действителен');
      return token;
    }

    console.log('⚠️ Токен недействителен, попытка обновления...');
    
    // Пытаемся обновить токен
    const newToken = await getRefreshToken();
    
    if (newToken) {
      console.log('✅ Получен новый токен');
      return newToken;
    }

    // Если не удалось обновить, очищаем все токены
    console.log('❌ Очищаем все токены из хранилища');
    const keysToRemove = ['auth_token', 'session_token', 'jwt_token', 'token', 'access_token', 'session_id'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    return null;
  };

  // ✅ ИСПРАВЛЕНИЕ: Улучшенная функция загрузки
  const uploadFile = async (file: File): Promise<string> => {
    console.log('📤 Начинаем загрузку файла:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Получаем валидный токен
    const token = await getValidToken();
    
    if (!token) {
      const error = new Error('Авторизация не найдена. Пожалуйста, войдите в систему.');
      console.error('❌ Ошибка авторизации:', error.message);
      throw error;
    }

    console.log('🔑 Используем токен для загрузки');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'body-analysis');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Auth-Token': token,
        }
      });

      console.log('📡 Ответ от сервера:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('❌ Ошибка от сервера:', errorData);
        
        if (response.status === 401) {
          // Очищаем все токены при ошибке авторизации
          const keysToRemove = ['auth_token', 'session_token', 'jwt_token', 'token', 'access_token', 'session_id'];
          keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          });
          
          throw new Error('Сессия истекла. Пожалуйста, войдите в систему заново.');
        }
        
        throw new Error(errorData.error || `Ошибка загрузки: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.url) {
        throw new Error('Сервер вернул некорректный ответ');
      }

      console.log('✅ Файл успешно загружен:', result.url);
      return result.url;
    } catch (error) {
      console.error('❌ Ошибка при загрузке:', error);
      throw error;
    }
  };

  // Валидация файла
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Файл должен быть изображением' };
    }

    const maxSize = 10 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Файл слишком большой (максимум 10MB)' };
    }

    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedFormats.includes(file.type)) {
      return { valid: false, error: 'Поддерживаются только JPEG, PNG и WebP' };
    }

    return { valid: true };
  };

  // ✅ ИСПРАВЛЕНИЕ: Обработка выбора файла с улучшенной проверкой
  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled) return;

    console.log('📁 Обрабатываем выбор файла:', file.name);

    // Валидируем файл
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Ошибка",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Создаем превью
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Загружаем файл
      const uploadedUrl = await uploadFile(file);

      // Очищаем временный URL
      URL.revokeObjectURL(preview);

      // Обновляем превью с загруженным URL
      setPreviewUrl(uploadedUrl);

      // Вызываем callback
      onUploadComplete(uploadedUrl, file);

      toast({
        title: "Успешно!",
        description: "Фото загружено"
      });
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
      
      // Очищаем превью при ошибке
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(currentUrl || null);

      const errorMessage = error instanceof Error ? error.message : "Не удалось загрузить файл";
      
      toast({
        title: "Ошибка загрузки",
        description: errorMessage,
        variant: "destructive"
      });

      // Если ошибка авторизации, показываем дополнительную информацию
      if (errorMessage.includes('Сессия истекла') || errorMessage.includes('авторизация')) {
        toast({
          title: "Требуется авторизация",
          description: "Пожалуйста, обновите страницу и войдите в систему заново",
          variant: "destructive"
        });
      }
    } finally {
      setIsUploading(false);
    }
  }, [disabled, currentUrl, onUploadComplete, toast, previewUrl]);

  // Обработка drag & drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // Открытие файлового диалога
  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ✅ ИСПРАВЛЕНИЕ: Удаление фото с улучшенной проверкой
  const handleRemove = async () => {
    if (disabled) return;

    console.log('🗑️ Удаляем фото...');

    const token = await getValidToken();
    if (!token) {
      toast({
        title: "Ошибка авторизации",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }

    try {
      // Удаляем файл через API если есть URL
      if (previewUrl && !previewUrl.startsWith('blob:')) {
        const response = await fetch(`/api/upload/delete?url=${encodeURIComponent(previewUrl)}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Auth-Token': token,
          }
        });

        if (!response.ok) {
          console.warn('⚠️ Не удалось удалить файл с сервера, но продолжаем');
        }
      }

      // Очищаем превью
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);
      
      if (onRemove) {
        onRemove();
      }

      toast({
        title: "Фото удалено",
        description: "Фото успешно удалено"
      });
    } catch (error) {
      console.error('❌ Ошибка удаления:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить фото",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        disabled={disabled}
      />

      <AnimatePresence mode="wait">
        {previewUrl ? (
          // Превью загруженного фото
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group"
          >
            <div className="relative w-full h-80 bg-gray-100 rounded-2xl overflow-hidden">
              <img
                src={previewUrl}
                alt="Загруженное фото"
                className="w-full h-full object-cover"
              />
              
              {/* Оверлей с кнопками */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={openFileDialog}
                  disabled={disabled || isUploading}
                  className="bg-white/90 text-gray-900 hover:bg-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Заменить
                </Button>
                
                {onRemove && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={disabled || isUploading}
                    className="bg-red-500/90 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Удалить
                  </Button>
                )}
              </div>

              {/* Индикатор загрузки */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-white rounded-xl p-4 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-sm font-medium">Загрузка...</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // Зона загрузки
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
              relative w-full h-[25rem] sm:h-[20rem] border-2 border-dashed rounded-2xl transition-all cursor-pointer
              ${dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={openFileDialog}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mb-4
                ${dragOver ? 'bg-blue-500' : 'bg-gray-200'}
              `}>
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                ) : dragOver ? (
                  <Upload className="h-8 w-8 text-white" />
                ) : (
                  <Camera className="h-8 w-8 text-gray-600" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isUploading ? 'Загружаем фото...' : 'Загрузите фото в полный рост'}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                Перетащите файл сюда или нажмите для выбора
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  disabled={disabled || isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Выбрать фото
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || isUploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment');
                      fileInputRef.current.click();
                    }
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Сделать фото
                </Button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Поддерживаются: JPEG, PNG, WebP (до 10MB)
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Рекомендации */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Для лучшего анализа:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Фото в полный рост на светлом фоне</li>
              <li>• Облегающая одежда или спортивная форма</li>
              <li>• Хорошее освещение, прямая поза</li>
              <li>• Руки вдоль тела, взгляд в камеру</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}