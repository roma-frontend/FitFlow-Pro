// app/api/body-analysis/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 API POST /body-analysis/save: Начало сохранения анализа тела");

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

    // Получаем userId из сессии
    const userId = sessionData.user.id;
    console.log("👤 UserID из сессии:", userId);

    const body = await request.json();
    console.log("📦 Получены данные:", {
      bodyType: body.bodyType,
      hasUserId: !!body.userId,
      receivedUserId: body.userId,
      sessionUserId: userId,
      hasRecommendations: !!body.recommendations,
      hasFutureProjections: !!body.futureProjections,
      hasCurrentVisualData: !!body.currentVisualData
    });

    // Расширенная валидация данных
    if (!body.bodyType || !['ectomorph', 'mesomorph', 'endomorph', 'mixed'].includes(body.bodyType)) {
      throw new Error("Некорректный тип телосложения: " + body.bodyType);
    }

    // Подготовка данных для сохранения - используем userId из сессии
    const analysisData = {
      userId: userId, // Используем userId из сессии, а не из body
      bodyType: body.bodyType,
      estimatedBodyFat: Number(body.estimatedBodyFat) || 20,
      estimatedMuscleMass: Number(body.estimatedMuscleMass) || 35,
      posture: body.posture || 'fair',
      fitnessScore: Number(body.fitnessScore) || 50,
      progressPotential: Number(body.progressPotential) || 70,
      problemAreas: Array.isArray(body.problemAreas) ? body.problemAreas : [],
      recommendations: body.recommendations || {
        primaryGoal: 'Общее улучшение формы',
        secondaryGoals: [],
        estimatedTimeToGoal: 12,
        weeklyTrainingHours: 4
      },
      currentVisualData: {
        imageUrl: body.currentVisualData?.imageUrl || '',
        analyzedImageUrl: body.currentVisualData?.analyzedImageUrl || '',
        bodyOutlineData: body.currentVisualData?.bodyOutlineData || null
      },
      futureProjections: body.futureProjections || {
        weeks4: { estimatedWeight: 73, estimatedBodyFat: 18, estimatedMuscleMass: 36, confidenceLevel: 0.85 },
        weeks8: { estimatedWeight: 71, estimatedBodyFat: 16, estimatedMuscleMass: 37, confidenceLevel: 0.75 },
        weeks12: { estimatedWeight: 69, estimatedBodyFat: 14, estimatedMuscleMass: 38, confidenceLevel: 0.65 }
      }
    };

    console.log("📝 Подготовленные данные для Convex:", {
      userId: analysisData.userId,
      bodyType: analysisData.bodyType,
      estimatedBodyFat: analysisData.estimatedBodyFat,
      estimatedMuscleMass: analysisData.estimatedMuscleMass,
      hasAllRequiredFields: true
    });

    console.log("📞 Вызываем Convex mutation для сохранения");
    const convexResult = await convex.mutation("bodyAnalysis:saveBodyAnalysis", analysisData);

    console.log("✅ Анализ тела успешно сохранен в Convex, ID:", convexResult);

    // Возвращаем полные данные обратно
    const fullResult = {
      _id: convexResult,
      _creationTime: Date.now(),
      userId: analysisData.userId,
      bodyType: analysisData.bodyType,
      estimatedBodyFat: analysisData.estimatedBodyFat,
      estimatedMuscleMass: analysisData.estimatedMuscleMass,
      posture: analysisData.posture,
      fitnessScore: analysisData.fitnessScore,
      progressPotential: analysisData.progressPotential,
      problemAreas: analysisData.problemAreas,
      recommendations: analysisData.recommendations,
      currentVisualData: analysisData.currentVisualData,
      futureProjections: analysisData.futureProjections,
      date: new Date(),
      bodyMetrics: body.bodyMetrics || {
        shoulderWidth: 45,
        waistWidth: 38, 
        hipWidth: 42,
        bodyRatio: 0.7
      }
    };

    console.log("📤 Возвращаем полные данные клиенту");

    return NextResponse.json({
      success: true,
      data: fullResult,
      message: 'Анализ тела успешно сохранен'
    }, { status: 201 });
    
  } catch (error) {
    console.error("❌ Ошибка сохранения:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка сохранения',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}