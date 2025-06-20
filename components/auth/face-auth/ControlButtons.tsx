// components/face-auth/ControlButtons.tsx
"use client";

import React, { memo } from 'react';
import { Camera, XCircle } from 'lucide-react';
import { useFaceAuthContext } from './FaceAuthProvider';
import { FaceAuthMode } from '@/types/face-auth.types';

interface ControlButtonsProps {
  mode: FaceAuthMode;
  onStartScanning: () => void;
  onStopScanning: () => void;
}

const ControlButtons = memo(({ mode, onStartScanning, onStopScanning }: ControlButtonsProps) => {
  const { state } = useFaceAuthContext();

  return (
    <div className="flex justify-center mt-6 space-x-4">
      {!state.isScanning ? (
        <button
          onClick={onStartScanning}
          disabled={state.isRegistering}
          className="bg-blue-500/80 backdrop-blur-md hover:bg-blue-600/80 disabled:bg-gray-400/80 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl border border-blue-400/30 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
        >
          <Camera className="w-5 h-5 inline mr-2" />
          {state.isRegistering 
            ? "Регистрация..." 
            : mode === "login" 
              ? "Начать сканирование" 
              : "Зарегистрировать Face ID"
          }
        </button>
      ) : (
        <button
          onClick={onStopScanning}
          className="bg-red-500/80 backdrop-blur-md hover:bg-red-600/80 text-white px-8 py-3 rounded-xl border border-red-400/30 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
        >
          <XCircle className="w-5 h-5 inline mr-2" />
          Остановить
        </button>
      )}
    </div>
  );
});

ControlButtons.displayName = 'ControlButtons';

export default ControlButtons;
