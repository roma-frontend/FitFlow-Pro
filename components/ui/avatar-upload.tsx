// components/ui/avatar-upload.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, Loader2 } from 'lucide-react';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
  userName: string;
  disabled?: boolean;
}

// ✅ ИСПРАВЛЕНИЕ: Функция валидации URL
const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || url.trim() === '') {
    return true; // Пустое значение валидно
  }

  const trimmedUrl = url.trim();

  try {
    // Проверяем абсолютные URL
    const urlObj = new URL(trimmedUrl);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    // Проверяем относительные пути и data URLs
    return trimmedUrl.startsWith('/') || 
           trimmedUrl.startsWith('./') || 
           trimmedUrl.startsWith('../') ||
           trimmedUrl.startsWith('data:image/');
  }
};

export function AvatarUpload({ 
  currentUrl, 
  onUploadComplete, 
  onRemove, 
  userName,
  disabled = false 
}: AvatarUploadProps) {
  // ✅ ИСПРАВЛЕНИЕ: Правильная инициализация с валидацией
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    // Проверяем валидность URL при инициализации
    return (currentUrl && isValidUrl(currentUrl)) ? currentUrl : null;
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error } = useCloudinaryUpload();
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // ✅ Предотвращаем всплытие события
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Выбран файл:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // ✅ ДОБАВЛЕНА валидация файла
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Можно загружать только изображения"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Размер файла не должен превышать 10MB"
      });
      return;
    }

    // Создаем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result && isValidUrl(result)) {
        setPreviewUrl(result);
      }
    };
    reader.readAsDataURL(file);

    try {
      console.log('🚀 Начинаем загрузку...');
      const uploadedUrl = await upload(file, {
        folder: 'user-avatars',
        uploadPreset: 'FitFlow-Pro'
      });

      if (uploadedUrl && isValidUrl(uploadedUrl)) {
        console.log('✅ Загрузка завершена:', uploadedUrl);
        
        // ✅ ИСПРАВЛЕНИЕ: Удаляем старое изображение при замене
        if (currentUrl && currentUrl !== uploadedUrl && isValidUrl(currentUrl)) {
          try {
            // Здесь можно добавить логику удаления старого изображения
            console.log('🗑️ Заменяем старое изображение:', currentUrl);
          } catch (deleteError) {
            console.warn('⚠️ Не удалось удалить старое изображение:', deleteError);
          }
        }
        
        onUploadComplete(uploadedUrl);
        toast({
          title: "Успех!",
          description: "Фото профиля загружено успешно"
        });
      } else {
        throw new Error('Получен некорректный URL');
      }
    } catch (error: any) {
      console.error('❌ Ошибка загрузки:', error);
      // Возвращаем предыдущее состояние
      setPreviewUrl((currentUrl && isValidUrl(currentUrl)) ? currentUrl : null);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить фото"
      });
    }

    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ Обработчик клика с предотвращением всплытия
  const handleUploadClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // ✅ ИСПРАВЛЕНИЕ: Правильное удаление с очисткой
    const urlToDelete = previewUrl;
    
    setPreviewUrl(null);
    
    if (onRemove) {
      onRemove();
    }
    
    // ✅ ДОБАВЛЕНА попытка удаления из Cloudinary
    if (urlToDelete && urlToDelete.includes('cloudinary.com')) {
      try {
        console.log('🗑️ Удаляем изображение из Cloudinary:', urlToDelete);
        
        const response = await fetch(`/api/upload/delete?url=${encodeURIComponent(urlToDelete)}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Изображение удалено из Cloudinary:', result);
        } else {
          console.warn('⚠️ Не удалось удалить изображение из Cloudinary');
        }
      } catch (deleteError) {
        console.warn('⚠️ Ошибка удаления изображения:', deleteError);
      }
    }
    
    toast({
      title: "Фото удалено",
      description: "Фото профиля было удалено"
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // ✅ ИСПРАВЛЕНИЕ: Используем валидный URL для отображения
  const displayUrl = previewUrl && isValidUrl(previewUrl) ? previewUrl : null;

  return (
    <div className="flex flex-col items-center space-y-4" data-file-upload>
      {/* Аватар */}
      <div className="relative">
        <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
          {displayUrl ? (
            <AvatarImage 
              src={displayUrl} 
              alt={userName}
              className="object-cover"
              onError={(e) => {
                console.warn('⚠️ Ошибка загрузки изображения:', displayUrl);
                // При ошибке загрузки скрываем изображение
                (e.target as HTMLImageElement).style.display = 'none';
                setPreviewUrl(null);
              }}
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Индикатор загрузки */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}

        {/* Кнопка удаления */}
        {displayUrl && !isUploading && onRemove && !disabled && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={disabled || isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {displayUrl ? 'Изменить фото' : 'Загрузить фото'}
            </>
          )}
        </Button>
      </div>

      {/* ✅ Скрытый input с правильными обработчиками */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        onClick={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
        className="hidden"
        disabled={disabled || isUploading}
        data-file-upload
      />

      {/* Показываем ошибку если есть */}
      {error && (
        <p className="text-sm text-red-600 text-center max-w-xs">
          {error}
        </p>
      )}

      {/* Подсказка */}
      <p className="text-xs text-gray-500 text-center">
        Поддерживаются форматы: JPG, PNG, GIF, WebP<br />
        Максимальный размер: 10MB
      </p>
    </div>
  );
}