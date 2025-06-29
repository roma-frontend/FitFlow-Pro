// app/api/auth/staff-face-register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  console.log('👨‍💼 Staff Face Register API: начало регистрации Face ID для персонала');
  
  try {
    const body = await request.json();
    const { descriptor, confidence } = body;

    // Проверки как в обычном face-register
    if (!descriptor || descriptor.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Недостаточно данных лица для регистрации'
      }, { status: 400 });
    }

    if (confidence < 75) { // Более строгие требования для персонала
      return NextResponse.json({
        success: false,
        message: 'Качество изображения слишком низкое для регистрации Face ID персонала'
      }, { status: 400 });
    }

    // Получаем staff пользователя из JWT токена
    const token = request.cookies.get('staff_auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Необходима авторизация персонала для регистрации Face ID'
      }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log('👨‍💼 Staff пользователь:', decoded.staffId, decoded.role);
      
      // Для демо - просто возвращаем успех
      const staffFaceProfileId = `staff_face_profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Staff Face ID профиль создан (демо):', staffFaceProfileId);

      return NextResponse.json({
        success: true,
        message: `Face ID успешно зарегистрирован для ${decoded.name || 'сотрудника'} (${decoded.role})`,
        profileId: staffFaceProfileId,
        staffRole: decoded.role
      });

    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'Недействительный токен персонала'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('❌ Staff Face Register API: ошибка:', error);
    return NextResponse.json({
      success: false,
      message: 'Внутренняя ошибка сервера при регистрации Face ID персонала'
    }, { status: 500 });
  }
}
