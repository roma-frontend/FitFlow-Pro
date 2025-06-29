// components/face-auth/DebugInfo.tsx - ИСПРАВЛЕННАЯ версия
"use client";

import React, { memo } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useFaceAuthContext } from './FaceAuthProvider';
import { DebugPanelProps } from '@/types/face-auth.types';

const DebugInfo = memo(({
  mode,
  isScanning,
  authenticated,
  sessionId,
  scanCount,
  faceData,
  lastScanTime,
  props
}: DebugPanelProps) => {
  const { state, actions } = useFaceAuthContext();

  if (!state.showDebugInfo) return null;

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
          Отладочная информация
        </h3>
        <button
          onClick={actions.toggleDebugInfo}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="Скрыть отладочную информацию"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <DebugItem label="Режим" value={mode} color="blue" />
        <DebugItem
          label="Статус камеры"
          value={state.cameraActive ? "Активна" : "Неактивна"}
          color={state.cameraActive ? "green" : "red"}
          icon={state.cameraActive ? "🟢" : "🔴"}
        />
        <DebugItem
          label="Регистрация"
          value={state.isRegistering ? "В процессе" : "Неактивна"}
          color={state.isRegistering ? "yellow" : "gray"}
          icon={state.isRegistering ? "🟡" : "⚪"}
        />
        <DebugItem
          label="Статус авторизации"
          value={state.authStatus?.authenticated ? "Успешно" : "Не авторизован"}
          color={state.authStatus?.authenticated ? "green" : "red"}
          icon={state.authStatus?.authenticated ? "✅" : "❌"}
        />
        <DebugItem
          label="Детекция лица"
          value={state.faceDetection.detected ? "Обнаружено" : "Не обнаружено"}
          color={state.faceDetection.detected ? "green" : "red"}
          icon={state.faceDetection.detected ? "✅" : "❌"}
        />
        <DebugItem label="Этап сканирования" value={state.scanProgress.stage} color="purple" />
        <DebugItem label="Прогресс" value={`${state.scanProgress.progress.toFixed(0)}%`} color="blue" />
        <DebugItem label="Точек лица" value={state.faceDetection.landmarks.length.toString()} color="orange" />
        <DebugItem label="Количество сканирований" value={state.scanCount.toString()} color="indigo" />
        <DebugItem label="Session ID" value={`${state.sessionId.slice(0, 8)}...`} color="gray" />
        <DebugItem
          label="Последнее сканирование"
          value={state.lastScanTime?.toISOString().slice(11, 19) || "Нет"}
          color="gray"
        />
        <DebugItem
          label="User Agent"
          value={typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? "📱 Mobile" : "💻 Desktop"}
          color="cyan"
        />
      </div>

      {/* Технические данные детекции */}
      {state.faceDetection.detected && state.faceDetection.boundingBox && (
        <TechnicalData
          boundingBox={state.faceDetection.boundingBox}
          quality={state.faceDetection.quality}
        />
      )}

      {/* Face Data информация */}
      {state.faceData && (
        <FaceDataInfo faceData={state.faceData} />
      )}

      {/* Props информация */}
      <PropsInfo props={props} />
    </div>
  );
});

const DebugItem = memo(({
  label,
  value,
  color = "gray",
  icon
}: {
  label: string;
  value: string;
  color?: string;
  icon?: string;
}) => {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    indigo: "text-indigo-600",
    gray: "text-gray-600",
    cyan: "text-cyan-600"
  };

  return (
    <div className="text-gray-700 p-2 bg-gray-50/50 rounded-lg">
      <span className={`font-medium ${colorClasses[color as keyof typeof colorClasses] || colorClasses.gray}`}>
        {label}:
      </span>{" "}
      {icon && <span className="mr-1">{icon}</span>}
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
});

const TechnicalData = memo(({
  boundingBox,
  quality
}: {
  boundingBox: any;
  quality: any;
}) => (
  <div className="mt-4 p-4 bg-gray-100/80 rounded-lg">
    <h4 className="font-medium text-gray-800 mb-2">📊 Технические данные детекции:</h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono text-gray-600">
      <div className="bg-white/50 p-2 rounded">
        <span className="text-blue-600 font-medium">X:</span> {boundingBox.x?.toFixed(0) || 'N/A'}
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="text-blue-600 font-medium">Y:</span> {boundingBox.y?.toFixed(0) || 'N/A'}
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="text-blue-600 font-medium">W:</span> {boundingBox.width?.toFixed(0) || 'N/A'}
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="text-blue-600 font-medium">H:</span> {boundingBox.height?.toFixed(0) || 'N/A'}
      </div>
      <div className="bg-yellow-50/50 p-2 rounded">
        <span className="text-yellow-600 font-medium">💡:</span> {quality.lighting?.toFixed(1) || 'N/A'}%
      </div>
      <div className="bg-green-50/50 p-2 rounded">
        <span className="text-green-600 font-medium">📊:</span> {quality.stability?.toFixed(1) || 'N/A'}%
      </div>
      <div className="bg-purple-50/50 p-2 rounded">
        <span className="text-purple-600 font-medium">🔍:</span> {quality.clarity?.toFixed(1) || 'N/A'}%
      </div>
      <div className="bg-blue-50/50 p-2 rounded">
        <span className="text-blue-600 font-medium">Avg:</span> {
          quality.lighting && quality.stability && quality.clarity
            ? ((quality.lighting + quality.stability + quality.clarity) / 3).toFixed(1)
            : 'N/A'
        }%
      </div>
    </div>
  </div>
));

const FaceDataInfo = memo(({ faceData }: { faceData: any }) => (
  <div className="mt-4 p-4 bg-blue-50/80 rounded-lg">
    <h4 className="font-medium text-blue-800 mb-2">🎯 Face Data информация:</h4>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono text-blue-600">
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Confidence:</span> {faceData.confidence?.toFixed(1) || 'N/A'}%
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Landmarks:</span> {faceData.landmarks?.length || 0}
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Descriptor Length:</span> {faceData.descriptor?.length || 0}
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Detection Score:</span> {faceData.detection?.score?.toFixed(3) || 'N/A'}
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Class Score:</span> {faceData.detection?.classScore?.toFixed(3) || 'N/A'}
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Class Name:</span> {faceData.detection?.className || 'N/A'}
      </div>
    </div>
  </div>
));

const PropsInfo = memo(({ props }: { props: any }) => (
  <div className="mt-4 p-4 bg-purple-50/80 rounded-lg">
    <h4 className="font-medium text-purple-800 mb-2">⚙️ Props информация:</h4>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono text-purple-600">
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Mode:</span> {props.mode || 'N/A'}
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Is Mobile:</span> {props.isMobile ? 'Yes' : 'No'}
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Session ID:</span> {props.sessionId?.slice(0, 8) || 'N/A'}...
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Scan Count:</span> {props.scanCount || 0}
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Is Registering:</span> {props.isRegistering ? 'Yes' : 'No'}
      </div>
      <div className="bg-white/50 p-2 rounded">
        <span className="font-medium">Auth Status:</span> {props.authStatus?.authenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
    </div>
  </div>
));

DebugItem.displayName = 'DebugItem';
TechnicalData.displayName = 'TechnicalData';
FaceDataInfo.displayName = 'FaceDataInfo';
PropsInfo.displayName = 'PropsInfo';
DebugInfo.displayName = 'DebugInfo';

export default DebugInfo;