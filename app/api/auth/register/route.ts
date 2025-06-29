// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail, sendWelcomeEmail } from '@/lib/email';
import { z } from 'zod'; // Добавляем валидацию схемы

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Схема валидации
const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(50),
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов')
});

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Начало процесса регистрации");
    
    // Rate limiting (простая реализация)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `register_${ip}`;
    
    // Проверяем блокировку IP
    const blockedIp = await convex.query("security:checkBlockedIp", { ipAddress: ip });
    if (blockedIp?.isActive) {
      return NextResponse.json(
        { error: 'IP адрес заблокирован' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Валидация с помощью Zod
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Ошибка валидации',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // Проверяем существующих пользователей
    const existingUser = await convex.query("users:getByEmail", { email: email.toLowerCase() });
    if (existingUser) {
      // Логируем попытку регистрации с существующим email
      await convex.mutation("auditLogs:create", {
        userId: "anonymous",
        userName: "Anonymous",
        userRole: "guest",
        action: "registration_attempt_duplicate",
        resource: "user",
        details: { email, ip },
        ipAddress: ip,
        timestamp: Date.now()
      });
      
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12); // Увеличиваем rounds для безопасности

    // Создаем пользователя в транзакции
    const userId = await convex.mutation("users:createWithAudit", {
      userData: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=0ea5e9&color=fff`,
        faceDescriptor: [],
        role: 'member',
        createdAt: Date.now(),
        isActive: true
      },
      auditData: {
        action: "user_created",
        ipAddress: ip,
        userAgent: request.headers.get('user-agent')
      }
    });

    // Отправляем приветственное письмо (опционально)
    try {
      await sendWelcomeEmail({
        to: email,
        name: name.trim(),
        userType: 'member'
      });
    } catch (emailError) {
      console.error('Ошибка отправки приветственного письма:', emailError);
      // Не прерываем регистрацию из-за ошибки email
    }

    console.log("🎉 Регистрация успешна:", { userId, name: name.trim(), email });

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      userId,
      user: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'member'
      }
    });

  } catch (error) {
    console.error('💥 Критическая ошибка регистрации:', error);
    
    // Логируем системную ошибку
    try {
      await convex.mutation("auditLogs:create", {
        userId: "system",
        userName: "System",
        userRole: "system",
        action: "registration_system_error",
        resource: "user",
        details: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        },
        timestamp: Date.now()
      });
    } catch (logError) {
      console.error('Ошибка логирования:', logError);
    }
    
    return NextResponse.json(
      { 
        error: 'Ошибка сервера при регистрации',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}
