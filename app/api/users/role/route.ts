// app/api/users/[id]/role/route.ts
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Используем строковый путь вместо api.users.getAll
    const allUsers = await client.query("users:getAll");
    const user = allUsers.find((user: any) => user._id === id);
    
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }
    
    // Возвращаем роль пользователя (по умолчанию "user", если роль не указана)
    return NextResponse.json({ role: user.role || "user" });
  } catch (error) {
    console.error("❌ Ошибка получения роли пользователя:", error);
    return NextResponse.json(
      { error: "Ошибка получения роли пользователя: " + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
