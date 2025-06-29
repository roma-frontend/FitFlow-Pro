// components/admin/settings/components/SettingsHeader.tsx (исправленная версия)
"use client";
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  HelpCircle, 
  Bell,
  Badge as BadgeIcon,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsHeaderProps {
  title: string;
  subtitle?: string;
  hasUnsavedChanges: boolean;
  showBackButton?: boolean;
  showActions?: boolean;
  isMobile: boolean;
  isTablet: boolean;
  saving: boolean;
  lastSaved?: Date | null; // ✅ Изменено на Date | null
  onBack?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onHelp?: () => void;
  onNotifications?: () => void;
  onBadgeManagement?: () => void; // ✅ Добавлено свойство
}

export function SettingsHeader({
  title,
  subtitle,
  hasUnsavedChanges,
  showBackButton = true,
  showActions = true,
  isMobile,
  isTablet,
  saving,
  lastSaved,
  onBack,
  onSave,
  onReset,
  onExport,
  onImport,
  onHelp,
  onNotifications,
  onBadgeManagement, // ✅ Добавлено в деструктуризацию
}: SettingsHeaderProps) {

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={cn(
      "bg-white/80 backdrop-blur-lg border-b border-gray-200",
      "transition-all duration-300 rounded-xl"
    )}>
      <div className="px-4 py-3 sm:py-4">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          
          {/* Левая часть - кнопка назад и заголовок */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                <h1 className={cn(
                  "font-bold text-gray-900 truncate",
                  isMobile ? "text-lg" : "text-xl sm:text-2xl"
                )}>
                  {title}
                </h1>
                {hasUnsavedChanges && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shrink-0" />
                )}
              </div>
              
              {subtitle && !isMobile && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {subtitle}
                </p>
              )}
              
              {lastSaved && !hasUnsavedChanges && (
                <p className="text-xs text-green-600 mt-1">
                  Сохранено {formatLastSaved(lastSaved)}
                </p>
              )}
            </div>
          </div>

          {/* Правая часть - действия */}
          {showActions && (
            <div className={cn("flex items-center gap-2 shrink-0")}>
              
              {/* ✅ Кнопка Badge Management */}
              {onBadgeManagement && (
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={onBadgeManagement}
                  className={cn(
                    "border-purple-300 text-purple-700 hover:bg-purple-50",
                    isMobile && "px-2"
                  )}
                  title="Управление Badge"
                >
                  <BadgeIcon className="h-4 w-4" />
                  {!isMobile && <span className="ml-2">Badge</span>}
                </Button>
              )}

              {/* Мобильные действия */}
              {isMobile ? (
                <>
                  {hasUnsavedChanges && (
                    <Button
                      size="sm"
                      onClick={onSave}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHelp}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                /* Десктопные действия */
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onImport}
                    className="hidden sm:flex"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Импорт
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onExport}
                    className="hidden sm:flex"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="hidden md:flex text-red-600 hover:text-red-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Сброс
                  </Button>
                  
                  {hasUnsavedChanges && (
                    <Button
                      onClick={onSave}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNotifications}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHelp}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Индикатор сохранения */}
        {saving && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Сохранение настроек...</span>
            </div>
          </div>
        )}

        {/* Мобильный subtitle */}
        {subtitle && isMobile && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
