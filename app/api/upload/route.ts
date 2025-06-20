// app/api/upload/route.ts (исправленная версия с ml_default)
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('📁 POST /api/upload - начало загрузки файла');

    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    if (!['super-admin', 'admin', 'manager'].includes(sessionData.user.role)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    // Получаем данные формы
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'profile';

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Неподдерживаемый тип файла. Разрешены: JPEG, PNG, WebP, GIF'
      }, { status: 400 });
    }

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'Файл слишком большой. Максимальный размер: 10MB'
      }, { status: 400 });
    }

    console.log('☁️ Загружаем в Cloudinary...');

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgbtipi5o';
    
    let uploadPreset = 'ml_default';

    // Проверяем, какие preset'ы доступны
    console.log('🔍 Попробуем найти рабочий preset...');

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', uploadPreset);
    cloudinaryFormData.append('folder', 'user-avatars');

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    console.log('📤 Отправляем в Cloudinary:', {
      url: cloudinaryUrl,
      preset: uploadPreset,
      folder: 'user-avatars'
    });

    try {
      const cloudinaryResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: cloudinaryFormData,
      });

      const responseText = await cloudinaryResponse.text();
      console.log('📡 Ответ от Cloudinary:', {
        status: cloudinaryResponse.status,
        ok: cloudinaryResponse.ok,
        response: responseText.substring(0, 500)
      });

      if (!cloudinaryResponse.ok) {
        // Если ml_default не работает, попробуем без preset
        console.log('⚠️ ml_default не работает, пробуем без preset...');
        
        const fallbackFormData = new FormData();
        fallbackFormData.append('file', file);
        fallbackFormData.append('folder', 'user-avatars');
        
        // Добавляем API ключи для signed upload
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
        const timestamp = Math.round(Date.now() / 1000);
        
        if (apiKey) {
          fallbackFormData.append('api_key', apiKey);
          fallbackFormData.append('timestamp', timestamp.toString());
      
        }

        return NextResponse.json({
          error: 'Upload preset не найден',
          details: `Preset "${uploadPreset}" не существует в аккаунте ${cloudName}`,
          suggestion: 'Создайте unsigned upload preset в Cloudinary Dashboard',
          cloudinaryResponse: responseText,
        }, { status: 500 });
      }

      const cloudinaryData = JSON.parse(responseText);
      
      console.log('✅ Файл успешно загружен в Cloudinary:', {
        url: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id
      });

      return NextResponse.json({
        success: true,
        message: 'Файл успешно загружен в Cloudinary',
        url: cloudinaryData.secure_url,
        data: {
          fileName: cloudinaryData.public_id,
          originalName: file.name,
          size: file.size,
          type: file.type,
          url: cloudinaryData.secure_url,
          uploadedAt: new Date().toISOString(),
          uploadedBy: sessionData.user.name,
          cloudinaryData: {
            publicId: cloudinaryData.public_id,
            width: cloudinaryData.width,
            height: cloudinaryData.height,
            format: cloudinaryData.format,
            bytes: cloudinaryData.bytes
          }
        }
      });

    } catch (cloudinaryError) {
      console.error('❌ Исключение при запросе к Cloudinary:', cloudinaryError);
      return NextResponse.json({
        error: 'Ошибка соединения с Cloudinary',
        details: cloudinaryError instanceof Error ? cloudinaryError.message : 'Неизвестная ошибка'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Общая ошибка загрузки файла:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка загрузки файла',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}
