// app/api/admin/users/update-role-by-email/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body;

    // Находим пользователя по email
    const user = await convex.query("users:getByEmail", { email });
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Обновляем роль
    await convex.mutation("users:updateRole", {
      userId: user._id,
      role
    });

    return NextResponse.json({
      success: true,
      message: `Роль пользователя ${email} обновлена на ${role}`
    });

  } catch (error) {
    console.error('Ошибка обновления роли:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления роли' },
      { status: 500 }
    );
  }
}
