// components/auth/GoogleLoginButton.tsx - ОКОНЧАТЕЛЬНО ИСПРАВЛЕННАЯ ВЕРСИЯ
"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLoaderStore } from "@/stores/loaderStore";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface GoogleLoginButtonProps {
  isStaff?: boolean;
  className?: string;
  disabled?: boolean;
}

export function GoogleLoginButton({ isStaff = false, className = "", disabled }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const showLoader = useLoaderStore((state) => state.showLoader);
  const hideLoader = useLoaderStore((state) => state.hideLoader);
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  
  const redirectParam = searchParams.get('redirect');

  // ✅ ВАЖНО: Проверяем если мы вернулись после Google OAuth
  useEffect(() => {
    const checkGoogleReturn = async () => {
      // Проверяем есть ли параметры OAuth в URL
      const urlParams = new URLSearchParams(window.location.search);
      const state = urlParams.get('state');
      const code = urlParams.get('code');
      
      // Если есть код от Google и мы на странице входа, значит OAuth прошел
      if (code && (window.location.pathname.includes('login'))) {
        console.log('🔄 Обнаружен возврат после Google OAuth, показываем loader...');
        
        // Показываем loader сразу при обнаружении возврата
        showLoader("login", {
          userRole: isStaff ? "admin" : "member",
          userName: "Пользователь",
          dashboardUrl: redirectParam || (isStaff ? "/staff-dashboard" : "/member-dashboard")
        });

        // Ждем обновления сессии
        try {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Даем время NextAuth обработать
          await refreshUser();
          
          // Через 2 секунды скрываем loader и делаем редирект
          setTimeout(() => {
            hideLoader();
            const targetUrl = redirectParam || (isStaff ? "/staff-dashboard" : "/member-dashboard");
            window.location.href = targetUrl;
          }, 2000);
          
        } catch (error) {
          console.error('❌ Ошибка при обработке возврата Google:', error);
          hideLoader();
        }
      }
    };

    checkGoogleReturn();
  }, [isStaff, redirectParam, showLoader, hideLoader, refreshUser]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Определяем callbackUrl
      let callbackUrl = isStaff ? "/staff-dashboard" : "/member-dashboard";
      if (redirectParam) {
        callbackUrl = redirectParam;
      }

      console.log("🔐 Google Login - начало процесса:", { isStaff, callbackUrl });

      // ✅ НЕ показываем loader здесь, так как NextAuth сделает серверный редирект
      // Loader будет показан при возврате в useEffect

      // Сохраняем состояние в sessionStorage для восстановления после OAuth
      sessionStorage.setItem('google_login_in_progress', 'true');
      sessionStorage.setItem('google_login_is_staff', isStaff.toString());
      if (redirectParam) {
        sessionStorage.setItem('google_login_redirect', redirectParam);
      }

      // ✅ КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Используем redirect: true для серверного редиректа
      const result = await signIn("google", {
        callbackUrl,
        redirect: true, // ✅ Включаем серверный редирект
      });

      // Этот код может не выполниться из-за redirect: true
      console.log("🔐 Google Login - результат:", result);

    } catch (error) {
      console.error("Google login error:", error);
      setIsLoading(false);
      
      // Очищаем sessionStorage при ошибке
      sessionStorage.removeItem('google_login_in_progress');
      sessionStorage.removeItem('google_login_is_staff');
      sessionStorage.removeItem('google_login_redirect');
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при входе через Google"
      });
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 text-md border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Подключение к Google...</span>
        </>
      ) : (
        <>
          <GoogleIcon />
          <span className="font-medium">Войти через Google</span>
        </>
      )}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );
}