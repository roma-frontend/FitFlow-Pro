// app/api/classes/enroll/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { verifyToken } from '@/lib/auth';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    const body = await request.json();
    const { classId } = body;

    // Получаем информацию о занятии
    const classItem = await convex.query("classes:getById", { id: classId });
    if (!classItem) {
      return NextResponse.json(
        { error: 'Занятие не найдено' },
        { status: 404 }
      );
    }

    // Проверяем, не записан ли уже пользователь
    if (classItem.enrolled.includes(payload.userId)) {
      return NextResponse.json(
        { error: 'Вы уже записаны на это занятие' },
        { status: 400 }
      );
    }

    // Проверяем, не в листе ожидания ли пользователь
    if (classItem.waitlist && classItem.waitlist.includes(payload.userId)) {
      return NextResponse.json(
        { error: 'Вы уже в листе ожидания' },
        { status: 400 }
      );
    }

    const enrolled = [...classItem.enrolled];
    const waitlist = classItem.waitlist ? [...classItem.waitlist] : [];
    let waitlisted = false;

    // Проверяем наличие мест
    if (enrolled.length < classItem.capacity) {
      // Есть места - записываем
      enrolled.push(payload.userId);
    } else {
      // Мест нет - добавляем в лист ожидания
      waitlist.push(payload.userId);
      waitlisted = true;
    }

    // Обновляем занятие
    await convex.mutation("classes:updateEnrollment", {
      classId,
      enrolled,
      waitlist
    });

    // Создаем уведомление для участника
    await convex.mutation("notifications:create", {
      recipientId: payload.userId,
      recipientType: "member",
      title: waitlisted ? "Добавлены в лист ожидания" : "Запись на занятие",
      message: waitlisted 
        ? `Вы добавлены в лист ожидания на занятие "${classItem.name}"`
        : `Вы записались на занятие "${classItem.name}"`,
      type: "class",
      relatedId: classId,
    });

    // Создаем уведомление для инструктора (если записался, а не в ожидание)
    if (!waitlisted) {
      await convex.mutation("notifications:create", {
        recipientId: classItem.instructorId,
        recipientType: "trainer",
        title: "Новая запись",
        message: `Новый участник записался на ваше занятие "${classItem.name}"`,
        type: "class",
        relatedId: classId,
      });
    }

    return NextResponse.json({
      success: true,
      enrolled,
      waitlist,
      waitlisted
    });

  } catch (error) {
    console.error('Ошибка записи на занятие:', error);
    return NextResponse.json(
      { error: 'Ошибка записи на занятие' },
      { status: 500 }
    );
  }
}
