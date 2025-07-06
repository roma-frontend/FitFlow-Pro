// components/auth/UniversalSubmitButton.tsx
"use client";

import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Shield, UserPlus, KeyRound, CheckCircle } from "lucide-react";

export interface UniversalSubmitButtonProps {
  type?: "login" | "register" | "staff-login";
  isLogin?: boolean;
  loading: boolean;
  isFormReady: boolean;
  isValidating: boolean;
  submitText?: string;
  className?: string;
  redirectParam?: string | null;
  isRedirecting?: boolean;
}

export const UniversalSubmitButton = memo(function UniversalSubmitButton({
  type,
  isLogin,
  loading,
  isFormReady,
  isValidating,
  submitText,
  className = "",
  redirectParam,
  isRedirecting
}: UniversalSubmitButtonProps) {
  // Определяем тип формы на основе пропсов
  const formType = type || (isLogin !== undefined ? (isLogin ? "login" : "register") : "login");
  
  // Определяем иконку в зависимости от типа формы
  const getIcon = () => {
    switch (formType) {
      case "register":
        return UserPlus;
      case "staff-login":
        return KeyRound;
      case "login":
      default:
        return Shield;
    }
  };

  // Определяем текст кнопки
  const getButtonText = () => {
    if (submitText) return submitText;
    
    switch (formType) {
      case "register":
        return "Зарегистрироваться";
      case "staff-login":
        return "Войти в систему";
      case "login":
      default:
        return "Войти";
    }
  };

  // Определяем текст загрузки
  const getLoadingText = () => {
    if (isRedirecting) {
      return "Перенаправление...";
    }
    
    switch (formType) {
      case "register":
        return "Создаем аккаунт...";
      case "staff-login":
        return "Проверяем доступ...";
      case "login":
      default:
        return redirectParam ? "Входим и перенаправляем..." : "Входим...";
    }
  };

  // Определяем стили в зависимости от состояния
  const getButtonStyles = () => {
    const baseStyles = "w-full h-11 font-medium rounded-lg transition-all duration-200 shadow-lg";
    
    if (!isFormReady || isValidating) {
      return `${baseStyles} bg-gradient-to-r from-gray-400 to-gray-600 cursor-not-allowed opacity-60`;
    }

    switch (formType) {
      case "staff-login":
        return `${baseStyles} bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl text-white`;
      case "register":
        return `${baseStyles} bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl text-white`;
      case "login":
      default:
        return `${baseStyles} bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl text-white`;
    }
  };

  const IconComponent = getIcon();

  return (
    <Button
      type="submit"
      disabled={loading || !isFormReady || isValidating || isRedirecting}
      className={`${getButtonStyles()} ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          {getLoadingText()}
        </div>
      ) : isValidating ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Проверка данных...
        </div>
      ) : isFormReady ? (
        <div className="flex items-center justify-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {getButtonText()}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <IconComponent className="h-5 w-5 mr-2" />
          {getButtonText()}
        </div>
      )}
    </Button>
  );
});