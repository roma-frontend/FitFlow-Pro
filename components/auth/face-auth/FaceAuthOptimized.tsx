// components/face-auth/FaceAuthOptimized.tsx - Версия с умной логикой Face ID
"use client";
import React, { Suspense, useMemo, useCallback, useEffect } from 'react';
import { FaceAuthProvider } from './FaceAuthProvider';
import VideoCamera from './VideoCamera';
import ScanOverlay from './ScanOverlay';
import StatusPanel from './StatusPanel';
import ControlButtons from './ControlButtons';
import SettingsPanel from './SettingsPanel';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';
import PerformanceMonitor from './PerformanceMonitor';
import { LazyDebugInfo, LazyDetectionPanel, withConditionalRender } from './LazyComponents';
import { useFaceScanning } from '@/hooks/useFaceScanning';
import { useFaceAuthContext } from './FaceAuthProvider';
import { useFaceIdSmart } from '@/hooks/useFaceIdSmart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Shield, Camera, User, Settings } from 'lucide-react';
import { StatisticsPanel } from './StatisticsPanel';

// Импорт типов из файла типов
import type {
  FaceAuthMode,
  SwitchModeType,
  FaceDetectionData,
  OptimizedFaceAuthProps,
  FaceAuthProps,
  VideoCameraViewMode,
  AuthStatusType
} from '@/types/face-auth.types';

// 🔥 НОВЫЙ: Компонент статуса Face ID
const FaceIdStatusBanner = React.memo(({ 
  faceIdStatus, 
  mode, 
  isScanning,
  isRegistering 
}: { 
  faceIdStatus: any;
  mode: FaceAuthMode;
  isScanning: boolean;
  isRegistering: boolean;
}) => {
  const getStatusInfo = useMemo(() => {
    if (isScanning) {
      return {
        type: 'info' as const,
        icon: Camera,
        title: 'Сканирование...',
        description: mode === 'login' ? 'Анализируем ваше лицо' : 'Регистрируем Face ID'
      };
    }

    if (isRegistering) {
      return {
        type: 'info' as const,
        icon: Shield,
        title: 'Регистрация Face ID',
        description: 'Создаем ваш биометрический профиль'
      };
    }

    if (faceIdStatus?.registered) {
      return {
        type: 'success' as const,
        icon: CheckCircle,
        title: 'Face ID активен',
        description: `Зарегистрирован ${new Date(faceIdStatus.profile?.createdAt || Date.now()).toLocaleDateString()}`
      };
    }

    if (mode === 'register') {
      return {
        type: 'warning' as const,
        icon: AlertTriangle,
        title: 'Face ID не настроен',
        description: 'Настройте Face ID для быстрого входа'
      };
    }

    return {
      type: 'info' as const,
      icon: Info,
      title: 'Face ID вход',
      description: 'Войдите используя распознавание лица'
    };
  }, [faceIdStatus, mode, isScanning, isRegistering]);

  const { type, icon: Icon, title, description } = getStatusInfo;

  return (
    <Alert className={`mb-4 ${
      type === 'success' ? 'border-green-200 bg-green-50' :
      type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
      'border-blue-200 bg-blue-50'
    }`}>
      <Icon className={`h-4 w-4 ${
        type === 'success' ? 'text-green-600' :
        type === 'warning' ? 'text-yellow-600' :
        'text-blue-600'
      }`} />
      <AlertTitle className="flex items-center gap-2">
        {title}
        {faceIdStatus?.registered && (
          <Badge variant="secondary" className="text-xs">
            Активен
          </Badge>
        )}
      </AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
});

// 🔥 НОВЫЙ: Панель управления Face ID профилями
const FaceIdProfileManager = React.memo(({ 
  profiles, 
  currentProfileId,
  onDeleteProfile,
  onDeleteAllProfiles 
}: {
  profiles: any[];
  currentProfileId: string | null;
  onDeleteProfile: (id: string) => void;
  onDeleteAllProfiles: () => void;
}) => {
  if (!profiles.length) return null;

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-200/30 p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <User className="h-5 w-5" />
        Face ID профили ({profiles.length})
      </h3>
      
      <div className="space-y-3">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`p-3 rounded-lg border ${
              profile.id === currentProfileId 
                ? 'border-blue-200 bg-blue-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {profile.deviceInfo?.platform || 'Unknown'}
                  </span>
                  {profile.id === currentProfileId && (
                    <Badge variant="secondary" className="text-xs">
                      Текущий
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  Создан: {new Date(profile.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-600">
                  Использован: {profile.usageCount} раз
                </p>
              </div>
              <button
                onClick={() => onDeleteProfile(profile.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
        
        {profiles.length > 1 && (
          <button
            onClick={onDeleteAllProfiles}
            className="w-full mt-3 py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            Удалить все профили
          </button>
        )}
      </div>
    </div>
  );
});

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

// 🔥 НОВЫЙ: Дополнительные типы для ControlButtons
interface ControlButtonsProps {
  mode: FaceAuthMode;
  onStartScanning: () => void;
  onStopScanning: () => void;
  disabled?: boolean;
}

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
  
  // 🔥 НОВЫЙ: Используем умную логику Face ID
  const {
    isScanning: smartScanning,
    isRegistering: smartRegistering,
    faceIdStatus,
    profiles,
    currentProfileId,
    deleteFaceIdProfile,
    deleteAllFaceIdProfiles,
    checkFaceIdStatus,
    isFaceIdRegistered,
    user
  } = useFaceIdSmart();

  const { startScanning, stopScanning } = useFaceScanning({
    mode,
    viewMode,
    onSuccess,
    onFaceDetected
  });

  // 🔥 НОВЫЙ: Обновляем статус Face ID при изменении режима
  useEffect(() => {
    if (user) {
      checkFaceIdStatus();
    }
  }, [mode, user, checkFaceIdStatus]);

  // 🔥 НОВЫЙ: Обработчики для управления профилями
  const handleDeleteProfile = useCallback(async (profileId: string) => {
    const confirmed = window.confirm('Удалить этот Face ID профиль?');
    if (confirmed) {
      await deleteFaceIdProfile(profileId);
    }
  }, [deleteFaceIdProfile]);

  const handleDeleteAllProfiles = useCallback(async () => {
    const confirmed = window.confirm('Удалить все Face ID профили? Это действие нельзя отменить.');
    if (confirmed) {
      await deleteAllFaceIdProfiles();
    }
  }, [deleteAllFaceIdProfiles]);

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
    if (viewMode === "legacy") return "modern";
    return viewMode as VideoCameraViewMode;
  }, [viewMode]);

  // 🔥 НОВЫЙ: Определяем текущий статус сканирования
  const isCurrentlyScanning = state.isScanning || smartScanning;
  const isCurrentlyRegistering = state.isRegistering || smartRegistering;

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

            {/* 🔥 НОВЫЙ: Баннер статуса Face ID */}
            <ErrorBoundary fallback={<div className="text-red-500">Ошибка статуса Face ID</div>}>
              <FaceIdStatusBanner 
                faceIdStatus={faceIdStatus}
                mode={mode}
                isScanning={isCurrentlyScanning}
                isRegistering={isCurrentlyRegistering}
              />
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
                    disabled={isCurrentlyScanning}
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

                {/* 🔥 НОВЫЙ: Панель управления Face ID профилями */}
                {user && profiles.length > 0 && (
                  <ErrorBoundary fallback={<div className="text-red-500">Ошибка панели профилей</div>}>
                    <FaceIdProfileManager
                      profiles={profiles}
                      currentProfileId={currentProfileId}
                      onDeleteProfile={handleDeleteProfile}
                      onDeleteAllProfiles={handleDeleteAllProfiles}
                    />
                  </ErrorBoundary>
                )}
                
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
                  isScanning={isCurrentlyScanning}
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
                    isRegistering: isCurrentlyRegistering,
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
FaceIdStatusBanner.displayName = 'FaceIdStatusBanner';
FaceIdProfileManager.displayName = 'FaceIdProfileManager';