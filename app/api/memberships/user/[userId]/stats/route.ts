// app/api/users/[userId]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Получаем статистику пользователя из Convex
    const stats = await fetchQuery(api.users.getMemberStats, {
      userId: userId as any
    });

    // Если нет статистики в Convex, создаем базовую
    const defaultStats = {
      totalWorkouts: 0,
      totalHours: 0,
      currentStreak: 0,
      personalRecords: 0,
      caloriesBurned: 0,
      averageWorkoutTime: 0,
      membershipType: 'basic',
      membershipExpiry: null,
      lastWorkout: null,
      achievements: [],
      goals: []
    };

    return NextResponse.json({
      success: true,
      stats: stats || defaultStats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    
    // Возвращаем пустую статистику в случае ошибки
    return NextResponse.json({
      success: true,
      stats: {
        totalWorkouts: 0,
        totalHours: 0,
        currentStreak: 0,
        personalRecords: 0,
        caloriesBurned: 0,
        averageWorkoutTime: 0,
        membershipType: 'basic',
        membershipExpiry: null,
        lastWorkout: null,
        achievements: [],
        goals: []
      }
    });
  }
}