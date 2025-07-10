// app/api/upload/route.ts - УЛУЧШЕННАЯ ВЕРСИЯ С ДЕТАЛЬНЫМ ЛОГИРОВАНИЕМ
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/upload - начало загрузки файла');
    console.log('📋 Headers:', Object.fromEntries(request.headers.entries()));

    // ✅ ИСПРАВЛЕНИЕ: Более детальная проверка токена
    let sessionToken = null;
    
    // 1. Проверяем заголовок Authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
      console.log('🔑 Токен найден в Authorization header');
    }
    
    // 2. Проверяем X-Auth-Token заголовок
    if (!sessionToken) {
      sessionToken = request.headers.get('x-auth-token');
      if (sessionToken) {
        console.log('🔑 Токен найден в X-Auth-Token header');
      }
    }
    
    // 3. Проверяем cookies
    if (!sessionToken) {
      sessionToken = request.cookies.get('session_id')?.value;
      if (sessionToken) {
        console.log('🔑 Токен найден в session_id cookie');
      }
    }
    
    // 4. Проверяем альтернативные cookies
    if (!sessionToken) {
      sessionToken = request.cookies.get('auth_token')?.value;
      if (sessionToken) {
        console.log('🔑 Токен найден в auth_token cookie');
      }
    }

    console.log('🔍 Итоговый токен:', sessionToken ? 'НАЙДЕН' : 'НЕ НАЙДЕН');

    if (!sessionToken) {
      console.log('❌ Upload: JWT токен отсутствует во всех источниках');
      return NextResponse.json({ 
        error: 'Не авторизован - токен отсутствует',
        details: 'Токен не найден в headers и cookies'
      }, { status: 401 });
    }

    // ✅ ИСПРАВЛЕНИЕ: Детальная проверка сессии
    console.log('🔍 Проверяем сессию...');
    const sessionData = await getSession(sessionToken);
    
    if (!sessionData) {
      console.log('❌ Upload: JWT токен недействителен');
      return NextResponse.json({ 
        error: 'Сессия недействительна',
        details: 'Токен не прошел проверку'
      }, { status: 401 });
    }

    console.log('✅ Upload: JWT авторизация пройдена:', {
      userId: sessionData.user.id,
      role: sessionData.user.role,
      email: sessionData.user.email
    });

    // ✅ ИСПРАВЛЕНИЕ: Детальная проверка FormData
    console.log('📋 Парсим FormData...');
    const formData = await request.formData();
    const type = formData.get('type') as string || 'profile';
    const file = formData.get('file') as File;

    console.log('📁 Данные формы:', {
      type,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    
    // Для body-analysis разрешаем всем авторизованным пользователям
    if (type === 'body-analysis') {
      console.log('✅ Upload: загрузка для анализа тела - разрешено для всех авторизованных');
    } else {
      // Для других типов проверяем права
      if (!['super-admin', 'admin', 'manager', 'trainer'].includes(sessionData.user.role)) {
        // Обычные пользователи могут загружать только свои аватары
        if (type !== 'profile' && type !== 'avatar') {
          console.log('❌ Upload: недостаточно прав для типа:', type);
          return NextResponse.json({ 
            error: 'Недостаточно прав для данного типа загрузки',
            details: `Роль ${sessionData.user.role} не может загружать тип ${type}`
          }, { status: 403 });
        }
      }
    }

    if (!file) {
      console.log('❌ Upload: файл не найден в FormData');
      return NextResponse.json({ 
        error: 'Файл не найден',
        details: 'Файл отсутствует в FormData'
      }, { status: 400 });
    }

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Upload: неподдерживаемый тип файла:', file.type);
      return NextResponse.json({
        error: 'Неподдерживаемый тип файла. Разрешены: JPEG, PNG, WebP, GIF',
        details: `Получен тип: ${file.type}`
      }, { status: 400 });
    }

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('❌ Upload: файл слишком большой:', file.size);
      return NextResponse.json({
        error: 'Файл слишком большой. Максимальный размер: 10MB',
        details: `Размер файла: ${file.size} байт`
      }, { status: 400 });
    }

    console.log('☁️ Загружаем в Cloudinary...');

    // ✅ ИСПРАВЛЕНИЕ: Проверяем переменные окружения
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgbtipi5o';
    if (!cloudName) {
      console.log('❌ Upload: CLOUDINARY_CLOUD_NAME не настроен');
      return NextResponse.json({
        error: 'Ошибка конфигурации сервера',
        details: 'Cloudinary не настроен'
      }, { status: 500 });
    }

    const uploadPreset = 'ml_default';
    const folder = type === 'body-analysis' ? 'body-analysis' : 'user-avatars';

    console.log('🔍 Параметры Cloudinary:', {
      cloudName,
      uploadPreset,
      folder,
      fileName: file.name,
      fileSize: file.size
    });

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', uploadPreset);
    cloudinaryFormData.append('folder', folder);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    console.log('📤 Отправляем в Cloudinary:', cloudinaryUrl);

    try {
      const cloudinaryResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: cloudinaryFormData,
      });

      const responseText = await cloudinaryResponse.text();
      console.log('📡 Ответ от Cloudinary:', {
        status: cloudinaryResponse.status,
        ok: cloudinaryResponse.ok,
        statusText: cloudinaryResponse.statusText,
        responseLength: responseText.length
      });

      if (!cloudinaryResponse.ok) {
        console.error('❌ Ошибка Cloudinary:', responseText);
        return NextResponse.json({
          error: 'Ошибка загрузки в Cloudinary',
          details: responseText,
          cloudinaryStatus: cloudinaryResponse.status
        }, { status: 500 });
      }

      const cloudinaryData = JSON.parse(responseText);
      
      console.log('✅ Файл успешно загружен в Cloudinary:', {
        url: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        width: cloudinaryData.width,
        height: cloudinaryData.height
      });

      const responseData = {
        success: true,
        message: 'Файл успешно загружен',
        url: cloudinaryData.secure_url,
        data: {
          fileName: cloudinaryData.public_id,
          originalName: file.name,
          size: file.size,
          type: file.type,
          url: cloudinaryData.secure_url,
          uploadedAt: new Date().toISOString(),
          uploadedBy: sessionData.user.name,
          userId: sessionData.user.id,
          uploadType: type,
          cloudinaryData: {
            publicId: cloudinaryData.public_id,
            width: cloudinaryData.width,
            height: cloudinaryData.height,
            format: cloudinaryData.format,
            bytes: cloudinaryData.bytes
          }
        }
      };

      console.log('🎉 Успешный ответ клиенту');
      return NextResponse.json(responseData);

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