// lib/simple-auth.ts
import { UserRole } from '@/lib/permissions';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  user: User;
  createdAt: Date;
  expiresAt: Date;
  lastAccessed: Date;
  rating: number;
}

// Глобальное хранилище сессий
declare global {
  var __sessions: Map<string, Session> | undefined;
}

// Инициализируем глобальное хранилище сессий
const sessions = globalThis.__sessions ?? new Map<string, Session>();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__sessions = sessions;
}

// ИСПРАВЛЕНИЕ ДЛЯ VERCEL: проверяем среду выполнения
const isVercelProduction = process.env.VERCEL === '1' && process.env.NODE_ENV === 'production';

// Создание сессии
export const createSession = (user: User): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();
  const session: Session = {
    id: sessionId,
    user,
    createdAt: now,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
    lastAccessed: now,
    rating: user.rating || 0,
  };

  sessions.set(sessionId, session);
  console.log(`✅ Session: создана сессия для ${user.email} (${user.role}), ID: ${sessionId.substring(0, 20)}...`);
  console.log(`📊 Session: всего сессий в хранилище: ${sessions.size}`);
  
  if (isVercelProduction) {
    console.log(`🔧 Vercel: создана сессия ${sessionId.substring(0, 20)}... для ${user.email}`);
    console.log(`🔧 Vercel: размер хранилища после создания: ${sessions.size}`);
    console.log(`🔧 Vercel: все ключи после создания:`, Array.from(sessions.keys()).map(k => k.substring(0, 20)));
  }
  
  return sessionId;
};

// Аутентификация пользователя (только для супер-админа)
export const authenticate = (email: string, password: string): Session | null => {
  console.log(`🔐 Auth: попытка входа для ${email}`);
  
  // Специальная проверка для супер-админа (единственный оставшийся mock user)
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
    
    const sessionId = createSession(superAdminUser);
    const session = sessions.get(sessionId);
    console.log(`✅ Auth: супер-админ авторизован`);
    return session || null;
  }
  
  console.log('❌ Auth: пользователь не найден в simple-auth (проверьте Convex)');
  return null;
};

// Получение сессии
export const getSession = (sessionId: string): Session | null => {
  console.log(`🔍 getSession: поиск сессии ${sessionId.substring(0, 20)}...`);
  console.log(`📊 getSession: всего сессий в хранилище: ${sessions.size}`);
  
  if (isVercelProduction) {
    console.log(`🔧 Vercel: поиск сессии ${sessionId.substring(0, 20)}...`);
    console.log(`🔧 Vercel: размер хранилища: ${sessions.size}`);
    console.log(`🔧 Vercel: все ключи:`, Array.from(sessions.keys()).map(k => k.substring(0, 20)));
  }
  
  // Выводим все ключи сессий для отладки
  const allKeys = Array.from(sessions.keys());
  console.log(`🔑 getSession: ключи сессий (первые 20 символов):`, allKeys.map(key => key.substring(0, 20)));
  
  const session = sessions.get(sessionId);
  
  if (!session) {
    console.log(`❌ getSession: сессия ${sessionId.substring(0, 20)}... не найдена`);
    
    if (isVercelProduction) {
      console.log(`🔧 Vercel: сессия не найдена, проверяем точное совпадение...`);
      const exactMatch = allKeys.find(key => key === sessionId);
      console.log(`🔧 Vercel: точное совпадение найдено:`, !!exactMatch);
    }
    
    return null;
  }

  console.log(`✅ getSession: сессия найдена для ${session.user.email} (${session.user.role})`);

  // Проверяем срок действия
  if (session.expiresAt < new Date()) {
    sessions.delete(sessionId);
    console.log('⏰ Auth: сессия истекла');
    return null;
  }

  // Обновляем время последнего доступа
  session.lastAccessed = new Date();
  sessions.set(sessionId, session);

  if (isVercelProduction) {
    console.log(`🔧 Vercel: сессия найдена и обновлена для ${session.user.email}`);
  }

  return session;
};

// Выход из системы
export const logout = (sessionId: string): boolean => {
  const deleted = sessions.delete(sessionId);
  if (deleted) {
    console.log('👋 Auth: сессия завершена');
    if (isVercelProduction) {
      console.log(`🔧 Vercel: сессия ${sessionId.substring(0, 20)}... удалена`);
    }
  }
  return deleted;
};

// Получение пользователя по ID (только для супер-админа)
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

// Получение пользователя по email (только для супер-админа)
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

// Получение всех пользователей (теперь только супер-админ)
export const getAllUsers = (): User[] => {
  console.log(`📋 getAllUsers: возвращаем только супер-админа (остальные в Convex)`);
  const superAdmin = getUserByEmail('romangulanyan@gmail.com');
  return superAdmin ? [superAdmin] : [];
};

// Получение пользователей по роли
export const getUsersByRole = (role: UserRole): User[] => {
  if (role === 'super-admin') {
    const superAdmin = getUserByEmail('romangulanyan@gmail.com');
    return superAdmin ? [superAdmin] : [];
  }
  return [];
};

// Валидация роли
export const isValidRole = (role: string): role is UserRole => {
  return ['super-admin', 'admin', 'manager', 'trainer', 'member', 'client'].includes(role);
};

// Смена пароля (заглушка)
export const changePassword = (userId: string, oldPassword: string, newPassword: string): boolean => {
  console.log(`🔑 Auth: смена пароля для пользователя ${userId} (функция-заглушка)`);
  
  // Простая валидация пароля
  if (newPassword.length < 6) {
    throw new Error('Пароль должен содержать минимум 6 символов');
  }
  
  return true;
};

// Сброс пароля (заглушка)
export const resetPassword = (email: string): string | null => {
  console.log(`🔄 Auth: сброс пароля для ${email} (функция-заглушка)`);
  
  if (email === 'romangulanyan@gmail.com') {
    const tempPassword = Math.random().toString(36).substr(2, 10);
    console.log(`🔄 Auth: сгенерирован временный пароль для супер-админа: ${tempPassword}`);
    return tempPassword;
  }
  
  return null;
};

// Проверка активности сессии
export const isSessionActive = (sessionId: string): boolean => {
  const session = getSession(sessionId);
  return session !== null;
};

// Продление сессии
export const extendSession = (sessionId: string, hours: number = 24): boolean => {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }

  session.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  sessions.set(sessionId, session);
  
  console.log(`⏰ Auth: сессия ${sessionId} продлена на ${hours} часов`);
  return true;
};

// Получение всех активных сессий пользователя
export const getUserSessions = (userId: string): Session[] => {
  const userSessions: Session[] = [];
  
  for (const session of sessions.values()) {
    if (session.user.id === userId && session.expiresAt > new Date()) {
      userSessions.push(session);
    }
  }
  
  return userSessions;
};

// Завершение всех сессий пользователя
export const logoutAllUserSessions = (userId: string): number => {
  let deletedCount = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    if (session.user.id === userId) {
      sessions.delete(sessionId);
      deletedCount++;
    }
  }
  
  console.log(`👋 Auth: завершено ${deletedCount} сессий для пользователя ${userId}`);
  return deletedCount;
};

// Очистка истекших сессий
export const cleanupExpiredSessions = (): number => {
  let deletedCount = 0;
  const now = new Date();
  
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0) {
    console.log(`🧹 Auth: очищено ${deletedCount} истекших сессий`);
  }
  
  return deletedCount;
};

// Получение статистики аутентификации
export const getAuthStats = () => {
  const now = new Date();
  const activeSessions = Array.from(sessions.values()).filter(s => s.expiresAt > now);
  
  return {
    totalUsers: 1, // Только супер-админ
    usersByRole: {
      'super-admin': 1,
      admin: 0,
      manager: 0,
      trainer: 0,
      member: 0,
      client: 0
    },
    activeSessions: activeSessions.length,
    totalSessions: sessions.size,
    note: 'Статистика только для simple-auth (супер-админ). Остальные пользователи в Convex.'
  };
};

// Инициализация - очистка истекших сессий каждые 30 минут
if (typeof window === 'undefined') { // Только на сервере
  setInterval(() => {
    cleanupExpiredSessions();
  }, 30 * 60 * 1000); // 30 минут
}

// Дополнительная функция для отладки middleware
export const debugSessionAccess = (sessionId: string) => {
  console.log(`🔍 Debug: проверка доступа к сессии ${sessionId.substring(0, 20)}...`);
  console.log(`📊 Debug: размер хранилища сессий: ${sessions.size}`);
  console.log(`🗂️ Debug: тип хранилища:`, typeof sessions);
  console.log(`🔑 Debug: все ключи сессий:`, Array.from(sessions.keys()).map(k => k.substring(0, 20)));
  
  const session = sessions.get(sessionId);
  console.log(`📋 Debug: результат поиска сессии:`, !!session);
  
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
    console.log(`✅ Debug: сессия активна:`, session.expiresAt > new Date());
  }
  
  return session;
};

// Экспорт для отладки (только в development)
export const debugAuth = process.env.NODE_ENV === 'development' ? {
  getAllSessions: () => Array.from(sessions.entries()),
  clearAllSessions: () => {
    sessions.clear();
    console.log('🧹 Debug: все сессии очищены');
  },
  getSuperAdmin: () => getUserByEmail('romangulanyan@gmail.com'),
  getSessionsCount: () => sessions.size,
  getActiveSessionsCount: () => {
    const now = new Date();
    return Array.from(sessions.values()).filter(s => s.expiresAt > now).length;
  },
  getSessionById: (sessionId: string) => sessions.get(sessionId),
  getAllSessionIds: () => Array.from(sessions.keys()),
  forceCreateSession: (user: User) => createSession(user),
  getSessionsMap: () => sessions
} : undefined;
