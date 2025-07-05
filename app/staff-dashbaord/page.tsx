// app/staff-dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, LogOut, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoaderStore } from "@/stores/loaderStore";
import { useStaffAuth } from "@/hooks/useStaffAuth";

export default function StaffDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { showLoader } = useLoaderStore.getState();
  const savedRedirect = sessionStorage.getItem('google_login_redirect');
  const { isLoading, setIsLoading } = useStaffAuth()

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
      setIsLoading(false);
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

  if (isLoading) {

    showLoader("login", {
      userRole: user?.role || "admin" || "super-admin",
      userName: user?.name || "Администратор",
      dashboardUrl: savedRedirect || "/admin"
    });
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