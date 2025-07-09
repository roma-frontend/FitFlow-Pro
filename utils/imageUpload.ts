// utils/imageUpload.ts

// Функция для загрузки изображения в хранилище
// Вы можете использовать Cloudinary, Uploadthing, AWS S3 или другой сервис
export async function uploadImageToStorage(file: File): Promise<string> {

  // Вариант 2: Используя Cloudinary
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
    }
  }

  // Вариант 3: Используя API endpoint для загрузки
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Upload error:", error);
    
    // Fallback: создаем локальный URL (только для демо)
    return URL.createObjectURL(file);
  }
}

// Функция для оптимизации изображения перед загрузкой
export async function optimizeImage(file: File, maxWidth = 1024, maxHeight = 1024): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Вычисляем новые размеры, сохраняя пропорции
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Рисуем изображение с новыми размерами
        ctx.drawImage(img, 0, 0, width, height);

        // Конвертируем в blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not create blob"));
              return;
            }

            // Создаем новый File объект
            const optimizedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(optimizedFile);
          },
          "image/jpeg",
          0.85 // Качество JPEG
        );
      };

      img.onerror = () => {
        reject(new Error("Could not load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Could not read file"));
    };

    reader.readAsDataURL(file);
  });
}

// Функция для валидации изображения
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Проверяем тип файла
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Файл должен быть изображением" };
  }

  // Проверяем размер файла (макс 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: "Файл слишком большой (максимум 10MB)" };
  }

  // Проверяем поддерживаемые форматы
  const supportedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!supportedFormats.includes(file.type)) {
    return { valid: false, error: "Поддерживаются только JPEG, PNG и WebP" };
  }

  return { valid: true };
}

// Функция для создания превью изображения
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error("Could not read file"));
    };
    
    reader.readAsDataURL(file);
  });
}