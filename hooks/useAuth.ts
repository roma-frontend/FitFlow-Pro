// hooks/useAuth.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ с правильным loader

"use client";

import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { User } from '@/lib/simple-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useLoaderStore } from "@/stores/loaderStore"; // ✅ ДОБАВИЛИ
import { toast } from './use-toast';

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
  login: (email: string, password: string, redirectPath?: string) => Promise<boolean>;
  logout: (skipRedirect?: boolean) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const pathname = usePathname();

  // Предотвращаем множественные вызовы checkSession
  const checkingSession = useRef(false);
  const lastCheckTime = useRef(0);
  const CHECK_THROTTLE = 1000;
  const initialCheckDone = useRef(false);

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Преобразуем в правильный формат User
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
            ...userData // Остальные поля
          });
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        console.log('🔍 AuthProvider: загружаем сохраненные данные...', {
          hasToken: !!storedToken,
          hasUser: !!storedUser
        });

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('✅ AuthProvider: восстановлены данные пользователя:', parsedUser);
          setUser(parsedUser);
          setToken(storedToken);
          setLoading(false);
          initialCheckDone.current = true;
        }
      } catch (error) {
        console.error('❌ AuthProvider: ошибка загрузки сохраненных данных:', error);
      }
    };

    loadStoredAuth();
  }, []);

  useEffect(() => {
    const newAuthStatus = userToAuthStatus(user);
    setAuthStatus(newAuthStatus);
    console.log('🔄 AuthProvider: authStatus обновлен:', newAuthStatus);
  }, [user]);

  useEffect(() => {
    console.log('🚀 AuthProvider: проверка необходимости загрузки сессии:', {
      pathname,
      hasUser: !!user,
      initialCheckDone: initialCheckDone.current
    });

    if ((!user && !initialCheckDone.current) || pathname.includes('login')) {
      console.log('🔍 AuthProvider: требуется проверка сессии');
      checkSessionThrottled();
    }
  }, [pathname]);

  useEffect(() => {
    const handleForceUpdate = (event: CustomEvent) => {
      console.log('🔄 Force auth update received');

      setUser(null);
      setToken(null);
      setAuthStatus({ authenticated: false });
      setLoading(false);

      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');

      if (!storedUser && !storedToken) {
        console.log('✅ Auth cleared successfully');
      } else {
        console.warn('⚠️ Auth data still in localStorage after force update');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    };

    window.addEventListener('force-auth-update', handleForceUpdate as EventListener);

    return () => {
      window.removeEventListener('force-auth-update', handleForceUpdate as EventListener);
    };
  }, []);

  const checkSessionThrottled = async (): Promise<void> => {
    const now = Date.now();

    if (checkingSession.current) {
      console.log('⏳ AuthProvider: проверка сессии уже выполняется, пропускаем...');
      return;
    }

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
      initialCheckDone.current = true;
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

          const userData: User = {
            id: data.user.id,
            role: data.user.role,
            email: data.user.email,
            name: data.user.name,
            avatar: data.user.avatar,
            createdAt: data.user.createdAt,
            updatedAt: data.user.updatedAt
          };

          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
          console.log('💾 AuthProvider: данные пользователя сохранены в localStorage');

          if (data.token) {
            setToken(data.token);
            localStorage.setItem('auth_token', data.token);
            console.log('💾 AuthProvider: токен сохранен в localStorage');
          }
        } else {
          console.log('❌ AuthProvider: пользователь не авторизован');
          if (pathname !== '/' && !user) {
            clearAuthData();
          }
        }
      } else {
        console.log('❌ AuthProvider: ошибка ответа от API:', response.status);
        if (response.status === 401) {
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('❌ AuthProvider: ошибка проверки сессии:', error);
    } finally {
      setLoading(false);
      console.log('🏁 AuthProvider: проверка сессии завершена');
    }
  };

  const clearAuthData = () => {
    console.log('🧹 clearAuthData: НАЧАЛО очистки');

    setUser(null);
    setToken(null);

    try {
      const keysToRemove = ['auth_user', 'auth_token', 'user', 'token', 'authToken', 'userToken'];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      localStorage.clear();
      sessionStorage.clear();

      console.log('🧹 clearAuthData: очистка завершена');
    } catch (error) {
      console.error('❌ clearAuthData: ошибка очистки localStorage:', error);
    }
  };

const login = useCallback(async (email: string, password: string, redirectPath?: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Member login attempt:', email);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role: 'member' // Явно указываем роль
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success && data.user) {
        console.log('✅ Member login successful');

        // Создаем объект User с правильными типами
        const userData: User = {
          id: data.user.id || data.user.userId || '',
          email: data.user.email || '',
          name: data.user.name || '',
          role: data.user.role || 'member',
          createdAt: data.user.createdAt ? new Date(data.user.createdAt) : new Date(),
          updatedAt: data.user.updatedAt ? new Date(data.user.updatedAt) : new Date(),
          ...data.user // Дополнительные поля
        };

        // Сохраняем в localStorage
        localStorage.setItem('auth_user', JSON.stringify(userData));
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }

        // Устанавливаем флаги для приветствия
        sessionStorage.setItem('show_welcome_toast', 'true');
        sessionStorage.setItem('welcome_user_role', 'member');
        sessionStorage.setItem('is_redirecting', 'true');

        // Определяем целевой URL
        let targetUrl = '/member-dashboard';

        if (redirectPath) {
          try {
            const decodedRedirect = decodeURIComponent(redirectPath);
            if (decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//')) {
              targetUrl = decodedRedirect;
              console.log('🎯 Redirect to requested page:', targetUrl);
            }
          } catch (error) {
            console.error('❌ Error decoding redirect path');
          }
        }

        // ВАЖНО: НЕ скрываем loader здесь!
        // Loader должен оставаться видимым до загрузки новой страницы

        // Делаем редирект после анимации loader (1.5 сек)
        setTimeout(() => {
          console.log('🚀 Redirecting to:', targetUrl);

          // Используем window.location.replace для полной перезагрузки
          window.location.replace(targetUrl);

          // НЕ вызываем hideLoader() - пусть новая страница сама управляет
        }, 1500);

        // Устанавливаем user в состояние
        setUser(userData);
        setLoading(false);

        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('💥 Login error:', error);

      // При ошибке скрываем loader
      const { hideLoader } = useLoaderStore.getState();
      hideLoader();

      sessionStorage.removeItem('is_redirecting');

      const errorMessage = error instanceof Error ? error.message : 'Ошибка входа';
      setError(errorMessage);
      setLoading(false);

      // Показываем toast с ошибкой
      if (toast) {
        toast({
          variant: "destructive",
          title: "Ошибка входа",
          description: errorMessage,
        });
      }

      return false;
    }
  }, [toast]);

  // ✅ logout остается без изменений (уже правильный)
  const logout = async (skipRedirect: boolean = false): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 AuthProvider: НАЧАЛО logout...', { skipRedirect });

      // Устанавливаем флаг для Vercel
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('logout_in_progress', 'true');
      }

      // Сначала очищаем React состояние
      setUser(null);
      setToken(null);
      setAuthStatus({ authenticated: false });

      // Триггерим события logout
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-logout'));
        document.dispatchEvent(new Event('auth-logout'));

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'LOGOUT'
          });
        }

        window.postMessage({ type: 'CLEAR_AUTH_STORAGE' }, window.location.origin);

        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel('auth_channel');
          channel.postMessage({ type: 'logout' });
          channel.close();
        }
      }

      // Функция очистки
      const clearAuthData = () => {
        const keys = ['auth_user', 'auth_token', 'user', 'token', 'authToken', 'userToken'];

        keys.forEach(key => {
          try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
            localStorage.setItem(key, '');
            localStorage.removeItem(key);
          } catch (e) {
            console.error(`Error clearing ${key}:`, e);
          }
        });
      };

      // Немедленная очистка
      clearAuthData();

      // Вызываем API
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (!response.ok) {
          console.warn('⚠️ API logout вернул ошибку, но продолжаем');
        }
      } catch (apiError) {
        console.warn('⚠️ Ошибка API logout, но продолжаем:', apiError);
      }

      // Повторная очистка после API
      clearAuthData();

      // Задержка перед редиректом
      await new Promise(resolve => setTimeout(resolve, 100));

      // Финальная очистка
      clearAuthData();

      // Убираем флаг
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('logout_in_progress');
      }

      // Редирект только если не пропускаем
      if (!skipRedirect) {
        console.log('🔄 AuthProvider: Выполняем редирект...');
        window.location.href = "/";
      } else {
        console.log('⏭️ AuthProvider: Пропускаем редирект (используется loader)');
      }

    } catch (error) {
      console.error('❌ AuthProvider: критическая ошибка logout:', error);

      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.error('❌ Даже clear() не сработал:', e);
        }
      }

      setUser(null);
      setToken(null);
      setAuthStatus({ authenticated: false });

      if (!skipRedirect) {
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    console.log('🔄 AuthProvider: принудительное обновление пользователя...');
    initialCheckDone.current = false;
    await checkSessionThrottled();
  };

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

// Остальные хуки остаются без изменений...

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

        const userData = {
          id: data.user.id || data.user.userId,
          role: data.user.role,
          email: data.user.email,
          name: data.user.name
        };
        localStorage.setItem('auth_user', JSON.stringify(userData));

        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }

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

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}

export function useAuthStatus() {
  const { authStatus, loading, logout: contextLogout } = useAuth();

  return {
    authStatus,
    isLoading: loading,
    logout: contextLogout
  };
}

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

export function useUser() {
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