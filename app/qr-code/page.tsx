// app/qr-code/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  QrCode,
  Download,
  Share2,
  Smartphone,
  Shield,
  Clock,
  Users,
  Sparkles,
  Zap,
  Lock,
  Unlock,
  Calendar,
  ChevronRight,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  RefreshCw,
  Copy,
  Check,
  ArrowLeft,
  Gift,
  History,
  BarChart3,
  Fingerprint,
  CreditCard
} from "lucide-react";

interface QRHistoryItem {
  id: string;
  type: "main" | "guest" | "temporary";
  createdAt: Date;
  expiresAt?: Date;
  usageCount: number;
  lastUsed?: Date;
  guestName?: string;
  isActive: boolean;
}

export default function QRCodePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState("main");
  const [brightness, setBrightness] = useState(100);

  // Симуляция истории QR-кодов
  const [qrHistory] = useState<QRHistoryItem[]>([
    {
      id: "1",
      type: "main",
      createdAt: new Date("2024-01-01"),
      usageCount: 156,
      lastUsed: new Date(),
      isActive: true
    },
    {
      id: "2",
      type: "guest",
      createdAt: new Date("2024-06-15"),
      expiresAt: new Date("2024-06-16"),
      usageCount: 1,
      guestName: "Иван Петров",
      isActive: false
    }
  ]);

  useEffect(() => {
    if (user) {
      // Генерируем уникальный QR-код для пользователя
      const qrData = {
        userId: user.id,
        email: user.email,
        timestamp: Date.now(),
        type: "access"
      };
      setQrValue(JSON.stringify(qrData));
    }
  }, [user]);

  // Автоматическое увеличение яркости при показе QR
  useEffect(() => {
    if (selectedTab === "main" && !isLocked) {
      setBrightness(100);
      // В реальном приложении здесь бы был код для увеличения яркости экрана
    }
    return () => setBrightness(70);
  }, [selectedTab, isLocked]);

  const handleDownloadQR = () => {
    const svg = document.getElementById("main-qr-code");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "fitflow-qr-code.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
    toast({
      title: "Успешно",
      description: "QR-код сохранен!",
    });
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Мой QR-код FitFlow Pro",
          text: "QR-код для входа в фитнес-клуб",
          url: window.location.href
        });
      } catch (err) {
        console.log("Ошибка при шаринге:", err);
      }
    } else {
      handleCopyCode();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qrValue);
    setIsCopied(true);
    toast({
      title: "Успешно",
      description: "Код скопирован!",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAddToWallet = () => {
    toast({
      title: "В разработке",
      description: "Функция добавления в Wallet скоро будет доступна",
      variant: "default",
    });
    // Здесь будет интеграция с Apple/Google Wallet
  };

  const generateGuestQR = () => {
    const guestData = {
      type: "guest",
      hostId: user?.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 часа
      accessLevel: "limited"
    };
    const guestQR = JSON.stringify(guestData);
    toast({
      title: "Успешно",
      description: "Гостевой QR-код создан!",
    });
    return guestQR;
  };

  const handleBack = () => {
    router.back();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <p className="text-gray-600">Необходимо войти в систему</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    }`}>
      {/* Декоративный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-400 to-blue-400 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <QrCode className="h-4 sm:h-6 w-4 sm:w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    QR-код доступа
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ваш цифровой пропуск в клуб
                  </p>
                </div>
              </div>
            </div>

            {/* Панель управления */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOfflineMode(!isOfflineMode)}
                className={isOfflineMode ? "border-green-500 text-green-600" : ""}
              >
                {isOfflineMode ? (
                  <>
                    <WifiOff className="h-4 w-4 mr-2" />
                    Офлайн
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Онлайн
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - QR-код */}
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="main" className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" />
                  Основной
                </TabsTrigger>
                <TabsTrigger value="guest" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Гостевой
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  История
                </TabsTrigger>
              </TabsList>

              {/* Основной QR-код */}
              <TabsContent value="main">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1">
                      <div className="bg-white dark:bg-gray-900 rounded-t-lg">
                        <CardHeader className="text-center pb-4">
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <Shield className="h-5 w-5 text-green-500" />
                            <CardTitle>Ваш персональный QR-код</CardTitle>
                            <Badge className="bg-green-100 text-green-700">
                              Активен
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {user.name} • ID: {user.id?.slice(0, 8)}...
                          </p>
                        </CardHeader>

                        <CardContent className="pb-8">
                          <div className="relative">
                            {/* QR-код с анимацией */}
                            <motion.div
                              className="relative bg-white p-8 rounded-2xl shadow-lg mx-auto w-fit"
                              animate={isLocked ? {} : {
                                boxShadow: [
                                  "0 0 0 0 rgba(59, 130, 246, 0)",
                                  "0 0 0 10px rgba(59, 130, 246, 0.1)",
                                  "0 0 0 20px rgba(59, 130, 246, 0)",
                                ]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {isLocked ? (
                                <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                                  <div className="text-center">
                                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600">QR-код заблокирован</p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="mt-2"
                                      onClick={() => setIsLocked(false)}
                                    >
                                      <Unlock className="h-4 w-4 mr-2" />
                                      Разблокировать
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <QRCode
                                  id="main-qr-code"
                                  value={qrValue}
                                  size={256}
                                  level="H"
                                />
                              )}
                              
                              {/* Центральный логотип */}
                              {!isLocked && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                                    <Sparkles className="h-8 w-8 text-blue-600" />
                                  </div>
                                </div>
                              )}
                            </motion.div>

                            {/* Индикатор обновления */}
                            {isOfflineMode && (
                              <div className="absolute top-2 right-2 flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                                <WifiOff className="h-3 w-3" />
                                Офлайн режим
                              </div>
                            )}
                          </div>

                          {/* Действия */}
                          <div className="grid grid-cols-2 gap-4 mt-8">
                            <Button
                              onClick={handleDownloadQR}
                              variant="outline"
                              className="group"
                              disabled={isLocked}
                            >
                              <Download className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                              Сохранить
                            </Button>
                            <Button
                              onClick={handleShareQR}
                              variant="outline"
                              className="group"
                              disabled={isLocked}
                            >
                              <Share2 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                              Поделиться
                            </Button>
                          </div>

                          {/* Добавить в Wallet */}
                          <Button
                            onClick={handleAddToWallet}
                            className="w-full mt-4 bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-black"
                            disabled={isLocked}
                          >
                            <Smartphone className="h-4 w-4 mr-2" />
                            Добавить в Apple/Google Wallet
                          </Button>

                          {/* Безопасность */}
                          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="flex flex-wrap items-start sm:items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium">Безопасность</span>
                              </div>
                              <Button
                                size="sm"
                                variant={isLocked ? "default" : "destructive"}
                                onClick={() => setIsLocked(!isLocked)}
                              >
                                {isLocked ? (
                                  <>
                                    <Unlock className="h-3 w-3 mr-1" />
                                    Разблокировать
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-3 w-3 mr-1" />
                                    Заблокировать
                                  </>
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              Заблокируйте QR-код при утере телефона
                            </p>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Гостевой QR */}
              <TabsContent value="guest">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-purple-600" />
                      Пригласить друга
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-6">
                      Создайте временный QR-код для друга на пробную тренировку
                    </p>
                    <Button
                      onClick={() => generateGuestQR()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Создать гостевой QR-код
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* История */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>История использования</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {qrHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.type === "main" ? "bg-blue-100" : "bg-purple-100"
                            }`}>
                              {item.type === "main" ? (
                                <QrCode className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Users className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {item.type === "main" ? "Основной QR-код" : "Гостевой QR-код"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.guestName || `Использован ${item.usageCount} раз`}
                              </p>
                            </div>
                          </div>
                          <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "Активен" : "Истек"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Правая колонка - Информация */}
          <div className="space-y-6">
            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Использований сегодня</span>
                  <span className="font-bold text-lg">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Всего за месяц</span>
                  <span className="font-bold text-lg">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Последнее использование</span>
                  <span className="text-sm font-medium">Сегодня, 14:32</span>
                </div>
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Быстрые действия
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/member-dashboard")}
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  Мои тренировки
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/memberships")}
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Абонементы
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCopyCode}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-3 text-green-600" />
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-3" />
                      Копировать код
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Подсказки */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">💡 Полезные советы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Сохраните QR-код в галерею для офлайн доступа</p>
                <p>• Добавьте в Wallet для быстрого доступа</p>
                <p>• Увеличьте яркость экрана при сканировании</p>
                <p>• Заблокируйте код при утере телефона</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}