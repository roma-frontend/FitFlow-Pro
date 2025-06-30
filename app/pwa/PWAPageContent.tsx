
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Smartphone,
    Settings,
    BarChart3,
    Bell,
    Download,
    Shield,
    Zap,
} from "lucide-react";
import { PWAInfo } from "@/components/PWAInfo";
import { PWAStats } from "@/components/PWAStats";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { PWAStatus } from "@/components/PWAStatus";
import { PWANotifications } from "@/components/PWANotifications";
import { PWAAnalytics } from "@/components/PWAAnalytics";
import usePWA from "@/hooks/usePWA";

export default function PWAPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const { isInstalled, canInstall } = usePWA();

    return (
        <div className="min-h-[100svh] bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Назад
                        </Button>
                        <div className="ml-auto flex items-center gap-3">
                            <PWAStatus showDetails={true} />
                            <PWAInstallButton variant="outline" size="sm" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <Smartphone className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                PWA Управление
                            </h1>
                            <p className="text-xl text-gray-600">
                                Полное управление Progressive Web App
                            </p>
                        </div>
                    </div>
                </div>

                {/* Основные табы */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-8">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Обзор
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Настройки
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="flex items-center gap-2"
                        >
                            <Bell className="h-4 w-4" />
                            Уведомления
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Аналитика
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Расширенные
                        </TabsTrigger>
                    </TabsList>

                    {/* Обзор */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <PWAInfo />
                            </div>
                            <div>
                                <PWAStats />
                            </div>
                        </div>

                        {/* Быстрые действия */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Быстрые действия</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {!isInstalled && canInstall && (
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                                            <Download className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                                            <h3 className="font-semibold text-blue-900 mb-2">
                                                Установить приложение
                                            </h3>
                                            <p className="text-sm text-blue-700 mb-4">
                                                Получите нативный опыт
                                            </p>
                                            <PWAInstallButton size="sm" className="w-full" />
                                        </div>
                                    )}

                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                                        <Zap className="h-8 w-8 text-green-600 mx-auto mb-3" />
                                        <h3 className="font-semibold text-green-900 mb-2">
                                            Проверить кеш
                                        </h3>
                                        <p className="text-sm text-green-700 mb-4">
                                            Управление офлайн данными
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full border-green-300 text-green-700 hover:bg-green-100"
                                            onClick={() => setActiveTab("settings")}
                                        >
                                            Открыть
                                        </Button>
                                    </div>

                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
                                        <Bell className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                                        <h3 className="font-semibold text-purple-900 mb-2">
                                            Настроить уведомления
                                        </h3>
                                        <p className="text-sm text-purple-700 mb-4">
                                            Push notifications
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
                                            onClick={() => setActiveTab("notifications")}
                                        >
                                            Настроить
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Настройки */}
                    <TabsContent value="settings" className="space-y-6">
                        <PWAInfo />
                    </TabsContent>

                    {/* Уведомления */}
                    <TabsContent value="notifications" className="space-y-6">
                        <PWANotifications />
                    </TabsContent>

                    {/* Аналитика */}
                    <TabsContent value="analytics" className="space-y-6">
                        <PWAAnalytics />
                    </TabsContent>

                    {/* Расширенные настройки */}
                    <TabsContent value="advanced" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Расширенные настройки PWA</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h3 className="font-semibold text-yellow-900 mb-2">
                                            ⚠️ Внимание
                                        </h3>
                                        <p className="text-sm text-yellow-800">
                                            Изменение этих настроек может повлиять на работу
                                            приложения. Используйте с осторожностью.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold mb-3">Управление данными</h4>
                                            <div className="space-y-3">
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                >
                                                    Экспорт настроек PWA
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                >
                                                    Импорт настроек PWA
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="w-full justify-start"
                                                >
                                                    Сброс всех данных PWA
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-3">Диагностика</h4>
                                            <div className="space-y-3">
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                >
                                                    Проверить Service Worker
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                >
                                                    Тест push уведомлений
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                >
                                                    Проверить кеш
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Техническая информация */}
                                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-semibold mb-3">
                                            Техническая информация
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <strong>PWA Version:</strong>
                                                <p className="text-gray-600">2.1.0</p>
                                            </div>
                                            <div>
                                                <strong>Service Worker:</strong>
                                                <p className="text-gray-600">
                                                    {typeof window !== 'undefined' && "serviceWorker" in navigator
                                                        ? "Активен"
                                                        : "Недоступен"}
                                                </p>
                                            </div>
                                            <div>
                                                <strong>Manifest:</strong>
                                                <p className="text-gray-600">Загружен</p>
                                            </div>
                                            <div>
                                                <strong>Display Mode:</strong>
                                                <p className="text-gray-600">
                                                    {isInstalled ? "Standalone" : "Browser"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
