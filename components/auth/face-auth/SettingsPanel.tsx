// components/face-auth/SettingsPanel.tsx - ОБНОВЛЕННАЯ версия
"use client";

import React, { memo } from 'react';
import { Settings, Eye, EyeOff, Bug } from 'lucide-react';
import { useFaceAuthContext } from './FaceAuthProvider';

interface SettingsPanelProps {
  showDebugInfo: boolean;
  onToggleDebug: (show: boolean) => void;
}

const SettingsPanel = memo(({ showDebugInfo, onToggleDebug }: SettingsPanelProps) => {
  const { state, actions } = useFaceAuthContext();

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-gray-500" />
        Настройки
      </h3>

      <div className="space-y-4">
        {/* Переключатель отладочной информации */}
        <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg">
          <div className="flex items-center">
            <Bug className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-sm text-gray-700">Отладочная информация</span>
          </div>
          <button
            onClick={actions.toggleDebugInfo}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              state.showDebugInfo ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                state.showDebugInfo ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Статус камеры */}
        <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${state.cameraActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-700">Статус камеры</span>
          </div>
          <span className={`text-sm font-medium ${state.cameraActive ? 'text-green-600' : 'text-red-600'}`}>
            {state.cameraActive ? 'Активна' : 'Неактивна'}
          </span>
        </div>

        {/* Статус сканирования */}
        <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${state.isScanning ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-700">Сканирование</span>
          </div>
          <span className={`text-sm font-medium ${state.isScanning ? 'text-blue-600' : 'text-gray-600'}`}>
            {state.isScanning ? 'Активно' : 'Остановлено'}
          </span>
        </div>

        {/* Информация о сессии */}
        <div className="p-3 bg-gray-50/80 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">ID сессии:</div>
          <div className="text-xs font-mono text-gray-700 break-all">{state.sessionId}</div>
        </div>

        {/* Быстрые действия */}
        <div className="pt-3 border-t border-gray-200/50">
          <div className="text-xs text-gray-500 mb-2">Быстрые действия:</div>
          <div className="flex space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              🔄 Перезагрузить
            </button>
            <button
              onClick={() => console.clear()}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              🧹 Очистить консоль
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

SettingsPanel.displayName = 'SettingsPanel';

export default SettingsPanel;
