// components/admin/PasswordResetManagement.tsx (исправленная версия)
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePasswordResetCleanup } from "@/hooks/usePasswordResetCleanup";
import { PasswordResetLogs } from "./PasswordResetLogs";
import { PasswordResetNotifications } from "./PasswordResetNotifications";
import {
  Shield,
  Trash2,
  Settings,
  AlertTriangle,
  Info,
  CheckCircle,
  Mail,
  BarChart3,
  Loader2,
} from "lucide-react";

export function PasswordResetManagement() {
  const [activeTab, setActiveTab] = useState<
    "logs" | "settings" | "notifications"
  >("logs");
  const [isClient, setIsClient] = useState(false);
  
  // ВСЕГДА вызываем хук, независимо от условий
  const { cleanup, isLoading } = usePasswordResetCleanup();
  
  // Проверяем, что компонент загружен на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCleanup = async () => {
    // Проверяем isClient перед выполнением действия, а не перед вызовом хука
    if (!isClient) return;
    
    try {
      await cleanup();
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  const tabs = [
    { id: "logs", label: "Логи", icon: BarChart3 },
    { id: "notifications", label: "Email", icon: Mail },
    { id: "settings", label: "Настройки", icon: Settings },
  ] as const;

  // Показываем загрузку до полной гидрации
  if (!isClient) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Инициализация управления паролями...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и навигация */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span>Управление восстановлением паролей</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Мониторинг и управление процессом восстановления паролей
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Информационные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Безопасность
                </p>
                <p className="text-xs text-blue-700">Токены действуют 1 час</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Защита от спама
                </p>
                <p className="text-xs text-green-700">
                  Лимит: 1 запрос в 5 минут
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Автоочистка
                </p>
                <p className="text-xs text-orange-700">
                  Истекшие токены удаляются
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  Email уведомления
                </p>
                <p className="text-xs text-purple-700">
                  HTML + текстовые версии
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Контент вкладок */}
      {activeTab === "logs" && <PasswordResetLogs />}
      {activeTab === "notifications" && <PasswordResetNotifications />}

      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Настройки очистки */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5" />
                <span>Очистка истекших токенов</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Автоматическая очистка</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Истекшие токены восстановления пароля автоматически удаляются
                  из базы данных для обеспечения безопасности и экономии места.
                </p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Активно
                  </span>
                  <span className="text-xs text-gray-500">
                    • Проверка каждые 24 часа
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Ручная очистка</h4>
                  <p className="text-sm text-gray-600">
                    Принудительно удалить все истекшие токены сейчас
                  </p>
                </div>
                <Button
                  onClick={handleCleanup}
                  disabled={isLoading || !isClient}
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Очистка...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Очистить сейчас
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Параметры безопасности */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Параметры безопасности</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-blue-600" />
                    Время жизни токена
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Токены восстановления пароля действуют в течение:
                  </p>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-mono text-sm">
                      1 час (3600 секунд)
                    </span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                    Лимит запросов
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Максимальная частота запросов на восстановление:
                  </p>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-mono text-sm">1 раз в 5 минут</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Конфигурация системы */}
          <Card>
            <CardHeader>
              <CardTitle>Системная конфигурация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">
                  Переменные окружения
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">NODE_ENV:</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-mono">
                        {typeof window !== 'undefined' ? 'client' : 'server'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Convex:</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-mono">Подключен</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
