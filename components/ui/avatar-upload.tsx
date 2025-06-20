// components/ui/avatar-upload.tsx (исправленная версия)
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

export function AvatarUpload({ 
  currentUrl, 
  onUploadComplete, 
  onRemove, 
  userName,
  disabled = false 
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
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

    // Создаем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      console.log('🚀 Начинаем загрузку...');
      const uploadedUrl = await upload(file, {
        folder: 'user-avatars',
        uploadPreset: 'fitAccess'
      });

      if (uploadedUrl) {
        console.log('✅ Загрузка завершена:', uploadedUrl);
        onUploadComplete(uploadedUrl);
        toast({
          title: "Успех!",
          description: "Фото профиля загружено успешно"
        });
      }
    } catch (error: any) {
      console.error('❌ Ошибка загрузки:', error);
      setPreviewUrl(currentUrl || null);
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
    fileInputRef.current?.click();
  };

  const handleRemove = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setPreviewUrl(null);
    if (onRemove) {
      onRemove();
    }
    toast({
      title: "Фото удалено",
      description: "Фото профиля было удалено"
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex flex-col items-center space-y-4" data-file-upload>
      {/* Аватар */}
      <div className="relative">
        <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
          {previewUrl ? (
            <AvatarImage 
              src={previewUrl} 
              alt={userName}
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-semibold">
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
        {previewUrl && !isUploading && onRemove && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemove}
            disabled={disabled}
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
              {previewUrl ? 'Изменить фото' : 'Загрузить фото'}
            </>
          )}
        </Button>
      </div>

      {/* ✅ Скрытый input с правильными обработчиками */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        onClick={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
        className="hidden"
        disabled={disabled || isUploading}
        data-file-upload
      />

      {/* Показываем ошибку если есть */}
      {error && (
        <p className="text-sm text-red-600 text-center">
          {error}
        </p>
      )}

      {/* Подсказка */}
      <p className="text-xs text-gray-500 text-center">
        Поддерживаются форматы: JPG, PNG, GIF<br />
        Максимальный размер: 10MB
      </p>
    </div>
  );
}
