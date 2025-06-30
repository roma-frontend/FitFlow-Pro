// hooks/useCombinedAuth.ts
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useAuth } from "./useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoaderStore } from "@/stores/loaderStore";

interface CombinedAuthResult {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectUrl?: string) => Promise<boolean>;
  loginWithGoogle: (redirectUrl?: string) => Promise<void>;
  logout: (skipRedirect?: boolean) => Promise<void>;
}

export function useCombinedAuth(): CombinedAuthResult {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const { 
    user: legacyUser, 
    login: legacyLogin, 
    logout: legacyLogout,
    loading: legacyLoading 
  } = useAuth();
  
  const router = useRouter();
  const showLoader = useLoaderStore((state) => state.showLoader);
  const hideLoader = useLoaderStore((state) => state.hideLoader);

  // Синхронизация NextAuth сессии с legacy системой
  useEffect(() => {
    if (nextAuthSession?.user && !legacyUser) {
      // Если есть NextAuth сессия, но нет legacy сессии
      const userData = {
        id: nextAuthSession.user.id,
        email: nextAuthSession.user.email,
        name: nextAuthSession.user.name,
        role: nextAuthSession.user.role || 'member'
      };
      
      // Сохраняем в localStorage для совместимости
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      // Триггерим событие для обновления legacy системы
      window.dispatchEvent(new Event('auth-update'));
    }
  }, [nextAuthSession, legacyUser]);

  // Определяем текущего пользователя (приоритет у NextAuth)
  const currentUser = nextAuthSession?.user || legacyUser;
  const isLoading = nextAuthStatus === "loading" || legacyLoading;
  const isAuthenticated = !!currentUser;

  // Комбинированный login
  const login = async (email: string, password: string, redirectUrl?: string): Promise<boolean> => {
    try {
      // Сначала пробуем legacy login
      const legacyResult = await legacyLogin(email, password, redirectUrl);
      
      if (legacyResult) {
        // Также делаем вход через NextAuth для синхронизации
        await signIn('credentials', {
          email,
          password,
          redirect: false
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Combined login error:", error);
      return false;
    }
  };

  // Google login
  const loginWithGoogle = async (redirectUrl?: string) => {
    try {
      showLoader("login", {
        userRole: "member",
        userName: "Google User",
        dashboardUrl: redirectUrl || "/member-dashboard"
      });

      const result = await signIn("google", {
        callbackUrl: redirectUrl || "/member-dashboard",
        redirect: false
      });

      if (result?.ok) {
        sessionStorage.setItem('show_welcome_toast', 'true');
        sessionStorage.setItem('welcome_user_role', 'member');
        
        setTimeout(() => {
          window.location.href = result.url || redirectUrl || "/member-dashboard";
        }, 500);
      } else {
        hideLoader();
        throw new Error(result?.error || "Google login failed");
      }
    } catch (error) {
      hideLoader();
      throw error;
    }
  };

  // Комбинированный logout
  const logout = async (skipRedirect: boolean = false) => {
    try {
      // Выходим из обеих систем
      await Promise.all([
        legacyLogout(true), // skipRedirect = true
        signOut({ redirect: false })
      ]);
      
      // Очищаем все данные
      localStorage.clear();
      sessionStorage.clear();
      
      if (!skipRedirect) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Combined logout error:", error);
      // В любом случае делаем редирект
      if (!skipRedirect) {
        window.location.href = "/";
      }
    }
  };

  return {
    user: currentUser,
    loading: isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout
  };
}