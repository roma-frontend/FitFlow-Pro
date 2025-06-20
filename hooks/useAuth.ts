"use client";

import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { User } from '@/lib/simple-auth';
import { useRouter, usePathname } from 'next/navigation';

// Обновленный интерфейс для совместимости с главной страницей
export interface AuthStatus {
  authenticated: boolean;
  user?: {
    id: string;
    role: string;
    email: string;
    name: string;
  };
  dashboardUrl?: string;
}

interface FaceIdLoginData {
  descriptor: Float32Array;
  confidence: number;
  userName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoading: boolean;
  authStatus: AuthStatus | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuthStatus: (status: AuthStatus | null) => void;
}

// Функция для получения URL дашборда по роли
const getDashboardUrl = (role: string): string => {
  const dashboardUrls: Record<string, string> = {
    'admin': '/admin',
    'super-admin': '/admin',
    'manager': '/manager-dashboard',
    'trainer': '/trainer-dashboard',
    'client': '/member-dashboard',
    'member': '/member-dashboard',
    'staff': '/staff-dashboard'
  };
  
  return dashboardUrls[role] || '/dashboard';
};

// Функция для преобразования User в AuthStatus
const userToAuthStatus = (user: User | null): AuthStatus | null => {
  if (!user) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    dashboardUrl: getDashboardUrl(user.role)
  };
};

// Создаем контекст с дефолтными значениями
const AuthContext = React.createContext<AuthContextType | null>(null);

// Провайдер контекста аутентификации
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  // 🔧 ИСПРАВЛЕНИЕ: Предотвращаем множественные вызовы checkSession
  const checkingSession = useRef(false);
  const lastCheckTime = useRef(0);
  const CHECK_THROTTLE = 1000; // 1 секунда между проверками

  useEffect(() => {
    // Читаем токен из localStorage при монтировании
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken && !token) {
      console.log('🎫 AuthProvider: восстановлен токен из localStorage');
      setToken(savedToken);
    }
  }, []);

  // Синхронизируем authStatus с user
  useEffect(() => {
    const newAuthStatus = userToAuthStatus(user);
    setAuthStatus(newAuthStatus);
    console.log('🔄 AuthProvider: authStatus обновлен:', newAuthStatus);
  }, [user]);

  // 🔧 ИСПРАВЛЕНИЕ: Единственный useEffect для проверки сессии
  useEffect(() => {
    console.log('🚀 AuthProvider: инициализация или изменение маршрута:', pathname);
    
    // Проверяем сессию только при инициализации
    if (!user && loading) {
      console.log('🔍 AuthProvider: требуется проверка сессии');
      checkSessionThrottled();
    }
  }, []); // Пустой массив зависимостей - только при монтировании

  // 🔧 ИСПРАВЛЕНИЕ: Throttled версия checkSession
  const checkSessionThrottled = async (): Promise<void> => {
    const now = Date.now();
    
    // Предотвращаем множественные вызовы
    if (checkingSession.current) {
      console.log('⏳ AuthProvider: проверка сессии уже выполняется, пропускаем...');
      return;
    }
    
    // Throttling - не чаще раза в секунду
    if (now - lastCheckTime.current < CHECK_THROTTLE) {
      console.log('⏳ AuthProvider: throttling, слишком частые проверки, пропускаем...');
      return;
    }
    
    checkingSession.current = true;
    lastCheckTime.current = now;
    
    try {
      await checkSession();
    } finally {
      checkingSession.current = false;
    }
  };

  const checkSession = async (): Promise<void> => {
    try {
      console.log('🔍 AuthProvider: проверяем сессию через /api/auth/check...');
      
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Auth-Check': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      });
  
      console.log('🔍 AuthProvider: статус ответа:', response.status);
  
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 AuthProvider: данные от API:', data);
        
        if (data.authenticated && data.user) {
          console.log('✅ AuthProvider: пользователь авторизован:', data.user);
          setUser({
            id: data.user.id,
            role: data.user.role,
            email: data.user.email,
            name: data.user.name
          });
          
          // Сохраняем токен если есть
          if (data.token) {
            console.log('🎫 AuthProvider: восстанавливаем токен из сессии');
            setToken(data.token);
            localStorage.setItem('auth_token', data.token);
          } else {
            // Пробуем взять из localStorage
            const savedToken = localStorage.getItem('auth_token');
            if (savedToken) {
              console.log('🎫 AuthProvider: восстанавливаем токен из localStorage');
              setToken(savedToken);
            }
          }
        } else {
          console.log('❌ AuthProvider: пользователь не авторизован');
          
          // 🔧 ВАЖНОЕ ИСПРАВЛЕНИЕ: НЕ очищаем токен автоматически
          // Проверяем, есть ли сохраненный токен
          const savedToken = localStorage.getItem('auth_token');
          if (savedToken) {
            console.log('⚠️ AuthProvider: сохраняем существующий токен');
            setToken(savedToken);
            // НЕ очищаем пользователя, если есть токен
          } else {
            // Очищаем только если действительно нет токена
            setUser(null);
            setToken(null);
          }
        }
      } else {
        console.log('❌ AuthProvider: ошибка ответа от API:', response.status);
        // НЕ очищаем токен при ошибке сети
      }
    } catch (error) {
      console.error('❌ AuthProvider: ошибка проверки сессии:', error);
      // НЕ очищаем при ошибках сети
    } finally {
      setLoading(false);
      console.log('🏁 AuthProvider: проверка сессии завершена');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔐 AuthProvider: попытка входа для:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log('🔐 AuthProvider: результат входа:', data);
  
      if (data.success && data.user) {
        
        setUser(data.user);
        
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          setToken(data.token); // обновить состояние
        } else {
          console.warn('⚠️ AuthProvider: токен не получен от сервера');
        }
        
        return true;
      }
  
      return false;
    } catch (error) {
      console.error('❌ AuthProvider: ошибка входа:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 AuthProvider: выполняем выход...');
      
      // Сначала очищаем состояние
      setUser(null);
      setToken(null);
      setAuthStatus({ authenticated: false });
      
      // Очищаем токен из localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role'); // Добавляем очистку роли
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
  
      if (response.ok) {
        console.log('✅ AuthProvider: выход успешен');
        // Очищаем локальное хранилище
        localStorage.clear();
        sessionStorage.clear();
        
        // Принудительно перенаправляем на главную
        router.push("/");
      }
    } catch (error) {
      console.error('❌ AuthProvider: ошибка выхода:', error);
      setUser(null);
      setToken(null);
      setAuthStatus({ authenticated: false });
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    console.log('🔄 AuthProvider: принудительное обновление пользователя...');
    await checkSessionThrottled();
  };

  // Функция для ручного обновления authStatus (для совместимости)
  const updateAuthStatus = (status: AuthStatus | null): void => {
    console.log('🔄 AuthProvider: ручное обновление authStatus:', status);
    setAuthStatus(status);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    isLoading: loading,
    authStatus,
    login,
    logout,
    refreshUser,
    setAuthStatus: updateAuthStatus
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

// Остальные функции остаются без изменений...
export function useFaceAuth() {
  const { authStatus, login, logout } = useAuth();

  const loginWithFaceId = async (faceData: FaceIdLoginData): Promise<boolean> => {
    try {
      console.log('🔒 useFaceAuth: попытка входа через Face ID...', {
        confidence: faceData.confidence,
        userName: faceData.userName,
        descriptorLength: faceData.descriptor.length
      });

      const descriptorBase64 = Buffer.from(faceData.descriptor.buffer).toString('base64');

      const response = await fetch('/api/auth/face-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          descriptor: descriptorBase64,
          confidence: faceData.confidence,
          userName: faceData.userName,
        }),
      });

      const data = await response.json();
      console.log('🔒 useFaceAuth: результат Face ID входа:', data);

      if (data.success && data.user) {
        console.log('✅ useFaceAuth: Face ID вход успешен:', data.user);
        return true;
      } else {
        console.log('❌ useFaceAuth: Face ID вход неуспешен:', data.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('❌ useFaceAuth: ошибка Face ID входа:', error);
      return false;
    }
  };

  const registerFaceId = async (faceData: FaceIdLoginData): Promise<boolean> => {
    try {
      console.log('📝 useFaceAuth: регистрация Face ID...', {
        confidence: faceData.confidence,
        userName: faceData.userName,
        descriptorLength: faceData.descriptor.length
      });

      const descriptorBase64 = Buffer.from(faceData.descriptor.buffer).toString('base64');

      const response = await fetch('/api/auth/face-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          descriptor: descriptorBase64,
          confidence: faceData.confidence,
          userName: faceData.userName,
        }),
      });

      const data = await response.json();
      console.log('📝 useFaceAuth: результат регистрации Face ID:', data);

      if (data.success) {
        console.log('✅ useFaceAuth: Face ID регистрация успешна');
        return true;
      } else {
        console.log('❌ useFaceAuth: Face ID регистрация неуспешна:', data.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('❌ useFaceAuth: ошибка регистрации Face ID:', error);
      return false;
    }
  };

  const verifyFaceId = async (descriptor: Float32Array): Promise<{ success: boolean; confidence?: number }> => {
    try {
      const descriptorBase64 = Buffer.from(descriptor.buffer).toString('base64');

      const response = await fetch('/api/auth/face-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          descriptor: descriptorBase64,
        }),
      });

      const data = await response.json();
      return {
        success: data.success,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('❌ useFaceAuth: ошибка верификации Face ID:', error);
      return { success: false };
    }
  };

  return {
    authStatus,
    loginWithFaceId,
    registerFaceId,
    verifyFaceId,
    logout
  };
}

// Основной хук для использования контекста аутентификации
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}

// Упрощенный хук для главной страницы (для обратной совместимости)
export function useAuthStatus() {
  const { authStatus, loading, logout: contextLogout } = useAuth();
  
  return {
    authStatus,
    isLoading: loading,
    logout: contextLogout
  };
}

// Остальные хуки остаются без изменений...
export function useRole() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin' || user?.role === 'super-admin',
    isSuperAdmin: user?.role === 'super-admin',
    isManager: user?.role === 'manager' || user?.role === 'admin' || user?.role === 'super-admin',
    isTrainer: user?.role === 'trainer',
    isClient: user?.role === 'client' || user?.role === 'member',
    isMember: user?.role === 'member' || user?.role === 'client',
    isStaff: ['admin', 'super-admin', 'manager', 'trainer', 'staff'].includes(user?.role || ''),
    role: user?.role
  };
}

export function usePermissions() {
  const { user } = useAuth();
  
  const checkPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    try {
      const { hasPermission } = require('@/lib/permissions');
      return hasPermission(user.role, resource, action);
    } catch (error) {
      console.error('Ошибка проверки прав:', error);
      return false;
    }
  };

  const checkObjectAccess = (
    resource: string, 
    action: string, 
    objectOwnerId?: string
  ): boolean => {
    if (!user) return false;
    
    try {
      const { canAccessObject } = require('@/lib/permissions');
      return canAccessObject(user.role, user.id, objectOwnerId, resource, action);
    } catch (error) {
      console.error('Ошибка проверки доступа к объекту:', error);
      return false;
    }
  };

  return {
    checkPermission,
    checkObjectAccess,
    user
  };
}

// Хук для получения информации о пользователе
export function useUser() {
  const router = useRouter()
  const { user, loading } = useAuth();
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.name,
    userRole: user?.role
  };
}

// Хук для навигации (интегрируем с существующей системой)
export function useNavigation() {
  const router = useRouter()
  const { authStatus } = useAuth();
  
  const handleDashboardRedirect = () => {
    if (authStatus?.dashboardUrl) {
      router.push(authStatus.dashboardUrl);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return {
    handleDashboardRedirect,
    navigateTo,
    authStatus
  };
}

// Хук для API запросов с автоматической авторизацией
export function useApiRequest() {
  const { token } = useAuth();

  const apiRequest = async (
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(endpoint, {
      ...options,
      headers,
    });
  };

  const get = async (endpoint: string): Promise<any> => {
    const response = await apiRequest(endpoint);
    return response.json();
  };

  const post = async (endpoint: string, data: any): Promise<any> => {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  };

  const put = async (endpoint: string, data: any): Promise<any> => {
    const response = await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  };

  const del = async (endpoint: string): Promise<any> => {
    const response = await apiRequest(endpoint, {
      method: 'DELETE',
    });
    return response.json();
  };

  return {
    apiRequest,
    get,
    post,
    put,
    delete: del,
    token
  };
}
