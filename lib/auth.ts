import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface UserJwtPayload {
  jti: string;
  iat: number;
  exp: number;
  userId: string;
  name: string;
  email?: string;
  role: string;
}

export function setAuthCookie(token: string): void {
  console.warn('setAuthCookie вызвана, но cookies должны устанавливаться через NextResponse');
}

export function setRoleCookie(role: string): void {
  console.warn('setRoleCookie вызвана, но cookies должны устанавливаться через NextResponse');
}

export function createToken(payload: any): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET не установлен');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

export async function verifyToken(token: string): Promise<any> {
  try {
    console.log('🔧 Проверяем JWT токен...');
    console.log('🔑 JWT_SECRET установлен:', !!process.env.JWT_SECRET);
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET не установлен');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT токен декодирован:', decoded);
    return decoded;
  } catch (error) {
    console.error('❌ Ошибка проверки JWT:', error);
    throw new Error(`Invalid token: ${error}`);
  }
}

export async function signToken(payload: any) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET не установлен');
    }
    console.log('signToken: создаем токен для:', payload);
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
    
    console.log('signToken: токен создан успешно');
    return token;
  } catch (error) {
    console.error('signToken: ошибка создания токена:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    console.log("Токен из cookies:", token ? "найден" : "не найден");
    
    if (!token) {
      return null;
    }
    
    const payload = await verifyToken(token);
    console.log("Payload из токена:", payload);
    
    return {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.error("Ошибка в getCurrentUser:", error);
    return null;
  }
}

export async function clearAuthCookies(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('user_role');
  } catch (error) {
    console.error("Ошибка при очистке cookies:", error);
  }
}
