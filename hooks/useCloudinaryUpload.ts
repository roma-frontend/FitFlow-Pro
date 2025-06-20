// hooks/useCloudinaryUpload.ts (исправленная версия)
'use client';

import { useState } from 'react';

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (
    file: File, 
    options: { folder: string; uploadPreset: string; } = { folder: 'user-avatars', uploadPreset: 'fitAccess' }
  ) => {
    setIsUploading(true);
    setError(null);

    try {
      console.log('🔄 useCloudinaryUpload: начинаем загрузку файла', {
        name: file.name,
        size: file.size,
        type: file.type,
        options
      });

      // Проверяем файл на клиенте
      if (!file.type.startsWith('image/')) {
        throw new Error('Можно загружать только изображения');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Размер файла не должен превышать 10MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');
      formData.append('uploadTo', 'cloudinary');

      console.log('📤 Отправляем запрос на /api/upload...');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Получен ответ от сервера:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка HTTP:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📄 Данные ответа:', result);

      if (result.success) {
        console.log('✅ useCloudinaryUpload: файл успешно загружен', result.url);
        return result.url;
      } else {
        console.error('❌ Ошибка от сервера:', result);
        throw new Error(result.error || 'Ошибка загрузки');
      }
    } catch (err: any) {
      console.error('❌ useCloudinaryUpload: исключение при загрузке', err);
      const errorMessage = err.message || 'Неизвестная ошибка загрузки';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    isUploading,
    error,
    clearError: () => setError(null)
  };
}
