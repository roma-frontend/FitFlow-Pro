// app/api/classes/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let classes;
    if (date) {
      // Получаем занятия на конкретную дату
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      classes = await convex.query("classes:getByDateRange", { 
        start: startOfDay.getTime(),
        end: endOfDay.getTime()
      });
    } else {
      // Получаем все предстоящие занятия
      classes = await convex.query("classes:getUpcoming");
    }

    // Получаем информацию об инструкторах
    const trainers = await convex.query("trainers:getAll");
    
    // Обогащаем данные о занятиях
    const enrichedClasses = classes.map((classItem: any) => {
      const instructor = trainers.find((t: any) => t._id === classItem.instructorId);
      return {
        ...classItem,
        instructorName: instructor?.name || 'Неизвестный инструктор',
        instructorPhoto: instructor?.photoUrl
      };
    });

    return NextResponse.json({
      success: true,
      classes: enrichedClasses
    });

  } catch (error) {
    console.error('Ошибка получения занятий:', error);
    return NextResponse.json(
      { error: 'Ошибка получения занятий' },
      { status: 500 }
    );
  }
}
