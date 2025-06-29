// hooks/useCloudinaryUpload.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
'use client';

import { useState } from 'react';

interface UploadResult {
  url: string;
  data: {
    fileName: string;
    originalName: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
    cloudinaryData: {
      publicId: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    };
  };
}

interface DeleteResult {
  success: boolean;
  message: string;
  data?: {
    url: string;
    publicId: string;
    deletedAt: string;
    deletedBy: string;
  };
}

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функция загрузки файла
  const upload = async (
    file: File, 
    options: { 
      folder?: string; 
      uploadPreset?: string; 
      replaceUrl?: string; // URL файла, который нужно заменить (и удалить старый)
    } = {}
  ): Promise<string> => {
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

      // Добавляем дополнительные параметры
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      if (options.uploadPreset) {
        formData.append('uploadPreset', options.uploadPreset);
      }

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
        const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка сервера' }));
        console.error('❌ Ошибка HTTP:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: { success: boolean; url: string; data: UploadResult['data']; error?: string } = await response.json();
      console.log('📄 Данные ответа:', result);

      if (result.success && result.url) {
        console.log('✅ useCloudinaryUpload: файл успешно загружен', result.url);

        // Если указан URL для замены, удаляем старый файл
        if (options.replaceUrl && options.replaceUrl !== result.url) {
          console.log('🔄 Удаляем заменяемый файл:', options.replaceUrl);
          try {
            await deleteImage(options.replaceUrl);
            console.log('✅ Старый файл успешно удален');
          } catch (deleteError) {
            console.warn('⚠️ Не удалось удалить старый файл:', deleteError);
            // Не прерываем процесс, если удаление старого файла не удалось
          }
        }

        return result.url;
      } else {
        console.error('❌ Ошибка от сервера:', result);
        throw new Error(result.error || 'Ошибка загрузки файла');
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

  // Функция удаления файла
  const deleteImage = async (imageUrl: string): Promise<DeleteResult> => {
    setIsDeleting(true);
    setError(null);

    try {
      console.log('🗑️ useCloudinaryUpload: удаляем файл', imageUrl);

      if (!imageUrl) {
        throw new Error('URL изображения не указан');
      }

      if (!imageUrl.includes('cloudinary.com')) {
        console.log('ℹ️ Файл не из Cloudinary, пропускаем удаление');
        return {
          success: true,
          message: 'Файл не из Cloudinary, удаление не требуется'
        };
      }

      const response = await fetch(`/api/upload/delete?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Получен ответ от сервера:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка сервера' }));
        console.error('❌ Ошибка HTTP при удалении:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: DeleteResult = await response.json();
      console.log('📄 Результат удаления:', result);

      if (result.success) {
        console.log('✅ useCloudinaryUpload: файл успешно удален');
        return result;
      } else {
        console.error('❌ Ошибка удаления от сервера:', result);
        throw new Error(result.message || 'Ошибка удаления файла');
      }
    } catch (err: any) {
      console.error('❌ useCloudinaryUpload: исключение при удалении', err);
      const errorMessage = err.message || 'Неизвестная ошибка удаления';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Функция замены файла (загрузка нового + удаление старого)
  const replaceImage = async (
    newFile: File,
    oldImageUrl: string,
    options: { folder?: string; uploadPreset?: string } = {}
  ): Promise<string> => {
    console.log('🔄 useCloudinaryUpload: замена изображения', {
      oldUrl: oldImageUrl,
      newFile: newFile.name
    });

    try {
      // Загружаем новый файл с указанием URL для замены
      const newUrl = await upload(newFile, {
        ...options,
        replaceUrl: oldImageUrl
      });

      console.log('✅ useCloudinaryUpload: изображение успешно заменено', {
        oldUrl: oldImageUrl,
        newUrl: newUrl
      });

      return newUrl;
    } catch (error) {
      console.error('❌ useCloudinaryUpload: ошибка замены изображения', error);
      throw error;
    }
  };

  // Функция очистки ошибок
  const clearError = () => {
    setError(null);
  };

  // ✅ ИСПРАВЛЕНИЕ: Функция проверки, является ли URL Cloudinary URL
  const isCloudinaryUrl = (url: string): boolean => {
    return Boolean(url && url.includes('cloudinary.com'));
  };

  // Функция получения превью URL с трансформациями
  const getPreviewUrl = (url: string, transformations: string = 'w_150,h_150,c_fill'): string => {
    if (!isCloudinaryUrl(url)) {
      return url;
    }

    try {
      // Вставляем трансформации в Cloudinary URL
      // Пример: https://res.cloudinary.com/cloud/image/upload/v123/folder/image.jpg
      // Результат: https://res.cloudinary.com/cloud/image/upload/w_150,h_150,c_fill/v123/folder/image.jpg
      
      const uploadIndex = url.indexOf('/upload/');
      if (uploadIndex !== -1) {
        const beforeUpload = url.substring(0, uploadIndex + 8); // включая '/upload/'
        const afterUpload = url.substring(uploadIndex + 8);
        return `${beforeUpload}${transformations}/${afterUpload}`;
      }
      
      return url;
    } catch (error) {
      console.warn('⚠️ Не удалось создать превью URL:', error);
      return url;
    }
  };

  // ✅ ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ
  
  // Функция для валидации файла
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Неподдерживаемый тип файла. Разрешены: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Файл слишком большой. Максимальный размер: 10MB'
      };
    }

    return { isValid: true };
  };

  // Функция для получения информации о файле
  const getFileInfo = (file: File) => {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeFormatted: formatFileSize(file.size),
      extension: file.name.split('.').pop()?.toLowerCase() || ''
    };
  };

  // Функция для форматирования размера файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Функция для извлечения public_id из Cloudinary URL
  const extractPublicId = (url: string): string | null => {
    if (!isCloudinaryUrl(url)) {
      return null;
    }

    try {
      const cloudinaryPattern = /cloudinary\.com\/[^\/]+\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
      const match = url.match(cloudinaryPattern);
      
      if (match && match[1]) {
        return match[1];
      }
      
      return null;
    } catch (error) {
      console.error('❌ Ошибка извлечения public_id:', error);
      return null;
    }
  };

  return {
    // Основные функции
    upload,
    deleteImage,
    replaceImage,

    // Состояние
    isUploading,
    isDeleting,
    isProcessing: isUploading || isDeleting,
    error,

    // Утилиты
    clearError,
    isCloudinaryUrl,
    getPreviewUrl,
    validateFile,
    getFileInfo,
    formatFileSize,
    extractPublicId,

    // Алиасы для совместимости
    delete: deleteImage,
    replace: replaceImage,
  };
}

// ✅ ДОПОЛНИТЕЛЬНЫЕ ТИПЫ

export interface CloudinaryUploadOptions {
  folder?: string;
  uploadPreset?: string;
  replaceUrl?: string;
  transformations?: string;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  sizeFormatted: string;
  extension: string;
}

// Экспорт типов для использования в других файлах
export type { UploadResult, DeleteResult };

// ✅ ЭКСПОРТ ПО УМОЛЧАНИЮ
export default useCloudinaryUpload;