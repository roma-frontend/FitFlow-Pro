"use client";

import { memo } from 'react';

interface AuthModeToggleProps {
  isLogin: boolean;
  onToggle: () => void;
  loading: boolean;
  isValidating: boolean;
  onShowForgotPassword: () => void;
}

export const AuthModeToggle = memo(function AuthModeToggle({
  isLogin,
  onToggle,
  loading,
  isValidating,
  onShowForgotPassword
}: AuthModeToggleProps) {
  return (
    <div className="text-center space-y-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={loading || isValidating}
        className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isLogin
          ? "Нет аккаунта? Зарегистрируйтесь"
          : "Уже есть аккаунт? Войдите"}
      </button>

      {/* Ссылка на восстановление пароля только для входа */}
      {isLogin && (
        <div>
          <button
            type="button"
            onClick={onShowForgotPassword}
            disabled={loading || isValidating}
            className="text-blue-600 hover:text-blue-500 text-sm transition-colors disabled:opacity-50"
          >
            Забыли пароль?
          </button>
        </div>
      )}
    </div>
  );
});
