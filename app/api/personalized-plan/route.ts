// app/api/personalized-plan/route.ts
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

    console.log('💾 Сохраняем план в Convex:', {
      userId,
      analysisId: body.analysisId,
      hasTrainer: !!body.recommendedTrainer,
      hasProgram: !!body.trainingProgram,
      exercisesCount: body.trainingProgram?.exercises?.length || 0
    });

    try {
      // Проверяем и извлекаем exercises из trainingProgram
      const exercises = body.trainingProgram?.exercises || [];
      
      // Очищаем trainingProgram от exercises для соответствия валидатору
      const cleanTrainingProgram = {
        duration: body.trainingProgram.duration,
        focusAreas: body.trainingProgram.focusAreas,
        id: body.trainingProgram.id,
        name: body.trainingProgram.name,
        sessionsPerWeek: body.trainingProgram.sessionsPerWeek
      };

      // Подготавливаем данные для Convex
      const planData = {
        userId,
        analysisId: body.analysisId,
        recommendedTrainer: body.recommendedTrainer,
        trainingProgram: cleanTrainingProgram,
        exercises: exercises, // Передаем exercises отдельным полем
        nutritionPlan: body.nutritionPlan,
        recommendedProducts: body.recommendedProducts,
        membershipRecommendation: body.membershipRecommendation,
        projectedResults: body.projectedResults
      };

      console.log('📦 Подготовленные данные для Convex:', {
        ...planData,
        exercisesCount: exercises.length,
        firstExercise: exercises[0] // Для отладки
      });

      // Используем ConvexHttpClient для вызова mutation
      const result = await convex.mutation("bodyAnalysis:savePersonalizedPlan", planData);

      console.log('✅ План успешно сохранен:', result);

      // Возвращаем полные данные плана (включая exercises обратно в trainingProgram)
      const fullPlanData = {
        _id: result.planId,
        analysisId: body.analysisId,
        userId,
        recommendedTrainer: body.recommendedTrainer,
        trainingProgram: {
          ...cleanTrainingProgram,
          exercises: exercises // Возвращаем exercises для фронтенда
        },
        nutritionPlan: body.nutritionPlan,
        recommendedProducts: body.recommendedProducts,
        membershipRecommendation: body.membershipRecommendation,
        projectedResults: body.projectedResults,
        _creationTime: Date.now()
      };

      return NextResponse.json({
        success: true,
        data: fullPlanData
      });

    } catch (convexError) {
      console.error('❌ Ошибка Convex при сохранении плана:', convexError);
      
      // Более детальная обработка ошибок валидации
      if (convexError instanceof Error && convexError.message.includes('ArgumentValidationError')) {
        console.error('🔍 Детали ошибки валидации:', {
          error: convexError.message,
          trainingProgram: body.trainingProgram,
          exercisesCount: body.trainingProgram?.exercises?.length,
          firstExercise: body.trainingProgram?.exercises?.[0]
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Ошибка сохранения в базу данных',
        details: convexError instanceof Error ? convexError.message : 'Unknown error'
      }, { status: 500 });
    }

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

    try {
      // Используем ConvexHttpClient для вызова query
      const plan = await convex.query("bodyAnalysis:getPersonalizedPlan", {
        userId,
        analysisId: analysisId as any
      });

      return NextResponse.json({
        success: true,
        data: plan
      });

    } catch (convexError) {
      console.error('❌ Ошибка Convex при получении плана:', convexError);
      return NextResponse.json({
        success: false,
        error: 'План не найден',
        details: convexError instanceof Error ? convexError.message : 'Unknown error'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ Ошибка получения плана:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения данных',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}