// app/api/personalized-plan/route.ts - Персонализированный план

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

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

    // Сохраняем план в Convex
    const result = await fetchMutation(api.bodyAnalysis.savePersonalizedPlan, {
      userId,
      ...body
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Ошибка сохранения плана:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка сохранения плана',
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
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');

    if (!analysisId) {
      return NextResponse.json({
        success: false,
        error: 'analysisId не указан'
      }, { status: 400 });
    }

    // Получаем план из Convex
    const plan = await fetchQuery(api.bodyAnalysis.getPersonalizedPlan, {
      userId,
      analysisId: analysisId as any
    });

    return NextResponse.json({
      success: true,
      data: plan
    });

  } catch (error) {
    console.error('❌ Ошибка получения плана:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения данных',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}