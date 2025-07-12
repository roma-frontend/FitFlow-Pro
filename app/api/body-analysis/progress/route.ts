// app/api/body-analysis/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_id')?.value;
    if (!sessionToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Не авторизован' 
      }, { status: 401 });
    }

    const sessionData = await getSession(sessionToken);
    if (!sessionData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Сессия недействительна' 
      }, { status: 401 });
    }

    const userId = sessionData.user.id;
    const body = await request.json();

    console.log('📸 Обновление прогресса для пользователя:', userId);

    // Вызываем Convex mutation для обновления прогресса
    const result = await convex.mutation("bodyAnalysis:updateProgress", {
      userId,
      photoUrl: body.photoUrl,
      originalAnalysisId: body.originalAnalysisId,
      newAnalysisData: body.newAnalysisData,
      weight: body.weight
    });

    console.log('✅ Прогресс обновлен:', result);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Прогресс успешно обновлен'
    });

  } catch (error) {
    console.error('❌ Ошибка обновления прогресса:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка обновления прогресса',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}