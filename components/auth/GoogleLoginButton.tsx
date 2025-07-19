// components/auth/GoogleLoginButton.tsx - БЕЗОПАСНАЯ ВЕРСИЯ
"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoogleLoginButtonProps {
  isStaff?: boolean;
  className?: string;
  disabled?: boolean;
}

// Внутренний компонент который использует useSearchParams
function GoogleLoginButtonInner({ isStaff = false, className = "", disabled }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const redirectParam = searchParams.get('redirect');

  const handleGoogleLogin = async () => {
    // Предотвращаем множественные клики
    if (isLoading) return;
    
    setIsLoading(true);

    // Определяем целевой URL
    let targetUrl = isStaff ? "/admin" : "/member-dashboard";
    if (redirectParam) {
      try {
        const decodedRedirect = decodeURIComponent(redirectParam);
        if (decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//')) {
          targetUrl = decodedRedirect;
        }
      } catch (error) {
        console.error('Error decoding redirect:', error);
      }
    }

    console.log("🔐 Google Login - начало процесса:", { isStaff, targetUrl });

    // Сохраняем состояние в sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('google_login_in_progress', 'true');
      sessionStorage.setItem('google_login_is_staff', isStaff.toString());
      sessionStorage.setItem('google_login_target_url', targetUrl);
      
      if (isStaff) {
        sessionStorage.setItem('google_login_staff_role', 'admin');
      }
    }
    
    try {
      // Вызываем signIn без await, так как будет редирект
      signIn("google", {
        callbackUrl: targetUrl,
        redirect: true,
      });
      
      // Держим кнопку в состоянии загрузки
      // Компонент будет размонтирован при редиректе
    } catch (error) {
      // Обработка ошибок signIn
      console.error("Google signIn error:", error);
      setIsLoading(false);

      // Очищаем флаги при ошибке
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('google_login_in_progress');
        sessionStorage.removeItem('google_login_is_staff');
        sessionStorage.removeItem('google_login_target_url');
        sessionStorage.removeItem('google_login_staff_role');
      }

      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось начать вход через Google. Попробуйте еще раз."
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
          <span>Переход к Google...</span>
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

// Основной компонент с Suspense и ErrorBoundary
export function GoogleLoginButton(props: GoogleLoginButtonProps) {
  return (
    <Suspense 
      fallback={
        <button
          disabled
          className={`w-full flex items-center justify-center gap-3 px-4 py-3 text-md border border-gray-300 rounded-2xl bg-gray-50 opacity-50 cursor-not-allowed ${props.className || ""}`}
        >
          <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
          <span className="font-medium">Войти через Google</span>
        </button>
      }
    >
      <GoogleLoginButtonInner {...props} />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}