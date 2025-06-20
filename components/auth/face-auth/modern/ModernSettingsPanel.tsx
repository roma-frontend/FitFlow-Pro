// components/auth/face-auth/modern/ModernSettingsPanel.tsx
import React from 'react';
import { Settings } from 'lucide-react';

interface ModernSettingsPanelProps {
  showDebugInfo: boolean;
  onToggleDebug: (show: boolean) => void;
}

export const ModernSettingsPanel = React.memo(({
  showDebugInfo,
  onToggleDebug
}: ModernSettingsPanelProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-blue-500" />
        Настройки
      </h3>

      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showDebugInfo}
            onChange={(e) => onToggleDebug(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-300"
          />
          <span className="text-gray-700">
            Показать отладочную информацию
          </span>
        </label>
      </div>
    </div>
  );
});

ModernSettingsPanel.displayName = 'ModernSettingsPanel';
