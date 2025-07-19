// hooks/useAuth.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ с правильным loader

"use client";

import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { User } from '@/lib/simple-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useLoaderStore } from "@/stores/loaderStore";

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
  };

  return dashboardUrls[role] || '/';
};

// Функция для получения названия роли
const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    'admin': 'Администратор',
    'super-admin': 'Супер-админ',
    'manager': 'Менеджер',
    'trainer': 'Тренер',
    'client': 'Клиент',
    'member': 'Участник',
  };

  return roleNames[role] || 'Пользователь';
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

  const showLoader = useLoaderStore((state) => state.showLoader);
  const hideLoader = useLoaderStore((state) => state.hideLoader);

  // Предотвращаем множественные вызовы checkSession
  const checkingSession = useRef(false);
  const lastCheckTime = useRef(0);
  const CHECK_THROTTLE = 1000;
  const initialCheckDone = useRef(false);

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

  const login = async (email: string, password: string, redirectUrl?: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔐 AuthProvider: попытка входа для:', email, 'redirectUrl:', redirectUrl);

      // Определяем endpoint на основе текущего пути
      let endpoint = '/api/auth/login';
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath.includes('member-login')) {
          endpoint = '/api/auth/member-login';
          console.log('👥 AuthProvider: определили member-login по пути:', currentPath);
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          redirectUrl
        }),
      });

      const data = await response.json();
      console.log('🔐 AuthProvider: результат входа:', {
        status: response.status,
        success: data.success,
        hasUser: !!data.user,
        userRole: data.user?.role,
        redirectUrl: data.redirectUrl || data.dashboardUrl
      });

      if (!response.ok) {
        console.error('❌ AuthProvider: ошибка входа:', data.error || 'Unknown error');
        return false;
      }

      if (data.success && data.user) {
        console.log('✅ AuthProvider: вход успешен:', data.user);

        // Создаем объект пользователя
        const userData: User = {
          id: data.user.userId || data.user.id,
          role: data.user.role,
          email: data.user.email,
          name: data.user.name,
          avatar: data.user.avatar,
          createdAt: data.user.createdAt || new Date().toISOString(),
          updatedAt: data.user.updatedAt || new Date().toISOString()
        };

        console.log('👤 AuthProvider: созданный объект пользователя:', userData);

        // Сохраняем в localStorage
        try {
          const userJson = JSON.stringify(userData);
          localStorage.setItem('auth_user', userJson);
          console.log('💾 AuthProvider: данные пользователя сохранены в localStorage');

          const savedUser = localStorage.getItem('auth_user');
          console.log('✅ AuthProvider: проверка сохранения:', !!savedUser);
        } catch (storageError) {
          console.error('❌ AuthProvider: ошибка сохранения в localStorage:', storageError);
        }

        // Сохраняем токен
        if (data.token) {
          try {
            localStorage.setItem('auth_token', data.token);
            setToken(data.token);
            console.log('💾 AuthProvider: токен сохранен в localStorage');
          } catch (tokenError) {
            console.error('❌ AuthProvider: ошибка сохранения токена:', tokenError);
          }
        }

        // Устанавливаем пользователя в состояние
        setUser(userData);

        // Обновляем authStatus
        const newAuthStatus = {
          authenticated: true,
          user: {
            id: userData.id,
            role: userData.role,
            email: userData.email,
            name: userData.name
          },
          dashboardUrl: getDashboardUrl(userData.role)
        };
        setAuthStatus(newAuthStatus);

        const targetUrl = data.redirectUrl || data.dashboardUrl || getDashboardUrl(userData.role);
        console.log('🎯 AuthProvider: целевой URL:', targetUrl);
        console.log('✅ AuthProvider: возвращаем success, управление loader остается у вызывающего кода');

        return true;
      }

      console.log('❌ AuthProvider: вход неуспешен, нет данных пользователя');
      return false;
    } catch (error) {
      console.error('❌ AuthProvider: критическая ошибка входа:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (skipRedirect: boolean = false): Promise<void> => {
    try {
      console.log('🚪 AuthProvider: НАЧАЛО logout...', { skipRedirect });

      // ✅ ИСПРАВЛЕНО: Показываем loader при logout
      console.log('📱 AuthProvider: показываем logout loader...');
      showLoader("logout", {
        userRole: user?.role || "user",
        userName: user?.name || user?.email?.split('@')[0] || getRoleDisplayName(user?.role || "user"),
        redirectUrl: "/"
      });

      // Устанавливаем флаг для Vercel
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('logout_in_progress', 'true');
      }

      // Сначала очищаем React состояние
      console.log('🧹 AuthProvider: очищаем состояние React...');
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
        console.log('🧹 AuthProvider: очищаем localStorage...');
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
        console.log('🌐 AuthProvider: вызываем API logout...');
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
        } else {
          console.log('✅ API logout успешен');
        }
      } catch (apiError) {
        console.warn('⚠️ Ошибка API logout, но продолжаем:', apiError);
      }

      // Повторная очистка после API
      clearAuthData();

      // Задержка для показа loader
      console.log('⏳ AuthProvider: ждем 1.5 секунды для показа logout loader...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Финальная очистка
      clearAuthData();

      // Убираем флаг
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('logout_in_progress');
      }

      // Редирект (если не пропускаем)
      if (!skipRedirect) {
        console.log('🔄 AuthProvider: выполняем редирект на главную...');
        router.push("/");
        // Loader скроется автоматически при загрузке новой страницы
      } else {
        console.log('⏭️ AuthProvider: пропускаем редирект');
        hideLoader();
      }

    } catch (error) {
      console.error('❌ AuthProvider: критическая ошибка logout:', error);

      // Скрываем loader при ошибке
      hideLoader();

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
        router.push("/");
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