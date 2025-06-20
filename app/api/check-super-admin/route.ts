// app/api/check-super-admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Проверяем существование супер-админа...');
    
    // Проверяем подключение к Convex
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL не установлен');
    }

    // Ищем супер-админа
    const superAdmin = await convex.query("users:getSuperAdmin");
    
    const exists = !!superAdmin;
    console.log(`${exists ? '✅' : '❌'} Супер-админ ${exists ? 'найден' : 'не найден'}`);
    
    return NextResponse.json({
      success: true,
      exists,
      superAdmin: exists ? {
        id: superAdmin._id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role
      } : null
    });

  } catch (error) {
    console.error('❌ Ошибка проверки супер-админа:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка проверки супер-админа',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
