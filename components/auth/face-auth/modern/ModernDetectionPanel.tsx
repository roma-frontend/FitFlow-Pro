// components/auth/face-auth/modern/ModernDetectionPanel.tsx
import React from 'react';
import { Target, Activity } from 'lucide-react';

interface FaceDetection {
  detected: boolean;
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

interface ModernDetectionPanelProps {
  faceDetection: FaceDetection;
  scanProgress: ScanProgress;
}

export const ModernDetectionPanel = React.memo(({
  faceDetection,
  scanProgress
}: ModernDetectionPanelProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Target className="w-5 h-5 mr-2 text-green-500" />
        Детекция лица
      </h3>

      <div className="space-y-3">
        <div className={`flex items-center p-3 rounded-lg ${
            faceDetection.detected 
              ? 'bg-green-100/80 border border-green-200' 
              : 'bg-orange-100/80 border border-orange-200'
          }`}>
          <div className={`w-3 h-3 rounded-full mr-3 ${
              faceDetection.detected ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
            }`}></div>
          <span className={`text-sm font-medium ${
              faceDetection.detected ? 'text-green-800' : 'text-orange-800'
            }`}>
            {faceDetection.detected ? 'Лицо обнаружено' : 'Поиск лица...'}
          </span>
        </div>

        {faceDetection.detected && (
          <div className="space-y-2">
            {Object.entries(faceDetection.quality).map(([key, value]) => {
              const labels = {
                lighting: 'Освещение',
                stability: 'Стабильность',
                clarity: 'Четкость'
              };
              const colors = {
                lighting: 'blue',
                stability: 'green',
                clarity: 'yellow'
              };
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {labels[key as keyof typeof labels]}:
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-${colors[key as keyof typeof colors]}-500`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-500 w-8">
                      {value.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-gray-50/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Этап: {scanProgress.stage}
            </span>
            <Activity className={`w-4 h-4 ${
                scanProgress.stage === 'analyzing' ? 'text-blue-500 animate-pulse' : 'text-gray-400'
              }`} />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

ModernDetectionPanel.displayName = 'ModernDetectionPanel';
