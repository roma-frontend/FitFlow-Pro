// app/api/auth/face-register/route.ts - исправленная типизация ошибок
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import jwt from 'jsonwebtoken';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface FaceRegisterRequest {
  descriptor: number[];
  confidence: number;
  sessionToken?: string;
}

// ✅ Функция для безопасного получения сообщения об ошибке
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Неизвестная ошибка';
}

// ✅ Функция для получения деталей ошибки (только в dev режиме)
function getErrorDetails(error: unknown) {
  if (process.env.NODE_ENV !== 'development') {
    return undefined;
  }
  
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }
  
  return { error };
}

export async function POST(request: NextRequest) {
  console.log('📸 Face Register API: начало регистрации Face ID');
  
  try {
    const body: FaceRegisterRequest = await request.json();
    const { descriptor, confidence, sessionToken } = body;

    console.log('📸 Face Register: получены данные:', {
      hasDescriptor: !!descriptor,
      descriptorLength: descriptor?.length,
      confidence,
      hasSessionToken: !!sessionToken
    });

    // Проверяем качество данных
    if (!descriptor || descriptor.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Недостаточно данных лица для регистрации'
      }, { status: 400 });
    }

    if (confidence < 70) {
      return NextResponse.json({
        success: false,
        message: 'Качество изображения слишком низкое для регистрации Face ID'
      }, { status: 400 });
    }

    // ✅ Проверяем JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET не установлен!');
      return NextResponse.json({
        success: false,
        message: 'Ошибка конфигурации сервера'
      }, { status: 500 });
    }

    // ✅ Получаем текущего пользователя из JWT токена в cookie
    let currentUser = null;
    
    // Получаем токен из cookies
    const token = request.cookies.get('auth_token')?.value || sessionToken;
    console.log('🍪 Токен найден:', !!token);
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        console.log('🎫 Токен декодирован:', { userId: decoded.userId, email: decoded.email });
        
        // Используем правильный query name
        currentUser = await convex.query("users:getById", { id: decoded.userId });
        console.log('👤 Пользователь найден:', currentUser ? currentUser.name : 'не найден');
      } catch (jwtError) {
        const jwtErrorMessage = getErrorMessage(jwtError);
        console.log('❌ Ошибка проверки токена:', jwtErrorMessage);
      }
    }

    if (!currentUser) {
      console.log('❌ Пользователь не авторизован');
      return NextResponse.json({
        success: false,
        message: 'Необходимо войти в систему для регистрации Face ID'
      }, { status: 401 });
    }

    // ✅ Проверяем, есть ли уже Face ID у пользователя (пропускаем для демо)
    console.log('🔍 Проверяем существующий Face ID профиль...');
    
    // Для демо версии - просто создаем "профиль" без реальной БД
    console.log('📝 Создаем демо Face ID профиль...');
    
    // Симулируем создание профиля
    const faceProfileId = `face_profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('✅ Face ID профиль создан (демо):', faceProfileId);

    return NextResponse.json({
      success: true,
      message: `Face ID успешно зарегистрирован для ${currentUser.name}`,
      profileId: faceProfileId,
      user: {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email
      }
    });

  } catch (error) {
    // ✅ Правильная типизация ошибки
    const errorMessage = getErrorMessage(error);
    const errorDetails = getErrorDetails(error);
    
    console.error('❌ Face Register API: ошибка:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Внутренняя ошибка сервера при регистрации Face ID',
      error: errorMessage,
      ...(errorDetails && { details: errorDetails })
    }, { status: 500 });
  }
}

// ✅ GET метод для проверки статуса
export async function GET() {
  try {
    return NextResponse.json({
      message: 'Face ID register endpoint',
      status: 'active',
      methods: ['POST'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('❌ Face Register GET: ошибка:', error);
    
    return NextResponse.json({
      message: 'Ошибка сервера',
      error: errorMessage
    }, { status: 500 });
  }
}

// ✅ Опционально: DELETE метод для удаления Face ID профиля
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({
        success: false,
        message: 'Не авторизован'
      }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Симулируем удаление профиля
    console.log(`🗑️ Удаляем Face ID профиль для пользователя ${decoded.userId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Face ID профиль удален'
    });

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('❌ Face Register DELETE: ошибка:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Ошибка при удалении Face ID профиля',
      error: errorMessage
    }, { status: 500 });
  }
}
