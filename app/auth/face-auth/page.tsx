// app/auth/face-auth/FaceAuthContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FaceAuthOptimized from "@/components/auth/face-auth/FaceAuthOptimized";
import MainHeader from "@/components/MainHeader";
import { useAuth } from "@/hooks/useAuth";
import { useFaceIdSmart } from "@/hooks/useFaceIdSmart";
import { SwitchModeType, FaceAuthMode } from "@/types/face-auth.types";
import { toast } from "@/hooks/use-toast";
import { FaceIdQuickLogin } from "@/components/auth/FaceIdQuickLogin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, Shield, ArrowRight, Info, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FaceAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const {
    isFaceIdRegistered,
    faceIdStatus,
    checkFaceIdStatus,
    profiles
  } = useFaceIdSmart();

  // Состояние страницы
  const [mode, setMode] = useState<FaceAuthMode>("login");
  const [viewMode, setViewMode] = useState<SwitchModeType>("modern");
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Получаем redirect параметр
  const redirectParam = searchParams.get("redirect");

  // Проверяем статус Face ID при загрузке
  useEffect(() => {
    checkFaceIdStatus();
  }, []);

  // Определяем режим на основе статуса пользователя и Face ID
  useEffect(() => {
    if (user && !isFaceIdRegistered) {
      // Пользователь авторизован, но Face ID не настроен
      setMode("register");
      toast({
        title: "Настройте Face ID",
        description: "Для быстрого входа в будущем настройте Face ID",
      });
    } else if (!user && isFaceIdRegistered) {
      // Пользователь не авторизован, но Face ID настроен
      setMode("login");
      setShowQuickLogin(true);
    } else if (user && isFaceIdRegistered) {
      // Пользователь авторизован и Face ID настроен
      toast({
        title: "Face ID уже настроен",
        description: "Вы можете управлять Face ID в настройках безопасности",
      });
      // Перенаправляем в личный кабинет
      router.push(redirectParam || "/member-dashboard?tab=security");
    }
  }, [user, isFaceIdRegistered, router, redirectParam]);

  // Обработчик успешной аутентификации
  const handleSuccess = async (userData: any) => {
    console.log("✅ Успешная Face ID аутентификация:", userData);

    setIsRedirecting(true);

    try {
      // Обновляем состояние пользователя
      await refreshUser();
      
      // Проверяем тип действия
      if (userData.action === "face_id_registered") {
        toast({
          title: "✅ Face ID настроен!",
          description: userData.message || "Теперь вы можете использовать Face ID для входа",
        });

        // Небольшая задержка для показа сообщения
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Перенаправляем после регистрации
        if (redirectParam) {
          router.push(redirectParam);
        } else {
          router.push("/member-dashboard?tab=security");
        }
      } else if (userData.action === "face_login_success") {
        // Используем URL из ответа сервера или redirect параметр
        const targetUrl = userData.dashboardUrl || redirectParam || "/member-dashboard";
        
        toast({
          title: "🎉 Добро пожаловать!",
          description: `Вход выполнен через Face ID`,
        });

        // Небольшая задержка для показа сообщения
        await new Promise(resolve => setTimeout(resolve, 1000));

        router.push(targetUrl);
      }
    } catch (error) {
      console.error("❌ Ошибка после Face ID аутентификации:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось завершить процесс аутентификации",
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  // Обработчик переключения режима отображения
  const handleSwitchMode = (newMode: SwitchModeType) => {
    setViewMode(newMode);
    console.log("🔄 Переключение режима отображения:", newMode);
  };

  // Обработчик переключения между login/register
  const handleToggleAuthMode = () => {
    if (user && !isFaceIdRegistered) {
      // Если пользователь авторизован, остаемся в режиме регистрации
      toast({
        title: "Настройте Face ID",
        description: "Вы уже вошли в систему. Настройте Face ID для быстрого входа в будущем.",
      });
      return;
    }
    
    setMode(mode === "login" ? "register" : "login");
  };

  // Рендер основного контента
  return (
    <>
      <MainHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Индикатор redirect */}
        {redirectParam && (
          <div className="bg-blue-500/90 backdrop-blur-sm text-white text-center py-2 px-4">
            <p className="text-sm">
              📍 После входа вы будете перенаправлены на запрошенную страницу
            </p>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === "login" ? "Face ID вход" : "Настройка Face ID"}
            </h1>
            <p className="text-lg text-gray-600">
              {mode === "login" 
                ? "Быстрый и безопасный вход с помощью биометрии" 
                : "Создайте биометрический профиль для быстрого входа"
              }
            </p>
          </div>

          {/* Основной контент */}
          <div className="max-w-6xl mx-auto">
            {showQuickLogin && mode === "login" ? (
              // Показываем компонент быстрого входа для зарегистрированных пользователей
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <FaceIdQuickLogin 
                    variant="hero"
                    onSuccess={() => {
                      // Обработка успешного входа уже происходит внутри компонента
                      setIsRedirecting(true);
                    }}
                  />
                </div>
                
                <div className="space-y-6">
                  {/* Информация о Face ID */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-green-600" />
                        Ваш Face ID активен
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {faceIdStatus?.profile && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                              <strong>Профиль создан:</strong> {new Date(faceIdStatus.profile.createdAt).toLocaleDateString()}
                            </p>
                            {faceIdStatus.profile.lastUsedAt && (
                              <p className="text-sm text-green-800 mt-1">
                                <strong>Последний вход:</strong> {new Date(faceIdStatus.profile.lastUsedAt).toLocaleDateString()}
                              </p>
                            )}
                            <p className="text-sm text-green-800 mt-1">
                              <strong>Использований:</strong> {faceIdStatus.profile.usageCount}
                            </p>
                          </div>
                        )}
                        
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Face ID использует математическое представление вашего лица. 
                            Фотографии не сохраняются.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Альтернативные методы входа */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Другие способы входа</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => router.push("/member-login" + (redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ""))}
                      >
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Вход с паролем
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      
                      {user && (
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => router.push("/member-dashboard?tab=security")}
                        >
                          <span className="flex items-center">
                            <Settings className="h-4 w-4 mr-2" />
                            Управление Face ID
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              // Показываем полный компонент Face Auth
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <FaceAuthOptimized
                    mode={mode}
                    onSuccess={handleSuccess}
                    viewMode={viewMode}
                    onSwitchMode={handleSwitchMode}
                  />
                  
                  {/* Переключатель режима */}
                  {!user && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleToggleAuthMode}
                        disabled={isRedirecting}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {mode === "login" ? (
                          <>
                            Нет аккаунта? <span className="text-blue-600 font-medium">Зарегистрироваться</span>
                          </>
                        ) : (
                          <>
                            Уже есть аккаунт? <span className="text-blue-600 font-medium">Войти</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  {/* Статус Face ID */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Статус Face ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className={cn(
                          "p-3 rounded-lg text-center",
                          isFaceIdRegistered 
                            ? "bg-green-50 text-green-800" 
                            : "bg-gray-50 text-gray-800"
                        )}>
                          <Eye className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-medium">
                            {isFaceIdRegistered 
                              ? "Face ID активен" 
                              : "Face ID не настроен"
                            }
                          </p>
                          {profiles.length > 0 && (
                            <p className="text-sm mt-1">
                              Профилей: {profiles.length} из 3
                            </p>
                          )}
                        </div>
                        
                        {!user && mode === "register" && (
                          <Alert>
                            <AlertDescription>
                              Для настройки Face ID необходимо сначала войти в систему
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Быстрые действия */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Быстрые действия</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!user ? (
                        <>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push("/member-login" + (redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ""))}
                          >
                            Вход с паролем
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push("/staff-login")}
                          >
                            Вход для персонала
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push("/member-dashboard")}
                          >
                            Личный кабинет
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push("/setup-face-recognition")}
                          >
                            Полная настройка Face ID
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}