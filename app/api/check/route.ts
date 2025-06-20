// app/api/auth/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const payload = await verifyToken(token);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.userId,
        role: payload.role,
        email: payload.email
      }
    });

  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
