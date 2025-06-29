// components/face-auth/FaceAuthOptimized.tsx - ДОБАВИТЬ ErrorBoundary
"use client";

import React, { Suspense, useMemo, useCallback } from 'react';
import { FaceAuthProvider } from './FaceAuthProvider';
import VideoCamera from './VideoCamera';
import ScanOverlay from './ScanOverlay';
import StatusPanel from './StatusPanel';
import ControlButtons from './ControlButtons';
import SettingsPanel from './SettingsPanel';
import StatisticsPanel from './StatisticsPanel';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';
import PerformanceMonitor from './PerformanceMonitor';
import { LazyDebugInfo, LazyDetectionPanel, withConditionalRender } from './LazyComponents';
import { useFaceScanning } from '@/hooks/useFaceScanning';
import { useFaceAuthContext } from './FaceAuthProvider';
import { OptimizedFaceAuthProps, SwitchModeType } from '@/types/face-auth.types';

// Условные компоненты
const ConditionalDetectionPanel = withConditionalRender(
  LazyDetectionPanel, 
  () => {
    const { state } = useFaceAuthContext();
    return state.isScanning;
  }
);

const ConditionalDebugInfo = withConditionalRender(
  LazyDebugInfo,
  () => {
    const { state } = useFaceAuthContext();
    return state.showDebugInfo;
  }
);

const FaceAuthContent = React.memo(({
  mode,
  onSuccess,
  viewMode = "modern",
  setMode,
  sessionId,
  onSwitchMode,
  onFaceDetected,
  className = "",
  isMobile = false
}: OptimizedFaceAuthProps) => {
  const { state } = useFaceAuthContext();
  
  const { startScanning, stopScanning } = useFaceScanning({
    mode,
    viewMode,
    onSuccess,
    onFaceDetected
  });

  // Мемоизация стилей
  const containerClasses = useMemo(() => 
    `bg-gradient-to-br from-gray-50 to-blue-50 p-6 face-auth-container ${className}`, 
    [className]
  );

  const gridClasses = useMemo(() =>
    "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8",
    []
  );

  const videoContainerClasses = useMemo(() =>
    "bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl",
    []
  );

  const sidebarClasses = useMemo(() =>
    "space-y-6",
    []
  );

  const handleToggleDebug = useCallback((show: boolean) => {
    console.log('Debug mode toggled:', show);
  }, []);

  const currentSessionId = sessionId || state.sessionId;

  // Преобразование viewMode для VideoCamera
  const videoViewMode = useMemo(() => {
    if (viewMode === "legacy") return "modern"; // fallback
    return viewMode as "mobile" | "desktop" | "modern";
  }, [viewMode]);

  return (
    <ErrorBoundary>
      <div className={containerClasses}>
        <PerformanceMonitor />
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Заголовок */}
            <ErrorBoundary fallback={<div className="text-red-500">Ошибка заголовка</div>}>
              <Header mode={mode} />
            </ErrorBoundary>

            {/* Основная область */}
            <div className={gridClasses}>
              {/* Видео область */}
              <ErrorBoundary fallback={<div className="text-red-500">Ошибка видео компонента</div>}>
                <div className={videoContainerClasses}>
                  <div className="relative">
                    <Suspense fallback={
                      <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center">
                        <div className="text-gray-500">Загрузка камеры...</div>
                      </div>
                    }>
                      <VideoCamera viewMode={videoViewMode} />
                    </Suspense>
                    <ScanOverlay />
                  </div>
                  
                  <ControlButtons 
                    mode={mode}
                    onStartScanning={startScanning}
                    onStopScanning={stopScanning}
                  />
                </div>
              </ErrorBoundary>

              {/* Панели статуса */}
              <div className={sidebarClasses}>
                <ErrorBoundary fallback={<div className="text-red-500">Ошибка статус панели</div>}>
                  <StatusPanel 
                    mode={mode} 
                    authenticated={state.authStatus?.authenticated || false}
                  />
                </ErrorBoundary>
                
                <ErrorBoundary fallback={<div className="text-red-500">Ошибка панели детекции</div>}>
                  <Suspense fallback={
                    <div className="animate-pulse bg-gray-200 h-48 rounded-lg" />
                  }>
                    <ConditionalDetectionPanel />
                  </Suspense>
                </ErrorBoundary>
                
                <ErrorBoundary fallback={<div className="text-red-500">Ошибка статистики</div>}>
                  <StatisticsPanel
                    scanCount={state.scanCount}
                    mode={mode}
                    sessionId={currentSessionId}
                    lastScanTime={state.lastScanTime}
                  />
                </ErrorBoundary>
                
                <ErrorBoundary fallback={<div className="text-red-500">Ошибка настроек</div>}>
                  <SettingsPanel 
                    showDebugInfo={state.showDebugInfo}
                    onToggleDebug={handleToggleDebug}
                  />
                </ErrorBoundary>
              </div>
            </div>

            {/* Отладочная информация */}
            <ErrorBoundary fallback={<div className="text-red-500">Ошибка отладочной информации</div>}>
              <Suspense fallback={
                <div className="animate-pulse bg-gray-200 h-32 rounded-lg mb-8" />
              }>
                <ConditionalDebugInfo 
                  mode={mode}
                  isScanning={state.isScanning}
                  authenticated={state.authStatus?.authenticated || false}
                  sessionId={currentSessionId}
                  scanCount={state.scanCount}
                  faceData={state.faceData}
                  lastScanTime={state.lastScanTime}
                  props={{
                    mode,
                    setMode,
                    faceData: state.faceData,
                    sessionId: currentSessionId,
                    scanCount: state.scanCount,
                    lastScanTime: state.lastScanTime,
                    onFaceDetected,
                    onSwitchMode,
                    isMobile,
                    isRegistering: state.isRegistering,
                    setIsRegistering: undefined,
                    className,
                    authStatus: state.authStatus
                  }}
                />
              </Suspense>
            </ErrorBoundary>

            {/* Футер */}
            <ErrorBoundary fallback={<div className="text-red-500">Ошибка футера</div>}>
              <Footer 
                sessionId={currentSessionId}
                onSwitchMode={onSwitchMode}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default function FaceAuthOptimized(props: OptimizedFaceAuthProps) {
  return (
    <ErrorBoundary>
      <FaceAuthProvider>
        <FaceAuthContent {...props} />
      </FaceAuthProvider>
    </ErrorBoundary>
  );
}

FaceAuthContent.displayName = 'FaceAuthContent';
