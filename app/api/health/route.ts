// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    // Проверяем подключение к Convex
    const users = await convex.query("users.getAll");
    
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      convex: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Service unavailable',
        convex: 'disconnected'
      },
      { status: 503 }
    );
  }
}
