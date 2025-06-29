// lib/cloudinaryUpload.ts (версия без SDK)
export interface CloudinaryUploadOptions {
  uploadPreset?: string;
  folder?: string;
  resourceType?: 'auto' | 'image' | 'video' | 'raw';
  transformation?: string;
}

export async function cloudinaryUpload(
  file: File,
  {
    uploadPreset = 'ml_default',
    folder = 'user-avatars',
    resourceType = 'image',
    transformation
  }: CloudinaryUploadOptions = {}
): Promise<string> {
  const cloudName = 'dgbtipi5o';

  console.log('📤 cloudinaryUpload: подготавливаем данные для загрузки', {
    cloudName,
    uploadPreset,
    folder,
    resourceType,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  // Проверяем, что файл - это изображение
  if (!file.type.startsWith('image/')) {
    throw new Error('Можно загружать только изображения');
  }

  // Проверяем размер файла (максимум 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Размер файла не должен превышать 10MB');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  // Добавляем folder только если он не пустой
  if (folder && folder.trim()) {
    formData.append('folder', folder);
  }
  
  // Добавляем базовые трансформации для оптимизации
  if (transformation) {
    formData.append('transformation', transformation);
  }

  console.log('📡 cloudinaryUpload: отправляем запрос в Cloudinary...');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    console.log('📡 cloudinaryUpload: получен ответ', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ cloudinaryUpload: ошибка от Cloudinary', {
        status: response.status,
        error: errorText
      });
      
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ cloudinaryUpload: успешная загрузка', {
      publicId: data.public_id,
      secureUrl: data.secure_url,
      format: data.format,
      width: data.width,
      height: data.height,
      bytes: data.bytes
    });

    return data.secure_url;
  } catch (error) {
    console.error('❌ cloudinaryUpload: исключение при загрузке', error);
    throw error;
  }
}

// Дополнительная функция для генерации трансформированных URL
export function getCloudinaryUrl(
  publicId: string, 
  transformations: string[] = []
): string {
  const cloudName = 'dgbtipi5o';
  
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  if (transformations.length === 0) {
    return `${baseUrl}/${publicId}`;
  }
  
  const transformationString = transformations.join(',');
  return `${baseUrl}/${transformationString}/${publicId}`;
}

// Предустановленные трансформации для аватарок
export const avatarTransformations = {
  thumbnail: ['w_150,h_150,c_fill,g_face', 'q_auto', 'f_auto'],
  medium: ['w_300,h_300,c_fill,g_face', 'q_auto', 'f_auto'],
  large: ['w_500,h_500,c_fill,g_face', 'q_auto', 'f_auto'],
};