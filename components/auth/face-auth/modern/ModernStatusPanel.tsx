// components/auth/face-auth/modern/ModernStatusPanel.tsx
import React from 'react';
import { User, CheckCircle, XCircle, Eye } from 'lucide-react';

interface AuthStatus {
  authenticated: boolean;
  confidence: number;
  user?: string;
}

interface ModernStatusPanelProps {
  mode: "login" | "register";
  authStatus: AuthStatus | null;
}

export const ModernStatusPanel = React.memo(({
  mode,
  authStatus
}: ModernStatusPanelProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <User className="w-6 h-6 mr-2 text-blue-500" />
        {mode === "login" ? "Статус аутентификации" : "Статус регистрации"}
      </h3>

      {authStatus ? (
        <div className={`p-4 rounded-xl border-2 ${
            authStatus.authenticated
              ? "bg-green-50/80 border-green-200 backdrop-blur-sm"
              : "bg-red-50/80 border-red-200 backdrop-blur-sm"
          }`}>
          <div className="flex items-center mb-3">
            {authStatus.authenticated ? (
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 mr-2" />
            )}
            <span className={`font-semibold ${
                authStatus.authenticated ? "text-green-800" : "text-red-800"
              }`}>
              {authStatus.authenticated
                ? mode === "login" ? "Аутентификация успешна" : "Face ID зарегистрирован"
                : mode === "login" ? "Доступ запрещен" : "Ошибка регистрации"}
            </span>
          </div>

          {authStatus.user && (
            <div className="text-gray-700 mb-2">
              Пользователь:{" "}
              <span className="font-medium text-green-700">
                {authStatus.user}
              </span>
            </div>
          )}

          <div className="text-gray-600 text-sm">
            Уверенность: {authStatus.confidence.toFixed(1)}%
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200 text-center">
          <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">
            {mode === "login" ? "Ожидание сканирования" : "Готов к регистрации Face ID"}
          </p>
        </div>
      )}
    </div>
  );
});

ModernStatusPanel.displayName = 'ModernStatusPanel';
