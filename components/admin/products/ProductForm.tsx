"use client";

import { useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProducts } from '@/hooks/useProducts';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import type { Product, ProductFormData } from '@/types/product';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';

// Схема Zod - точно соответствует ProductFormData
const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Название слишком длинное'),
  description: z.string().min(1, 'Описание обязательно').max(500, 'Описание слишком длинное'),
  price: z.number().min(0, 'Цена должна быть положительной'),
  category: z.enum(['supplements', 'drinks', 'snacks', 'merchandise'], {
    required_error: 'Выберите категорию'
  }),
  inStock: z.number().min(0, 'Количество не может быть отрицательным'),
  isPopular: z.boolean(),
  imageUrl: z.string().optional()
});

type ProductFormSchema = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading: boolean;
}

export function ProductForm({ product, isOpen, onClose, onSubmit, isLoading }: ProductFormProps) {
  const queryClient = useQueryClient();
  const { upload, isUploading, error: uploadError, clearError } = useCloudinaryUpload();
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || 'supplements',
      inStock: product?.inStock || 0,
      isPopular: product?.isPopular || false,
      imageUrl: product?.imageUrl || ''
    }
  });

  const watchImageUrl = form.watch('imageUrl');

  // Сброс формы при открытии/закрытии или смене продукта
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        category: product?.category || 'supplements',
        inStock: product?.inStock || 0,
        isPopular: product?.isPopular || false,
        imageUrl: product?.imageUrl || ''
      });
      setImagePreview(product?.imageUrl || '');
      setUploadedImageUrl('');
      setSubmitStatus('idle');
      setIsSubmitting(false);
    }
  }, [isOpen, product, form]);

  useEffect(() => {
    if (watchImageUrl && watchImageUrl.startsWith('http')) {
      setImagePreview(watchImageUrl);
    } else if (uploadedImageUrl) {
      setImagePreview(uploadedImageUrl);
    } else {
      setImagePreview('');
    }
  }, [watchImageUrl, uploadedImageUrl]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      clearError();
      console.log('🔄 ProductForm: Начинаем загрузку файла:', file.name);

      // Показываем превью сразу
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Загружаем в Cloudinary
      const imageUrl = await upload(file, {
        folder: 'products',
        uploadPreset: 'ml_default'
      });

      console.log('✅ ProductForm: Файл загружен, URL:', imageUrl);

      // Сохраняем URL в отдельном состоянии
      setUploadedImageUrl(imageUrl);

      // Обновляем форму с новым URL
      form.setValue('imageUrl', imageUrl, {
        shouldValidate: true,
        shouldDirty: true
      });

      const currentValue = form.getValues('imageUrl');
      console.log('📋 ProductForm: imageUrl в форме после установки:', currentValue);

    } catch (error) {
      console.error('❌ ProductForm: Ошибка загрузки файла:', error);
      setImagePreview('');
      setUploadedImageUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        await handleFileUpload({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (data: ProductFormSchema) => {
    try {
      if (isUploading || isSubmitting || isLoading) {
        console.log('⏳ ProductForm: Операция уже выполняется...');
        return;
      }

      setIsSubmitting(true);
      setSubmitStatus('saving');

      const finalImageUrl = uploadedImageUrl || data.imageUrl || '';
      const formDataToSend: ProductFormData = {
        ...data,
        imageUrl: finalImageUrl
      };

      await onSubmit(formDataToSend);

      setSubmitStatus('success');

      // Небольшая задержка перед закрытием
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('❌ ProductForm: Ошибка отправки формы:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  const getButtonText = () => {
    if (isUploading) return 'Загружаем изображение...';
    if (submitStatus === 'saving') return 'Сохраняем...';
    if (submitStatus === 'success') return 'Успешно сохранено!';
    if (submitStatus === 'error') return 'Ошибка сохранения';
    return product ? 'Сохранить изменения' : 'Создать продукт';
  };

  const getButtonVariant = () => {
    if (submitStatus === 'success') return 'default';
    if (submitStatus === 'error') return 'destructive';
    return 'default';
  };

  const categoryOptions = [
    { value: 'supplements', label: 'Добавки' },
    { value: 'drinks', label: 'Напитки' },
    { value: 'snacks', label: 'Снеки' },
    { value: 'merchandise', label: 'Мерч' }
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Редактировать продукт' : 'Создать новый продукт'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Основная информация */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название продукта</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Введите название продукта"
                          {...field}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Введите описание продукта"
                          className="min-h-[100px]"
                          {...field}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цена (₽)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            disabled={isFormLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Количество</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            disabled={isFormLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isFormLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPopular"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Популярный товар</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Отображать в разделе рекомендуемых товаров
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Изображение */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Изображение продукта</Label>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={uploadMethod === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMethod('file')}
                      disabled={isUploading || isFormLoading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Загрузить файл
                    </Button>
                    <Button
                      type="button"
                      variant={uploadMethod === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMethod('url')}
                      disabled={isUploading || isFormLoading}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      URL изображения
                    </Button>
                  </div>
                </div>

                {uploadMethod === 'url' && (
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL изображения</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            disabled={isUploading || isFormLoading}
                          />
                        </FormControl>
                        <FormMessage />
                                            </FormItem>
                    )}
                  />
                )}

                {uploadMethod === 'file' && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading || isFormLoading}
                    />

                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isUploading || isFormLoading
                          ? 'border-blue-300 bg-blue-50 cursor-not-allowed'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                      onClick={() => !isUploading && !isFormLoading && fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          <p className="mt-2 text-sm text-gray-600">Загружаем изображение...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            Нажмите для выбора файла или перетащите изображение сюда
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF до 10MB
                          </p>
                        </div>
                      )}
                    </div>

                    {uploadError && (
                      <p className="text-sm text-red-600">{uploadError}</p>
                    )}
                  </div>
                )}

                {/* Превью изображения */}
                {imagePreview && (
                  <div className="space-y-2">
                    <Label>Превью изображения</Label>
                    <div className="relative border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Превью"
                        className="w-full h-48 object-cover"
                        onError={() => {
                          setImagePreview('');
                          setUploadedImageUrl('');
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          form.setValue('imageUrl', '');
                          setImagePreview('');
                          setUploadedImageUrl('');
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        disabled={isUploading || isFormLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {!imagePreview && uploadMethod === 'url' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Введите URL изображения выше для предварительного просмотра
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Или оставьте поле пустым для использования изображения по умолчанию
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Статус операции */}
            {submitStatus !== 'idle' && (
              <div className={`p-4 rounded-lg ${submitStatus === 'saving' ? 'bg-blue-50 border border-blue-200' :
                  submitStatus === 'success' ? 'bg-green-50 border border-green-200' :
                    submitStatus === 'error' ? 'bg-red-50 border border-red-200' : ''
                }`}>
                <div className="flex items-center">
                  {submitStatus === 'saving' && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                      <span className="text-blue-700">Сохраняем изменения...</span>
                    </>
                  )}
                  {submitStatus === 'success' && (
                    <>
                      <div className="h-4 w-4 rounded-full bg-green-500 mr-2 flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-green-700">
                        {product ? 'Продукт успешно обновлен!' : 'Продукт успешно создан!'}
                      </span>
                    </>
                  )}
                  {submitStatus === 'error' && (
                    <>
                      <X className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-red-700">Произошла ошибка при сохранении</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Кнопки действий */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isFormLoading || isUploading}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant={getButtonVariant()}
                disabled={isFormLoading || isUploading || submitStatus === 'success'}
              >
                {(isFormLoading || submitStatus === 'saving') && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {submitStatus === 'success' && (
                  <div className="mr-2 h-4 w-4 rounded-full bg-white flex items-center justify-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
                {getButtonText()}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

