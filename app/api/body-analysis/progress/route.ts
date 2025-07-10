// app/api/progress/route.ts - Прогресс чекпоинты

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

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

    // Валидируем данные перед отправкой
    const progressData = {
      userId,
      weight: body.weight,
      photoUrl: body.photoUrl,
      originalAnalysisId: body.originalAnalysisId,
      newAnalysisData: body.newAnalysisData,
      // Добавьте другие поля по необходимости
    };

    // Сохраняем прогресс в Convex
    const result = await convex.mutation("bodyAnalysis:updateProgress", progressData);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Ошибка обновления прогресса:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка обновления прогресса',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    // Получаем чекпоинты из Convex
    const checkpoints = await convex.query("bodyAnalysis:getProgressCheckpoints", { userId });

    return NextResponse.json({
      success: true,
      data: checkpoints
    });

  } catch (error) {
    console.error('❌ Ошибка получения чекпоинтов:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения данных',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}