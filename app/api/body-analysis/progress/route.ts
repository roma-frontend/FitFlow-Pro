// app/api/body-analysis/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 API GET: Начало обработки запроса прогресса анализа тела");
    
    // Получаем параметры из query
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = searchParams.get('limit');
    
    if (!userId) {
      throw new Error("Отсутствует обязательный параметр: userId");
    }
    
    console.log("📞 API GET: Получаем прогресс анализа тела для пользователя:", userId);
    
    const progress = await convex.query("bodyAnalysis:getProgress", {
      userId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: limit ? parseInt(limit) : undefined
    });
    
    console.log("✅ API GET: Получено записей прогресса:", progress?.length || 0);
    
    return NextResponse.json({ 
      success: true, 
      data: progress || [],
      count: progress?.length || 0
    });
  } catch (error) {
    console.error("❌ API GET: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения прогресса анализа тела',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 API POST: Начало обновления прогресса анализа тела");
    
    const body = await request.json();
    console.log("📦 API POST: Получены данные:", body);
    
    // Валидация данных
    if (!body.userId) {
      throw new Error("Отсутствует обязательное поле: userId");
    }
    
    console.log("📞 API POST: Вызываем Convex mutation");
    
    const result = await convex.mutation("bodyAnalysis:updateProgress", {
      userId: body.userId,
      weight: body.weight,
      bodyFat: body.bodyFat,
      muscleMass: body.muscleMass,
      measurements: body.measurements,
      photos: body.photos,
      notes: body.notes,
      date: body.date || new Date().toISOString()
    });

    console.log("✅ API POST: Прогресс анализа тела обновлен:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Прогресс анализа тела успешно обновлен'
    });
  } catch (error) {
    console.error("❌ API POST: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления прогресса анализа тела'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🔄 API PUT: Начало редактирования записи прогресса");
    
    const body = await request.json();
    console.log("📦 API PUT: Получены данные:", body);
    
    // Валидация данных
    if (!body.userId || !body.progressId) {
      throw new Error("Отсутствуют обязательные поля: userId, progressId");
    }
    
    console.log("📞 API PUT: Вызываем Convex mutation");
    
    const result = await convex.mutation("bodyAnalysis:editProgress", {
      userId: body.userId,
      progressId: body.progressId,
      weight: body.weight,
      bodyFat: body.bodyFat,
      muscleMass: body.muscleMass,
      measurements: body.measurements,
      photos: body.photos,
      notes: body.notes
    });

    console.log("✅ API PUT: Запись прогресса отредактирована:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Запись прогресса успешно отредактирована'
    });
  } catch (error) {
    console.error("❌ API PUT: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка редактирования записи прогресса'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("🔄 API DELETE: Начало удаления записи прогресса");
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const progressId = searchParams.get('progressId');
    
    // Валидация данных
    if (!userId || !progressId) {
      throw new Error("Отсутствуют обязательные параметры: userId, progressId");
    }
    
    console.log("📞 API DELETE: Вызываем Convex mutation");
    
    const result = await convex.mutation("bodyAnalysis:deleteProgress", {
      userId,
      progressId
    });

    console.log("✅ API DELETE: Запись прогресса удалена:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Запись прогресса успешно удалена'
    });
  } catch (error) {
    console.error("❌ API DELETE: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка удаления записи прогресса'
      },
      { status: 500 }
    );
  }
}