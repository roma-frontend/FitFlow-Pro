// app/staff-login/StaffLoginContent.tsx - ФИНАЛЬНАЯ ВЕРСИЯ С ЕДИНЫМ LOADER
"use client";

import { useStaffAuth } from "@/hooks/useStaffAuth";
import { StaffLoginForm } from "@/components/staff/StaffLoginForm";
import { StaffForgotPasswordForm } from "@/components/staff/StaffForgotPasswordForm";
import { StaffAuthNavigation } from "@/components/staff/StaffAuthNavigation";
import { StaffSecurityInfo } from "@/components/staff/StaffSecurityInfo";
import { StaffDevelopmentTools } from "@/components/staff/StaffDevelopmentTools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Zap, TrendingUp, ArrowRight, CheckCircle, AlertTriangle, Lock, Mail, Loader2, Eye, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldButtonV1 } from "./components/StaffLoginButton";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { useLoaderStore } from "@/stores/loaderStore";
import { FaceIdQuickAccess } from "@/components/FaceIdQuickAccess";
import StaffLoginLoader from "./components/StaffLoginLoader";
import { UserRole } from "@/lib/permissions";

// Утилитная функция для безопасного приведения строки к UserRole
const toUserRole = (role: string | null | undefined): UserRole => {
  const validRoles: UserRole[] = ["super-admin", "admin", "manager", "trainer", "member", "client"];
  if (role && validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }
  return "member"; // Значение по умолчанию
};

// ✅ ПРЕДВАРИТЕЛЬНАЯ ПРОВЕРКА перед хуками для мгновенного показа loader
function shouldShowLoader() {
  if (typeof window === 'undefined') return false;
  
  // Проверяем возврат от Google OAuth
  const urlParams = new URLSearchParams(window.location.search);
  const hasGoogleParams = urlParams.get('code') && urlParams.get('state');
  const googleInProgress = sessionStorage.getItem('google_login_in_progress') === 'true';
  
  // Проверяем флаг редиректа
  const isRedirecting = sessionStorage.getItem('is_redirecting') === 'true';
  
  return (hasGoogleParams && googleInProgress) || isRedirecting;
}

export default function StaffLoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // ✅ НОВОЕ: Получаем состояние loader из store
  const { loaderType, loaderProps } = useLoaderStore();
  
  // ✅ ПРЕДВАРИТЕЛЬНАЯ ПРОВЕРКА для мгновенного показа loader
  const [showLoaderImmediately] = useState(() => shouldShowLoader());

  let staffAuthData;
  try {
    staffAuthData = useStaffAuth();
  } catch (error) {
    console.error('❌ Ошибка useStaffAuth:', error);
    // Fallback данные
    staffAuthData = {
      isLoading: false,
      showForgotPassword: false,
      resetEmail: "",
      resetSent: false,
      setShowForgotPassword: () => {},
      setResetEmail: () => {},
      setResetSent: () => {},
      handleStaffLogin: async () => ({ success: false }),
      handlePasswordReset: async () => {},
      handleSuperAdminQuickLogin: async () => ({ success: false }),
    };
  }

  const {
    isLoading,
    showForgotPassword,
    resetEmail,
    resetSent,
    setShowForgotPassword,
    setResetEmail,
    setResetSent,
    handleStaffLogin,
    handlePasswordReset,
    handleSuperAdminQuickLogin,
  } = staffAuthData;

  // ✅ ЕДИНАЯ ЛОГИКА: показываем полноэкранный loader когда:
  // 1. loaderType = "login"
  // 2. Предварительная проверка показала необходимость
  // 3. Возврат от Google OAuth
  if ((loaderType === "login" && loaderProps) || showLoaderImmediately) {
    const defaultProps = {
      userRole: "admin" as UserRole,
      userName: "Загрузка...",
      dashboardUrl: "/admin"
    };
    
    // Если есть данные от Google OAuth, используем их
    if (showLoaderImmediately && !loaderProps) {
      const isStaff = sessionStorage.getItem('google_login_is_staff') === 'true';
      const savedTarget = sessionStorage.getItem('google_login_target_url');
      const staffRole = sessionStorage.getItem('google_login_staff_role');
      
      return (
        <StaffLoginLoader
          userRole={toUserRole(staffRole) || (isStaff ? "admin" : "member")}
          userName="Завершение авторизации..."
          dashboardUrl={savedTarget || "/admin"}
          isOpen={true}
        />
      );
    }
    
    return (
      <StaffLoginLoader
        userRole={loaderProps?.userRole || defaultProps.userRole}
        userName={loaderProps?.userName || defaultProps.userName}
        dashboardUrl={loaderProps?.dashboardUrl || defaultProps.dashboardUrl}
        isOpen={true}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleStaffLogin({ email, password });
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
    }
  };

  const handleFormSubmit = async (formData: any): Promise<void> => {
    try {
      await handleStaffLogin(formData);
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
    }
  };

  const handleQuickLogin = async (): Promise<void> => {
    try {
      await handleSuperAdminQuickLogin();
    } catch (error) {
      console.error('❌ Ошибка быстрого входа:', error);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  const handleResendReset = () => {
    setResetSent(false);
    setResetEmail("");
  };

  // ✅ Проверка возврата от Google OAuth
  useEffect(() => {
    const checkGoogleOAuthReturn = () => {
      // Проверяем если пользователь вернулся после Google OAuth
      const googleLoginInProgress = sessionStorage.getItem('google_login_in_progress');
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      // Если обнаружен возврат и loader еще не показан
      if (googleLoginInProgress === 'true' && code && state && !loaderType) {
        console.log('🔄 Обнаружен возврат после Google OAuth на staff-login - показываем loader');
        
        // Получаем сохраненные данные
        const isStaff = sessionStorage.getItem('google_login_is_staff') === 'true';
        const savedRedirect = sessionStorage.getItem('google_login_target_url') || 
                             sessionStorage.getItem('google_login_redirect');
        const staffRole = sessionStorage.getItem('google_login_staff_role');
        
        // Показываем loader немедленно
        const { showLoader } = useLoaderStore.getState();
        showLoader("login", {
          userRole: toUserRole(staffRole) || (isStaff ? "admin" : "member"),
          userName: "Завершение авторизации...",
          dashboardUrl: savedRedirect || "/admin"
        });
      }
    };
    
    // Проверяем сразу при загрузке
    checkGoogleOAuthReturn();
  }, [loaderType]);

  if (showForgotPassword) {
    return (
      <div className="min-h-[100lvh] bg-gradient-to-br from-slate-700 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <StaffForgotPasswordForm
            resetEmail={resetEmail}
            resetSent={resetSent}
            isLoading={isLoading}
            onEmailChange={setResetEmail}
            onSubmit={handlePasswordReset}
            onBack={handleBackToLogin}
            onResend={handleResendReset}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-slate-700 via-blue-700 to-indigo-800">
      {/* Мобильная версия */}
      <div className="lg:hidden">
        <div className="min-h-[100lvh] flex flex-col">
          <div className="flex-1 flex flex-col justify-center px-6 py-8">
            
            <ShieldButtonV1 />

            <div className="w-full max-w-sm mx-auto">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Служебный email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 text-gray-900 placeholder-gray-500"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 text-gray-900 placeholder-gray-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email || !password}
                      className="w-full py-3 px-4 bg-gradient-to-r from-slate-600 to-blue-600 text-white font-medium rounded-2xl hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isLoading && !(loaderType === "login") ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Проверка...
                        </div>
                      ) : (
                        "Войти в систему"
                      )}
                    </button>
                  </form>

                  {/* Забыли пароль */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Забыли пароль?
                    </button>
                  </div>

                  {/* Роли */}
                  <div className="mt-6 space-y-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Доступные роли</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center p-2 bg-purple-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                        <span className="text-purple-700">Супер Админ</span>
                      </div>
                      <div className="flex items-center p-2 bg-red-50 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                        <span className="text-red-700">Админ</span>
                      </div>
                      <div className="flex items-center p-2 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        <span className="text-green-700">Менеджер</span>
                      </div>
                      <div className="flex items-center p-2 bg-orange-50 rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                        <span className="text-orange-700">Тренер</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Быстрые действия */}
              <div className="mt-6 space-y-3">
                <GoogleLoginButton
                  isStaff={true}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/30 transition-all text-white"
                />
                <button
                  onClick={() => router.push("/member-login")}
                  className="w-full flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/30 transition-all text-white"
                >
                  <Users className="h-5 w-5 mr-2" />
                  <span className="font-medium">Вход для участников</span>
                </button>

                <button
                  onClick={() => router.push("/auth/face-auth")}
                  className="w-full flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all text-white/80"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  <span className="font-medium">Face ID авторизация</span>
                </button>
              </div>

              {/* Системный статус */}
              <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white">Статус системы</h4>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    <span className="text-xs text-green-300">Онлайн</span>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-white/70">
                  <div className="flex justify-between">
                    <span>Сервер</span>
                    <span className="text-green-300">✓ Работает</span>
                  </div>
                  <div className="flex justify-between">
                    <span>База данных</span>
                    <span className="text-green-300">✓ Подключена</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Резервирование</span>
                    <span className="text-green-300">✓ Актуально</span>
                  </div>
                </div>
              </div>

              {/* Development Tools */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-4">
                  <button
                    onClick={handleQuickLogin}
                    disabled={isLoading}
                    className="w-full p-2 bg-yellow-500/20 border border-yellow-400/30 rounded-xl text-yellow-300 text-xs hover:bg-yellow-500/30 transition-all"
                  >
                    🚀 Quick Super Admin (DEV)
                  </button>
                </div>
              )}

              {/* Безопасность */}
              <div className="mt-6 flex justify-center space-x-4 text-xs text-white/50">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                  <span>SSL</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                  <span>2FA</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                  <span>Audit</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Десктопная версия (оригинальная) */}
      <div className="hidden lg:block py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">

          {/* Заголовок страницы */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Панель управления FitFlow Pro
            </h1>
            <p className="text-lg text-gray-600">
              Безопасный вход для персонала и администрации
            </p>
          </div>

          {/* Основной контент в виде "книги" */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">

            {/* Левая "страница" - Ваши компоненты */}
            <div className="order-1 space-y-6">
              <StaffLoginForm
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
              />

              <StaffAuthNavigation
                isLoading={isLoading}
                onShowForgotPassword={() => setShowForgotPassword(true)}
              />

              <StaffDevelopmentTools
                isLoading={isLoading}
                onQuickLogin={handleQuickLogin}
              />
            </div>

            {/* Правая "страница" - Информация */}
            <div className="order-1 lg:order-2 space-y-6">

              <StaffSecurityInfo />

              {/* Роли и возможности */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Роли и возможности
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-3">
                  <div className="space-y-3">
                    <div className="p-3 bg-white/60 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <Shield className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="font-medium text-blue-900">Супер Администратор</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Полный доступ ко всем функциям системы
                      </p>
                    </div>

                    <div className="p-3 bg-white/60 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <Shield className="h-4 w-4 text-red-600 mr-2" />
                        <span className="font-medium text-blue-900">Администратор</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Управление контентом и пользователями
                      </p>
                    </div>

                    <div className="p-3 bg-white/60 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                        <span className="font-medium text-blue-900">Менеджер</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Управление программами и клиентами
                      </p>
                    </div>

                    <div className="p-3 bg-white/60 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <Zap className="h-4 w-4 text-orange-600 mr-2" />
                        <span className="font-medium text-blue-900">Тренер</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Работа с клиентами и программами
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Быстрые действия */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-900 flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Быстрые действия
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={() => router.push("/member-login")}
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-300/30 rounded-lg hover:from-blue-500/20 hover:to-indigo-500/20 transition-all text-left group"
                  >
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-600 mr-3" />
                      <div>
                        <div className="font-medium text-purple-900">Вход для клиентов</div>
                        <div className="text-xs text-purple-700">Обычный пользовательский вход</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => router.push("/auth/face-auth")}
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-300/30 rounded-lg hover:from-green-500/20 hover:to-emerald-500/20 transition-all text-left group"
                  >
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-green-600 mr-3" />
                      <div>
                        <div className="font-medium text-purple-900">Face ID вход</div>
                        <div className="text-xs text-purple-700">Биометрическая авторизация</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                </CardContent>
              </Card>

              {/* Системные уведомления */}
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Статус системы
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-orange-800 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Все системы работают</span>
                        <p className="text-xs text-orange-700 mt-1">Последняя проверка: 2 мин назад</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Резервное копирование</span>
                        <p className="text-xs text-orange-700 mt-1">Завершено сегодня в 03:00</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Дополнительная информация внизу */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-gray-50 to-slate-100 border-gray-200 shadow-sm">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <span>Защищенное соединение</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    <span>Логирование действий</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                    <span>24/7 мониторинг</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
      <FaceIdQuickAccess variant="floating" className="bottom-10 right-10 hidden lg:block" />
    </div>
  );
}