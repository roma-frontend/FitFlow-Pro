// components/admin/settings/components/SettingsTabs.tsx
"use client";

import React, { lazy, Suspense, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Users,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  FileText,
  Menu,
  ChevronDown,
  ChevronRight,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SystemConfig } from "@/types/settings";

// Ленивая загрузка компонентов
const GeneralSettings = lazy(() =>
  import("@/components/admin/settings/GeneralSettings").then((m) => ({
    default: m.GeneralSettings,
  }))
);
const NotificationSettings = lazy(() =>
  import("@/components/admin/settings/Notificationsettings").then((m) => ({
    default: m.NotificationSettings,
  }))
);
const UserManagement = lazy(() =>
  import("@/components/admin/settings/UserManagment").then((m) => ({
    default: m.UserManagement,
  }))
);
const SecuritySettings = lazy(() =>
  import("@/components/admin/settings/SecuritySettings").then((m) => ({
    default: m.SecuritySettings,
  }))
);
const AppearanceSettings = lazy(() =>
  import("@/components/admin/settings/AppearanceSettings").then((m) => ({
    default: m.AppearanceSettings,
  }))
);
const IntegrationSettings = lazy(() =>
  import("@/components/admin/settings/IntegrationSettings").then((m) => ({
    default: m.IntegrationSettings,
  }))
);
const SystemSettings = lazy(() =>
  import("@/components/admin/settings/SystemSettings").then((m) => ({
    default: m.SystemSettings,
  }))
);
const BackupSettings = lazy(() =>
  import("@/components/admin/settings/BackupSettings").then((m) => ({
    default: m.BackupSettings,
  }))
);

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  config: SystemConfig;
  updateConfig: (section: keyof SystemConfig, updates: any) => void;
}

// Конфигурация табов
const tabsConfig = [
  {
    id: "general",
    label: "Общие",
    shortLabel: "Общие",
    icon: Building,
    description: "Основные настройки системы",
    category: "main",
    priority: 1,
  },
  {
    id: "users",
    label: "Пользователи",
    shortLabel: "Польз.",
    icon: Users,
    description: "Управление пользователями",
    category: "main",
    priority: 2,
  },
  {
    id: "notifications",
    label: "Уведомления",
    shortLabel: "Увед.",
    icon: Bell,
    description: "Настройки уведомлений",
    category: "features",
    priority: 3,
  },
  {
    id: "security",
    label: "Безопасность",
    shortLabel: "Безоп.",
    icon: Shield,
    description: "Параметры безопасности",
    category: "security",
    priority: 4,
  },
  {
    id: "appearance",
    label: "Внешний вид",
    shortLabel: "Вид",
    icon: Palette,
    description: "Настройки интерфейса",
    category: "features",
    priority: 5,
  },
  {
    id: "integrations",
    label: "Интеграции",
    shortLabel: "Интегр.",
    icon: Globe,
    description: "Внешние сервисы",
    category: "features",
    priority: 6,
  },
  {
    id: "system",
    label: "Система",
    shortLabel: "Сист.",
    icon: Database,
    description: "Системные настройки",
    category: "system",
    priority: 7,
  },
  {
    id: "backup",
    label: "Резервные копии",
    shortLabel: "Бэкап",
    icon: FileText,
    description: "Управление резервными копиями",
    category: "system",
    priority: 8,
  },
];

const TabLoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-32 space-y-3">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <p className="text-sm text-gray-500">Загрузка настроек...</p>
  </div>
);

// Компонент для мобильного меню табов
const MobileTabsMenu = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const activeTabConfig = tabsConfig.find((tab) => tab.id === activeTab);

  const groupedTabs = tabsConfig.reduce(
    (acc, tab) => {
      if (!acc[tab.category]) {
        acc[tab.category] = [];
      }
      acc[tab.category].push(tab);
      return acc;
    },
    {} as Record<string, typeof tabsConfig>
  );

  const categoryLabels = {
    main: "Основные",
    features: "Функции",
    security: "Безопасность",
    system: "Система",
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Заголовок */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Настройки</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Список табов */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {Object.entries(groupedTabs).map(([category, tabs]) => (
                <div key={category} className="space-y-1">
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h3>
                  </div>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          onTabChange(tab.id);
                          onClose();
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                          isActive
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isActive ? "text-blue-600" : "text-gray-400"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{tab.label}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {tab.description}
                          </div>
                        </div>
                        {isActive && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Компонент для десктопных табов
const DesktopTabs = ({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => {
  return (
    <div className="hidden lg:block">
      <TabsList className="grid w-full grid-cols-8 h-auto p-1 bg-gray-50/80 backdrop-blur-sm">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center gap-1.5 p-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
};

// Компонент для планшетных табов
const TabletTabs = ({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => {
  return (
    <div className="hidden md:block lg:hidden">
      <ScrollArea className="w-full">
        <TabsList className="inline-flex h-auto p-1 bg-gray-50/80 backdrop-blur-sm min-w-max">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-4 py-2.5 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.shortLabel}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </ScrollArea>
    </div>
  );
};

// Компонент для мобильного хедера
const MobileHeader = ({
  activeTab,
  onMenuOpen,
}: {
  activeTab: string;
  onMenuOpen: () => void;
}) => {
  const activeTabConfig = tabsConfig.find((tab) => tab.id === activeTab);
  const Icon = activeTabConfig?.icon || Settings;

  return (
    <div className="md:hidden mb-4">
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="font-semibold text-gray-900">
              {activeTabConfig?.label}
            </h2>
            <p className="text-sm text-gray-500">
              {activeTabConfig?.description}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onMenuOpen}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const SettingsTabs = React.memo(
  ({ activeTab, onTabChange, config, updateConfig }: SettingsTabsProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [screenSize, setScreenSize] = useState<
      "mobile" | "tablet" | "desktop"
    >("desktop");

    // Определение размера экрана
    useEffect(() => {
      const handleResize = () => {
        const width = window.innerWidth;
        if (width < 768) {
          setScreenSize("mobile");
        } else if (width < 1024) {
          setScreenSize("tablet");
        } else {
          setScreenSize("desktop");
        }
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleTabChange = (tab: string) => {
      onTabChange(tab);
      setIsMobileMenuOpen(false);
    };

    return (
      <div className="w-full space-y-4 sm:space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Мобильный хедер */}
          <MobileHeader
            activeTab={activeTab}
            onMenuOpen={() => setIsMobileMenuOpen(true)}
          />

          {/* Планшетные табы */}
          <TabletTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Десктопные табы */}
          <DesktopTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Контент табов */}
          <div className="w-full">
            <TabsContent value="general" className="mt-4 sm:mt-6">
              <Suspense fallback={<TabLoadingSpinner />}>
                <GeneralSettings
                  config={config.general}
                  businessConfig={config.business}
                  onUpdate={(updates) => updateConfig("general", updates)}
                  onBusinessUpdate={(updates) =>
                    updateConfig("business", updates)
                  }
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="users" className="mt-4 sm:mt-6">
              <Suspense fallback={<TabLoadingSpinner />}>
                <UserManagement />
              </Suspense>
            </TabsContent>

            <TabsContent value="notifications" className="mt-4 sm:mt-6">
              <Suspense fallback={<TabLoadingSpinner />}>
                <NotificationSettings
                  config={config.notifications}
                  onUpdate={(updates) => updateConfig("notifications", updates)}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="security" className="mt-4 sm:mt-6">
              <Suspense fallback={<TabLoadingSpinner />}>
                <SecuritySettings
                  config={config.security}
                  onUpdate={(updates) => updateConfig("security", updates)}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="appearance" className="mt-4 sm:mt-6">
              <Suspense fallback={<TabLoadingSpinner />}>
                <AppearanceSettings
                  config={config.appearance}
                  onUpdate={(updates) => updateConfig("appearance", updates)}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="integrations" className="mt-4 sm:mt-6">
              <Suspense fallback={<TabLoadingSpinner />}>
                <IntegrationSettings
                  config={config.integrations}
                  onUpdate={(updates) => updateConfig("integrations", updates)}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="system" className="mt-4 sm:mt-6">
              <Suspense fallback={<TabLoadingSpinner />}>
                <SystemSettings
                  config={config.system}
                  onUpdate={(updates) => updateConfig("system", updates)}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="backup" className="mt-4 sm:mt-6">
              <Suspense fallback={<TabLoadingSpinner />}>
                <BackupSettings />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>

        {/* Мобильное меню */}
        <MobileTabsMenu
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
    );
  }
);

SettingsTabs.displayName = "SettingsTabs";
