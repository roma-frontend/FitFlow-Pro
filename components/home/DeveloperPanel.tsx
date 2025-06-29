"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Users,
  Zap,
  Database,
  BarChart3,
  Download,
  Code,
  Activity,
  FileText,
  RefreshCw,
  Terminal,
  Key,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Clock,
  HardDrive,
  Cpu,
  Globe,
  Lock,
  Eye,
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { AuthStatus } from "@/types/home";
import { isAdmin, isSuperAdmin } from "@/utils/roleHelpers";
import { useApi } from "@/hooks/useApi";
import { motion } from "framer-motion";

interface DeveloperPanelProps {
  authStatus: AuthStatus | null;
}

interface SystemStatus {
  database: "healthy" | "warning" | "error";
  api: "healthy" | "warning" | "error";
  storage: number;
  memory: number;
  uptime: string;
}

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  dangerous?: boolean;
}

export default function DeveloperPanel({ authStatus }: DeveloperPanelProps) {
  const router = useRouter();
  const { post, get, loading, showInfo } = useApi();
  const [activeTab, setActiveTab] = useState("overview");
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: "healthy",
    api: "healthy",
    storage: 45,
    memory: 62,
    uptime: "15 дней 4 часа"
  });
  const [setupProgress, setSetupProgress] = useState(0);
  const [isSetupRunning, setIsSetupRunning] = useState(false);

  // Показываем только админам и супер-админам
  if (!isAdmin(authStatus)) {
    return null;
  }

  const isSuperAdminUser = isSuperAdmin(authStatus);

  // Быстрая настройка системы
  const handleQuickSetup = async () => {
    setIsSetupRunning(true);
    setSetupProgress(0);
    showInfo('Запуск', 'Начинаем автоматическую настройку системы...');
    
    const steps = [
      { url: '/api/setup/users', message: 'Создание пользователей...', progress: 25 },
      { url: '/api/setup/demo-data', message: 'Добавление демо-данных...', progress: 50 },
      { url: '/api/setup/verify', message: 'Проверка системы...', progress: 75 },
      { url: '/api/setup/finalize', message: 'Завершение настройки...', progress: 100 }
    ];

    for (const step of steps) {
      showInfo('Настройка', step.message);
      setSetupProgress(step.progress);
      
      try {
        await post(step.url, {}, { 
          showSuccessToast: false, 
          showErrorToast: true 
        });
      } catch (error) {
        setIsSetupRunning(false);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    showInfo('Завершено', 'Автоматическая настройка завершена!');
    setIsSetupRunning(false);
    setTimeout(() => router.push('/admin'), 2000);
  };

  // Инструменты только для супер-админа
  const superAdminTools: Tool[] = [
    {
      id: 'database-reset',
      title: 'Сброс базы данных',
      description: 'Полный сброс всех данных',
      icon: Database,
      color: 'text-red-600 bg-red-100',
      action: () => showInfo('Внимание', 'Функция сброса БД требует подтверждения'),
      dangerous: true
    },
    {
      id: 'api-keys',
      title: 'API ключи',
      description: 'Управление ключами доступа',
      icon: Key,
      color: 'text-purple-600 bg-purple-100',
      action: () => router.push('/admin/api-keys')
    },
    {
      id: 'system-logs',
      title: 'Системные логи',
      description: 'Просмотр всех логов системы',
      icon: Terminal,
      color: 'text-gray-600 bg-gray-100',
      action: () => router.push('/admin/logs')
    },
    {
      id: 'backup',
      title: 'Резервное копирование',
      description: 'Создать бэкап системы',
      icon: Download,
      color: 'text-green-600 bg-green-100',
      action: () => showInfo('Бэкап', 'Начинаем создание резервной копии...')
    }
  ];

  // Инструменты для всех админов
  const adminTools: Tool[] = [
    {
      id: 'quick-setup',
      title: 'Быстрая настройка',
      description: 'Автоматическая инициализация системы',
      icon: Zap,
      color: 'text-yellow-600 bg-yellow-100',
      action: handleQuickSetup
    },
    {
      id: 'user-management',
      title: 'Управление пользователями',
      description: 'Создание и редактирование',
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      action: () => router.push('/admin/users')
    },
    {
      id: 'reports',
      title: 'Отчеты и аналитика',
      description: 'Статистика системы',
      icon: BarChart3,
      color: 'text-indigo-600 bg-indigo-100',
      action: () => router.push('/admin/reports')
    },
    {
      id: 'settings',
      title: 'Настройки системы',
      description: 'Основные параметры',
      icon: Settings,
      color: 'text-orange-600 bg-orange-100',
      action: () => router.push('/admin/settings')
    }
  ];

  const allTools = isSuperAdminUser 
    ? [...adminTools, ...superAdminTools]
    : adminTools;

  // Компонент статуса системы
  const StatusIndicator = ({ status }: { status: "healthy" | "warning" | "error" }) => {
    const colors = {
      healthy: "text-green-600 bg-green-100",
      warning: "text-yellow-600 bg-yellow-100",
      error: "text-red-600 bg-red-100"
    };
    const icons = {
      healthy: CheckCircle2,
      warning: AlertTriangle,
      error: AlertTriangle
    };
    const Icon = icons[status];

    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        <Icon className="h-3 w-3" />
        {status === "healthy" ? "Работает" : status === "warning" ? "Внимание" : "Ошибка"}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl overflow-hidden relative">
        {/* Декоративный градиент */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl opacity-10" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-10" />
        </div>

        <CardHeader className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Панель разработчика
                </CardTitle>
                <CardDescription>
                  Инструменты администрирования системы
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isSuperAdminUser ? "destructive" : "default"}>
                {isSuperAdminUser ? "Супер-админ" : "Администратор"}
              </Badge>
              <Badge variant="custom" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                v2.0.1
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Предупреждение для супер-админа */}
          {isSuperAdminUser && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Внимание!</strong> У вас есть доступ к критическим функциям системы. 
                Используйте их с осторожностью.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="tools">Инструменты</TabsTrigger>
              {isSuperAdminUser && <TabsTrigger value="advanced">Продвинутое</TabsTrigger>}
            </TabsList>

            {/* Вкладка Обзор */}
            <TabsContent value="overview" className="space-y-6">
              {/* Статус системы */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">База данных</p>
                          <StatusIndicator status={systemStatus.database} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">API</p>
                          <StatusIndicator status={systemStatus.api} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-purple-600" />
                        <p className="text-sm text-gray-600">Хранилище</p>
                      </div>
                      <Progress value={systemStatus.storage} className="h-2" />
                      <p className="text-xs text-gray-500">{systemStatus.storage}% использовано</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-orange-600" />
                        <p className="text-sm text-gray-600">Память</p>
                      </div>
                      <Progress value={systemStatus.memory} className="h-2" />
                      <p className="text-xs text-gray-500">{systemStatus.memory}% использовано</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Быстрая настройка */}
              {isSetupRunning && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                        <h3 className="font-semibold">Автоматическая настройка выполняется...</h3>
                      </div>
                      <Progress value={setupProgress} className="h-3" />
                      <p className="text-sm text-gray-600">
                        Выполнено: {setupProgress}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">1,234</p>
                        <p className="text-sm text-gray-600">Всего пользователей</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600 opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">89</p>
                        <p className="text-sm text-gray-600">Активных сессий</p>
                      </div>
                      <Activity className="h-8 w-8 text-green-600 opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{systemStatus.uptime}</p>
                        <p className="text-sm text-gray-600">Время работы</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-600 opacity-20" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Вкладка Инструменты */}
            <TabsContent value="tools" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <motion.div
                      key={tool.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${
                          tool.dangerous ? 'hover:border-red-300' : 'hover:border-blue-300'
                        }`}
                        onClick={tool.action}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.color}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{tool.title}</h3>
                              <p className="text-sm text-gray-600">{tool.description}</p>
                              {tool.dangerous && (
                                <Badge variant="destructive" className="mt-2">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Опасно
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Быстрые ссылки */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Быстрые ссылки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push('/api-docs')}>
                      <FileText className="h-4 w-4 mr-2" />
                      API Docs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/logs')}>
                      <Terminal className="h-4 w-4 mr-2" />
                      Логи
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open('https://github.com/your-repo', '_blank')}>
                      <Code className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/monitoring')}>
                      <Activity className="h-4 w-4 mr-2" />
                      Мониторинг
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка Продвинутое (только для супер-админа) */}
            {isSuperAdminUser && (
              <TabsContent value="advanced" className="space-y-6">
                {/* Переменные окружения */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Переменные окружения
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <span>NODE_ENV:</span>
                        <Badge>{process.env.NODE_ENV}</Badge>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <span>DATABASE_URL:</span>
                        <Badge variant="outline">***hidden***</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Показать все переменные
                    </Button>
                  </CardContent>
                </Card>

                {/* Опасные действия */}
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Опасная зона
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => showInfo('Сброс БД', 'Требуется подтверждение через email')}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Полный сброс базы данных
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => showInfo('Очистка кэша', 'Все кэшированные данные будут удалены')}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Очистить все кэши
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => showInfo('Режим обслуживания', 'Сайт будет недоступен для пользователей')}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Включить режим обслуживания
                    </Button>
                  </CardContent>
                </Card>

                {/* Системная информация */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Системная информация
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 font-mono text-sm">
                    <div className="flex justify-between">
                      <span>Platform:</span>
                      <span className="text-gray-600">{process.platform || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Node Version:</span>
                      <span className="text-gray-600">{process.version || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Usage:</span>
                      <span className="text-gray-600">
                        {process.memoryUsage ? 
                          `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB` : 
                          'N/A'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}