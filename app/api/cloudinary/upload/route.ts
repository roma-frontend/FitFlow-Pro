// app/api/cloudinary/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('📁 POST /api/cloudinary/upload - начало загрузки в Cloudinary');
    
    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    // Получаем данные формы
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    console.log('📄 Информация о файле:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Неподдерживаемый тип файла. Разрешены: JPEG, PNG, WebP' 
      }, { status: 400 });
    }

    // Проверяем размер файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Файл слишком большой. Максимальный размер: 5MB' 
      }, { status: 400 });
    }

    // Подготавливаем данные для Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', 'ml_default');
    cloudinaryFormData.append('folder', 'user-avatars');

    console.log('📤 Отправляем в Cloudinary...');

    // Отправляем в Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      return NextResponse.json({ 
        error: 'Cloudinary не настроен. Проверьте переменные окружения.' 
      }, { status: 500 });
    }

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error('❌ Ошибка от Cloudinary:', errorText);
      return NextResponse.json({ 
        error: 'Ошибка загрузки в Cloudinary',
        details: errorText
      }, { status: 500 });
    }

    const cloudinaryData = await cloudinaryResponse.json();
    
    console.log('✅ Файл успешно загружен в Cloudinary:', cloudinaryData.secure_url);

    return NextResponse.json({
      success: true,
      message: 'Файл успешно загружен',
      url: cloudinaryData.secure_url,
      data: {
        publicId: cloudinaryData.public_id,
        width: cloudinaryData.width,
        height: cloudinaryData.height,
        format: cloudinaryData.format,
        bytes: cloudinaryData.bytes,
        uploadedBy: sessionData.user.name
      }
    });

  } catch (error) {
    console.error('❌ Ошибка загрузки файла:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка загрузки файла',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
