// app/staff-dashboard/page.tsx (новый файл)
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StaffDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter()

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Загрузка панели персонала...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <a href="/staff-login" className="text-blue-500 underline">
              Вернуться к входу
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FitAccess Staff</h1>
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
            Добро пожаловать, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Панель управления для персонала
          </p>
        </div>

        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">🎉 Успешный вход!</CardTitle>
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
