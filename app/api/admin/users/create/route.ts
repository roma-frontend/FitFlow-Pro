// app/api/admin/users/create/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    // Только админы могут создавать пользователей
    if (!['super-admin', 'admin'].includes(payload.role)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, password, role } = body;

    // Проверяем права на создание роли
    if (role === 'admin' && payload.role !== 'super-admin') {
      return NextResponse.json({ error: 'Только супер-админ может создавать админов' }, { status: 403 });
    }

    if (role === 'super-admin') {
      return NextResponse.json({ error: 'Нельзя создать супер-админа' }, { status: 403 });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await convex.query("users:getByEmail", { email });
    if (existingUser) {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем пользователя
    const userId = await convex.mutation("users:create", {
      email,
      password: hashedPassword,
      name,
      role,
      isActive: true,
      createdAt: Date.now(),
      createdBy: payload.userId
    });

    return NextResponse.json({
      success: true,
      userId
    });

  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка создания пользователя' },
      { status: 500 }
    );
  }
}
