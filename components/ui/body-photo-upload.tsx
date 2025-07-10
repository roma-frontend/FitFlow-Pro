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

  // Функция загрузки файла через API
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'body-analysis');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload file');
    }
  };

  // Валидация файла
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Файл должен быть изображением' };
    }

    // Проверяем размер файла (макс 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Файл слишком большой (максимум 10MB)' };
    }

    // Поддерживаемые форматы
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedFormats.includes(file.type)) {
      return { valid: false, error: 'Поддерживаются только JPEG, PNG и WebP' };
    }

    return { valid: true };
  };

  // Обработка выбора файла
  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled) return;

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
      console.error('Ошибка загрузки:', error);
      
      // Очищаем превью при ошибке
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(currentUrl || null);

      toast({
        title: "Ошибка загрузки",
        description: error instanceof Error ? error.message : "Не удалось загрузить файл",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [disabled, currentUrl, onUploadComplete, toast, previewUrl]);

  // Обработка drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Обработка drag over
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

  // Удаление фото
  const handleRemove = async () => {
    if (disabled) return;

    try {
      // Удаляем файл через API если есть URL
      if (previewUrl && !previewUrl.startsWith('blob:')) {
        await fetch(`/api/upload/delete?url=${encodeURIComponent(previewUrl)}`, {
          method: 'DELETE',
          credentials: 'include'
        });
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
      console.error('Ошибка удаления:', error);
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
                    // Для мобильных устройств - открыть камеру
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