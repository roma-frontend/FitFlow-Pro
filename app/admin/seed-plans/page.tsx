// app/admin/seed-plans/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  CreditCard,
  TrendingUp,
  Database,
  RefreshCw,
  Settings,
  Plus,
  Eye,
  Calendar,
  Clock,
  Users,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Типы для планов
interface Plan {
  id: string;
  name: string;
  type: 'monthly' | 'yearly';
  price: number;
  isActive: boolean;
  description?: string;
  features?: string[];
}

interface SeedResult {
  message?: string;
  count?: number;
  plans?: Plan[];
  success?: boolean;
}

export default function SeedPlansPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seedPlans = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/memberships/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка добавления планов');
      }

      setResult(data);
      toast({
        title: "Успех!",
        description: data.message,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/memberships/check-plans');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка проверки планов');
      }

      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setResult(null);
    setError(null);
  };

  const handleBack = () => {
    router.push('/admin');
  };

  const handleGoToMemberships = () => {
    router.push('/admin/memberships');
  };

  // Статистика для заголовка
  const stats = result ? {
    total: result.count || 0,
    active: result.plans ? result.plans.filter((p: Plan) => p.isActive).length : 0,
    monthly: result.plans ? result.plans.filter((p: Plan) => p.type === 'monthly').length : 0,
    yearly: result.plans ? result.plans.filter((p: Plan) => p.type === 'yearly').length : 0,
  } : { total: 0, active: 0, monthly: 0, yearly: 0 };

  // Планы для отображения (стандартные планы)
  const standardPlans = [
    {
      name: "Базовый",
      type: "monthly",
      price: 2990,
      gradient: "from-blue-500 to-blue-600",
      features: ["Доступ в зал", "Групповые занятия", "Консультация тренера"]
    },
    {
      name: "Премиум",
      type: "monthly",
      price: 4990,
      gradient: "from-purple-500 to-purple-600",
      features: ["Все из Базового", "Персональные тренировки", "Питание"]
    },
    {
      name: "VIP",
      type: "monthly",
      price: 7990,
      gradient: "from-amber-500 to-amber-600",
      features: ["Все из Премиум", "VIP зона", "Массаж", "Сауна"]
    },
    {
      name: "Безлимит",
      type: "yearly",
      price: 39900,
      gradient: "from-green-500 to-green-600",
      features: ["Все включено", "Годовая скидка 50%", "Заморозка 30 дней"]
    }
  ];

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm rounded-xl mb-8">
          {/* Декоративная линия */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

          <div className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Левая часть */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                {/* Кнопка назад */}
                <button
                  onClick={handleBack}
                  className="group p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 sm:hidden transform hover:scale-105 active:scale-95"
                  aria-label="Назад"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </button>

                {/* Иконка планов */}
                <div className="hidden sm:block relative flex-shrink-0">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>

                  {/* Индикатор статуса */}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm bg-green-400 animate-pulse" />
                </div>

                {/* Информация о странице */}
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Планы абонементов
                  </h1>
                  <p className="hidden sm:inline-block text-sm text-gray-500 truncate mt-0.5">
                    Инициализация планов в системе
                  </p>
                </div>
              </div>

              {/* Правая часть - действия */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Кнопка обновления */}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="group p-2.5 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Обновить"
                >
                  <RefreshCw className={`h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors ${loading ? 'animate-spin' : ''
                    }`} />
                </button>

                {/* Кнопка перехода к абонементам */}
                <button
                  onClick={handleGoToMemberships}
                  className="group p-2.5 hover:bg-purple-50 rounded-xl transition-all duration-200  transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Абонементы"
                >
                  <Package className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                </button>

                {/* Кнопка настроек */}
                <button
                  onClick={() => router.push('/admin/settings')}
                  className="group p-2.5 hover:bg-orange-50 rounded-xl transition-all duration-200 hidden sm:block transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Настройки"
                >
                  <Settings className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
                </button>

                {/* Кнопка проверки планов */}
                <button
                  onClick={checkPlans}
                  disabled={loading}
                  className="group p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Проверить планы"
                >
                  <Eye className="h-5 w-5 text-gray-600 group-hover:text-blue-600 hidden sm:block transition-colors" />
                </button>

                {/* Кнопка создания планов */}
                <button
                  onClick={seedPlans}
                  disabled={loading}
                  className="group p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Создать планы"
                >
                  <Plus className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего планов</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {result ? 'планов в системе' : 'проверьте планы'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% от общего
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Месячные</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.monthly}</div>
              <p className="text-xs text-muted-foreground">
                планов с месячной оплатой
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Годовые</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.yearly}</div>
              <p className="text-xs text-muted-foreground">
                планов с годовой оплатой
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Карточка инициализации планов */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Инициализация планов абонементов
                </CardTitle>
                <CardDescription className="mt-1">
                  Добавить стандартные планы абонементов в базу данных для начала работы системы
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="custom" className="bg-white/50">
                  4 плана
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Готово к запуску
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Планы */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {standardPlans.map((plan, index) => (
                  <div
                    key={index}
                    className={`relative rounded-xl bg-gradient-to-br ${plan.gradient} p-4 text-white shadow-lg hover:shadow-xl transition-shadow`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white hover:bg-white/30"
                      >
                        {plan.type === 'monthly' ? 'Месяц' : 'Год'}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold">
                        {plan.price.toLocaleString()}₽
                      </div>
                      <div className="text-sm opacity-90">
                        {plan.type === 'monthly' ? 'в месяц' : 'в год'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {plan.type === 'yearly' && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg text-xs font-bold">
                        ВЫГОДНО
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Действия */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={seedPlans}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg flex-1 sm:flex-initial"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Добавление планов...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Инициализировать планы
                    </>
                  )}
                </Button>

                <Button
                  onClick={checkPlans}
                  disabled={loading}
                  variant="outline"
                  className="hover:bg-white/50 shadow-md flex-1 sm:flex-initial"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Проверка...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Проверить существующие
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Результаты */}
        {result && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Результат выполнения
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {result.message && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {result.message}
                    </AlertDescription>
                  </Alert>
                )}

                {result.plans && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <p className="text-lg font-semibold text-gray-900">
                        Найдено планов: {result.count}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {stats.active} активных
                        </Badge>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          {stats.total - stats.active} неактивных
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {result.plans.map((plan: Plan, index: number) => (
                        <div
                          key={plan.id || index}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow gap-3"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${plan.isActive ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-gray-900 break-words">{plan.name}</span>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${plan.type === 'monthly'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-purple-50 text-purple-700 border-purple-200'
                                    }`}
                                >
                                  {plan.type === 'monthly' ? 'Месячный' : 'Годовой'}
                                </Badge>
                                <Badge
                                  variant={plan.isActive ? "default" : "secondary"}
                                  className={`text-xs ${plan.isActive
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                  {plan.isActive ? 'Активен' : 'Неактивен'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 min-w-0">
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {plan.price.toLocaleString()}₽
                              </div>
                              <div className="text-xs text-gray-500">
                                {plan.type === 'monthly' ? 'в месяц' : 'в год'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ошибки */}
        {error && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm border-red-200">
            <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                Произошла ошибка
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}