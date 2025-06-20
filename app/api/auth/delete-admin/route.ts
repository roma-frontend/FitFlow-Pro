// app/api/auth/delete-admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log("Удаление пользователя с email:", email);

    // Находим всех пользователей
    const users = await convex.query("users:getAll");
    const userToDelete = users.find((user: any) => user.email === email);

    if (userToDelete) {
      try {
        await convex.mutation("users:deleteUser", { id: userToDelete._id });
        console.log("Пользователь удален:", userToDelete._id);
        
        return NextResponse.json({
          success: true,
          message: 'Пользователь удален',
          deletedUser: userToDelete
        });
      } catch (deleteError) {
        console.error("Ошибка удаления:", deleteError);
        return NextResponse.json({
          success: false,
          message: 'Ошибка удаления: ' + deleteError
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

  } catch (error) {
    console.error('Ошибка:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
