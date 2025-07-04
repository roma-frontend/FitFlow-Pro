// app/api/memberships/user/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Получаем текущее членство пользователя из Convex
    const membership = await fetchQuery(api.memberships.getCurrentMembership, {
      userId: userId as any
    });

    // Если нет абонемента, пробуем получить историю
    let membershipHistory = null;
    if (!membership) {
      membershipHistory = await fetchQuery(api.memberships.getUserHistory, {
        userId: userId as any,
        includeExpired: true
      });
    }

    return NextResponse.json({
      success: true,
      membership: membership || null,
      history: membershipHistory || []
    });

  } catch (error) {
    console.error('Error fetching user membership:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch membership data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}