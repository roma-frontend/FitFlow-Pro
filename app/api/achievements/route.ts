// app/api/achievements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 API GET: Начало обработки запроса достижений");
    
    // Получаем параметры из query
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const statsOnly = searchParams.get('stats') === 'true';
    
    if (statsOnly) {
      // Получаем только статистику достижений
      console.log("📞 API GET: Получаем статистику достижений");
      const stats = await convex.query("achievements:getAchievementStats");
      
      console.log("✅ API GET: Получена статистика достижений");
      
      return NextResponse.json({ 
        success: true, 
        data: stats || {},
        message: 'Статистика достижений получена'
      });
    }
    
    if (!userId) {
      // Если нет userId, возвращаем все доступные достижения
      console.log("📞 API GET: Получаем все доступные достижения");
      const achievements = await convex.query("achievements:getAllAchievements");
      
      console.log("✅ API GET: Получено достижений:", achievements?.length || 0);
      
      return NextResponse.json({ 
        success: true, 
        data: achievements || [],
        count: achievements?.length || 0
      });
    }
    
    // Если есть userId, получаем достижения пользователя
    if (category) {
      console.log("📞 API GET: Получаем достижения пользователя по категории:", userId, category);
      const achievements = await convex.query("achievements:getUserAchievementsByCategory", { 
        userId, 
        category 
      });
      
      console.log("✅ API GET: Получено достижений по категории:", achievements?.length || 0);
      
      return NextResponse.json({ 
        success: true, 
        data: achievements || [],
        count: achievements?.length || 0,
        category
      });
    } else {
      console.log("📞 API GET: Получаем все достижения пользователя:", userId);
      const achievements = await convex.query("achievements:getUserAchievements", { userId });
      
      console.log("✅ API GET: Получено достижений пользователя:", achievements?.length || 0);
      
      return NextResponse.json({ 
        success: true, 
        data: achievements || [],
        count: achievements?.length || 0
      });
    }
  } catch (error) {
    console.error("❌ API GET: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения достижений',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 API POST: Начало создания/обновления достижения");
    
    const body = await request.json();
    console.log("📦 API POST: Получены данные:", body);
    
    // Валидация данных
    if (!body.userId || !body.achievementId) {
      throw new Error("Отсутствуют обязательные поля: userId, achievementId");
    }
    
    console.log("📞 API POST: Вызываем Convex mutation");
    
    const result = await convex.mutation("achievements:unlockAchievement", {
      userId: body.userId,
      achievementId: body.achievementId,
      progress: body.progress || 100,
      metadata: body.metadata || {}
    });

    console.log("✅ API POST: Достижение разблокировано:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Достижение успешно разблокировано'
    });
  } catch (error) {
    console.error("❌ API POST: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка разблокировки достижения'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🔄 API PUT: Начало обновления прогресса достижения");
    
    const body = await request.json();
    console.log("📦 API PUT: Получены данные:", body);
    
    // Валидация данных
    if (!body.userId || !body.achievementId || body.progress === undefined) {
      throw new Error("Отсутствуют обязательные поля: userId, achievementId, progress");
    }
    
    console.log("📞 API PUT: Вызываем Convex mutation");
    
    const result = await convex.mutation("achievements:updateProgress", {
      userId: body.userId,
      achievementId: body.achievementId,
      progress: body.progress,
      metadata: body.metadata || {}
    });

    console.log("✅ API PUT: Прогресс достижения обновлен:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Прогресс достижения успешно обновлен'
    });
  } catch (error) {
    console.error("❌ API PUT: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления прогресса достижения'
      },
      { status: 500 }
    );
  }
}