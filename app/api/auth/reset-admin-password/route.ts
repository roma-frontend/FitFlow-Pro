// app/api/auth/reset-admin-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    console.log("🔄 Сброс пароля для:", email);

    // Находим пользователя
    const users = await convex.query("users:getAll");
    const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({
        error: "Пользователь не найден"
      }, { status: 404 });
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log("🔑 Новый пароль захеширован");

    // Удаляем старого пользователя
    try {
      await convex.mutation("users:deleteUser", { id: user._id });
      console.log("🗑️ Старый пользователь удален");
    } catch (deleteError) {
      console.log("⚠️ Не удалось удалить старого пользователя:", deleteError);
    }

    // Создаем нового с новым паролем
    const userId = await convex.mutation("users:create", {
      name: user.name,
      email: user.email,
      password: hashedPassword,
      role: "admin",
      photoUrl: user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dc2626&color=fff`,
      faceDescriptor: user.faceDescriptor || [],
    });

    console.log("✅ Пользователь пересоздан с новым паролем");

    // Тестируем новый пароль
    const testResult = await bcrypt.compare(newPassword, hashedPassword);
    console.log("🧪 Тест нового пароля:", testResult);

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно сброшен',
      userId,
      passwordTest: testResult,
      user: {
        name: user.name,
        email: user.email,
        role: "admin"
      },
      debug: {
        hashedPasswordLength: hashedPassword.length,
        hashedPasswordStart: hashedPassword.substring(0, 20) + "..."
      }
    });

  } catch (error) {
    console.error('❌ Ошибка сброса пароля:', error);
    return NextResponse.json(
      { error: 'Ошибка: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
