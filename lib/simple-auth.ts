// lib/simple-auth.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ VERCEL
import { UserRole } from '@/lib/permissions';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  photoUrl?: string;
}

export interface Session {
  id: string;
  email: string;
  user: User;
  createdAt: Date;
  expiresAt: Date;
  lastAccessed: Date;
  rating: number;
}

// ✅ ИСПРАВЛЕНИЕ ДЛЯ VERCEL: Используем JWT токены вместо in-memory сессий
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

// ✅ Создание JWT токена вместо сессии в памяти
export const createSession = async (user: User): Promise<string> => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();
  
  const session: Session = {
    id: sessionId,
    email: user.email,
    user,
    createdAt: now,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
    lastAccessed: now,
    rating: user.rating || 0,
  };

  // Создаем JWT токен с данными сессии
  const token = await new SignJWT({ 
    sessionData: session,
    userId: user.id,
    userRole: user.role,
    userEmail: user.email
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  console.log(`✅ Session: создан JWT токен для ${user.email} (${user.role})`);
  return token;
};

// ✅ Получение сессии из JWT токена
export const getSession = async (sessionToken: string): Promise<Session | null> => {
  try {
    console.log(`🔍 getSession: проверка JWT токена...`);
    
    if (!sessionToken) {
      console.log('❌ getSession: токен отсутствует');
      return null;
    }

    // Верифицируем JWT токен
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    
    if (!payload.sessionData) {
      console.log('❌ getSession: некорректная структура токена');
      return null;
    }

    const session = payload.sessionData as Session;
    
    // Проверяем срок действия
    if (new Date(session.expiresAt) < new Date()) {
      console.log('⏰ getSession: сессия истекла');
      return null;
    }

    // Обновляем время последнего доступа (но не пересоздаем токен каждый раз)
    session.lastAccessed = new Date();

    console.log(`✅ getSession: сессия найдена для ${session.user.email} (${session.user.role})`);
    return session;

  } catch (error) {
    console.error('❌ getSession: ошибка верификации JWT:', error);
    return null;
  }
};

// ✅ Обновление сессии - создаем новый JWT токен
export const updateSession = async (sessionToken: string, updatedSession: Session): Promise<string | null> => {
  try {
    console.log(`🔄 updateSession: обновление JWT токена...`);
    
    // Проверяем существующий токен
    const currentSession = await getSession(sessionToken);
    if (!currentSession) {
      console.log(`❌ updateSession: исходная сессия не найдена`);
      return null;
    }

    // Создаем новый токен с обновленными данными
    const newToken = await new SignJWT({ 
      sessionData: {
        ...updatedSession,
        lastAccessed: new Date()
      },
      userId: updatedSession.user.id,
      userRole: updatedSession.user.role,
      userEmail: updatedSession.user.email
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    console.log(`✅ updateSession: JWT токен обновлен для ${updatedSession.user.email}`);
    return newToken;

  } catch (error) {
    console.error('❌ updateSession: ошибка обновления JWT:', error);
    return null;
  }
};

// ✅ Обновление пользователя в сессии
export const updateSessionUser = async (sessionToken: string, updatedUser: Partial<User>): Promise<string | null> => {
  try {
    console.log(`🔄 updateSessionUser: обновление пользователя в JWT токене...`);
    
    const session = await getSession(sessionToken);
    if (!session) {
      console.log(`❌ updateSessionUser: сессия не найдена`);
      return null;
    }

    // Обновляем только данные пользователя
    const updatedSession = {
      ...session,
      user: {
        ...session.user,
        ...updatedUser,
        updatedAt: new Date()
      },
      lastAccessed: new Date()
    };

    return await updateSession(sessionToken, updatedSession);

  } catch (error) {
    console.error('❌ updateSessionUser: ошибка:', error);
    return null;
  }
};

// ✅ Аутентификация пользователя (возвращает JWT токен)
export const authenticate = async (email: string, password: string): Promise<{ session: Session; token: string } | null> => {
  console.log(`🔐 Auth: попытка входа для ${email}`);
  
  // Специальная проверка для супер-админа
  if (email === 'romangulanyan@gmail.com' && password === 'Hovik-1970') {
    const superAdminUser: User = {
      id: 'super-admin-1',
      email: 'romangulanyan@gmail.com',
      role: 'super-admin',
      name: 'Roman Gulanyan',
      avatar: '/avatars/super-admin.jpg',
      isVerified: true,
      rating: 5.0,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };
    
    const token = await createSession(superAdminUser);
    const session = await getSession(token);
    
    if (session) {
      console.log(`✅ Auth: супер-админ авторизован`);
      return { session, token };
    }
  }
  
  console.log('❌ Auth: пользователь не найден в simple-auth (проверьте Convex)');
  return null;
};

// ✅ ДОБАВИМ СОВМЕСТИМОСТЬ: Синхронная версия для обратной совместимости  
export const authenticateSync = (email: string, password: string): { user: User; id: string } | null => {
  console.log(`🔐 AuthSync: попытка входа для ${email}`);
  
  // Специальная проверка для супер-админа
  if (email === 'romangulanyan@gmail.com' && password === 'Hovik-1970') {
    const superAdminUser: User = {
      id: 'super-admin-1',
      email: 'romangulanyan@gmail.com',
      role: 'super-admin',
      name: 'Roman Gulanyan',
      avatar: '/avatars/super-admin.jpg',
      isVerified: true,
      rating: 5.0,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`✅ AuthSync: супер-админ авторизован`);
    return { 
      user: superAdminUser,
      id: sessionId
    };
  }
  
  console.log('❌ AuthSync: пользователь не найден в simple-auth (проверьте Convex)');
  return null;
};

// ✅ Выход из системы (JWT токены нельзя удалить, но можем добавить в blacklist)
export const logout = (sessionToken: string): boolean => {
  console.log('👋 Auth: выход из системы (JWT токен остается валидным до истечения)');
  return true;
};

// Остальные функции остаются без изменений...
export const getUserById = (userId: string): User | null => {
  if (userId === 'super-admin-1') {
    return {
      id: 'super-admin-1',
      email: 'romangulanyan@gmail.com',
      role: 'super-admin',
      name: 'Roman Gulanyan',
      avatar: '/avatars/super-admin.jpg',
      isVerified: true,
      rating: 5.0,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };
  }
  return null;
};

export const getUserByEmail = (email: string): User | null => {
  if (email === 'romangulanyan@gmail.com') {
    return {
      id: 'super-admin-1',
      email: 'romangulanyan@gmail.com',
      role: 'super-admin',
      name: 'Roman Gulanyan',
      avatar: '/avatars/super-admin.jpg',
      isVerified: true,
      rating: 5.0,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };
  }
  return null;
};

export const getAllUsers = (): User[] => {
  console.log(`📋 getAllUsers: возвращаем только супер-админа (остальные в Convex)`);
  const superAdmin = getUserByEmail('romangulanyan@gmail.com');
  return superAdmin ? [superAdmin] : [];
};

export const getUsersByRole = (role: UserRole): User[] => {
  if (role === 'super-admin') {
    const superAdmin = getUserByEmail('romangulanyan@gmail.com');
    return superAdmin ? [superAdmin] : [];
  }
  return [];
};

export const isValidRole = (role: string): role is UserRole => {
  return ['super-admin', 'admin', 'manager', 'trainer', 'member', 'client'].includes(role);
};

export const changePassword = (userId: string, oldPassword: string, newPassword: string): boolean => {
  console.log(`🔑 Auth: смена пароля для пользователя ${userId} (функция-заглушка)`);
  
  if (newPassword.length < 6) {
    throw new Error('Пароль должен содержать минимум 6 символов');
  }
  
  return true;
};

export const resetPassword = (email: string): string | null => {
  console.log(`🔄 Auth: сброс пароля для ${email} (функция-заглушка)`);
  
  if (email === 'romangulanyan@gmail.com') {
    const tempPassword = Math.random().toString(36).substr(2, 10);
    console.log(`🔄 Auth: сгенерирован временный пароль для супер-админа: ${tempPassword}`);
    return tempPassword;
  }
  
  return null;
};

export const isSessionActive = async (sessionToken: string): Promise<boolean> => {
  const session = await getSession(sessionToken);
  return session !== null;
};

export const extendSession = async (sessionToken: string, hours: number = 24): Promise<string | null> => {
  try {
    const session = await getSession(sessionToken);
    if (!session) {
      return null;
    }

    const extendedSession = {
      ...session,
      expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000)
    };

    const newToken = await updateSession(sessionToken, extendedSession);
    console.log(`⏰ Auth: сессия продлена на ${hours} часов`);
    return newToken;
  } catch (error) {
    console.error('❌ extendSession: ошибка:', error);
    return null;
  }
};

// ✅ Дополнительная функция для отладки JWT токенов
export const debugSessionAccess = async (sessionToken: string) => {
  console.log(`🔍 Debug: проверка JWT токена...`);
  
  try {
    const session = await getSession(sessionToken);
    console.log(`📋 Debug: результат парсинга токена:`, !!session);
    
    if (session) {
      console.log(`👤 Debug: данные пользователя:`, {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name
      });
      console.log(`⏰ Debug: время создания:`, session.createdAt);
      console.log(`⏰ Debug: время истечения:`, session.expiresAt);
      console.log(`⏰ Debug: последний доступ:`, session.lastAccessed);
      console.log(`✅ Debug: сессия активна:`, new Date(session.expiresAt) > new Date());
    }
    
    return session;
  } catch (error) {
    console.error('❌ Debug: ошибка проверки токена:', error);
    return null;
  }
};

export const getAuthStats = () => {
  return {
    totalUsers: 1,
    usersByRole: {
      'super-admin': 1,
      admin: 0,
      manager: 0,
      trainer: 0,
      member: 0,
      client: 0
    },
    activeSessions: 'N/A (JWT tokens)',
    totalSessions: 'N/A (JWT tokens)',
    note: 'Используются JWT токены для совместимости с Vercel serverless'
  };
};