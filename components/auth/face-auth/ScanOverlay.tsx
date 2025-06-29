// components/face-auth/ScanOverlay.tsx
"use client";

import React, { memo } from 'react';
import { useFaceAuthContext } from './FaceAuthProvider';

const ScanOverlay = memo(() => {
  const { state } = useFaceAuthContext();

  if (!state.isScanning) return null;

  return (
    <>
      {/* Оверлей с прогрессом */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {state.scanProgress.stage === 'detecting' && '🔍 Поиск лица...'}
              {state.scanProgress.stage === 'analyzing' && '📊 Анализ данных...'}
              {state.scanProgress.stage === 'processing' && '⚡ Обработка...'}
              {state.scanProgress.stage === 'complete' && '✅ Готово!'}
              {state.scanProgress.stage === 'failed' && '❌ Ошибка'}
            </span>
            <span className="text-xs">
              {state.scanProgress.progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.scanProgress.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Метрики качества */}
      {state.faceDetection.detected && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 text-white">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center">
                <div className="text-blue-300">Освещение</div>
                <div className="font-mono">
                  {state.faceDetection.quality.lighting.toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-green-300">Стабильность</div>
                <div className="font-mono">
                  {state.faceDetection.quality.stability.toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-yellow-300">Четкость</div>
                <div className="font-mono">
                  {state.faceDetection.quality.clarity.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

ScanOverlay.displayName = 'ScanOverlay';

export default ScanOverlay;
