// app/api/admin/members/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const members = await convex.query("members:getAll");
    
    return NextResponse.json({
      success: true,
      members
    });

  } catch (error) {
    console.error('Ошибка получения участников:', error);
    return NextResponse.json(
      { error: 'Ошибка получения участников' },
      { status: 500 }
    );
  }
}
