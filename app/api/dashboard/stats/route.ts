import { NextRequest, NextResponse } from 'next/server';

// Типы для статистики
interface DashboardStats {
  totalClients: number;
  activeTrainers: number;
  todayEvents: number;
  monthlyRevenue: number;
  weeklyGrowth: number;
  clientRetention: number;
  averageRating: number;
  equipmentUtilization: number;
  totalUsers?: number;
  totalAdmins?: number;
  newClientsThisWeek?: number;
  monthlyEvents?: number;
  inactiveClients?: number;
  usersByRole?: Record<string, number>;
  lastUpdated: string;
  dataSource: string;
  generatedBy: string;
}

// Mock данные для разработки
const getMockStats = (): DashboardStats => {
  const now = new Date();
  
  return {
    totalClients: 156 + Math.floor(Math.random() * 10), // Небольшая вариация
    activeTrainers: 8,
    todayEvents: 24 + Math.floor(Math.random() * 5),
    monthlyRevenue: 485000 + Math.floor(Math.random() * 50000),
    weeklyGrowth: 12.5 + (Math.random() - 0.5) * 5,
    clientRetention: 87.3 + (Math.random() - 0.5) * 10,
    averageRating: 4.7 + (Math.random() - 0.5) * 0.6,
    equipmentUtilization: 73.2 + (Math.random() - 0.5) * 20,
    totalUsers: 164,
    totalAdmins: 3,
    newClientsThisWeek: 8,
    monthlyEvents: 156,
    inactiveClients: 12,
    usersByRole: {
      client: 156,
      trainer: 8,
      admin: 3
    },
    lastUpdated: now.toISOString(),
    dataSource: 'next-api',
    generatedBy: 'dashboard-stats-api'
  };
};

// GET - Получение статистики
export async function GET(request: NextRequest) {
  try {
    console.log('📊 API: Запрос статистики Dashboard');
    
    // В реальном приложении здесь будет запрос к базе данных
    // Например: const stats = await db.getDashboardStats();
    
    const stats = getMockStats();
    
    console.log('✅ API: Статистика Dashboard сгенерирована:', {
      totalClients: stats.totalClients,
      todayEvents: stats.todayEvents,
      monthlyRevenue: stats.monthlyRevenue
    });
    
    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Статистика Dashboard получена успешно',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API: Ошибка получения статистики Dashboard:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения статистики',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}

// POST - Обновление статистики (для админов)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 API: Запрос обновления статистики:', body);
    
    // В реальном приложении здесь будет обновление данных
    // const updatedStats = await db.updateDashboardStats(body);
    
    const updatedStats = {
      ...getMockStats(),
      ...body,
      lastUpdated: new Date().toISOString(),
      generatedBy: 'manual-update'
    };
    
    return NextResponse.json({
      success: true,
      data: updatedStats,
      message: 'Статистика обновлена успешно'
    });
    
  } catch (error) {
    console.error('❌ API: Ошибка обновления статистики:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Ошибка обновления статистики',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}
