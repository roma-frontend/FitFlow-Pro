// components/auth/face-auth/FaceDetectionOverlay.tsx
"use client";

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BoundingBox, Landmark, QualityMetrics } from '@/types/face-auth.types';

interface FaceDetectionOverlayProps {
  boundingBox: BoundingBox | null;
  landmarks: Landmark[];
  quality: QualityMetrics;
  className?: string;
  showLandmarks?: boolean;
  showQualityIndicators?: boolean;
}

export function FaceDetectionOverlay({
  boundingBox,
  landmarks,
  quality,
  className,
  showLandmarks = true,
  showQualityIndicators = true
}: FaceDetectionOverlayProps) {
  // Расчет цвета рамки на основе качества
  const boxColor = useMemo(() => {
    const avgQuality = (quality.lighting + quality.stability + quality.clarity) / 3;
    if (avgQuality > 0.7) return 'border-green-500';
    if (avgQuality > 0.5) return 'border-yellow-500';
    return 'border-red-500';
  }, [quality]);

  // Расчет прозрачности на основе стабильности
  const boxOpacity = useMemo(() => {
    return 0.3 + (quality.stability * 0.7);
  }, [quality.stability]);

  if (!boundingBox) return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Основная рамка детекции */}
      <div
        className={cn(
          "absolute border-2 rounded-lg transition-all duration-300",
          boxColor
        )}
        style={{
          left: `${boundingBox.x}px`,
          top: `${boundingBox.y}px`,
          width: `${boundingBox.width}px`,
          height: `${boundingBox.height}px`,
          opacity: boxOpacity
        }}
      >
        {/* Углы рамки */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-inherit" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-inherit" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-inherit" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-inherit" />
      </div>

      {/* Ключевые точки лица */}
      {showLandmarks && landmarks.map((landmark, index) => (
        <div
          key={`landmark-${index}`}
          className="absolute w-2 h-2 -translate-x-1 -translate-y-1"
          style={{
            left: `${landmark.x}px`,
            top: `${landmark.y}px`
          }}
        >
          <div 
            className={cn(
              "w-full h-full rounded-full",
              landmark.type === 'eye' && "bg-blue-500",
              landmark.type === 'nose' && "bg-green-500",
              landmark.type === 'mouth' && "bg-red-500",
              landmark.type === 'face' && "bg-yellow-500"
            )}
            style={{ opacity: 0.8 }}
          />
        </div>
      ))}

      {/* Индикаторы качества */}
      {showQualityIndicators && boundingBox && (
        <div
          className="absolute flex flex-col gap-1 text-xs"
          style={{
            left: `${boundingBox.x + boundingBox.width + 10}px`,
            top: `${boundingBox.y}px`
          }}
        >
          <QualityIndicator label="Свет" value={quality.lighting} />
          <QualityIndicator label="Стаб." value={quality.stability} />
          <QualityIndicator label="Четк." value={quality.clarity} />
        </div>
      )}

      {/* Центральная точка фокуса */}
      {boundingBox && (
        <div
          className="absolute w-4 h-4 -translate-x-2 -translate-y-2"
          style={{
            left: `${boundingBox.x + boundingBox.width / 2}px`,
            top: `${boundingBox.y + boundingBox.height / 2}px`
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-white rounded-full opacity-30 animate-ping" />
            <div className="absolute inset-0 bg-white rounded-full opacity-50" />
          </div>
        </div>
      )}

      {/* Сканирующий эффект */}
      <div 
        className="absolute h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-scan-vertical"
        style={{
          left: boundingBox ? `${boundingBox.x}px` : 0,
          width: boundingBox ? `${boundingBox.width}px` : 0,
          top: '50%'
        }}
      />
    </div>
  );
}

// Компонент индикатора качества
function QualityIndicator({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  const color = useMemo(() => {
    if (percentage > 70) return 'text-green-400';
    if (percentage > 50) return 'text-yellow-400';
    return 'text-red-400';
  }, [percentage]);

  return (
    <div className={cn("bg-black/70 px-2 py-1 rounded", color)}>
      {label}: {percentage}%
    </div>
  );
}