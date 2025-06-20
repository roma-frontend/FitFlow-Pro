// components/auth/face-auth/modern/ModernDebugPanel.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { FaceDetectionData } from '@/types/face-auth.types';

interface AuthStatus {
  authenticated: boolean;
  confidence: number;
  user?: string;
}

interface FaceDetection {
  detected: boolean;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  landmarks: Array<{ x: number; y: number; type: string }>;
  quality: {
    lighting: number;
    stability: number;
    clarity: number;
  };
}

interface ScanProgress {
  stage: string;
  progress: number;
}

interface ModernDebugPanelProps {
  mode: "login" | "register";
  viewMode: string;
  isScanning: boolean;
  authStatus: AuthStatus | null;
  faceDetection: FaceDetection;
  scanProgress: ScanProgress;
  scanCount: number;
  sessionId: string;
  lastScanTime: Date | null;
  faceData: FaceDetectionData | null;
}

export const ModernDebugPanel = React.memo(({
  mode,
  viewMode,
  isScanning,
  authStatus,
  faceDetection,
  scanProgress,
  scanCount,
  sessionId,
  lastScanTime,
  faceData
}: ModernDebugPanelProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
        Отладочная информация
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <DebugItem label="Режим" value={mode} />
        <DebugItem label="UI Режим" value={viewMode} />
        <DebugItem 
          label="Статус камеры" 
          value={isScanning ? "🟢 Активна" : "🔴 Неактивна"} 
        />
        <DebugItem 
          label="Статус авторизации" 
          value={authStatus?.authenticated ? "✅" : "❌"} 
        />
        <DebugItem 
          label="Детекция лица" 
          value={faceDetection.detected ? "✅" : "❌"} 
        />
        <DebugItem label="Этап сканирования" value={scanProgress.stage} />
        <DebugItem 
          label="Прогресс" 
          value={`${scanProgress.progress.toFixed(0)}%`} 
        />
        <DebugItem 
          label="Точек лица" 
          value={faceDetection.landmarks.length.toString()} 
        />
        <DebugItem 
          label="Количество сканирований" 
          value={scanCount.toString()} 
        />
        <DebugItem 
          label="Session ID" 
          value={`${sessionId.slice(0, 8)}...`} 
        />
        <DebugItem 
          label="Последнее сканирование" 
          value={lastScanTime?.toISOString().slice(11, 19) || "Нет"} 
        />
        <DebugItem 
          label="User Agent" 
          value={navigator.userAgent.includes("Mobile") ? "📱 Mobile" : "💻 Desktop"} 
        />
      </div>

      {/* Технические данные детекции */}
      {faceDetection.detected && (
        <div className="mt-4 p-4 bg-gray-50/80 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">
            Технические данные детекции:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-600">
            <div>Позиция X: {faceDetection.boundingBox?.x.toFixed(0) || 'N/A'}</div>
            <div>Позиция Y: {faceDetection.boundingBox?.y.toFixed(0) || 'N/A'}</div>
            <div>Ширина: {faceDetection.boundingBox?.width.toFixed(0) || 'N/A'}</div>
            <div>Высота: {faceDetection.boundingBox?.height.toFixed(0) || 'N/A'}</div>
            <div>Освещение: {faceDetection.quality.lighting.toFixed(1)}%</div>
            <div>Стабильность: {faceDetection.quality.stability.toFixed(1)}%</div>
            <div>Четкость: {faceDetection.quality.clarity.toFixed(1)}%</div>
            <div>
              Avg Quality: {((faceDetection.quality.lighting + faceDetection.quality.stability + faceDetection.quality.clarity) / 3).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Legacy Face Data */}
      {faceData && (
        <div className="mt-4 p-4 bg-blue-50/80 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Legacy Face Data:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-blue-600">
            <div>Confidence: {faceData.confidence?.toFixed(1)}%</div>
            <div>Landmarks: {faceData.landmarks?.length || 0}</div>
            <div>Descriptor Length: {faceData.descriptor?.length || 0}</div>
            <div>Detection Score: {faceData.detection?.score?.toFixed(3) || 'N/A'}</div>
          </div>
        </div>
      )}
    </div>
  );
});

// Вспомогательный компонент для отладочных элементов
const DebugItem = React.memo(({ label, value }: { label: string; value: string }) => (
  <div className="text-gray-700">
    <span className="text-blue-600 font-medium">{label}:</span> {value}
  </div>
));

DebugItem.displayName = 'DebugItem';
ModernDebugPanel.displayName = 'ModernDebugPanel';
