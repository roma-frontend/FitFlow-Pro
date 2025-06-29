// components/face-auth/StatusPanel.tsx - ПРОВЕРИТЬ интерфейс
"use client";

import React, { memo } from 'react';
import { User, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useFaceAuthContext } from './FaceAuthProvider';
import { StatusPanelProps } from '@/types/face-auth.types';

const StatusPanel = memo(({ mode, authenticated }: StatusPanelProps) => {
  const { state } = useFaceAuthContext();

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <User className="w-6 h-6 mr-2 text-blue-500" />
        {mode === "login" ? "Статус аутентификации" : "Статус регистрации"}
      </h3>

      {state.authStatus ? (
        <div className={`p-4 rounded-xl border-2 ${
            state.authStatus.authenticated
              ? "bg-green-50/80 border-green-200 backdrop-blur-sm"
              : "bg-red-50/80 border-red-200 backdrop-blur-sm"
          }`}>
          <div className="flex items-center mb-3">
            {state.authStatus.authenticated ? (
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 mr-2" />
            )}
            <span className={`font-semibold ${
                state.authStatus.authenticated ? "text-green-800" : "text-red-800"
              }`}>
              {state.authStatus.authenticated
                ? mode === "login" ? "Аутентификация успешна" : "Face ID зарегистрирован"
                : mode === "login" ? "Доступ запрещен" : "Ошибка регистрации"}
            </span>
          </div>

          {state.authStatus.user && (
            <div className="text-gray-700 mb-2">
              Пользователь:{" "}
              <span className="font-medium text-green-700">
                {state.authStatus.user.name || state.authStatus.user.email || state.authStatus.user}
              </span>
            </div>
          )}

          {state.authStatus.loading && (
            <div className="text-gray-600 text-sm flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Обработка...
            </div>
          )}
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

StatusPanel.displayName = 'StatusPanel';

export default StatusPanel;
