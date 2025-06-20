// app/api/create-super-admin/route.ts (улучшенная версия с отладкой)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  console.log('🚀 Начало создания супер-админа');
  
  try {
    const email = "romangulanyan@gmail.com";
    const password = "Hovik-970";
    const name = "Роман Гуланян";

    console.log('📧 Email:', email);
    console.log('🔑 Пароль длина:', password.length);
    console.log('👤 Имя:', name);

    // Проверяем подключение к Convex
    console.log('🔌 Проверяем подключение к Convex...');
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL не установлен');
    }
    console.log('✅ Convex URL:', process.env.NEXT_PUBLIC_CONVEX_URL);

    // Проверяем, существует ли уже супер-админ
    console.log('🔍 Проверяем существующего пользователя...');
    let existingAdmin;
    try {
      existingAdmin = await convex.query("users:getByEmail", { email });
      console.log('👤 Существующий пользователь:', existingAdmin ? 'найден' : 'не найден');
    } catch (error) {
      console.error('❌ Ошибка поиска пользователя:', error);
      throw new Error(`Ошибка поиска пользователя: ${error}`);
    }

    if (existingAdmin) {
      console.log('ℹ️ Супер-админ уже существует');
      return NextResponse.json({
        success: true,
        message: 'Супер-админ уже существует',
        exists: true,
        user: {
          id: existingAdmin._id,
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      });
    }

    // Хешируем пароль
    console.log('🔐 Хешируем пароль...');
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
      console.log('✅ Пароль захеширован, длина хеша:', hashedPassword.length);
    } catch (error) {
      console.error('❌ Ошибка хеширования пароля:', error);
      throw new Error(`Ошибка хеширования пароля: ${error}`);
    }

    // Создаем супер-админа
    console.log('👑 Создаем супер-админа...');
    let userId;
    try {
      userId = await convex.mutation("users:create", {
        email,
        password: hashedPassword,
        name,
        role: 'super-admin',
        isActive: true,
        createdAt: Date.now()
      });
      console.log('✅ Супер-админ создан с ID:', userId);
    } catch (error) {
      console.error('❌ Ошибка создания пользователя:', error);
      throw new Error(`Ошибка создания пользователя: ${error}`);
    }

    console.log('🎉 Супер-админ успешно создан!');
    return NextResponse.json({
      success: true,
      message: 'Супер-админ создан успешно',
      userId,
      exists: false
    });

  } catch (error) {
    console.error('💥 Общая ошибка создания супер-админа:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка создания супер-админа',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
