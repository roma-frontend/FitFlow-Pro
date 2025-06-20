// app/api/auth/member-register/route.ts (обновленная версия с отладкой)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  console.log('📝 Начало регистрации участника');
  
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    console.log('📧 Email:', email);
    console.log('👤 Имя:', name);
    console.log('🔑 Пароль длина:', password?.length || 0);

    // Валидация
    if (!email || !password || !name) {
      console.log('❌ Отсутствуют обязательные поля');
      return NextResponse.json(
        { error: 'Имя, email и пароль обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log('❌ Пароль слишком короткий');
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Проверяем подключение к Convex
    console.log('🔌 Проверяем подключение к Convex...');
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL не установлен');
    }

    // Проверяем, существует ли пользователь
    console.log('🔍 Проверяем существующего пользователя...');
    let existingUser;
    try {
      existingUser = await convex.query("users:getByEmail", { email });
      console.log('👤 Результат поиска:', existingUser ? 'найден' : 'не найден');
    } catch (error) {
      console.error('❌ Ошибка поиска пользователя:', error);
      throw new Error(`Ошибка поиска пользователя: ${error}`);
    }

    if (existingUser) {
      console.log('❌ Пользователь уже существует');
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
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

    // Создаем пользователя
    console.log('👤 Создаем пользователя...');
    let userId;
    try {
      // Попробуем разные варианты создания
      const userData = {
        email,
        password: hashedPassword,
        name,
        role: 'member',
        isActive: true,
        createdAt: Date.now()
      };
      
      console.log('📦 Данные для создания:', {
        ...userData,
        password: hashedPassword.substring(0, 20) + '...'
      });

      // Сначала попробуем users:create
      try {
        userId = await convex.mutation("users:create", userData);
        console.log('✅ Пользователь создан через users:create с ID:', userId);
      } catch (createError) {
        console.log('❌ Ошибка users:create:', createError);
        
        // Попробуем userManagement:create
        try {
          userId = await convex.mutation("userManagement:create", userData);
          console.log('✅ Пользователь создан через userManagement:create с ID:', userId);
        } catch (managementError) {
          console.log('❌ Ошибка userManagement:create:', managementError);
          throw new Error(`Не удалось создать пользователя: ${createError}`);
        }
      }
    } catch (error) {
      console.error('❌ Ошибка создания пользователя:', error);
      throw new Error(`Ошибка создания пользователя: ${error}`);
    }

    console.log('🎉 Участник успешно зарегистрирован!');
    return NextResponse.json({
      success: true,
      message: 'Участник зарегистрирован успешно',
      userId
    });

  } catch (error) {
    console.error('💥 Общая ошибка регистрации:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка регистрации',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
