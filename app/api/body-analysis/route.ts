// app/api/body-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 API GET: Начало обработки запроса анализа тела");
    
    // Получаем параметры из query
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'current';
    
    if (!userId) {
      throw new Error("Отсутствует обязательный параметр: userId");
    }
    
    console.log("📞 API GET: Получаем данные анализа тела для пользователя:", userId, "тип:", type);
    
    let data;
    
    switch (type) {
      case 'current':
        console.log("📞 API GET: Получаем текущий анализ тела");
        data = await convex.query("bodyAnalysis:getCurrentAnalysis", { userId });
        break;
        
      case 'progress':
        console.log("📞 API GET: Получаем контрольные точки прогресса");
        data = await convex.query("bodyAnalysis:getProgressCheckpoints", { userId });
        break;
        
      case 'leaderboard':
        console.log("📞 API GET: Получаем рейтинг трансформаций");
        data = await convex.query("bodyAnalysis:getTransformationLeaderboard");
        break;
        
      case 'history':
        console.log("📞 API GET: Получаем историю анализов");
        const limit = searchParams.get('limit');
        data = await convex.query("bodyAnalysis:getAnalysisHistory", { 
          userId,
          limit: limit ? parseInt(limit) : undefined
        });
        break;
        
      default:
        throw new Error(`Неверный тип запроса: ${type}`);
    }
    
    console.log("✅ API GET: Получены данные анализа тела:", data ? 'да' : 'нет');
    
    return NextResponse.json({ 
      success: true, 
      data: data || null,
      type,
      count: Array.isArray(data) ? data.length : (data ? 1 : 0)
    });
  } catch (error) {
    console.error("❌ API GET: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения данных анализа тела',
        data: null
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 API POST: Начало сохранения анализа тела");
    
    const body = await request.json();
    console.log("📦 API POST: Получены данные:", body);
    
    // Валидация данных
    if (!body.userId) {
      throw new Error("Отсутствует обязательное поле: userId");
    }
    
    console.log("📞 API POST: Вызываем Convex mutation");
    
    const result = await convex.mutation("bodyAnalysis:saveBodyAnalysis", {
      userId: body.userId,
      weight: body.weight,
      height: body.height,
      bodyFat: body.bodyFat,
      muscleMass: body.muscleMass,
      visceralFat: body.visceralFat,
      boneMass: body.boneMass,
      waterPercentage: body.waterPercentage,
      metabolism: body.metabolism,
      measurements: body.measurements,
      photos: body.photos,
      goals: body.goals,
      notes: body.notes
    });

    console.log("✅ API POST: Анализ тела сохранен:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Анализ тела успешно сохранен'
    }, { status: 201 });
  } catch (error) {
    console.error("❌ API POST: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка сохранения анализа тела'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🔄 API PUT: Начало обновления анализа тела");
    
    const body = await request.json();
    console.log("📦 API PUT: Получены данные:", body);
    
    // Валидация данных
    if (!body.userId || !body.analysisId) {
      throw new Error("Отсутствуют обязательные поля: userId, analysisId");
    }
    
    console.log("📞 API PUT: Вызываем Convex mutation");
    
    const result = await convex.mutation("bodyAnalysis:updateBodyAnalysis", {
      userId: body.userId,
      analysisId: body.analysisId,
      weight: body.weight,
      height: body.height,
      bodyFat: body.bodyFat,
      muscleMass: body.muscleMass,
      visceralFat: body.visceralFat,
      boneMass: body.boneMass,
      waterPercentage: body.waterPercentage,
      metabolism: body.metabolism,
      measurements: body.measurements,
      photos: body.photos,
      goals: body.goals,
      notes: body.notes
    });

    console.log("✅ API PUT: Анализ тела обновлен:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Анализ тела успешно обновлен'
    });
  } catch (error) {
    console.error("❌ API PUT: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления анализа тела'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("🔄 API DELETE: Начало удаления анализа тела");
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const analysisId = searchParams.get('analysisId');
    
    // Валидация данных
    if (!userId || !analysisId) {
      throw new Error("Отсутствуют обязательные параметры: userId, analysisId");
    }
    
    console.log("📞 API DELETE: Вызываем Convex mutation");
    
    const result = await convex.mutation("bodyAnalysis:deleteBodyAnalysis", {
      userId,
      analysisId
    });

    console.log("✅ API DELETE: Анализ тела удален:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Анализ тела успешно удален'
    });
  } catch (error) {
    console.error("❌ API DELETE: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка удаления анализа тела'
      },
      { status: 500 }
    );
  }
}