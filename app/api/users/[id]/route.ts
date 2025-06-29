// app/api/users/[id]/route.ts
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
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("❌ Ошибка получения пользователя:", error);
    return NextResponse.json(
      { error: "Ошибка получения пользователя: " + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
