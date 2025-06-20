// components/face-auth/DetectionPanel.tsx
"use client";

import React, { memo } from 'react';
import { Target, Activity } from 'lucide-react';
import { useFaceAuthContext } from './FaceAuthProvider';

const DetectionPanel = memo(() => {
  const { state } = useFaceAuthContext();

  if (!state.isScanning) return null;

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Target className="w-5 h-5 mr-2 text-green-500" />
        Детекция лица
      </h3>

      <div className="space-y-3">
        <div className={`flex items-center p-3 rounded-lg ${
            state.faceDetection.detected 
              ? 'bg-green-100/80 border border-green-200' 
              : 'bg-orange-100/80 border border-orange-200'
          }`}>
          <div className={`w-3 h-3 rounded-full mr-3 ${
              state.faceDetection.detected ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
            }`}></div>
          <span className={`text-sm font-medium ${
              state.faceDetection.detected ? 'text-green-800' : 'text-orange-800'
            }`}>
            {state.faceDetection.detected ? 'Лицо обнаружено' : 'Поиск лица...'}
          </span>
        </div>

        {state.faceDetection.detected && (
          <QualityMetrics quality={state.faceDetection.quality} />
        )}

        <ScanProgressBar 
          stage={state.scanProgress.stage}
          progress={state.scanProgress.progress}
        />
      </div>
    </div>
  );
});

const QualityMetrics = memo(({ quality }: { quality: any }) => {
  const metrics = [
    { key: 'lighting', label: 'Освещение', color: 'blue' },
    { key: 'stability', label: 'Стабильность', color: 'green' },
    { key: 'clarity', label: 'Четкость', color: 'yellow' }
  ];

  return (
    <div className="space-y-2">
      {metrics.map(({ key, label, color }) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{label}:</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-${color}-500`}
                style={{ width: `${quality[key]}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-500 w-8">
              {quality[key].toFixed(0)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});

const ScanProgressBar = memo(({ stage, progress }: { stage: string; progress: number }) => (
  <div className="bg-gray-50/80 rounded-lg p-3">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">
        Этап: {stage}
      </span>
      <Activity className={`w-4 h-4 ${
          stage === 'analyzing' ? 'text-blue-500 animate-pulse' : 'text-gray-400'
        }`} />
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
));

QualityMetrics.displayName = 'QualityMetrics';
ScanProgressBar.displayName = 'ScanProgressBar';
DetectionPanel.displayName = 'DetectionPanel';

export default DetectionPanel;
