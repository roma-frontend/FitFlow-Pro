// app/api/classes/cancel/route.ts (новый файл)
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

    let enrolled = [...classItem.enrolled];
    let waitlist = classItem.waitlist ? [...classItem.waitlist] : [];
    let wasEnrolled = false;
    let wasOnWaitlist = false;

    // Убираем из записанных
    if (enrolled.includes(payload.userId)) {
      enrolled = enrolled.filter(id => id !== payload.userId);
      wasEnrolled = true;

      // Если есть лист ожидания, переводим первого в очереди
      if (waitlist.length > 0) {
        const nextUserId = waitlist.shift()!;
        enrolled.push(nextUserId);

        // Уведомляем пользователя из листа ожидания
        await convex.mutation("notifications:create", {
          recipientId: nextUserId,
          recipientType: "member",
          title: "Место освободилось!",
          message: `Для вас освободилось место на занятии "${classItem.name}"`,
          type: "class",
          relatedId: classId,
        });
      }
    }

    // Убираем из листа ожидания
    if (waitlist.includes(payload.userId)) {
      waitlist = waitlist.filter(id => id !== payload.userId);
      wasOnWaitlist = true;
    }

    if (!wasEnrolled && !wasOnWaitlist) {
      return NextResponse.json(
        { error: 'Вы не записаны на это занятие' },
        { status: 400 }
      );
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
      title: "Запись отменена",
      message: `Вы отменили запись на занятие "${classItem.name}"`,
      type: "class",
      relatedId: classId,
    });

    return NextResponse.json({
      success: true,
      enrolled,
      waitlist
    });

  } catch (error) {
    console.error('Ошибка отмены записи:', error);
    return NextResponse.json(
      { error: 'Ошибка отмены записи' },
      { status: 500 }
    );
  }
}
