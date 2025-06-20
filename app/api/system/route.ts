// app/api/sys/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { mockTrainers, mockClients, mockSessions } from '@/lib/mock-data';

interface SystemInfo {
  version: string;
  environment: string;
  uptime: number;
  timestamp: string;
  status: 'healthy' | 'warning' | 'critical';
  services: {
    database: 'online' | 'offline' | 'degraded';
    api: 'online' | 'offline' | 'degraded';
    cache: 'online' | 'offline' | 'degraded';
    storage: 'online' | 'offline' | 'degraded';
  };
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalSessions: number;
    systemLoad: number;
    memoryUsage: number;
    diskUsage: number;
  };
  lastMaintenance: string;
  nextMaintenance: string;
}

interface SystemCommand {
  command: string;
  parameters?: Record<string, any>;
  force?: boolean;
}

// GET /api/sys - Получение общей информации о системе
export const GET = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'read' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('🖥️ API: получение информации о системе');

        const { user } = req;
        const url = new URL(req.url);
        const detailed = url.searchParams.get('detailed') === 'true';

        // Базовая информация о системе
        const systemInfo: SystemInfo = {
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          status: 'healthy',
          services: {
            database: 'online',
            api: 'online',
            cache: 'online',
            storage: 'online'
          },
          metrics: {
            totalUsers: mockTrainers.length + mockClients.length,
            activeUsers: mockTrainers.filter(t => t.status === 'active').length + 
                        mockClients.filter(c => c.status === 'active').length,
            totalSessions: mockSessions.length,
            systemLoad: Math.random() * 100,
            memoryUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
            diskUsage: Math.random() * 80 + 10 // Имитация использования диска
          },
          lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          nextMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        // Определение общего статуса системы
        const memoryUsage = systemInfo.metrics.memoryUsage;
        const diskUsage = systemInfo.metrics.diskUsage;
        const systemLoad = systemInfo.metrics.systemLoad;

        if (memoryUsage > 90 || diskUsage > 90 || systemLoad > 90) {
          systemInfo.status = 'critical';
        } else if (memoryUsage > 80 || diskUsage > 80 || systemLoad > 80) {
          systemInfo.status = 'warning';
        }

        let responseData: any = systemInfo;

        // Добавляем детальную информацию если запрошена
        if (detailed) {
          responseData = {
            ...systemInfo,
            detailed: {
              // Информация о процессе
              process: {
                pid: process.pid,
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage()
              },

              // Статистика по данным
              dataStats: {
                trainers: {
                  total: mockTrainers.length,
                  active: mockTrainers.filter(t => t.status === 'active').length,
                  inactive: mockTrainers.filter(t => t.status === 'inactive').length,
                  suspended: mockTrainers.filter(t => t.status === 'suspended').length
                },
                clients: {
                  total: mockClients.length,
                  active: mockClients.filter(c => c.status === 'active').length,
                  inactive: mockClients.filter(c => c.status === 'inactive').length,
                  suspended: mockClients.filter(c => c.status === 'suspended').length,
                  trial: mockClients.filter(c => c.status === 'trial').length
                },
                sessions: {
                  total: mockSessions.length,
                  scheduled: mockSessions.filter(s => s.status === 'scheduled').length,
                  completed: mockSessions.filter(s => s.status === 'completed').length,
                  cancelled: mockSessions.filter(s => s.status === 'cancelled').length,
                  noShow: mockSessions.filter(s => s.status === 'no-show').length
                }
              },

              // Информация о конфигурации
              configuration: {
                maxMemory: '512MB',
                maxConnections: 1000,
                sessionTimeout: 3600,
                backupInterval: 'daily',
                logLevel: 'info',
                debugMode: process.env.NODE_ENV === 'development'
              },

              // Активные подключения и сессии
              connections: {
                active: Math.floor(Math.random() * 50) + 10,
                peak: Math.floor(Math.random() * 100) + 50,
                total: Math.floor(Math.random() * 1000) + 500
              },

              // Последние события системы
              recentEvents: [
                {
                  timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                  type: 'info',
                  message: 'Система запущена успешно',
                  source: 'system'
                },
                {
                  timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                  type: 'info',
                  message: 'Автоматическое резервное копирование завершено',
                  source: 'backup'
                },
                {
                  timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                  type: 'warning',
                  message: 'Высокое использование памяти',
                  source: 'monitor'
                }
              ]
            }
          };
        }

        // Фильтрация данных по правам доступа
        if (user.role === 'trainer') {
          // Тренеры видят только базовую информацию
          responseData = {
            version: systemInfo.version,
            status: systemInfo.status,
            uptime: systemInfo.uptime,
            timestamp: systemInfo.timestamp
          };
        }

        return NextResponse.json({
          success: true,
          data: responseData,
          meta: {
            requestedBy: user.id,
            userRole: user.role,
            detailed,
            generatedAt: new Date().toISOString()
          }
        });

      } catch (error) {
        console.error('💥 API: ошибка получения системной информации:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения системной информации' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// POST /api/sys - Выполнение системных команд
export const POST = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'manage' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('⚡ API: выполнение системной команды');

        const { user } = req;
        const body = await req.json();
        const { command, parameters = {}, force = false }: SystemCommand = body;

        if (!command) {
          return NextResponse.json(
            { success: false, error: 'Не указана команда для выполнения' },
            { status: 400 }
          );
        }

        const startTime = Date.now();
        let result: any = {};

        switch (command) {
          case 'restart':
            result = await executeRestart(parameters, force, user.id);
            break;

          case 'maintenance':
            result = await executeMaintenanceMode(parameters, force, user.id);
            break;

          case 'cleanup':
            result = await executeCleanup(parameters, force, user.id);
            break;

          case 'backup':
            result = await executeBackup(parameters, force, user.id);
            break;

          case 'optimize':
            result = await executeOptimization(parameters, force, user.id);
            break;

          case 'cache-clear':
            result = await executeCacheClear(parameters, force, user.id);
            break;

          case 'health-check':
            result = await executeHealthCheck(parameters, force, user.id);
            break;

          case 'reset-stats':
            result = await executeResetStats(parameters, force, user.id);
            break;

          default:
            return NextResponse.json(
              { success: false, error: `Неизвестная команда: ${command}` },
              { status: 400 }
            );
        }

        const executionTime = Date.now() - startTime;

        console.log(`✅ API: команда ${command} выполнена за ${executionTime}ms`);

        return NextResponse.json({
          success: true,
          data: {
            command,
            parameters,
            result,
            executionTime,
            executedBy: user.id,
            executedAt: new Date().toISOString(),
            forced: force
          },
          message: `Команда ${command} успешно выполнена`
        });

      } catch (error: any) {
        console.error('💥 API: ошибка выполнения системной команды:', error);
        return NextResponse.json(
          { success: false, error: `Ошибка выполнения команды: ${error?.message || 'Неизвестная ошибка'}` },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PUT /api/sys - Обновление системных настроек
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'manage' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('⚙️ API: обновление системных настроек');

        const { user } = req;
        const body = await req.json();
        const { settings, validate = true } = body;

        if (!settings || typeof settings !== 'object') {
          return NextResponse.json(
            { success: false, error: 'Не указаны настройки для обновления' },
            { status: 400 }
          );
        }

        // Валидация настроек
        if (validate) {
          const validationResult = validateSystemSettings(settings);
          if (!validationResult.valid) {
            return NextResponse.json(
              { success: false, error: 'Ошибка валидации настроек', details: validationResult.errors },
              { status: 400 }
            );
          }
        }

        // Применение настроек (в реальном приложении это было бы сохранение в БД/конфиг)
        const updatedSettings = applySystemSettings(settings, user.id);

        console.log(`✅ API: системные настройки обновлены пользователем ${user.id}`);

        return NextResponse.json({
          success: true,
          data: {
            updatedSettings,
            appliedBy: user.id,
            appliedAt: new Date().toISOString(),
            validated: validate
          },
          message: 'Системные настройки успешно обновлены'
        });

      } catch (error: any) {
        console.error('💥 API: ошибка обновления системных настроек:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка обновления системных настроек' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// DELETE /api/sys - Сброс системы к заводским настройкам
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'manage' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('🔄 API: сброс системы');

        const { user } = req;
        const body = await req.json();
        const { confirmReset = false, keepUserData = true, createBackup = true } = body;

        if (!confirmReset) {
          return NextResponse.json(
            { success: false, error: 'Подтверждение сброса обязательно' },
            { status: 400 }
          );
        }

        // Создание резервной копии перед сбросом
        let backupId = null;
        if (createBackup) {
          backupId = await createSystemBackup(user.id);
        }

        // Выполнение сброса
        const resetResult = await executeSystemReset(keepUserData, user.id);

        console.log(`✅ API: система сброшена пользователем ${user.id}`);

        return NextResponse.json({
          success: true,
          data: {
            resetResult,
            backupId,
            resetBy: user.id,
            resetAt: new Date().toISOString(),
            keepUserData,
            backupCreated: !!backupId
          },
          message: 'Система успешно сброшена к заводским настройкам'
        });

      } catch (error: any) {
        console.error('💥 API: ошибка сброса системы:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка сброса системы' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// Функции выполнения команд

async function executeRestart(parameters: any, force: boolean, userId: string) {
  console.log(`🔄 Выполнение перезапуска системы (пользователь: ${userId})`);
  
  // Имитация процесса перезапуска
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    action: 'restart',
    status: 'completed',
    message: 'Система будет перезапущена через 30 секунд',
    scheduledFor: new Date(Date.now() + 30000).toISOString(),
    gracefulShutdown: !force,
    affectedServices: ['api', 'database', 'cache']
  };
}

async function executeMaintenanceMode(parameters: any, force: boolean, userId: string) {
  console.log(`🔧 Переключение режима обслуживания (пользователь: ${userId})`);
  
  const { enable = true, duration = 3600, message = 'Система находится на техническом обслуживании' } = parameters;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    action: 'maintenance',
    status: 'completed',
    enabled: enable,
    duration: duration,
    message: message,
    startTime: new Date().toISOString(),
    endTime: enable ? new Date(Date.now() + duration * 1000).toISOString() : null,
    affectedUsers: mockTrainers.length + mockClients.length
  };
}

async function executeCleanup(parameters: any, force: boolean, userId: string) {
  console.log(`🧹 Выполнение очистки системы (пользователь: ${userId})`);
  
  const { 
    clearLogs = true, 
    clearCache = true, 
    clearTempFiles = true,
    olderThan = 30 // дни
  } = parameters;
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const cleanupResults = {
    logs: clearLogs ? { deleted: Math.floor(Math.random() * 1000) + 100, size: '15.2 MB' } : null,
    cache: clearCache ? { cleared: Math.floor(Math.random() * 500) + 50, size: '8.7 MB' } : null,
    tempFiles: clearTempFiles ? { deleted: Math.floor(Math.random() * 200) + 20, size: '3.1 MB' } : null
  };
  
  return {
    action: 'cleanup',
    status: 'completed',
    results: cleanupResults,
    totalSpaceFreed: '27.0 MB',
    olderThan: olderThan
  };
}

async function executeBackup(parameters: any, force: boolean, userId: string) {
  console.log(`💾 Создание резервной копии (пользователь: ${userId})`);
  
  const { 
    includeUserData = true, 
    includeSystemData = true, 
    compression = true,
    encryption = false 
  } = parameters;
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    action: 'backup',
    status: 'completed',
    backupId: backupId,
    filename: `system_backup_${new Date().toISOString().split('T')[0]}.tar.gz`,
    size: '45.8 MB',
    compression: compression,
    encryption: encryption,
    includes: {
      userData: includeUserData,
      systemData: includeSystemData,
      trainers: includeUserData ? mockTrainers.length : 0,
      clients: includeUserData ? mockClients.length : 0,
      sessions: includeUserData ? mockSessions.length : 0
    },
    location: '/backups/',
    checksum: 'sha256:a1b2c3d4e5f6...'
  };
}

async function executeOptimization(parameters: any, force: boolean, userId: string) {
  console.log(`⚡ Оптимизация системы (пользователь: ${userId})`);
  
  const { 
    optimizeDatabase = true, 
    optimizeCache = true, 
    optimizeIndexes = true 
  } = parameters;
  
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  return {
    action: 'optimization',
    status: 'completed',
    results: {
      database: optimizeDatabase ? {
        tablesOptimized: 12,
        spaceReclaimed: '5.2 MB',
        performanceImprovement: '15%'
      } : null,
      cache: optimizeCache ? {
        entriesOptimized: 1500,
        hitRateImprovement: '8%'
      } : null,
      indexes: optimizeIndexes ? {
        indexesRebuilt: 8,
        querySpeedImprovement: '12%'
      } : null
    },
    overallImprovement: '11%'
  };
}

async function executeCacheClear(parameters: any, force: boolean, userId: string) {
  console.log(`🗑️ Очистка кэша (пользователь: ${userId})`);
  
  const { 
    clearUserCache = true, 
    clearSystemCache = true, 
    clearApiCache = true 
  } = parameters;
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    action: 'cache-clear',
    status: 'completed',
    cleared: {
      userCache: clearUserCache ? { entries: 450, size: '2.1 MB' } : null,
      systemCache: clearSystemCache ? { entries: 120, size: '5.8 MB' } : null,
      apiCache: clearApiCache ? { entries: 890, size: '3.2 MB' } : null
    },
    totalCleared: {
      entries: 1460,
      size: '11.1 MB'
    }
  };
}

async function executeHealthCheck(parameters: any, force: boolean, userId: string) {
  console.log(`🏥 Проверка состояния системы (пользователь: ${userId})`);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const checks = [
    { name: 'Database', status: 'healthy', responseTime: 45 },
    { name: 'API', status: 'healthy', responseTime: 23 },
    { name: 'Cache', status: 'healthy', responseTime: 12 },
    { name: 'Storage', status: 'warning', responseTime: 156, message: 'High disk usage' },
    { name: 'Memory', status: 'healthy', responseTime: 8 }
  ];
  
  return {
    action: 'health-check',
    status: 'completed',
    overall: 'warning',
    checks: checks,
    summary: {
      healthy: checks.filter(c => c.status === 'healthy').length,
      warning: checks.filter(c => c.status === 'warning').length,
      critical: checks.filter(c => c.status === 'critical').length
    },
    recommendations: [
      'Рассмотрите возможность очистки диска',
      'Мониторьте использование памяти'
    ]
  };
}

async function executeResetStats(parameters: any, force: boolean, userId: string) {
  console.log(`📊 Сброс статистики (пользователь: ${userId})`);
  
  const { 
    resetUserStats = false, 
    resetSystemStats = true, 
    resetPerformanceStats = true 
  } = parameters;
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    action: 'reset-stats',
    status: 'completed',
    reset: {
      userStats: resetUserStats,
      systemStats: resetSystemStats,
      performanceStats: resetPerformanceStats
    },
    backupCreated: true,
    backupLocation: '/backups/stats/',
    affectedMetrics: [
      'Performance counters',
      'System load history',
      'Error rate statistics'
    ]
  };
}

// Функции валидации и применения настроек

function validateSystemSettings(settings: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Валидация настроек памяти
  if (settings.memory) {
    if (settings.memory.maxHeapSize && (typeof settings.memory.maxHeapSize !== 'number' || settings.memory.maxHeapSize < 128)) {
      errors.push('Максимальный размер кучи должен быть числом не менее 128 MB');
    }
    
    if (settings.memory.gcInterval && (typeof settings.memory.gcInterval !== 'number' || settings.memory.gcInterval < 1000)) {
      errors.push('Интервал сборки мусора должен быть не менее 1000 мс');
    }
  }
  
  // Валидация настроек производительности
  if (settings.performance) {
    if (settings.performance.maxConnections && (typeof settings.performance.maxConnections !== 'number' || settings.performance.maxConnections < 1)) {
      errors.push('Максимальное количество соединений должно быть положительным числом');
    }
    
    if (settings.performance.requestTimeout && (typeof settings.performance.requestTimeout !== 'number' || settings.performance.requestTimeout < 1000)) {
      errors.push('Таймаут запроса должен быть не менее 1000 мс');
    }
  }
  
  // Валидация настроек безопасности
  if (settings.security) {
    if (settings.security.sessionTimeout && (typeof settings.security.sessionTimeout !== 'number' || settings.security.sessionTimeout < 300)) {
      errors.push('Таймаут сессии должен быть не менее 300 секунд');
    }
    
    if (settings.security.maxLoginAttempts && (typeof settings.security.maxLoginAttempts !== 'number' || settings.security.maxLoginAttempts < 1)) {
      errors.push('Максимальное количество попыток входа должно быть положительным числом');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function applySystemSettings(settings: any, userId: string): any {
  const appliedSettings: any = {};
  
  // Применение настроек (в реальном приложении это было бы сохранение в конфигурацию)
  if (settings.memory) {
    appliedSettings.memory = {
      maxHeapSize: settings.memory.maxHeapSize || 512,
      gcInterval: settings.memory.gcInterval || 30000,
      appliedAt: new Date().toISOString()
    };
  }
  
  if (settings.performance) {
    appliedSettings.performance = {
      maxConnections: settings.performance.maxConnections || 1000,
      requestTimeout: settings.performance.requestTimeout || 30000,
      enableCompression: settings.performance.enableCompression !== false,
      appliedAt: new Date().toISOString()
    };
  }
  
  if (settings.security) {
    appliedSettings.security = {
      sessionTimeout: settings.security.sessionTimeout || 3600,
      maxLoginAttempts: settings.security.maxLoginAttempts || 5,
      enableTwoFactor: settings.security.enableTwoFactor || false,
      appliedAt: new Date().toISOString()
    };
  }
  
  if (settings.logging) {
    appliedSettings.logging = {
      level: settings.logging.level || 'info',
      maxFileSize: settings.logging.maxFileSize || '10MB',
      retentionDays: settings.logging.retentionDays || 30,
      appliedAt: new Date().toISOString()
    };
  }
  
  console.log(`⚙️ Настройки применены пользователем ${userId}:`, appliedSettings);
  
  return appliedSettings;
}

async function createSystemBackup(userId: string): Promise<string> {
  console.log(`💾 Создание резервной копии перед сбросом (пользователь: ${userId})`);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const backupId = `reset_backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return backupId;
}

async function executeSystemReset(keepUserData: boolean, userId: string): Promise<any> {
  console.log(`🔄 Выполнение сброса системы (пользователь: ${userId}, сохранить данные: ${keepUserData})`);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const resetActions = [
    'Сброс системных настроек',
    'Очистка кэша',
    'Сброс конфигурации',
    'Перезапуск сервисов'
  ];
  
  if (!keepUserData) {
    resetActions.push('Очистка пользовательских данных');
  }
  
  return {
    actionsPerformed: resetActions,
    userDataPreserved: keepUserData,
    systemConfigReset: true,
    servicesRestarted: ['api', 'database', 'cache'],
    duration: 3000,
    status: 'completed'
  };
}

