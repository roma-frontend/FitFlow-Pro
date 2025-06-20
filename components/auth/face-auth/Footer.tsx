// components/face-auth/Footer.tsx - ИСПРАВЛЕННАЯ версия
"use client";

import React, { memo } from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { FooterProps, PlatformSwitcherProps, SwitchModeType } from '@/types/face-auth.types';

const Footer = memo(({ sessionId, onSwitchMode }: FooterProps & PlatformSwitcherProps) => (
  <div className="text-center">
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl">
      <div className="flex items-center justify-center mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="text-gray-800 font-semibold">
          Advanced Face Recognition System
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        Оснащено ИИ детекцией, биометрическим анализом и end-to-end шифрованием
      </p>

      <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 mb-4">
        <FeatureItem text="Реальная детекция лица" />
        <FeatureItem text="Биометрический анализ" />
        <FeatureItem text="Защищенная передача" />
      </div>

      {/* Session ID */}
      <div className="text-xs text-gray-400 mb-4">
        Session ID: {sessionId}
      </div>

      {/* Переключатель режимов */}
      {onSwitchMode && <ModeSwitch onSwitchMode={onSwitchMode} />}
    </div>
  </div>
));

const FeatureItem = memo(({ text }: { text: string }) => (
  <div className="flex items-center">
    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
    {text}
  </div>
));

// 🔥 ИСПРАВЛЕНО: Изменен тип параметра с string на SwitchModeType
const ModeSwitch = memo(({ onSwitchMode }: { onSwitchMode: (mode: SwitchModeType) => void }) => (
  <div className="mt-4 pt-4 border-t border-gray-200/50">
    <div className="flex items-center justify-center space-x-4">
      <span className="text-green-600 font-medium text-sm">
        ✨ Modern UI (Активный)
      </span>
    </div>
  </div>
));

FeatureItem.displayName = 'FeatureItem';
ModeSwitch.displayName = 'ModeSwitch';
Footer.displayName = 'Footer';

export default Footer;
