// app/staff-dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, LogOut, Loader2, Shield, Settings, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import FitnessLoader from '@/components/ui/FitnessLoader';

// Хук для определения мобильного устройства
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export default function StaffDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        const allowedRoles = ['super-admin', 'admin', 'manager', 'trainer', 'staff'];
        if (allowedRoles.includes(data.user.role)) {
          setUser(data.user);
        } else {
          setError('Недостаточно прав доступа');
        }
      } else {
        router.push('/staff-login');
      }
    } catch (error) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  if (loading) {
    if (isMobile) {
      // Мобильная версия лоадера
      return (
        <FitnessLoader
          isMobile={true}
          theme="staff"
          size="lg"
          variant="strength"
          text="Staff Dashboard"
          showProgress={true}
          motivationalTexts={[
            "Загружаем панель персонала...",
            "Проверяем права доступа...",
            "Подготавливаем рабочее пространство...",
            "Настраиваем интерфейс...",
            "Почти готово!"
          ]}
        />
      );
    } else {
      // Десктопная версия лоадера
      return (
        <div className="min-h-[100svh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
          {/* Декоративные элементы */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-16 h-16 bg-slate-500/10 rounded-full" />
            <div className="absolute top-40 right-20 w-12 h-12 bg-blue-500/10 rounded-full" />
            <div className="absolute bottom-40 left-20 w-20 h-20 bg-indigo-500/10 rounded-full" />
            <div className="absolute bottom-20 right-10 w-14 h-14 bg-purple-500/10 rounded-full" />

            <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-slate-400/20 to-transparent rounded-full" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-l from-blue-400/20 to-transparent rounded-full" />
          </div>

          {/* Центральный лоадер */}
          <div className="relative z-10 flex items-center justify-center min-h-[100svh]">
            <div className="text-center">
              <FitnessLoader
                isMobile={false}
                theme="staff"
                size="xl"
                variant="strength"
                text="Staff Dashboard"
                showProgress={true}
                motivationalTexts={[
                  "Загружаем панель персонала...",
                  "Проверяем права доступа...",
                  "Подготавливаем рабочее пространство...",
                  "Синхронизируем данные...",
                  "Настраиваем интерфейс...",
                  "Финальная подготовка..."
                ]}
                className="drop-shadow-2xl"
              />

              {/* Дополнительная информация */}
              <div className="mt-12 space-y-4">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    <span>Авторизация</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse animation-delay-500" />
                    <span>Права доступа</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse animation-delay-1000" />
                    <span>Интерфейс</span>
                  </div>
                </div>

                {/* Статус */}
                <div className="text-xs text-gray-400 space-y-1">
                  <p>FitFlow Pro Staff Portal v2.0</p>
                  <p className="animate-pulse">🔒 Безопасный вход для персонала</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  if (error) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-red-200">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Ошибка доступа</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button 
              onClick={() => router.push('/staff-login')}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Вернуться к входу
            </Button>
            <p className="text-xs text-gray-500">
              Если проблема повторится, обратитесь к администратору
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FitFlow-Pro Staff</h1>
                <p className="text-sm text-gray-500">Панель персонала</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{user?.name}</p>
                <Badge className="bg-blue-100 text-blue-800">
                  {user?.role}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать, {user?.name}!
          </h2>
          <p className="text-gray-600">
            Панель управления для персонала
          </p>
        </div>

        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Успешный вход!</CardTitle>
            <CardDescription className="text-blue-700">
              Вы вошли как {user?.role}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Ваши данные:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Имя:</strong> {user?.name}</p>
                  <p><strong>Роль:</strong> {user?.role}</p>
                </div>
              </div>
              
              {(user?.role === 'super-admin' || user?.role === 'admin') && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Доступные панели:</h4>
                  <a 
                    href="/admin"
                    className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    👑 Админ-панель
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}