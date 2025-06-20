// app/staff-login/page.tsx - сохраняем вашу структуру, добавляем книжный стиль
"use client";

import { useStaffAuth } from "@/hooks/useStaffAuth";
import { StaffLoginForm } from "@/components/staff/StaffLoginForm";
import { StaffForgotPasswordForm } from "@/components/staff/StaffForgotPasswordForm";
import { StaffAuthNavigation } from "@/components/staff/StaffAuthNavigation";
import { StaffSecurityInfo } from "@/components/staff/StaffSecurityInfo";
import { StaffDevelopmentTools } from "@/components/staff/StaffDevelopmentTools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Zap, TrendingUp, ArrowRight, CheckCircle, AlertTriangle, Router } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StaffLoginContent() {
  const router = useRouter()
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
  } = useStaffAuth();

  // Обработчики для компонента восстановления пароля
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  const handleResendReset = () => {
    setResetSent(false);
    setResetEmail("");
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* ✅ Контейнер в стиле "открытой книги" */}
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

        {/* ✅ Основной контент в виде "книги" */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Левая "страница" - Ваши компоненты */}
          <div className="order-1 space-y-6">
            <StaffLoginForm
              onSubmit={handleStaffLogin}
              isLoading={isLoading}
            />

            <StaffAuthNavigation
              isLoading={isLoading}
              onShowForgotPassword={() => setShowForgotPassword(true)}
            />

            <StaffDevelopmentTools
              isLoading={isLoading}
              onQuickLogin={handleSuperAdminQuickLogin}
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
  );
}
