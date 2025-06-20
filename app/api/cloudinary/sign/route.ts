// app/api/cloudinary/sign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getSession } from '@/lib/simple-auth';

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    const { folder, transformation } = await request.json();

    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const params = {
      timestamp,
      folder: folder || 'user-avatars',
      transformation: transformation || 'c_fill,g_face,h_400,w_400,q_auto,f_auto'
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: params.folder,
      transformation: params.transformation
    });

  } catch (error) {
    console.error('Ошибка создания подписи:', error);
    return NextResponse.json({ error: 'Ошибка создания подписи' }, { status: 500 });
  }
}
