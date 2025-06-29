// components/admin/settings/index.ts - финальный экспорт
export { SettingsHeader } from './components/SettingsHeader';
export { SettingsTabs } from './components/SettingsTabs';
export { AdaptiveSettingsContainer } from './components/AdaptiveSettingsContainer';
export { AdaptiveSettingsForm } from './components/AdaptiveSettingsForm';
export { AdaptiveSettingsGrid } from './components/AdaptiveSettingsGrid';
export { SettingsQuickActions } from './components/SettingsQuickActions';
export { ProgressiveSettingsLoader } from './components/ProgressiveSettingsLoader';
export { MobileSettingsNavigation } from './components/MobileSettingsNavigation';
export { SettingsPageWrapper } from './components/SettingsPageWrapper';
export { SettingsPageBreadcrumb } from './components/SettingsPageBreadcrumb';
export { SettingsStatusIndicator } from './components/SettingsStatusIndicator';
export { SettingsHeaderActions } from './components/SettingsHeaderActions';
export { AdaptiveConfirmDialog } from './components/AdaptiveConfirmDialog';
export { useAdaptiveToast, AdaptiveToastContainer } from './components/AdaptiveToast';
export { UnsavedChangesAlert } from './components/UnsavedChangesAlert';
export { 
  SettingsOperationSkeleton,
  SettingsExportSkeleton,
  SettingsImportSkeleton,
  SettingsResetSkeleton,
  SettingsValidationSkeleton
} from './components/SettingsOperationSkeletons';
export { SettingsPageSkeleton } from './components/SettingsPageSkeleton';
export { SettingsErrorState } from './components/SettingsErrorState';

// Хуки
export { useAdaptiveSettings } from '@/hooks/useAdaptiveSettings';
export { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';

// Утилиты
export { adaptiveUtils } from '@/utils/adaptive';
