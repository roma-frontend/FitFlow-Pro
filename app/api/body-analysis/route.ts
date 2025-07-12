// app/api/body-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Получаем JWT токен из cookies
    const sessionToken = request.cookies.get('session_id')?.value;
    if (!sessionToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Не авторизован' 
      }, { status: 401 });
    }

    // Проверяем сессию
    const sessionData = await getSession(sessionToken);
    if (!sessionData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Сессия недействительна' 
      }, { status: 401 });
    }

    const userId = sessionData.user.id;
    const body = await request.json();

    console.log('📊 Сохраняем анализ тела для пользователя:', userId);

    // Сохраняем в Convex
    try {
      const result = await convex.mutation("bodyAnalysis:saveBodyAnalysis", {
        userId,
        ...body
      });

      console.log('✅ Анализ сохранен в Convex:', result);

      // Возвращаем в формате, совместимом с вашим useBodyAnalysis
      return NextResponse.json({
        success: true,
        data: {
          _id: result,
          userId,
          ...body,
          _creationTime: Date.now()
        }
      });

    } catch (convexError) {
      console.error('❌ Ошибка Convex:', convexError);
      return NextResponse.json({
        success: false,
        error: 'Ошибка сохранения в базу данных',
        details: convexError instanceof Error ? convexError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error);
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
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

    // Получаем данные из Convex
    const analysis = await convex.query("bodyAnalysis:getCurrentAnalysis", { userId });

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('❌ Ошибка получения анализа:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения данных',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}