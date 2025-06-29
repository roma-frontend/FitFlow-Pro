"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/permissions";

interface StaffLoginResult {
  success: boolean;
  userRole?: UserRole;
  userName?: string;
  dashboardUrl?: string;
}

export function useStaffAuth() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetSent, setResetSent] = useState<boolean>(false);
  
  // Новые состояния для лоадера
  const [showLoader, setShowLoader] = useState(false);
  const [loaderData, setLoaderData] = useState<{
    userRole: UserRole;
    userName: string;
    dashboardUrl: string;
  } | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

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
    switch (role) {
      case "admin":
      case "super-admin":
        return "/admin";
      case "manager":
        return "/manager-dashboard";
      case "trainer":
        return "/trainer-dashboard";
      default:
        return "/staff-dashboard";
    }
  }, []);

  const getRoleDisplayName = useCallback((role: string): string => {
    switch (role) {
      case "admin":
        return "Администратор";
      case "super-admin":
        return "Супер Администратор";
      case "manager":
        return "Менеджер";
      case "trainer":
        return "Тренер";
      default:
        return "Персонал";
    }
  }, []);

  // ✅ Обновленная функция входа с поддержкой лоадера
  const handleStaffLogin = useCallback(async (formData: any): Promise<StaffLoginResult> => {
    setIsLoading(true);

    try {
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

      const data = await response.json();

      if (response.ok && data.success) {
        // 🔧 Сохраняем данные в localStorage
        if (data.user) {
          const userData = {
            id: data.user.id || data.user.userId,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role
          };
          localStorage.setItem('auth_user', JSON.stringify(userData));
          console.log('💾 Данные пользователя сохранены в localStorage');
        }

        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          console.log('💾 Токен сохранен в localStorage');
        }

        // 🎉 Устанавливаем флаг для показа приветствия
        sessionStorage.setItem('show_welcome_toast', 'true');
        sessionStorage.setItem('welcome_user_role', data.user.role);

        const returnUrl = sessionStorage.getItem("returnUrl");
        const destination = returnUrl || data.dashboardUrl || redirectPath || getDashboardForRole(data.user.role);
        
        // Очищаем returnUrl если использовали
        if (returnUrl) {
          sessionStorage.removeItem("returnUrl");
        }

        // 🔥 НОВОЕ: Подготавливаем данные для лоадера
        setLoaderData({
          userRole: data.user.role as UserRole,
          userName: data.user.name || data.user.email,
          dashboardUrl: destination
        });
        
        // Показываем лоадер вместо мгновенного редиректа
        setShowLoader(true);
        
        // Убираем isLoading чтобы форма исчезла
        setIsLoading(false);

        // Возвращаем результат для обратной совместимости
        return {
          success: true,
          userRole: data.user.role as UserRole,
          userName: data.user.name || data.user.email,
          dashboardUrl: destination
        };
      } else {
        throw new Error(data.error || `Ошибка ${response.status}`);
      }
    } catch (error) {
      console.error("💥 Ошибка:", error);
      const errorMessage = error instanceof Error ? error.message : "Не удалось выполнить операцию";
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage,
      });
      setIsLoading(false);
      return { success: false };
    }
  }, [toast, redirectPath, getDashboardForRole]);

  // ✅ Обновленный быстрый вход с поддержкой лоадера
  const handleSuperAdminQuickLogin = useCallback(async (): Promise<StaffLoginResult> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/debug/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-login",
          email: "romangulanyan@gmail.com",
          password: "Hovik-1970",
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 🔧 Сохраняем данные быстрого входа
        if (result.user) {
          const userData = {
            id: result.user.id || result.user.userId,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role
          };
          localStorage.setItem('auth_user', JSON.stringify(userData));
        }

        if (result.token) {
          localStorage.setItem('auth_token', result.token);
        }

        // 🎉 Устанавливаем флаг для показа приветствия
        sessionStorage.setItem('show_welcome_toast', 'true');
        sessionStorage.setItem('welcome_user_role', result.user.role);

        const returnUrl = sessionStorage.getItem("returnUrl");
        const destination = returnUrl || "/admin";
        
        if (returnUrl) {
          sessionStorage.removeItem("returnUrl");
        }

        // 🔥 НОВОЕ: Подготавливаем данные для лоадера
        setLoaderData({
          userRole: result.user.role as UserRole,
          userName: result.user.name || result.user.email,
          dashboardUrl: destination
        });
        
        // Показываем лоадер
        setShowLoader(true);
        setIsLoading(false);

        return {
          success: true,
          userRole: result.user.role as UserRole,
          userName: result.user.name || result.user.email,
          dashboardUrl: destination
        };
      } else {
        throw new Error("Ошибка быстрого входа: " + result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка быстрого входа",
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
      console.error("Quick login error:", error);
      setIsLoading(false);
      return { success: false };
    }
  }, [toast]);

  const handlePasswordReset = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите email адрес",
      });
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

      const data = await response.json();

      if (response.ok && data.success) {
        setResetSent(true);
        toast({
          title: "Письмо отправлено! 📧",
          description: "Проверьте вашу почту для восстановления пароля",
        });
      } else {
        throw new Error(data.error || "Ошибка отправки письма");
      }
    } catch (error) {
      console.error("Ошибка восстановления пароля:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось отправить письмо",
      });
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
    
    // Новые состояния для лоадера
    showLoader,
    loaderData,

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