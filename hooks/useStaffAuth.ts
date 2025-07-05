// hooks/useStaffAuth.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useLoaderStore } from "@/stores/loaderStore";

interface StaffLoginResult {
  success: boolean;
  userRole?: string;
  userName?: string;
  dashboardUrl?: string;
}

// Безопасная функция для получения параметров URL
function getUrlParams(): URLSearchParams | null {
  if (typeof window === 'undefined') return null;
  try {
    return new URLSearchParams(window.location.search);
  } catch (error) {
    console.error('Error parsing URL params:', error);
    return null;
  }
}

export function useStaffAuth() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const {showLoader, hideLoader} = useLoaderStore()

  const { toast } = useToast();
  const router = useRouter();

  // Получаем redirect параметр безопасно
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = getUrlParams();
      const redirect = params?.get("redirect") || null;
      setRedirectPath(redirect);
    }
  }, []);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Сначала проверяем localStorage
        const storedUser = localStorage.getItem('auth_user');
        const storedToken = localStorage.getItem('auth_token');

        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          if (["admin", "super-admin", "manager", "trainer"].includes(user.role)) {
            const dashboardUrl = getDashboardForRole(user.role);
            router.replace(dashboardUrl);
            return;
          }
        }

        // Если нет в localStorage, проверяем через API
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (
          data.authenticated &&
          ["admin", "super-admin", "manager", "trainer"].includes(
            data.user?.role
          )
        ) {
          // Сохраняем в localStorage если пришло из API
          if (data.user) {
            localStorage.setItem('auth_user', JSON.stringify(data.user));
          }
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }

          const dashboardUrl = getDashboardForRole(data.user.role);
          router.replace(dashboardUrl);
        }
      } catch (error) {
        console.log("Проверка авторизации не удалась:", error);
      }
    };

    checkAuth();
  }, [router]);

  const getDashboardForRole = useCallback((role: string): string => {
    const dashboards: { [key: string]: string } = {
      "admin": "/admin",
      "super-admin": "/admin",
      "manager": "/manager-dashboard",
      "trainer": "/trainer-dashboard"
    };
    return dashboards[role] || "/staff-dashboard";
  }, []);

  const getRoleDisplayName = useCallback((role: string): string => {
    const roleNames: { [key: string]: string } = {
      "admin": "Администратор",
      "super-admin": "Супер Администратор",
      "manager": "Менеджер",
      "trainer": "Тренер"
    };
    return roleNames[role] || "Персонал";
  }, []);

const handleStaffLogin = useCallback(async (formData: {
  email: string;
  password: string;
  role?: string;
}): Promise<StaffLoginResult> => {
  setIsLoading(true);
  
  // Устанавливаем флаг редиректа
  sessionStorage.setItem('is_redirecting', 'true');

  try {
    console.log('🔐 Staff login attempt:', { email: formData.email });

    // Показываем loader
    showLoader("login", {
      userRole: "admin",
      userName: formData.email.split('@')[0] || "Персонал",
      dashboardUrl: redirectPath || "/staff-dashboard"
    });

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.user) {
      console.log('✅ Staff login successful:', data.user.role);

      // Сохраняем данные пользователя
      if (typeof window !== 'undefined') {
        try {
          const userData = {
            id: data.user.id || data.user.userId,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role
          };
          localStorage.setItem('auth_user', JSON.stringify(userData));

          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }

          sessionStorage.setItem('show_welcome_toast', 'true');
          sessionStorage.setItem('welcome_user_role', data.user.role);
        } catch (storageError) {
          console.error('❌ Storage error:', storageError);
        }
      }

      const returnUrl = sessionStorage.getItem("returnUrl");
      const destination = returnUrl || data.dashboardUrl || redirectPath || getDashboardForRole(data.user.role);

      if (returnUrl) {
        sessionStorage.removeItem("returnUrl");
      }

      // Обновляем loader с правильными данными
      showLoader("login", {
        userRole: data.user.role,
        userName: data.user.name || data.user.email,
        dashboardUrl: destination
      });

      // ВАЖНО: НЕ скрываем loader здесь!
      // Loader должен оставаться активным до полной загрузки новой страницы
      
      // Делаем редирект после завершения анимации loader
      setTimeout(() => {
        console.log('🎯 Staff login: redirect to', destination);
        
        // Используем window.location.replace для полной перезагрузки
        // это гарантирует, что loader останется видимым до загрузки новой страницы
        window.location.replace(destination);
        
        // НЕ вызываем hideLoader() здесь - пусть новая страница сама управляет loader
      }, 1500); // Ждем завершения анимации loader

      return {
        success: true,
        userRole: data.user.role,
        userName: data.user.name || data.user.email,
        dashboardUrl: destination
      };
    } else {
      throw new Error(data.error || "Неверные учетные данные");
    }
  } catch (error) {
    console.error("💥 Staff login error:", error);

    hideLoader();
    sessionStorage.removeItem('is_redirecting');

    const errorMessage = error instanceof Error ? error.message : "Не удалось выполнить операцию";

    if (toast) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage,
      });
    }

    setIsLoading(false);
    return { success: false };
  }
}, [toast, router, getDashboardForRole, redirectPath, showLoader, hideLoader]);

// Аналогично для handleSuperAdminQuickLogin:
const handleSuperAdminQuickLogin = useCallback(async (): Promise<StaffLoginResult> => {
  setIsLoading(true);
  
  // Устанавливаем флаг редиректа
  sessionStorage.setItem('is_redirecting', 'true');

  try {
    console.log('🚀 Quick admin login attempt');

    showLoader("login", {
      userRole: "super-admin",
      userName: "Супер Админ",
      dashboardUrl: "/admin"
    });

    const response = await fetch("/api/debug/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "test-login",
        email: "romangulanyan@gmail.com",
        password: "Hovik-1970",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.user) {
      console.log('✅ Quick login successful');

      if (typeof window !== 'undefined') {
        try {
          const userData = {
            id: result.user.id || result.user.userId,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role
          };
          localStorage.setItem('auth_user', JSON.stringify(userData));

          if (result.token) {
            localStorage.setItem('auth_token', result.token);
          }

          sessionStorage.setItem('show_welcome_toast', 'true');
          sessionStorage.setItem('welcome_user_role', result.user.role);
        } catch (storageError) {
          console.error('❌ Storage error:', storageError);
        }
      }

      const returnUrl = sessionStorage.getItem("returnUrl");
      const destination = returnUrl || "/admin";

      if (returnUrl) {
        sessionStorage.removeItem("returnUrl");
      }

      showLoader("login", {
        userRole: result.user.role,
        userName: result.user.name || result.user.email,
        dashboardUrl: destination
      });

      // НЕ скрываем loader здесь!
      setTimeout(() => {
        console.log('🎯 Quick login: redirect to', destination);
        
        // Используем window.location.replace для полной перезагрузки
        window.location.replace(destination);
      }, 1500);

      return {
        success: true,
        userRole: result.user.role,
        userName: result.user.name || result.user.email,
        dashboardUrl: destination
      };
    } else {
      throw new Error("Ошибка быстрого входа: " + (result.error || "Неизвестная ошибка"));
    }
  } catch (error) {
    console.error("💥 Quick login error:", error);

    hideLoader();
    sessionStorage.removeItem('is_redirecting');

    if (toast) {
      toast({
        variant: "destructive",
        title: "Ошибка быстрого входа",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }

    setIsLoading(false);
    return { success: false };
  }
}, [toast, router, showLoader, hideLoader]);

  const handlePasswordReset = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      if (toast) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Введите email адрес",
        });
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
          userType: "staff",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setResetSent(true);
        if (toast) {
          toast({
            title: "Письмо отправлено! 📧",
            description: "Проверьте вашу почту для восстановления пароля",
          });
        }
      } else {
        throw new Error(data.error || "Ошибка отправки письма");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      
      if (toast) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: error instanceof Error ? error.message : "Не удалось отправить письмо",
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [resetEmail, toast]);

  return {
    isLoading,
    showForgotPassword,
    resetEmail,
    resetSent,
    setIsLoading,
    
    setShowForgotPassword,
    setResetEmail,
    setResetSent,
    handleStaffLogin,
    handlePasswordReset,
    handleSuperAdminQuickLogin,

    getDashboardForRole,
    getRoleDisplayName,
  };
}