"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; // 🔧 ДОБАВЛЕНО: импорт useAuth

export function useStaffAuth() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetSent, setResetSent] = useState<boolean>(false);
  
  // 🔧 ИЗМЕНЕНО: убрали локальный token state, используем из контекста
  const { user, token } = useAuth();

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (
          data.authenticated &&
          ["admin", "super-admin", "manager", "trainer"].includes(
            data.user?.role
          )
        ) {
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

  const handleStaffLogin = useCallback(async (formData: any): Promise<void> => {
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
        // 🔧 ИЗМЕНЕНО: сохраняем токен в localStorage
        if (data.token) {
          console.log('🎫 Staff Login: сохраняем токен');
          localStorage.setItem('auth_token', data.token);
          
          // 🔧 ВАЖНО: Триггерим обновление контекста
          // Вызываем событие для обновления AuthContext
          window.dispatchEvent(new CustomEvent('auth-token-saved', { 
            detail: { token: data.token, user: data.user } 
          }));
        } else {
          console.warn('⚠️ Staff Login: токен не получен от сервера');
        }

        toast({
          title: "Добро пожаловать!",
          description: `Вы вошли как ${getRoleDisplayName(data.user.role)}`,
        });

        const returnUrl = sessionStorage.getItem("returnUrl");
        if (returnUrl) {
          sessionStorage.removeItem("returnUrl");
          router.push(returnUrl);
          return;
        }

        const destination =
          data.dashboardUrl ||
          redirectPath ||
          getDashboardForRole(data.user.role);

        // 🔧 ИЗМЕНЕНО: даем время на обновление контекста
        setTimeout(() => {
          router.push(destination);
        }, 500);
      } else {
        throw new Error(data.error || `Ошибка ${response.status}`);
      }
    } catch (error) {
      console.error("💥 Ошибка:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Не удалось выполнить операцию";
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, redirectPath, getDashboardForRole, getRoleDisplayName, router]);

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
        // 🔧 ИЗМЕНЕНО: сохраняем токен если он приходит
        if (data.token) {
          console.log('🎫 Password Reset: сохраняем токен');
          localStorage.setItem('auth_token', data.token);
          
          // Триггерим обновление контекста
          window.dispatchEvent(new CustomEvent('auth-token-saved', { 
            detail: { token: data.token } 
          }));
        }
        
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

  const handleSuperAdminQuickLogin = useCallback(async (): Promise<void> => {
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
        // 🔧 ДОБАВЛЕНО: сохраняем токен при быстром входе
        if (result.token) {
          console.log('🎫 Quick Login: сохраняем токен');
          localStorage.setItem('auth_token', result.token);
          
          // Триггерим обновление контекста
          window.dispatchEvent(new CustomEvent('auth-token-saved', { 
            detail: { token: result.token, user: result.user } 
          }));
        }

        toast({
          title: "Быстрый вход выполнен!",
          description: "Вы вошли как супер-администратор",
        });

        const returnUrl = sessionStorage.getItem("returnUrl");
        if (returnUrl) {
          sessionStorage.removeItem("returnUrl");
          router.push(returnUrl);
        } else {
          router.push("/admin");
        }
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
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, router]);

  return {
    isLoading,
    showForgotPassword,
    resetEmail,
    resetSent,
    token, // 🔧 ИЗМЕНЕНО: возвращаем token из контекста

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