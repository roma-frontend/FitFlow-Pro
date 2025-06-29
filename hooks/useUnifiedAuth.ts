// hooks/useUnifiedAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import unifiedAuth, { type AuthUser, type AuthSession, type LoginResult } from '@/lib/unified-auth';

interface UseUnifiedAuthReturn {
  // Состояние
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Методы входа
  loginWithPassword: (email: string, password: string) => Promise<LoginResult>;
  loginWithQR: (qrCode: string) => Promise<LoginResult>;
  
  // Управление
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useUnifiedAuth = (): UseUnifiedAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Проверяем сессию при загрузке
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const sessionId = localStorage.getItem('auth_session');
      const token = localStorage.getItem('auth_token');

      if (sessionId) {
        const result = await unifiedAuth.validateSession(sessionId);
        if (result.valid && result.session) {
          setSession(result.session);
          setUser(result.session.user);
        }
      } else if (token) {
        const result = await unifiedAuth.validateToken(token);
        if (result.valid && result.user) {
          setUser(result.user);
        }
      }
    } catch (error) {
      console.error('Ошибка проверки сессии:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔐 Вход по паролю
  const loginWithPassword = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const result = await unifiedAuth.login('password', {
        email,
        password,
        ipAddress: await getClientIP(),
        deviceInfo: getDeviceInfo()
      });

      if (result.success && result.session && result.token) {
        setSession(result.session);
        setUser(result.session.user);
        
        localStorage.setItem('auth_session', result.session.id);
        localStorage.setItem('auth_token', result.token);
        
        router.push('/dashboard');
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // 📱 Вход по QR
  const loginWithQR = useCallback(async (qrCode: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const result = await unifiedAuth.login('qr-code', {
        qrCode,
        ipAddress: await getClientIP(),
        deviceInfo: getDeviceInfo()
      });

      if (result.success && result.session && result.token) {
        setSession(result.session);
        setUser(result.session.user);
        
        localStorage.setItem('auth_session', result.session.id);
        localStorage.setItem('auth_token', result.token);
        
        router.push('/dashboard');
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // 🚪 Выход
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const sessionId = localStorage.getItem('auth_session');
      if (sessionId) {
        await unifiedAuth.logout(sessionId, {
          ipAddress: await getClientIP(),
          deviceInfo: getDeviceInfo()
        });
      }

      setUser(null);
      setSession(null);
      localStorage.removeItem('auth_session');
      localStorage.removeItem('auth_token');
      
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // 🔄 Обновление сессии
  const refreshSession = useCallback(async () => {
    await checkExistingSession();
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    loginWithPassword,
    loginWithQR,
    logout,
    refreshSession
  };
};

// Утилиты
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

function getDeviceInfo(): string {
  return `${navigator.userAgent.split(' ')[0]} ${navigator.platform}`;
}
