// app/admin/settings/page.tsx (обновленная версия с передачей onBadgeManagement)
"use client";
import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettingsManager } from "@/hooks/useSettingsManager";
import { useSettingsImportExport } from "@/hooks/useSettingsImportExport";
import { useSettingsActions } from "@/hooks/useSettingsActions";
import { useAdaptiveSettings } from "@/hooks/useAdaptiveSettings";
import { SettingsHeader } from "@/components/admin/settings/components/SettingsHeader";
import { SettingsPageBreadcrumb } from "@/components/admin/settings/components/SettingsPageBreadcrumb";
import { AdaptiveSettingsContainer } from "@/components/admin/settings/components/AdaptiveSettingsContainer";
import { SettingsQuickActions } from "@/components/admin/settings/components/SettingsQuickActions";
import { SettingsTabs } from "@/components/admin/settings/components/SettingsTabs";
import { SettingsPageSkeleton } from "@/components/admin/settings/components/SettingsPageSkeleton";
import { SettingsErrorState } from "@/components/admin/settings/components/SettingsErrorState";
import { UnsavedChangesAlert } from "@/components/admin/settings/components/UnsavedChangesAlert";
import {
  SettingsOperationSkeleton,
  SettingsExportSkeleton,
  SettingsImportSkeleton,
  SettingsResetSkeleton,
  SettingsValidationSkeleton,
} from "@/components/admin/settings/components/SettingsOperationSkeletons";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Badge as BadgeIcon, Plus, BarChart3 } from "lucide-react";
import { PWAStatus } from "@/components/PWAStatus";
import { PWAInfo } from "@/components/PWAInfo";
import { PWAStats } from "@/components/PWAStats";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loadingSteps] = useState([
    "Загрузка общих настроек...",
    "Загрузка настроек пользователей...",
    "Загрузка настроек безопасности...",
    "Загрузка настроек уведомлений...",
    "Финализация...",
  ]);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);

  const {
    isMobile,
    isTablet,
    isDesktop,
    getOptimalDelay,
    shouldUseProgressiveLoading,
  } = useAdaptiveSettings();

  const {
    config,
    loading,
    saving,
    lastSaved,
    hasUnsavedChanges,
    loadSettings,
    saveSettings,
    updateConfig,
  } = useSettingsManager();

  const { exportSettings, importSettings } = useSettingsImportExport(
    config,
    (newConfig) => updateConfig("general", newConfig),
    (value) => {}
  );

  const { resetSettings, showHelp, showNotifications } = useSettingsActions(
    loadSettings,
    (value) => {}
  );

  // Отслеживание прокрутки для адаптивного хедера
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Симуляция прогрессивной загрузки для мобильных устройств
  useEffect(() => {
    if (loading && shouldUseProgressiveLoading()) {
      const interval = setInterval(() => {
        setCurrentLoadingStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [loading, shouldUseProgressiveLoading, loadingSteps.length]);

  // Обработчики навигации и операций
  const handleBack = () => {
    if (hasUnsavedChanges && !isMobile) {
      const confirmed = window.confirm(
        "У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?"
      );
      if (!confirmed) return;
    }
    router.push("/admin");
  };

  // ✅ Обработчик для перехода к управлению Badge
  const handleBadgeManagement = () => {
    router.push("/admin/header-badges");
  };

  const handleImport = async () => {
    setActiveOperation("import");
    let input: HTMLInputElement | null = null;

    try {
      input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.style.display = "none";
      document.body.appendChild(input);

      const success = await new Promise<boolean>((resolve) => {
        if (!input) {
          resolve(false);
          return;
        }

        input.onchange = async (e: Event) => {
          try {
            const fileEvent = e as unknown as ChangeEvent<HTMLInputElement>;
            if (fileEvent.target?.files?.length) {
              await importSettings(fileEvent);
              resolve(true);
            } else {
              resolve(false);
            }
          } catch (error) {
            console.error("Ошибка импорта:", error);
            const message = isMobile
              ? "Ошибка импорта. Проверьте файл."
              : "Ошибка при импорте настроек. Проверьте формат файла.";
            alert(message);
            resolve(false);
          }
        };

        input.oncancel = () => resolve(false);
        input.click();
      });

      if (success) {
        await new Promise((resolve) =>
          setTimeout(resolve, getOptimalDelay("import"))
        );
      }
    } catch (error) {
      console.error("Ошибка импорта:", error);
      alert("Произошла ошибка при импорте настроек.");
    } finally {
      if (input && document.body.contains(input)) {
        document.body.removeChild(input);
      }
      setActiveOperation(null);
    }
  };

  const handleExport = async () => {
    setActiveOperation("export");
    try {
      await exportSettings();
      await new Promise((resolve) =>
        setTimeout(resolve, getOptimalDelay("export"))
      );
    } catch (error) {
      console.error("Ошибка экспорта:", error);
      alert("Ошибка при экспорте настроек.");
    } finally {
      setActiveOperation(null);
    }
  };

  const handleReset = async () => {
    const confirmMessage = isMobile
      ? "Сбросить все настройки? Это действие нельзя отменить."
      : "Вы уверены, что хотите сбросить все настройки? Это действие нельзя отменить.";

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setActiveOperation("reset");
    try {
      await resetSettings();
      await new Promise((resolve) =>
        setTimeout(resolve, getOptimalDelay("save") * 2)
      );
    } catch (error) {
      console.error("Ошибка сброса:", error);
      alert("Ошибка при сбросе настроек.");
    } finally {
      setActiveOperation(null);
    }
  };

  const handleSave = async () => {
    setActiveOperation("saving");
    try {
      await saveSettings();
      await new Promise((resolve) =>
        setTimeout(resolve, getOptimalDelay("save"))
      );
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert("Ошибка при сохранении настроек.");
    } finally {
      setActiveOperation(null);
    }
  };

  // Состояния загрузки и ошибки
  if (loading) {
    return (
      <SettingsPageSkeleton
        isMobile={isMobile}
        useProgressiveLoading={shouldUseProgressiveLoading()}
        loadingSteps={loadingSteps}
        currentStep={currentLoadingStep}
      />
    );
  }

  if (!config) {
    return (
      <SettingsErrorState
        onBack={handleBack}
        onRetry={loadSettings}
        isMobile={isMobile}
      />
    );
  }

  return (
    <>
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          isMobile
            ? "bg-gradient-to-b from-slate-50 to-blue-50"
            : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100",
          isDesktop && "bg-fixed"
        )}
      >
        {/* Хедер */}
        <div
          className={cn(
            "sticky top-0 z-40 transition-all duration-300",
            isScrolled && "shadow-lg backdrop-blur-md"
          )}
        >
          <SettingsHeader
            title="Настройки системы"
            subtitle={
              isMobile
                ? "Управление системой"
                : "Управление конфигурацией и параметрами"
            }
            hasUnsavedChanges={hasUnsavedChanges}
            showBackButton={true}
            showActions={true}
            isMobile={isMobile}
            isTablet={isTablet}
            saving={saving}
            lastSaved={lastSaved}
            onBack={handleBack}
            onSave={handleSave}
            onReset={handleReset}
            onExport={handleExport}
            onImport={handleImport}
            onHelp={showHelp}
            onNotifications={showNotifications}
            onBadgeManagement={handleBadgeManagement}
          />
        </div>

        {/* Основной контент */}
        <AdaptiveSettingsContainer
          loading={loading}
          loadingSteps={loadingSteps}
          currentStep={currentLoadingStep}
          className={cn(
            "relative z-10",
            "pt-2 sm:pt-4 md:pt-6",
            isMobile && "pb-20"
          )}
        >
          <SettingsPageBreadcrumb isMobile={isMobile} className="mb-4" />

          <div
            className={cn(
              "transition-all duration-300",
              hasUnsavedChanges ? "mb-3 sm:mb-4 md:mb-6" : "mb-0"
            )}
          >
            <UnsavedChangesAlert
              hasUnsavedChanges={hasUnsavedChanges}
              isMobile={isMobile}
              onSave={handleSave}
              onDiscard={() => window.location.reload()}
            />
          </div>

          {/* ✅ Badge Management Quick Access */}
          <div className="mb-4 sm:mb-6">
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <BadgeIcon className="h-5 w-5" />
                  Управление Badge
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Настройка и управление значками в навигации
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleBadgeManagement}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    {isMobile
                      ? "Управление Badge"
                      : "Создать и настроить Badge"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push("/admin/header-badges?tab=analytics")
                    }
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {isMobile ? "Аналитика" : "Посмотреть аналитику"}
                  </Button>
                </div>
                <div className="mt-3 p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-purple-600 leading-relaxed">
                    {isMobile
                      ? "💡 Создавайте и настраивайте Badge для навигации"
                      : "💡 Создавайте персонализированные Badge для элементов навигации с таргетингом по ролям и устройствам. Отслеживайте клики и эффективность."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PWA статус в настройках */}
          <div className="mb-4 sm:mb-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Smartphone className="h-5 w-5" />
                  Progressive Web App
                  <PWAStatus showDetails={false} />
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Статус и управление PWA функциями
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PWAInfo />
                  <PWAStats />
                </div>
              </CardContent>
            </Card>
          </div>

          <div
            className={cn(
              "transition-all duration-300",
              "mb-4 sm:mb-6 md:mb-8"
            )}
          >
            <SettingsQuickActions
              hasUnsavedChanges={hasUnsavedChanges}
              lastSaved={lastSaved}
              onSave={handleSave}
              onImport={handleImport}
              onExport={handleExport}
              onReset={handleReset}
              saving={saving}
            />
          </div>

          <div
            className={cn(
              "transition-all duration-300",
              "space-y-4 sm:space-y-6 md:space-y-8"
            )}
          >
            <SettingsTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              config={config}
              updateConfig={updateConfig}
            />
          </div>
        </AdaptiveSettingsContainer>

        {/* Плавающая кнопка сохранения для мобильных устройств */}
        {isMobile && hasUnsavedChanges && (
          <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={handleSave}
              disabled={saving || !!activeOperation}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-medium text-white",
                "bg-gradient-to-r from-blue-500 to-purple-600",
                "hover:from-blue-600 hover:to-purple-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-lg hover:shadow-xl transition-all duration-200",
                "transform hover:scale-[1.02] active:scale-[0.98]",
                "touch-target"
              )}
            >
              {saving || activeOperation === "saving"
                ? "Сохранение..."
                : "Сохранить изменения"}
            </button>
          </div>
        )}

        {/* ✅ Плавающая кнопка Badge для мобильных устройств */}
        {isMobile && !hasUnsavedChanges && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <Button
              onClick={handleBadgeManagement}
              size="lg"
              className={cn(
                "rounded-full w-14 h-14 shadow-lg hover:shadow-xl",
                "bg-gradient-to-r from-purple-500 to-blue-500",
                "hover:from-purple-600 hover:to-blue-600",
                "transform hover:scale-110 active:scale-95",
                "transition-all duration-200"
              )}
              title="Управление Badge"
            >
              <BadgeIcon className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Индикатор загрузки для мобильных устройств */}
        {isMobile && (saving || activeOperation) && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="h-1 bg-blue-200">
              <div
                className="h-full bg-blue-600 animate-pulse"
                style={{ width: "60%" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Операционные скелетоны с адаптивными размерами */}
      {activeOperation === "saving" && (
        <SettingsOperationSkeleton
          operation="Сохранение настроек..."
          isMobile={isMobile}
        />
      )}
      {activeOperation === "import" && (
        <SettingsImportSkeleton isMobile={isMobile} />
      )}
      {activeOperation === "export" && (
        <SettingsExportSkeleton isMobile={isMobile} />
      )}
      {activeOperation === "reset" && (
        <SettingsResetSkeleton isMobile={isMobile} />
      )}
      {activeOperation === "validation" && (
        <SettingsValidationSkeleton isMobile={isMobile} />
      )}

      {saving && !activeOperation && (
        <SettingsOperationSkeleton
          operation="Обработка..."
          isMobile={isMobile}
        />
      )}
    </>
  );
}
