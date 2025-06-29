import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to test storage operations'
  });
}

export async function POST(request: NextRequest) {
  const { action } = await request.json();
  
  const results: any = {};
  
  if (action === 'check') {
    // Этот код выполняется на сервере, не имеет доступа к localStorage
    results.server = {
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
      },
      cookies: request.cookies.getAll()
    };
  }
  
  return NextResponse.json(results);
}