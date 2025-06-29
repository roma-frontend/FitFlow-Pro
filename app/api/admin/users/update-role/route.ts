// app/api/admin/users/update-role/route.ts (новый файл)
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
    const { userId, role } = body;

    // Получаем информацию о пользователе
    const user = await convex.query("users:getById", { id: userId });
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Проверяем права на изменение роли
    if (user.role === 'super-admin') {
      return NextResponse.json({ error: 'Нельзя изменить роль супер-админа' }, { status: 403 });
    }

    if (role === 'admin' && payload.role !== 'super-admin') {
      return NextResponse.json({ error: 'Только супер-админ может назначать админов' }, { status: 403 });
    }

    if (role === 'super-admin') {
      return NextResponse.json({ error: 'Нельзя назначить роль супер-админа' }, { status: 403 });
    }

    // Обновляем роль
    await convex.mutation("users:updateRole", {
      userId,
      role
    });

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Ошибка обновления роли:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления роли' },
      { status: 500 }
    );
  }
}
