// components/auth/SubmitButton.tsx - обновленная версия
"use client";

import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Shield, UserPlus } from "lucide-react";

interface SubmitButtonProps {
  isLogin: boolean;
  loading: boolean;
  isFormReady: boolean;
  isValidating: boolean;
}

export const SubmitButton = memo(function SubmitButton({
  isLogin,
  loading,
  isFormReady,
  isValidating
}: SubmitButtonProps) {
  const IconComponent = isLogin ? Shield : UserPlus;
  
  return (
    <div className="pt-2">
      <Button
        type="submit"
        disabled={loading || !isFormReady || isValidating}
        className={`w-full h-12 text-base font-medium transition-all duration-300 transform ${
          isFormReady && !isValidating
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02] text-white' 
            : 'bg-gray-400 cursor-not-allowed text-gray-600'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            {isLogin ? "Входим..." : "Создаем аккаунт..."}
          </>
        ) : isValidating ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Проверка данных...
          </>
        ) : (
          <>
            <IconComponent className="h-5 w-5 mr-2" />
            {isLogin ? "Войти в систему" : "Создать аккаунт"}
          </>
        )}
      </Button>
    </div>
  );
});
