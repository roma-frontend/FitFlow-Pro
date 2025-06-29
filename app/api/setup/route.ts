// app/api/setup/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Начинаем настройку администратора...");

    // Проверяем, есть ли уже администраторы в системе
    const users = await convex.query('users:getAll');
    const hasAdmins = users.some((user: any) => user.role === "admin");
    
    if (hasAdmins) {
      console.log("❌ Администратор уже существует");
      return NextResponse.json(
        { error: 'Administrator already exists' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, email, password, photoUrl, faceDescriptor } = body;
    
    console.log("📋 Данные для создания:", { name, email, hasPassword: !!password });
    
    if (!name || !password || !photoUrl || !faceDescriptor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Создаем администратора
    const userId = await convex.mutation('users:createAdmin', {
      name,
      email,
      password,
      photoUrl,
      faceDescriptor,
    });
    
    console.log("✅ Администратор создан с ID:", userId);
    
    // Создаем JWT токен
    const token = await createToken({
      userId,
      name,
      email: email || '',
      role: 'admin',
    });
    
    console.log("🎫 Токен создан");
    
    // Создаем ответ
    const response = NextResponse.json({ 
      success: true,
      user: { userId, name, email, role: 'admin' }
    });
    
    // Устанавливаем cookies через NextResponse
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 часов
      sameSite: 'strict',
    });
    
    response.cookies.set('user_role', 'admin', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8,
      sameSite: 'strict',
    });
    
    console.log("🍪 Cookies установлены");
    
    return response;
    
  } catch (error) {
    console.error('❌ Ошибка настройки:', error);
    return NextResponse.json(
      { error: 'Setup failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
