// app/api/init-super-admin/route.ts (новый API для инициализации)
import { NextRequest, NextResponse } from 'next/server';
import { initializeSuperAdmin, hasSuperAdmin, getAllUsers } from '@/lib/users-db';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Инициализация супер-админа...');
    
    // Инициализируем супер-админа
    await initializeSuperAdmin();
    
    // Проверяем результат
    const superAdminExists = await hasSuperAdmin();
    const allUsers = await getAllUsers();
    
    return NextResponse.json({
      success: true,
      message: 'Инициализация завершена',
      superAdminExists,
      totalUsers: allUsers.length,
      users: allUsers.map(user => ({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        isActive: user.isActive
      }))
    });
    
  } catch (error) {
    console.error('❌ Ошибка инициализации супер-админа:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка инициализации'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const superAdminExists = await hasSuperAdmin();
    const allUsers = await getAllUsers();
    
    return NextResponse.json({
      success: true,
      superAdminExists,
      totalUsers: allUsers.length,
      users: allUsers.map(user => ({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        isActive: user.isActive
      }))
    });
    
  } catch (error) {
    console.error('❌ Ошибка получения статуса:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка получения статуса'
    }, { status: 500 });
  }
}
