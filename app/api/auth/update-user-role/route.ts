// app/api/auth/update-user-role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, newRole } = body;

    console.log("🔄 Обновление роли пользователя:", userId, "->", newRole);

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'userId и newRole обязательны' },
        { status: 400 }
      );
    }

    // Получаем всех пользователей
    const users = await convex.query("users:getAll");
    const user = users.find((u: any) => u._id === userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    console.log("✅ Пользователь найден:", user.name, "текущая роль:", user.role);

    // Обновляем роль пользователя
    const updatedUserId = await convex.mutation("users:updateRole", {
      userId: userId,
      role: newRole
    });

    console.log("✅ Роль обновлена для пользователя:", updatedUserId);

    return NextResponse.json({
      success: true,
      message: 'Роль пользователя успешно обновлена',
      userId: updatedUserId,
      oldRole: user.role,
      newRole: newRole
    });

  } catch (error) {
    console.error('❌ Ошибка обновления роли:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления роли: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
