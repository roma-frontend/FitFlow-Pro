// app/api/face-descriptors/route.ts
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

// Инициализируем клиент Convex
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    const users = await client.query("users:getAll");
    
    const descriptors = users
      .filter((user: any) => user.faceDescriptor && user.faceDescriptor.length > 0)
      .map((user: any) => ({
        id: user._id,
        name: user.name,
        descriptor: user.faceDescriptor
      }));
    
    console.log(`📊 Найдено ${descriptors.length} дескрипторов лиц`);
    
    return NextResponse.json({ descriptors });
  } catch (error) {
    console.error("❌ Ошибка получения дескрипторов:", error);
    return NextResponse.json(
      { error: "Ошибка получения дескрипторов: " + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
