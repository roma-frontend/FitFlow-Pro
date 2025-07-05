// components/auth/SubmitButton.tsx
"use client";

import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Shield, UserPlus } from "lucide-react";

interface SubmitButtonProps {
  isLogin: boolean;
  loading: boolean;
  isFormReady: boolean;
  isValidating: boolean;
  redirectParam?: string | null;
  isRedirecting?: boolean;
}

export const SubmitButton = memo(function SubmitButton({
  isLogin,
  loading,
  isFormReady,
  isValidating,
  redirectParam,
  isRedirecting
}: SubmitButtonProps) {
  const IconComponent = isLogin ? Shield : UserPlus;
  
  return (
    <Button
      type="submit"
      disabled={loading || !isFormReady || isValidating}
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          {isRedirecting ? "Перенаправление..." : (isLogin ? "Входим..." : "Создаем аккаунт...")}
        </div>
      ) : isValidating ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Проверка данных...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <IconComponent className="h-5 w-5 mr-2" />
          {isLogin ? "Войти в систему" : "Создать аккаунт"}
        </div>
      )}
    </Button>
  );
});