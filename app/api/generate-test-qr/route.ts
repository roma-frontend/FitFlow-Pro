// app/api/generate-test-qr/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    // Получаем всех пользователей
    const users: User[] = await convex.query("users:getAll");
    
    const qrCodes = users.map((user: User) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      qrData: `fitaccess:${user._id}`,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`fitaccess:${user._id}`)}`
    }));

    return NextResponse.json({
      success: true,
      qrCodes
    });

  } catch (error) {
    console.error('Ошибка генерации QR-кодов:', error);
    return NextResponse.json(
      { error: 'Ошибка генерации тестовых QR-кодов' },
      { status: 500 }
    );
  }
}
