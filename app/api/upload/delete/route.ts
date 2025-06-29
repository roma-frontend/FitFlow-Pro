// app/api/upload/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';

// Функция для извлечения public_id из Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Примеры URL:
    // https://res.cloudinary.com/dgbtipi5o/image/upload/v1234567890/user-avatars/filename.jpg
    // https://res.cloudinary.com/dgbtipi5o/image/upload/user-avatars/filename.jpg
    
    const cloudinaryPattern = /cloudinary\.com\/[^\/]+\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(cloudinaryPattern);
    
    if (match && match[1]) {
      return match[1];
    }
    
    // Альтернативный способ - разбор URL
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
      let publicIdParts = urlParts.slice(uploadIndex + 1);
      
      // Убираем версию если есть (v1234567890)
      if (publicIdParts[0]?.startsWith('v') && /^v\d+$/.test(publicIdParts[0])) {
        publicIdParts = publicIdParts.slice(1);
      }
      
      // Убираем расширение файла
      const lastPart = publicIdParts[publicIdParts.length - 1];
      if (lastPart?.includes('.')) {
        publicIdParts[publicIdParts.length - 1] = lastPart.split('.')[0];
      }
      
      return publicIdParts.join('/');
    }
    
    return null;
  } catch (error) {
    console.error('❌ Ошибка извлечения public_id:', error);
    return null;
  }
}

// Функция для удаления файла из Cloudinary
async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgbtipi5o';
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      console.error('❌ Cloudinary API ключи не настроены');
      return false;
    }
    
    // Создаем подпись для запроса
    const timestamp = Math.round(Date.now() / 1000);
    const crypto = require('crypto');
    
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);
    
    const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
    
    console.log('🗑️ Удаляем из Cloudinary:', { publicId, timestamp });
    
    const response = await fetch(deleteUrl, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log('📡 Ответ Cloudinary на удаление:', result);
    
    return result.result === 'ok';
  } catch (error) {
    console.error('❌ Ошибка удаления из Cloudinary:', error);
    return false;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE /api/upload/delete - начало удаления файла');

    // Проверяем авторизацию
    const sessionToken = request.cookies.get('session_id')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = await getSession(sessionToken);
    if (!sessionData) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    // Проверяем права
    if (!['super-admin', 'admin', 'manager'].includes(sessionData.user.role)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    // Получаем URL файла
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    
    if (!fileUrl) {
      return NextResponse.json({ error: 'URL файла не указан' }, { status: 400 });
    }

    console.log('📄 URL файла для удаления:', fileUrl);

    // Проверяем, что это Cloudinary URL
    if (!fileUrl.includes('cloudinary.com')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Файл не из Cloudinary, удаление не требуется' 
      });
    }

    // Извлекаем public_id
    const publicId = extractPublicIdFromUrl(fileUrl);
    if (!publicId) {
      return NextResponse.json({ 
        error: 'Не удалось извлечь public_id из URL',
        details: { url: fileUrl }
      }, { status: 400 });
    }

    console.log('🔍 Извлеченный public_id:', publicId);

    // Удаляем из Cloudinary
    const deleted = await deleteFromCloudinary(publicId);
    
    if (deleted) {
      console.log('✅ Файл успешно удален из Cloudinary');
      return NextResponse.json({
        success: true,
        message: 'Файл успешно удален из Cloudinary',
        data: {
          url: fileUrl,
          publicId: publicId,
          deletedAt: new Date().toISOString(),
          deletedBy: sessionData.user.name
        }
      });
    } else {
      console.log('⚠️ Не удалось удалить файл из Cloudinary');
      return NextResponse.json({
        success: false,
        error: 'Не удалось удалить файл из Cloudinary',
        details: { publicId, url: fileUrl }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Общая ошибка удаления файла:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка удаления файла',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}