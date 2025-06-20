// components/admin/PasswordResetLogs.tsx (версия без прямой зависимости от Convex)
"use client";

import { useState, useEffect, useMemo, JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Download,
  Trash2,
  Search,
  Filter,
  Users,
  Activity,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Типы
interface PasswordResetLog {
  _id: string;
  _creationTime: number;
  userId: string;
  userType: "staff" | "member";
  email: string;
  action: "requested" | "completed" | "failed" | "expired";
  timestamp: number;
  details?: string;
}

type UserTypeFilter = "all" | "staff" | "member";
type ActionFilter = "all" | "requested" | "completed" | "failed" | "expired";
type DateRangeFilter = "all" | "today" | "week" | "month";

export function PasswordResetLogs() {
  const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>("all");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(50);
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [logs, setLogs] = useState<PasswordResetLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  // Тестовые данные
  const mockLogs: PasswordResetLog[] = useMemo(() => [
    {
      _id: "1",
      _creationTime: Date.now() - 1000 * 60 * 30,
      userId: "user1",
      userType: "member",
      email: "test@example.com",
      action: "requested",
      timestamp: Date.now() - 1000 * 60 * 30,
      details: "Запрос восстановления пароля",
    },
    {
      _id: "2",
      _creationTime: Date.now() - 1000 * 60 * 60,
      userId: "user2",
      userType: "staff",
      email: "admin@example.com",
      action: "completed",
      timestamp: Date.now() - 1000 * 60 * 60,
      details: "Пароль успешно изменен",
    },
    {
      _id: "3",
      _creationTime: Date.now() - 1000 * 60 * 90,
      userId: "user3",
      userType: "member",
      email: "member@example.com",
      action: "failed",
      timestamp: Date.now() - 1000 * 60 * 90,
      details: "Пользователь не найден",
    },
    {
      _id: "4",
      _creationTime: Date.now() - 1000 * 60 * 120,
      userId: "user4",
      userType: "staff",
      email: "trainer@example.com",
      action: "expired",
      timestamp: Date.now() - 1000 * 60 * 120,
      details: "Токен истек",
    },
    {
      _id: "5",
      _creationTime: Date.now() - 1000 * 60 * 15,
      userId: "user5",
      userType: "member",
      email: "athlete@example.com",
      action: "requested",
      timestamp: Date.now() - 1000 * 60 * 15,
      details: "Новый запрос восстановления",
    },
  ], []);

  // Загрузка данных через API
  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/password-reset-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit,
          userType: userTypeFilter === "all" ? undefined : userTypeFilter,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        // Если API недоступно, используем тестовые данные
        console.warn('API недоступно, используются тестовые данные');
        setLogs(mockLogs);
      }
    } catch (error) {
      console.warn('Ошибка загрузки данных, используются тестовые данные:', error);
      setLogs(mockLogs);
      setError('Используются демо-данные');
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем данные при монтировании и изменении фильтров
  useEffect(() => {
    fetchLogs();
  }, [limit, userTypeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Фильтрация логов
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log: PasswordResetLog) => {
        if (actionFilter !== "all" && log.action !== actionFilter) return false;
        if (
          searchTerm &&
          !log.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
          return false;

        if (dateRange !== "all") {
          const now = Date.now();
          let cutoffTime = 0;

          switch (dateRange) {
            case "today":
              cutoffTime = now - 24 * 60 * 60 * 1000;
              break;
            case "week":
              cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
              break;
            case "month":
              cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
              break;
          }

          if (log.timestamp <= cutoffTime) return false;
        }

        return true;
      })
      .sort((a: PasswordResetLog, b: PasswordResetLog) => b.timestamp - a.timestamp);
  }, [logs, actionFilter, searchTerm, dateRange]);

  const handleCleanup = async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/cleanup-expired-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Очистка завершена",
          description: result.message || "Истекшие токены удалены",
        });
        // Перезагружаем данные
        fetchLogs();
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка очистки",
          description: result.error || "Произошла ошибка при очистке",
        });
      }
    } catch (error) {
      console.error("Ошибка очистки:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при очистке токенов",
      });
    }
  };

  // Вспомогательные функции
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString("ru-RU");
  };

  const getRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "только что";
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return formatTimestamp(timestamp);
  };

  const getActionIcon = (action: PasswordResetLog['action']): JSX.Element => {
    switch (action) {
      case "requested":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: PasswordResetLog['action']): JSX.Element => {
    const styles: Record<PasswordResetLog['action'], string> = {
      requested: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      expired: "bg-orange-100 text-orange-800 border-orange-200",
    };

    const labels: Record<PasswordResetLog['action'], string> = {
      requested: "Запрошен",
      completed: "Завершен",
      failed: "Ошибка",
      expired: "Истек",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[action]}`}
      >
        {labels[action]}
      </span>
    );
  };

  const getUserTypeBadge = (userType: PasswordResetLog['userType']): JSX.Element => {
    return (
      <Badge
        variant={userType === "staff" ? "secondary" : "outline"}
        className="text-xs"
      >
        {userType === "staff" ? "👥 Персонал" : "👤 Участник"}
      </Badge>
    );
  };

  const clearFilters = (): void => {
    setUserTypeFilter("all");
    setActionFilter("all");
    setSearchTerm("");
    setDateRange("all");
  };

  const exportLogs = (): void => {
    if (filteredLogs.length === 0) {
      toast({
        variant: "destructive",
        title: "Нет данных для экспорта",
        description: "Отфильтруйте логи или дождитесь загрузки данных",
      });
      return;
    }

    const csvContent = [
      ["Время", "Email", "Тип пользователя", "Действие", "Детали"].join(","),
      ...filteredLogs.map((log: PasswordResetLog) =>
        [
          formatTimestamp(log.timestamp),
          log.email,
          log.userType,
          log.action,
          log.details || "",
        ]
          .map((field: string) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `password-reset-logs-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Экспорт завершен",
      description: `Экспортировано ${filteredLogs.length} записей`,
    });
  };

  // Статистика
  const stats = useMemo(() => ({
    total: filteredLogs.length,
    requested: filteredLogs.filter((log: PasswordResetLog) => log.action === "requested").length,
    completed: filteredLogs.filter((log: PasswordResetLog) => log.action === "completed").length,
    failed: filteredLogs.filter((log: PasswordResetLog) => log.action === "failed").length,
    expired: filteredLogs.filter((log: PasswordResetLog) => log.action === "expired").length,
    staff: filteredLogs.filter((log: PasswordResetLog) => log.userType === "staff").length,
    members: filteredLogs.filter((log: PasswordResetLog) => log.userType === "member").length,
  }), [filteredLogs]);

  const hasFilters: boolean = useMemo(() =>
    userTypeFilter !== "all" ||
    actionFilter !== "all" ||
    searchTerm !== "" ||
    dateRange !== "all",
    [userTypeFilter, actionFilter, searchTerm, dateRange]
  );

  return (
    <div className="space-y-6">
      {/* Статус подключения */}
      {error && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  Демо режим
                </p>
                <p className="text-xs text-yellow-700">
                  {error}. Отображаются тестовые данные.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Статистические карточки */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Clock className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Запрошено</p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats.requested}
                </p>
                <p className="text-xs text-blue-600">токенов создано</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Завершено</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats.completed}
                </p>
                <p className="text-xs text-green-600">паролей изменено</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-200 rounded-lg">
                <XCircle className="h-5 w-5 text-red-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-900">Ошибки</p>
                <p className="text-2xl font-bold text-red-700">
                  {stats.failed}
                </p>
                <p className="text-xs text-red-600">неудачных попыток</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900">Истекло</p>
                <p className="text-2xl font-bold text-orange-700">
                  {stats.expired}
                </p>
                <p className="text-xs text-orange-600">токенов просрочено</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Основная таблица */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Логи восстановления паролей</span>
              {hasFilters && (
                <Badge variant="secondary" className="ml-2">
                  Фильтры активны
                </Badge>
              )}
            </CardTitle>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => fetchLogs()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Обновить
              </Button>

              <Button variant="outline" size="sm" onClick={handleCleanup}>
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить истекшие
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
                disabled={filteredLogs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Экспорт CSV
              </Button>
            </div>
          </div>

          {/* Фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={userTypeFilter}
              onChange={(e) =>
                setUserTypeFilter(e.target.value as UserTypeFilter)
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все пользователи</option>
              <option value="staff">👥 Персонал</option>
              <option value="member">👤 Участники</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все действия</option>
              <option value="requested">🕒 Запрошено</option>
              <option value="completed">✅ Завершено</option>
              <option value="failed">❌ Ошибка</option>
              <option value="expired">⚠️ Истекло</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все время</option>
              <option value="today">📅 Сегодня</option>
              <option value="week">📅 Неделя</option>
              <option value="month">📅 Месяц</option>
            </select>

            <select
              value={limit.toString()}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="25">25 записей</option>
              <option value="50">50 записей</option>
              <option value="100">100 записей</option>
              <option value="200">200 записей</option>
              <option value="500">500 записей</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Сбросить
            </Button>
          </div>

          {/* Информация о фильтрах */}
          {hasFilters && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Показано {stats.total} из {logs.length} записей
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700"
              >
                Показать все
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Загрузка логов...</p>
                <p className="text-sm text-gray-400 mt-1">
                  Получение данных из базы
                </p>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasFilters ? "Записи не найдены" : "Логи отсутствуют"}
              </h3>
              <p className="text-gray-500 mb-4">
                {hasFilters
                  ? "Попробуйте изменить параметры фильтрации"
                  : "Запросы на восстановление пароля еще не поступали"}
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Сбросить фильтры
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Мобильная версия - карточки */}
              <div className="block md:hidden space-y-3">
                {filteredLogs.map((log: PasswordResetLog) => (
                  <Card
                    key={log._id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          {getActionBadge(log.action)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getRelativeTime(log.timestamp)}
                        </div>
                      </div>

                      <div>
                        <div
                          className="font-medium text-sm truncate"
                          title={log.email}
                        >
                          {log.email}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {getUserTypeBadge(log.userType)}
                        </div>
                      </div>

                      {log.details && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-gray-200">
                          {log.details}
                        </div>
                      )}

                      <div className="text-xs text-gray-400 font-mono">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Десктопная версия - таблица */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Время
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Тип
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действие
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Детали
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Относительно
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log: PasswordResetLog) => (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          <div className="space-y-1">
                            <div>
                              {formatTimestamp(log.timestamp).split(" ")[0]}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTimestamp(log.timestamp).split(" ")[1]}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs">
                            <div
                              className="truncate font-medium text-sm"
                              title={log.email}
                            >
                              {log.email}
                            </div>
                            {log.userId && log.userId !== "unknown" && (
                              <div className="text-xs text-gray-500 font-mono">
                                ID: {log.userId.slice(-8)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getUserTypeBadge(log.userType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getActionIcon(log.action)}
                            {getActionBadge(log.action)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          {log.details ? (
                            <div
                              className="truncate cursor-help"
                              title={log.details}
                            >
                              {log.details}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {getRelativeTime(log.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Дополнительная информация */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Цветовая схема</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Синий - запрос отправлен</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Зеленый - пароль изменен</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm">Красный - ошибка</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Оранжевый - токен истек</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Быстрые фильтры</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setActionFilter("failed")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Показать только ошибки
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setDateRange("today")}
            >
              <Clock className="h-4 w-4 mr-2" />
              Активность за сегодня
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setActionFilter("completed");
                setDateRange("week");
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Успешные за неделю
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Статистика по типам</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Персонал</span>
              </div>
              <Badge variant="secondary">{stats.staff}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm">Участники</span>
              </div>
              <Badge variant="outline">{stats.members}</Badge>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Успешность</span>
                <span className="text-sm font-bold text-green-600">
                  {stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Информационные подсказки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Shield className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Безопасность</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Все действия по восстановлению паролей логируются для
                  обеспечения безопасности
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Токены действуют только 1 час</li>
                  <li>• Автоматическое удаление истекших токенов</li>
                  <li>• Защита от спама (1 запрос в 5 минут)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">Мониторинг</h4>
                <p className="text-sm text-green-700 mb-2">
                  Отслеживайте активность и выявляйте подозрительные паттерны
                </p>
                <ul className="text-xs text-green-600 space-y-1">
                  <li>• Экспорт данных в CSV формате</li>
                  <li>• Фильтрация по различным критериям</li>
                  <li>• Статистика в реальном времени</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Статус подключения */}
      <Card
        className={`${!error ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            {!error ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    API подключение активно
                  </p>
                  <p className="text-xs text-green-700">
                    Данные загружены успешно. Последнее обновление:{" "}
                    {new Date().toLocaleTimeString("ru-RU")}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Демо режим
                  </p>
                  <p className="text-xs text-yellow-700">
                    API недоступно. Отображаются тестовые данные для демонстрации функциональности.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

