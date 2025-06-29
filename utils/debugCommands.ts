// utils/debugCommands.ts (исправленная версия)
import { GlobalDebugCommands } from '@/types/debug';

export const initDebugCommands = (contexts: {
  schedule?: any;
  dashboard?: any;
  superAdmin?: any;
}): GlobalDebugCommands => {
  const { schedule, dashboard, superAdmin } = contexts;

  return {
    schedule,
    dashboard,
    superAdmin,
    
    // ✅ РЕАЛИЗУЕМ ВСЕ ОБЯЗАТЕЛЬНЫЕ КОМАНДЫ
    help: () => {
      console.log(`
🔧 FitAccess Debug System - Доступные команды:

📊 ОБЩИЕ КОМАНДЫ:
  fitAccessDebug.help()           - Показать эту справку
  fitAccessDebug.stats()          - Общая статистика
  fitAccessDebug.check()          - Быстрая проверка состояния
  fitAccessDebug.checkSync()      - Проверка синхронизации
  fitAccessDebug.sync()           - Синхронизация всех данных
  fitAccessDebug.clear()          - Очистка всех данных
  fitAccessDebug.refreshAll()     - Обновление всех контекстов

🗓️ SCHEDULE КОМАНДЫ:
  fitAccessDebug.schedule.events           - Список событий
  fitAccessDebug.schedule.getStats()       - Статистика расписания
  fitAccessDebug.schedule.refreshData()    - Обновить данные
  fitAccessDebug.schedule.clearAllEvents() - Очистить события

📈 DASHBOARD КОМАНДЫ:
  fitAccessDebug.dashboard.events          - События dashboard
  fitAccessDebug.dashboard.getStats()      - Статистика dashboard
  fitAccessDebug.dashboard.syncAllData()   - Синхронизация данных
  fitAccessDebug.dashboard.refreshStats()  - Обновить статистику

👥 SUPERADMIN КОМАНДЫ:
  fitAccessDebug.superAdmin.trainers       - Список тренеров
  fitAccessDebug.superAdmin.clients        - Список клиентов
  fitAccessDebug.superAdmin.getStats()     - Статистика администратора
  fitAccessDebug.superAdmin.refreshData()  - Обновить данные

🧪 ТЕСТОВЫЕ КОМАНДЫ:
  fitAccessDebug.test(5)          - Создать 5 тестовых событий
  fitAccessDebug.addEvents(10)    - Добавить 10 событий
  fitAccessDebug.stressTest(100)  - Стресс-тест с 100 событиями
  fitAccessDebug.simulateDesync() - Имитировать рассинхронизацию

🔍 ДИАГНОСТИКА:
  fitAccessDebug.diagnoseSync()   - Диагностика синхронизации
  fitAccessDebug.forceSyncContexts() - Принудительная синхронизация
  diagnoseContexts()              - Диагностика контекстов (глобальная)
      `);
    },

    checkSync: () => {
      console.log('🔍 Проверка синхронизации контекстов...');
      
      const scheduleEvents = schedule?.events?.length || 0;
      const dashboardEvents = dashboard?.events?.length || 0;
      
      console.log('📊 Состояние данных:', {
        schedule: {
          events: scheduleEvents,
          trainers: schedule?.trainers?.length || 0,
          loading: schedule?.loading || false
        },
        dashboard: {
          events: dashboardEvents,
          trainers: dashboard?.trainers?.length || 0,
          clients: dashboard?.clients?.length || 0,
          loading: dashboard?.loading || false
        },
        superAdmin: {
          trainers: superAdmin?.trainers?.length || 0,
          clients: superAdmin?.clients?.length || 0,
          loading: superAdmin?.loading || false
        }
      });
      
      // Проверяем синхронизацию
      const syncStatus = scheduleEvents === dashboardEvents;
      console.log(syncStatus ? '✅ Контексты синхронизированы' : '⚠️ Контексты рассинхронизированы');
      
      if (!syncStatus) {
        console.log('💡 Попробуйте: fitAccessDebug.sync()');
      }
    },

    sync: async () => {
      console.log('🔄 Синхронизация всех контекстов...');
      
      try {
        if (schedule?.refreshData) {
          await schedule.refreshData();
        }
        if (dashboard?.syncAllData) {
          await dashboard.syncAllData();
        }
        if (superAdmin?.refreshData) {
          await superAdmin.refreshData();
        }
        
        console.log('✅ Синхронизация завершена');
        
        // Проверяем результат
        setTimeout(() => {
          if (window.fitAccessDebug?.checkSync) {
            window.fitAccessDebug.checkSync();
          }
        }, 1000);
      } catch (error) {
        console.error('❌ Ошибка синхронизации:', error);
      }
    },

    clear: async () => {
      console.log('🧹 Очистка всех данных...');
      
      if (schedule?.clearAllEvents) {
        schedule.clearAllEvents();
      }
      if (dashboard?.clearAllEvents) {
        dashboard.clearAllEvents();
      }
      
      console.log('✅ Данные очищены');
    },

    test: async (count = 5) => {
      console.log(`🧪 Создание ${count} тестовых событий...`);
      
      if (schedule?.createEvent) {
        for (let i = 0; i < count; i++) {
          const testEvent = {
            title: `Тестовое событие ${i + 1}`,
            description: `Автоматически созданное событие для тестирования`,
            type: 'training' as const,
            startTime: new Date(Date.now() + (i + 1) * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + (i + 1) * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            trainerId: 'trainer1',
            location: 'Тестовый зал'
          };
          
          try {
            await schedule.createEvent(testEvent);
            console.log(`✅ Создано событие ${i + 1}/${count}`);
          } catch (error) {
            console.error(`❌ Ошибка создания события ${i + 1}:`, error);
          }
        }
      } else {
        console.warn('⚠️ Schedule.createEvent недоступен');
      }
    },

    stats: () => {
      const stats = {
        schedule: schedule?.getStats?.() || { error: 'недоступно' },
        dashboard: dashboard?.getStats?.() || { error: 'недоступно' },
        superAdmin: superAdmin?.getStats?.() || { error: 'недоступно' },
        timestamp: new Date().toISOString()
      };
      
      console.log('📊 Общая статистика:', stats);
      return stats;
    },

    check: () => {
      console.log('🔍 Быстрая проверка состояния системы:');
      console.log({
        schedule: !!schedule,
        dashboard: !!dashboard,
        superAdmin: !!superAdmin,
        scheduleEvents: schedule?.events?.length || 0,
        dashboardEvents: dashboard?.events?.length || 0,
        superAdminTrainers: superAdmin?.trainers?.length || 0
      });
    },

    addEvents: async (count = 3) => {
      return await window.fitAccessDebug.test(count);
    },

    updateLastEvent: async () => {
      console.log('📝 Обновление последнего события...');
      const events = schedule?.events || [];
      if (events.length > 0) {
        const lastEvent = events[events.length - 1];
        if (schedule?.updateEvent) {
          await schedule.updateEvent(lastEvent._id, {
            title: `${lastEvent.title} (обновлено)`,
            description: `Обновлено в ${new Date().toLocaleTimeString()}`
          });
          console.log('✅ Последнее событие обновлено');
        }
      } else {
        console.warn('⚠️ Нет событий для обновления');
      }
    },

    deleteLastEvent: async () => {
      console.log('🗑️ Удаление последнего события...');
      const events = schedule?.events || [];
      if (events.length > 0) {
        const lastEvent = events[events.length - 1];
        if (schedule?.deleteEvent) {
          await schedule.deleteEvent(lastEvent._id);
          console.log('✅ Последнее событие удалено');
        }
      } else {
        console.warn('⚠️ Нет событий для удаления');
      }
    },

    clearEvents: async () => {
      return await window.fitAccessDebug.clear();
    },

    refreshAll: async () => {
      return await window.fitAccessDebug.sync();
    },

    stressTest: async (count = 50) => {
      console.log(`🚀 Стресс-тест: создание ${count} событий...`);
      const startTime = Date.now();
      
      await window.fitAccessDebug.test(count);
      
      const endTime = Date.now();
      console.log(`⏱️ Стресс-тест завершен за ${endTime - startTime}мс`);
      
      // Проверяем состояние после теста
      setTimeout(() => {
        window.fitAccessDebug.checkSync();
      }, 2000);
    },

    simulateDesync: () => {
      console.log('⚠️ Имитация рассинхронизации...');
      
      if (schedule?.events && dashboard?.events) {
        // Создаем искусственную рассинхронизацию
        const fakeEvent = {
          _id: 'fake_event',
          title: 'Фальшивое событие',
          type: 'training',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          trainerId: 'trainer1',
          trainerName: 'Тест',
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          createdBy: 'test'
        };
        
        // Добавляем событие только в schedule, но не в dashboard
        schedule.events.push(fakeEvent);
        
        console.log('✅ Рассинхронизация создана');
        console.log('💡 Проверьте: fitAccessDebug.checkSync()');
        console.log('💡 Исправьте: fitAccessDebug.sync()');
      } else {
        console.warn('⚠️ Невозможно создать рассинхронизацию - контексты недоступны');
      }
    },

    getStats: () => {
      return window.fitAccessDebug.stats();
    },

    forceSyncContexts: async () => {
      console.log('🔧 Принудительная синхронизация контекстов...');
      
      // Отправляем события синхронизации
      if (typeof window !== 'undefined') {
        const syncEvent = new CustomEvent('force-sync', {
          detail: { timestamp: Date.now() }
        });
        window.dispatchEvent(syncEvent);
        
        // Также отправляем schedule-updated событие
        const scheduleEvent = new CustomEvent('schedule-updated', {
          detail: { 
            events: schedule?.events || [],
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(scheduleEvent);
        
        console.log('✅ События синхронизации отправлены');
      }
      
      // Выполняем обычную синхронизацию
      await window.fitAccessDebug.sync();
    },

    diagnoseSync: () => {
      console.log('🔍 Диагностика синхронизации...');
      
      // ✅ ИСПРАВЛЯЕМ ТИПЫ ДЛЯ RECOMMENDATIONS
      const recommendations: string[] = [];
      
      const diagnosis = {
        contexts: {
          schedule: {
            available: !!schedule,
            events: schedule?.events?.length || 0,
            trainers: schedule?.trainers?.length || 0,
            loading: schedule?.loading || false,
            error: schedule?.error || null,
            methods: schedule ? Object.keys(schedule).filter(key => typeof schedule[key] === 'function') : []
          },
          dashboard: {
            available: !!dashboard,
            events: dashboard?.events?.length || 0,
            trainers: dashboard?.trainers?.length || 0,
            clients: dashboard?.clients?.length || 0,
            loading: dashboard?.loading || false,
            error: dashboard?.error || null,
            methods: dashboard ? Object.keys(dashboard).filter(key => typeof dashboard[key] === 'function') : []
          },
          superAdmin: {
            available: !!superAdmin,
            trainers: superAdmin?.trainers?.length || 0,
            clients: superAdmin?.clients?.length || 0,
            loading: superAdmin?.loading || false,
            error: superAdmin?.error || null,
            methods: superAdmin ? Object.keys(superAdmin).filter(key => typeof superAdmin[key] === 'function') : []
          }
        },
        sync: {
          scheduleVsDashboard: {
            eventsMatch: (schedule?.events?.length || 0) === (dashboard?.events?.length || 0),
            scheduleEvents: schedule?.events?.length || 0,
            dashboardEvents: dashboard?.events?.length || 0,
            difference: Math.abs((schedule?.events?.length || 0) - (dashboard?.events?.length || 0))
          }
        },
        recommendations
      };
      
      // Генерируем рекомендации
      if (!diagnosis.contexts.schedule.available) {
        recommendations.push('Schedule контекст недоступен - проверьте ScheduleProvider');
      }
      if (!diagnosis.contexts.dashboard.available) {
        recommendations.push('Dashboard контекст недоступен - проверьте DashboardProvider');
      }
      if (!diagnosis.contexts.superAdmin.available) {
        recommendations.push('SuperAdmin контекст недоступен - проверьте SuperAdminProvider');
      }
      if (!diagnosis.sync.scheduleVsDashboard.eventsMatch) {
        recommendations.push('События рассинхронизированы - выполните fitAccessDebug.sync()');
      }
      if (diagnosis.contexts.schedule.error) {
        recommendations.push(`Ошибка в Schedule: ${diagnosis.contexts.schedule.error}`);
      }
      if (diagnosis.contexts.dashboard.error) {
        recommendations.push(`Ошибка в Dashboard: ${diagnosis.contexts.dashboard.error}`);
      }
      
      console.log('📋 Результаты диагностики:', diagnosis);
      
      if (diagnosis.recommendations.length === 0) {
                console.log('✅ Все контексты работают корректно!');
      } else {
        console.log('⚠️ Найдены проблемы:', diagnosis.recommendations);
      }
      
      return diagnosis;
    },

    clearAllEvents: async () => {
      console.log('🧹 Очистка всех событий...');
      
      if (schedule?.clearAllEvents) {
        schedule.clearAllEvents();
        console.log('✅ События Schedule очищены');
      }
      
      // Уведомляем dashboard об изменениях
      if (typeof window !== 'undefined') {
        const updateEvent = new CustomEvent('schedule-updated', {
          detail: { 
            events: [],
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(updateEvent);
      }
      
      // Обновляем статистику dashboard
      if (dashboard?.refreshStats) {
        await dashboard.refreshStats();
        console.log('✅ Статистика Dashboard обновлена');
      }
      
      console.log('✅ Все события очищены');
    }
  };
};

export const registerGlobalDebugCommands = (commands: GlobalDebugCommands) => {
  if (typeof window !== 'undefined') {
    // ✅ РЕГИСТРИРУЕМ ВСЕ КОМАНДЫ В WINDOW
    window.fitAccessDebug = commands;
    
    // ✅ РЕГИСТРИРУЕМ ДОПОЛНИТЕЛЬНЫЕ ГЛОБАЛЬНЫЕ ФУНКЦИИ
    window.diagnoseContexts = () => {
      console.log('🔍 Диагностика контекстов:');
      
      const fitAccessDebug = window.fitAccessDebug;
      
      if (!fitAccessDebug) {
        console.log('❌ fitAccessDebug не инициализирован');
        console.log('💡 Попробуйте подождать несколько секунд и повторить');
        return;
      }

      console.log('✅ fitAccessDebug доступен');
      console.log('📋 Доступные свойства:', Object.keys(fitAccessDebug));

      // ✅ ИСПРАВЛЯЕМ ПРОВЕРКУ КОНТЕКСТОВ С ПРАВИЛЬНЫМИ ТИПАМИ
      const contextNames = ['schedule', 'dashboard', 'superAdmin'] as const;
      
      contextNames.forEach(contextName => {
        // ✅ БЕЗОПАСНЫЙ ДОСТУП К СВОЙСТВАМ
        const context = (fitAccessDebug as any)[contextName];
        if (context && typeof context === 'object') {
          console.log(`✅ ${contextName} контекст найден:`, {
            events: context.events?.length || 0,
            trainers: context.trainers?.length || 0,
            clients: context.clients?.length || 0,
            loading: context.loading,
            error: context.error,
            methods: Object.keys(context).filter(key => typeof context[key] === 'function')
          });
        } else {
          console.log(`❌ ${contextName} контекст не найден`);
        }
      });

      // ✅ ДОПОЛНИТЕЛЬНАЯ ДИАГНОСТИКА
      console.log('🔧 Рекомендации:');
      if (!(fitAccessDebug as any).schedule) {
        console.log('  - Schedule контекст не найден. Проверьте ScheduleProvider в layout.tsx');
      }
      if (!(fitAccessDebug as any).dashboard) {
        console.log('  - Dashboard контекст не найден. Проверьте DashboardProvider в layout.tsx');
      }
      if (!(fitAccessDebug as any).superAdmin) {
        console.log('  - SuperAdmin контекст не найден. Проверьте SuperAdminProvider в layout.tsx');
      }
      
      console.log('  - Если контексты не найдены, подождите 5-10 секунд и повторите diagnoseContexts()');
      console.log('  - Проверьте консоль на ошибки загрузки контекстов');
      console.log('💡 Доступные команды: fitAccessDebug.help()');
    };

    window.forceRegisterContexts = () => {
      console.log('🔧 Принудительная регистрация контекстов...');
      console.log('💡 Используйте ContextRegistrar компонент для автоматической регистрации');
      console.log('💡 Или выполните: fitAccessDebug.forceSyncContexts()');
    };
    
    console.log('✅ Debug команды зарегистрированы глобально');
    console.log('💡 Попробуйте: fitAccessDebug.help()');
  }
};

