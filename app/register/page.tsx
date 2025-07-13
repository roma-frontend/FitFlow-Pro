// app/register/page.tsx - исправленная версия с Suspense
"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useAuthForm } from "@/hooks/useAuthForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { ErrorAlert } from "@/components/auth/ErrorAlert";
import { FormField } from "@/components/auth/FormField";
import { UniversalSubmitButton } from "@/components/auth/UniversalSubmitButton";
import { AuthModeToggle } from "@/components/auth/AuthModeToggle";
import { FormStatusIndicator } from "@/components/auth/FormStatusIndicator";
import { SecurityInfo } from "@/components/auth/SecurityInfo";
import { DevelopmentTools } from "@/components/auth/DevelopmentTools";
import { OtherAuthOptions } from "@/components/auth/OtherAuthOptions";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { FaceIdSetup } from "@/components/face-id/FaceIdSetup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Zap,
  Users,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Loader2,
  Eye,
  Lock,
  Mail,
  User,
  Phone,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RegistrationSuccess } from "@/components/auth/RegistrationSuccess";
import { useRouter } from "next/navigation";
import { FaceIdQuickLogin } from "@/components/auth/FaceIdQuickLogin";

// Компонент загрузки для Suspense
function PageLoader() {
  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 lg:bg-gradient-to-br lg:from-blue-50 lg:via-white lg:to-indigo-50 flex items-center justify-center p-4">
      <div className="text-center text-white lg:text-gray-900">
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto bg-white/20 lg:bg-blue-100 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-white lg:text-blue-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Загрузка...</h2>
        <p className="text-blue-100 lg:text-gray-600 text-sm">Подготавливаем форму</p>
      </div>
    </div>
  );
}

// Основной компонент контента
function MemberLoginContent() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [faceIdSetupComplete, setFaceIdSetupComplete] = useState(false);
  const [faceIdData, setFaceIdData] = useState<any>(null);
  const router = useRouter();

  const {
    isLogin,
    loading,
    error,
    emailValid,
    formData,
    validationStates,
    isValidating,
    isFormReady,
    isRedirecting,
    handleFieldChange,
    handleSubmit,
    toggleMode,
    fillFormData,
    clearForm,
    registrationSuccess,
    registrationEmail,
    resetRegistrationSuccess,
  } = useAuthForm();

  // Показываем индикатор перенаправления
  if (isRedirecting) {
    return (
      <div className="min-h-[100lvh] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 lg:bg-gradient-to-br lg:from-blue-50 lg:via-white lg:to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center text-white lg:text-gray-900">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto bg-white/20 lg:bg-blue-100 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-white lg:text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {isLogin ? "Вход выполнен!" : "Регистрация завершена!"}
          </h2>
          <p className="text-blue-100 lg:text-gray-600 text-sm">Перенаправляем...</p>
        </div>
      </div>
    );
  }

  if (registrationSuccess && !isLogin) {
    return (
      <RegistrationSuccess
        email={registrationEmail}
        onBackToLogin={() => {
          resetRegistrationSuccess();
          toggleMode(); // Переключаем на режим входа
        }}
        onResendEmail={async () => {
          try {
            // Логика повторной отправки письма
            const response = await fetch('/api/auth/resend-verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: registrationEmail }),
            });

            if (response.ok) {
              toast({
                title: "Письмо отправлено! 📧",
                description: "Проверьте почту еще раз",
              });
            } else {
              throw new Error('Ошибка отправки');
            }
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Ошибка",
              description: "Не удалось отправить письмо повторно",
            });
          }
        }}
      />
    );
  }

  // ✅ Обработчик завершения Face ID setup
  const handleFaceIdComplete = (success: boolean, data?: any) => {
    console.log('🎉 Face ID setup завершен:', { success, data });
    
    if (success) {
      setFaceIdSetupComplete(true);
      setFaceIdData(data);
      console.log('✅ Face ID профиль создан для регистрации:', data);
    } else {
      console.log('❌ Face ID setup не удался');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-[100lvh] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <ForgotPasswordForm
            onBack={() => setShowForgotPassword(false)}
            initialEmail={formData.email}
          />
        </div>
      </div>
    );
  }

  // Компонент логотипа для мобильной версии
  const MobileHeader = () => (
    <div className="text-center mb-8">
      <div className="relative mb-6">
        <div
          className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl cursor-pointer transform transition-all duration-300 ease-out relative overflow-hidden group"
          onClick={() => router.push('/')}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-3xl" />
          <Shield className="w-10 h-10 text-white z-10 relative drop-shadow-lg" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-ping z-20" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2">
        {isLogin ? "Добро пожаловать!" : "Присоединяйтесь!"}
      </h1>
      
      <p className="text-blue-100 text-sm">
        {isLogin ? "Войдите в FitFlow Pro" : "Создайте аккаунт FitFlow Pro"}
      </p>
      
      <div className="mt-4 flex justify-center space-x-4 text-xs text-white/60">
        <div className="flex items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-1" />
          <span>Безопасно</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-blue-400 rounded-full mr-1" />
          <span>Быстро</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-purple-400 rounded-full mr-1" />
          <span>Надежно</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 lg:bg-gradient-to-br lg:from-blue-50 lg:via-white lg:to-indigo-50">
      {/* Мобильная версия */}
      <div className="lg:hidden">
        <div className="min-h-[100lvh] flex flex-col">
          <div className="flex-1 flex flex-col justify-center px-6 py-8">

            {/* Логотип и заголовок */}
            <MobileHeader />

            {/* Форма в card */}
            <div className="w-full max-w-sm mx-auto">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <ErrorAlert error={error} />

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Ваше полное имя"
                          value={formData.name}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 text-gray-900 placeholder-gray-500"
                          required
                        />
                        {validationStates.name && validationStates.name.isValid && (
                          <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                        )}
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Email адрес"
                        value={formData.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 text-gray-900 placeholder-gray-500"
                        required
                      />
                      {validationStates.email && validationStates.email.isValid && (
                        <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                      )}
                      {isValidating && (
                        <Loader2 className="absolute right-3 top-3 h-5 w-5 text-blue-500 animate-spin" />
                      )}
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        placeholder={isLogin ? "Введите пароль" : "Создайте надежный пароль"}
                        value={formData.password}
                        onChange={(e) => handleFieldChange("password", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 text-gray-900 placeholder-gray-500"
                        required
                      />
                      {validationStates.password && validationStates.password.isValid && (
                        <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                      )}
                    </div>

                    {!isLogin && (
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          placeholder="+7 (999) 123-45-67"
                          value={formData.phone}
                          onChange={(e) => handleFieldChange("phone", e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 text-gray-900 placeholder-gray-500"
                        />
                        {validationStates.phone && validationStates.phone.isValid && (
                          <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !isFormReady || isValidating}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          {isLogin ? "Входим..." : "Создаем аккаунт..."}
                        </div>
                      ) : (
                        isLogin ? "Войти в систему" : "Создать аккаунт"
                      )}
                    </button>
                  </form>

                  {/* Переключатель режима */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={toggleMode}
                      disabled={loading || isValidating}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {isLogin ? (
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

                  {/* Забыли пароль */}
                  {isLogin && (
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Забыли пароль?
                      </button>
                    </div>
                  )}

                  {/* Дополнительная информация для регистрации */}
                  {!isLogin && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ваши преимущества</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center p-2 bg-purple-50 rounded-lg">
                          <CheckCircle className="w-3 h-3 text-purple-500 mr-2 flex-shrink-0" />
                          <span className="text-purple-700">Персональные программы</span>
                        </div>
                        <div className="flex items-center p-2 bg-green-50 rounded-lg">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-green-700">Профессиональные тренеры</span>
                        </div>
                        <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                          <CheckCircle className="w-3 h-3 text-blue-500 mr-2 flex-shrink-0" />
                          <span className="text-blue-700">Face ID авторизация</span>
                        </div>
                        <div className="flex items-center p-2 bg-orange-50 rounded-lg">
                          <CheckCircle className="w-3 h-3 text-orange-500 mr-2 flex-shrink-0" />
                          <span className="text-orange-700">Первый месяц бесплатно</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Face ID Setup для регистрации */}
              {!isLogin && (
                <div className="hidden lg:block mt-6">
                  <Card className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Eye className="h-5 w-5 text-white mr-2" />
                          <span className="text-white font-medium">Face ID</span>
                        </div>
                        <div className="text-xs text-white/70">
                          {faceIdSetupComplete ? "✅ Настроен" : "⭐ Рекомендуется"}
                        </div>
                      </div>
                      <p className="text-xs text-white/80 mb-3">
                        {faceIdSetupComplete 
                          ? "Face ID готов к использованию!" 
                          : "Настройте быстрый вход по лицу"
                        }
                      </p>
                      {!faceIdSetupComplete && (
                        <FaceIdSetup onComplete={handleFaceIdComplete} />
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Быстрые действия */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => router.push("/setup-face-recognition")}
                  className="w-full flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/30 transition-all text-white"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  <span className="font-medium">Face ID вход</span>
                </button>

                <button
                  onClick={() => router.push("/staff-login")}
                  className="w-full flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all text-white/80"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  <span className="font-medium">Вход для персонала</span>
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
                    <span>Регистрация</span>
                    <span className="text-green-300">✓ Доступна</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Face ID</span>
                    <span className="text-green-300">✓ Работает</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Уведомления</span>
                    <span className="text-green-300">✓ Активны</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Десктопная версия (оригинальная, расширенная) */}
      <div className="hidden lg:block py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок страницы */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin
                ? "Добро пожаловать в FitFlow Pro"
                : "Присоединяйтесь к FitFlow Pro"}
            </h1>
            <p className="text-lg text-gray-600">
              {isLogin
                ? "Войдите в свой аккаунт"
                : "Создайте новый аккаунт за несколько шагов"}
            </p>
          </div>

          {/* Основной контент в виде "книги" */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Левая "страница" - Форма входа/регистрации */}
            <div className="order-1">
              <AuthCard isLogin={isLogin}>
                <ErrorAlert error={error} />

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <FormField
                      fieldName="name"
                      label="Полное имя"
                      placeholder="Ваше полное имя"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(value) => handleFieldChange("name", value)}
                      validationState={validationStates.name}
                      isLogin={isLogin}
                    />
                  )}

                  <FormField
                    fieldName="email"
                    label="Email адрес"
                    placeholder="your@email.com"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(value) => handleFieldChange("email", value)}
                    validationState={validationStates.email}
                    isValidating={isValidating}
                    isLogin={isLogin}
                  />

                  <FormField
                    fieldName="password"
                    label="Пароль"
                    placeholder={
                      isLogin ? "Введите пароль" : "Создайте надежный пароль"
                    }
                    type="password"
                    required
                    value={formData.password}
                    onChange={(value) => handleFieldChange("password", value)}
                    validationState={validationStates.password}
                    isLogin={isLogin}
                  />

                  {!isLogin && (
                    <FormField
                      fieldName="phone"
                      label="Номер телефона"
                      placeholder="+7 (999) 123-45-67"
                      type="tel"
                      required={false}
                      value={formData.phone}
                      onChange={(value) => handleFieldChange("phone", value)}
                      validationState={validationStates.phone}
                      isLogin={isLogin}
                    />
                  )}

                  <UniversalSubmitButton
                    isLogin={isLogin}
                    loading={loading}
                    isFormReady={isFormReady}
                    isValidating={isValidating}
                  />
                </form>

                <AuthModeToggle
                  isLogin={isLogin}
                  onToggle={toggleMode}
                  loading={loading}
                  isValidating={isValidating}
                  onShowForgotPassword={() => setShowForgotPassword(true)}
                />

                <OtherAuthOptions loading={loading} />
              </AuthCard>

              {/* Статус формы под основной карточкой */}
              <div className="mt-6">
                <FormStatusIndicator
                  isFormReady={isFormReady}
                  isValidating={isValidating}
                  formData={formData}
                  emailValid={emailValid}
                  isLogin={isLogin}
                  validationStates={validationStates}
                />
              </div>
            </div>

            {/* Правая "страница" - Информация и преимущества */}
            <div className="order-1 lg:order-2 space-y-6">
              {/* Информация о безопасности */}
              <SecurityInfo isLogin={isLogin} />

              {/* ✅ Face ID Setup - показываем только при регистрации с обработчиком */}
              {!isLogin && (
                <div className="relative">
                  <FaceIdSetup onComplete={handleFaceIdComplete} />
                  
                  {/* ✅ Индикатор статуса Face ID */}
                  <div className="absolute -top-2 -right-2">
                    {faceIdSetupComplete ? (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        ✅ Настроен
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        ⭐ Рекомендуется
                      </div>
                    )}
                  </div>

                  {/* ✅ Дополнительная информация если Face ID настроен */}
                  {faceIdSetupComplete && faceIdData && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Face ID готов!</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Профиль: {faceIdData.profileId}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Преимущества для пользователей */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-900 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    {isLogin ? "Ваши возможности" : "Что вас ждет"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-purple-800 space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">
                          Персональные программы
                        </span>
                        <p className="text-xs text-purple-700 mt-1">
                          Тренировки, адаптированные под ваши цели
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Эксклюзивный магазин</span>
                        <p className="text-xs text-purple-700 mt-1">
                          Спортивное питание и аксессуары
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">
                          Отслеживание прогресса
                        </span>
                        <p className="text-xs text-purple-700 mt-1">
                          Детальная аналитика ваших достижений
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">
                          Профессиональные тренеры
                        </span>
                        <p className="text-xs text-purple-700 mt-1">
                          Консультации и индивидуальный подход
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className={`h-4 w-4 mr-3 mt-0.5 flex-shrink-0 ${
                        faceIdSetupComplete ? 'text-green-500' : 'text-purple-500'
                      }`} />
                      <div>
                        <span className="font-medium">Face ID авторизация</span>
                        <p className="text-xs text-purple-700 mt-1">
                          {faceIdSetupComplete ? 
                            'Настроен и готов к использованию!' : 
                            'Быстрый и безопасный вход'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white/60 rounded-lg border border-purple-200">
                    <p className="text-center font-medium text-purple-900">
                      🎉{" "}
                      {isLogin
                        ? "Добро пожаловать обратно!"
                        : "Начните свой путь к здоровью!"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Статистика и достижения */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-green-900 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Наше сообщество
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-800 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        5,000+
                      </div>
                      <div className="text-xs text-green-700">
                        Активных пользователей
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">50+</div>
                      <div className="text-xs text-green-700">
                        Профессиональных тренеров
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        1,000+
                      </div>
                      <div className="text-xs text-green-700">
                        Программ тренировок
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">98%</div>
                      <div className="text-xs text-green-700">
                        Довольных клиентов
                      </div>
                    </div>
                  </div>

                  {/* Отзывы пользователей */}
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs text-green-700 ml-2">
                          Анна К.
                        </span>
                      </div>
                      <p className="text-xs text-green-800">
                        "Потрясающая система! Сбросила 15 кг за 3 месяца"
                      </p>
                    </div>

                    <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs text-green-700 ml-2">
                          Михаил Р.
                        </span>
                      </div>
                      <p className="text-xs text-green-800">
                        "Тренеры супер! Программы действительно работают"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Быстрые действия */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900 flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Быстрые действия
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FaceIdQuickLogin />

                  <button
                    onClick={() => (router.push("/staff-login"))}
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all text-left group"
                  >
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Вход для персонала
                        </div>
                        <div className="text-xs text-gray-700">
                          Панель управления
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-600 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Дополнительные быстрые ссылки */}
                  <div className="pt-2 border-t border-blue-200">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => (router.push("/programs"))}
                        className="text-xs text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-100 transition-colors"
                      >
                        📋 Программы
                      </button>
                      <button
                        onClick={() => (router.push("/trainers"))}
                        className="text-xs text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-100 transition-colors"
                      >
                        👨‍💼 Тренеры
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Специальные предложения */}
              {!isLogin && (
                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-900 flex items-center">
                      🎁 Специальное предложение
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-orange-800">
                    <div className="space-y-3">
                      <div className="p-3 bg-white/60 rounded-lg border border-orange-200">
                        <div className="font-medium text-orange-900 mb-1">
                          🔥 Первый месяц бесплатно!
                        </div>
                        <p className="text-xs text-orange-700">
                          При регистрации сегодня получите полный доступ ко всем
                          функциям на 30 дней
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="text-xs text-orange-600">
                          ⏰ Предложение действует до конца месяца
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Development Tools (только в dev режиме) */}
              <DevelopmentTools
                isLogin={isLogin}
                loading={loading}
                isValidating={isValidating}
                onFillData={fillFormData}
                onClearForm={clearForm}
                onShowForgotPassword={() => setShowForgotPassword(true)}
              />
            </div>
          </div>

          {/* Дополнительная информация внизу */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 shadow-sm">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <span>Бесплатная регистрация</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    <span>Защищенные данные</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                    <span>24/7 поддержка</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    <span>Отмена в любое время</span>
                  </div>
                </div>

                {/* Дополнительные ссылки */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                    <a
                      href="/privacy"
                      className="hover:text-gray-700 transition-colors"
                    >
                      Политика конфиденциальности
                    </a>
                    <a
                      href="/terms"
                      className="hover:text-gray-700 transition-colors"
                    >
                      Условия использования
                    </a>
                    <a
                      href="/support"
                      className="hover:text-gray-700 transition-colors"
                    >
                      Поддержка
                    </a>
                    <a
                      href="/about"
                      className="hover:text-gray-700 transition-colors"
                    >
                      О нас
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MemberLoginContent />
    </Suspense>
  );
}