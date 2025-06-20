// app/api/admin/users/bulk/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { verifyToken } from '@/lib/auth';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!['super-admin', 'admin'].includes(payload.role)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const { action, userIds, updates } = await request.json();

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ 
        error: 'Действие и список пользователей обязательны' 
      }, { status: 400 });
    }

    let results: Array<{
      userId: string;
      success: boolean;
      error?: string;
    }> = [];

    switch (action) {
      case 'activate':
        results = await convex.mutation("users:bulkUpdateUsers", {
          userIds,
          updates: { isActive: true }
        });
        break;

      case 'deactivate':
        // Проверяем, что пользователь не пытается деактивировать сам себя
        if (userIds.includes(payload.userId)) {
          return NextResponse.json({ 
            error: 'Нельзя деактивировать самого себя' 
          }, { status: 403 });
        }
        
        results = await convex.mutation("users:bulkUpdateUsers", {
          userIds,
          updates: { isActive: false }
        });
        break;

      case 'delete':
        // Проверяем каждого пользователя перед удалением
        const deleteResults: Array<{
          userId: string;
          success: boolean;
          error?: string;
        }> = [];

        for (const userId of userIds) {
          try {
            const user = await convex.query("users:getSafeUserById", { userId });
            
            if (!user) {
              deleteResults.push({ 
                userId, 
                success: false, 
                error: 'Пользователь не найден' 
              });
              continue;
            }

            if (user.role === 'super-admin') {
              deleteResults.push({ 
                userId, 
                success: false, 
                error: 'Нельзя удалить супер-админа' 
              });
              continue;
            }

            if (userId === payload.userId) {
              deleteResults.push({ 
                userId, 
                success: false, 
                error: 'Нельзя удалить самого себя' 
              });
              continue;
            }

            await convex.mutation("users:deleteUser", { id: userId });
            deleteResults.push({ userId, success: true });
          } catch (error) {
            deleteResults.push({ 
              userId, 
              success: false, 
              error: error instanceof Error ? error.message : 'Ошибка удаления' 
            });
          }
        }
        
        results = deleteResults;
        break;

      case 'updateRole':
        if (!updates?.role) {
          return NextResponse.json({ 
            error: 'Роль обязательна для массового обновления' 
          }, { status: 400 });
        }

        if (updates.role === 'admin' && payload.role !== 'super-admin') {
          return NextResponse.json({ 
            error: 'Только супер-админ может назначать роль админа' 
          }, { status: 403 });
        }

        if (updates.role === 'super-admin') {
          return NextResponse.json({ 
            error: 'Нельзя назначить роль супер-админа' 
          }, { status: 403 });
        }

        results = await convex.mutation("users:bulkUpdateUsers", {
          userIds,
          updates: { role: updates.role }
        });
        break;

      default:
        return NextResponse.json({ 
          error: 'Неизвестное действие' 
        }, { status: 400 });
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Операция выполнена: ${successCount} успешно, ${errorCount} с ошибками`,
      results,
      stats: { successCount, errorCount, total: results.length }
    });

  } catch (error) {
    console.error('Ошибка массовой операции:', error);
    return NextResponse.json({ 
      error: 'Ошибка выполнения массовой операции' 
    }, { status: 500 });
  }
}
