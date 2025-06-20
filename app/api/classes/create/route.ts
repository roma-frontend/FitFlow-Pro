// app/api/classes/create/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instructorName, ...classData } = body;

    // Находим тренера по имени
    const trainers = await convex.query("trainers:getAll");
    const instructor = trainers.find((t: any) => t.name === instructorName);

    if (!instructor) {
      return NextResponse.json(
        { error: `Тренер ${instructorName} не найден` },
        { status: 404 }
      );
    }

    // Создаем занятие
    const classId = await convex.mutation("classes:create", {
      ...classData,
      instructorId: instructor._id
    });

    return NextResponse.json({
      success: true,
      classId
    });

  } catch (error) {
    console.error('Ошибка создания занятия:', error);
    return NextResponse.json(
      { error: 'Ошибка создания занятия' },
      { status: 500 }
    );
  }
}
