// Создайте тестовый API endpoint: app/api/test-email/route.ts
import { NextResponse } from 'next/server';
import { testEmailConnection, sendPasswordResetEmail } from '@/lib/email';

export async function GET() {
  try {
    const result = await testEmailConnection();
    return NextResponse.json({ success: result });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await sendPasswordResetEmail({
      to: 'test@example.com',
      name: 'Тестовый пользователь',
      resetUrl: 'http://localhost:3000/reset-password?token=test123',
      userType: 'member'
    });
    
    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      previewUrl: result.previewUrl 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
