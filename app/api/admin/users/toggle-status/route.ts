// app/api/admin/users/toggle-status/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { verifyToken } from '@/lib/auth';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!['super-admin', 'admin'].includes(payload.role)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, isActive } = body;

    // Получаем информацию о пользователе
    const user = await convex.query("users:getById", { id: userId });
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Нельзя деактивировать супер-админа
    if (user.role === 'super-admin') {
      return NextResponse.json({ error: 'Нельзя деактивировать супер-админа' }, { status: 403 });
    }

    // Нельзя деактивировать самого себя
    if (userId === payload.userId) {
      return NextResponse.json({ error: 'Нельзя деактивировать самого себя' }, { status: 403 });
    }

    // Обновляем статус
    await convex.mutation("users:toggleStatus", {
      userId,
      isActive
    });

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Ошибка изменения статуса:', error);
    return NextResponse.json(
      { error: 'Ошибка изменения статуса' },
      { status: 500 }
    );
  }
}
