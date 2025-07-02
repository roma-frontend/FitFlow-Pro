// components/auth/GoogleLoginButton.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
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
  const router = useRouter();
  const showLoader = useLoaderStore((state) => state.showLoader);
  const hideLoader = useLoaderStore((state) => state.hideLoader);
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  
  const redirectParam = searchParams.get('redirect');

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Определяем callbackUrl
      let callbackUrl = isStaff ? "/staff-dashboard" : "/member-dashboard";
      if (redirectParam) {
        callbackUrl = redirectParam;
      }

      console.log("🔐 Google Login - начало процесса:", { isStaff, callbackUrl });

      // Выполняем вход через NextAuth
      const result = await signIn("google", {
        callbackUrl,
        redirect: false, // Не делаем автоматический редирект
      });

      console.log("🔐 Google Login - результат:", result);

      if (result?.error) {
        console.error("Google login error:", result.error);
        toast({
          variant: "destructive",
          title: "Ошибка входа",
          description: result.error === "AccessDenied" 
            ? "У вас нет доступа к этой части системы" 
            : "Не удалось войти через Google"
        });
        setIsLoading(false);
      } else if (result?.ok) {
        console.log("✅ Google login успешен");
        
        // Обновляем состояние аутентификации
        await refreshUser();
        
        // Устанавливаем флаги для приветствия
        sessionStorage.setItem('show_welcome_toast', 'true');
        sessionStorage.setItem('welcome_user_role', isStaff ? 'staff' : 'member');
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при входе"
      });
      setIsLoading(false);
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
          <span>Подключение...</span>
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