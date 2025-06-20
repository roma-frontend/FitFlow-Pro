// components/auth/face-auth/modern/ModernVideoArea.tsx - ИСПРАВЛЕНЫ ТИПЫ РЕФОВ
import React from 'react';
import { Camera, XCircle } from 'lucide-react';

interface ScanProgress {
  stage: string;
  progress: number;
}

interface FaceDetection {
  detected: boolean;
  quality: {
    lighting: number;
    stability: number;
    clarity: number;
  };
}

interface ModernVideoAreaProps {
  mode: "login" | "register";
  isScanning: boolean;
  scanProgress: ScanProgress;
  faceDetection: FaceDetection;
  onStartScanning: () => void;
  onStopScanning: () => void;
  // ✅ ИСПРАВЛЕННЫЕ ТИПЫ РЕФОВ - ПРИНИМАЮТ NULL
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detectionRef: React.RefObject<HTMLCanvasElement | null>;
}

export const ModernVideoArea = React.memo(({
  mode,
  isScanning,
  scanProgress,
  faceDetection,
  onStartScanning,
  onStopScanning,
  videoRef,
  detectionRef
}: ModernVideoAreaProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl">
      <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        <canvas
          ref={detectionRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Прогресс сканирования */}
        {isScanning && (
          <>
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {scanProgress.stage === 'detecting' && '🔍 Поиск лица...'}
                    {scanProgress.stage === 'analyzing' && '📊 Анализ данных...'}
                    {scanProgress.stage === 'processing' && '⚡ Обработка...'}
                    {scanProgress.stage === 'complete' && '✅ Готово!'}
                    {scanProgress.stage === 'failed' && '❌ Ошибка'}
                    {scanProgress.stage === 'initializing' && '🔄 Инициализация...'}
                  </span>
                  <span className="text-xs">
                    {scanProgress.progress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Метрики качества */}
            {faceDetection.detected && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 text-white">
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-blue-300">Освещение</div>
                      <div className="font-mono">
                        {faceDetection.quality.lighting.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-300">Стабильность</div>
                      <div className="font-mono">
                        {faceDetection.quality.stability.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-300">Четкость</div>
                      <div className="font-mono">
                        {faceDetection.quality.clarity.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Статические уголки рамки */}
        {!isScanning && (
          <>
            <div className="absolute top-4 left-4 w-8 h-8 border-t-3 border-l-3 border-blue-400 rounded-tl-lg opacity-50"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-t-3 border-r-3 border-blue-400 rounded-tr-lg opacity-50"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-3 border-l-3 border-blue-400 rounded-bl-lg opacity-50"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-3 border-r-3 border-blue-400 rounded-br-lg opacity-50"></div>
          </>
        )}

        {/* Центральный индикатор состояния */}
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-700 font-medium">
                  {mode === "login" ? "Готов к аутентификации" : "Готов к регистрации"}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Нажмите кнопку для начала
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Кнопки управления */}
      <div className="flex justify-center mt-6 space-x-4">
        {!isScanning ? (
          <button
            onClick={onStartScanning}
            className="bg-blue-500/80 backdrop-blur-md hover:bg-blue-600/80 text-white px-8 py-3 rounded-xl border border-blue-400/30 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium flex items-center"
          >
            <Camera className="w-5 h-5 mr-2" />
            {mode === "login" ? "Начать сканирование" : "Зарегистрировать Face ID"}
          </button>
        ) : (
          <button
            onClick={onStopScanning}
            className="bg-red-500/80 backdrop-blur-md hover:bg-red-600/80 text-white px-8 py-3 rounded-xl border border-red-400/30 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium flex items-center"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Остановить сканирование
          </button>
        )}
      </div>

      {/* Статистика сканирования */}
      <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          <span>HD качество</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span>Безопасное соединение</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
          <span>ИИ анализ</span>
        </div>
      </div>
    </div>
  );
});

ModernVideoArea.displayName = 'ModernVideoArea';
