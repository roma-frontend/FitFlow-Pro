// components/SystemDashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useUnifiedData, useSyncStatus } from '@/contexts/UnifiedDataContext';
import { useMessaging } from '@/contexts/MessagingContext';

interface SystemDashboardProps {
  userRole: 'super-admin' | 'admin' | 'manager' | 'trainer' | 'client';
  userId: string;
}

export default function SystemDashboard({ userRole, userId }: SystemDashboardProps) {
  const {
    trainers,
    clients,
    events,
    products,
    analytics,
    syncAllData,
    forceRefresh
  } = useUnifiedData();

  const {
    loading,
    error,
    isOnline,
    lastSync,
    isAnySyncing,
    syncQueue,
    currentSyncOperation,
    clearError
  } = useSyncStatus();

  const {
    messages,
    eventLogs,
    messageQueue,
    isProcessingMessages,
    getDebugData
  } = useMessaging();

  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);

  // Обновляем статистику каждые 30 секунд
  useEffect(() => {
    const updateStats = () => {
      setSystemStats({
        totalTrainers: trainers.length,
        activeTrainers: trainers.filter(t => t.status === 'active').length,
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === 'active').length,
        totalEvents: events.length,
        upcomingEvents: events.filter(e => new Date(e.startTime) > new Date()).length,
        totalProducts: products.length,
        lowStockProducts: products.filter(p => p.inStock <= p.minStock).length,
        unreadMessages: messages.filter(m => !m.isRead).length,
        recentEventLogs: eventLogs.slice(0, 5),
        lastUpdate: new Date().toLocaleTimeString('ru')
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, [trainers, clients, events, products, messages, eventLogs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'syncing': return 'text-blue-600';
      case 'error': return 'text-red-600';
            default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'syncing': return '🔄';
      case 'error': return '🔴';
      case 'offline': return '⚫';
      default: return '⚪';
    }
  };

  const formatSyncTime = (date: Date | null) => {
    if (!date) return 'Никогда';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    
    const days = Math.floor(hours / 24);
    return `${days} дн назад`;
  };

  const handleEmergencySync = async () => {
    if (window.confirm('Выполнить экстренную синхронизацию? Это может занять некоторое время.')) {
      await forceRefresh();
    }
  };

  const debugData = getDebugData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Панель управления системой
        </h1>
        <p className="text-gray-600">
          Роль: <span className="font-semibold">{userRole}</span> | 
          ID: <span className="font-mono text-sm">{userId}</span>
        </p>
      </div>

      {/* Статус системы */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Статус подключения</p>
              <p className={`text-lg font-semibold ${getStatusColor(isOnline ? 'online' : 'offline')}`}>
                {getStatusIcon(isOnline ? 'online' : 'offline')} {isOnline ? 'Онлайн' : 'Офлайн'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Синхронизация</p>
              <p className={`text-lg font-semibold ${getStatusColor(isAnySyncing ? 'syncing' : 'online')}`}>
                {getStatusIcon(isAnySyncing ? 'syncing' : 'online')} 
                {isAnySyncing ? 'Синхронизация...' : 'Синхронизировано'}
              </p>
              {currentSyncOperation && (
                <p className="text-xs text-gray-500">Операция: {currentSyncOperation}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Последняя синхронизация</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatSyncTime(lastSync)}
              </p>
              {syncQueue.length > 0 && (
                <p className="text-xs text-blue-600">В очереди: {syncQueue.length}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Сообщения</p>
              <p className="text-lg font-semibold text-gray-900">
                {systemStats?.unreadMessages || 0} непрочитанных
              </p>
              {isProcessingMessages && (
                <p className="text-xs text-blue-600">Обработка: {messageQueue.length}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ошибки */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <div>
                <h3 className="text-red-800 font-medium">Ошибка системы</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              👥
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Тренеры</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemStats?.activeTrainers || 0}
              </p>
              <p className="text-xs text-gray-500">
                из {systemStats?.totalTrainers || 0} всего
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              👤
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Клиенты</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemStats?.activeClients || 0}
              </p>
              <p className="text-xs text-gray-500">
                из {systemStats?.totalClients || 0} всего
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              📅
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">События</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemStats?.upcomingEvents || 0}
              </p>
              <p className="text-xs text-gray-500">
                из {systemStats?.totalEvents || 0} всего
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
              📦
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Продукты</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemStats?.totalProducts || 0}
              </p>
              <p className="text-xs text-red-500">
                {systemStats?.lowStockProducts || 0} заканчиваются
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Последние события */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Последние события</h3>
          </div>
          <div className="p-6">
            {systemStats?.recentEventLogs?.length > 0 ? (
              <div className="space-y-4">
                {systemStats.recentEventLogs.map((log: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {log.event.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {log.action} • {log.createdBy} • 
                        {new Date(log.timestamp).toLocaleString('ru')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Нет недавних событий</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Последние сообщения</h3>
          </div>
          <div className="p-6">
            {messages.slice(0, 5).length > 0 ? (
              <div className="space-y-4">
                {messages.slice(0, 5).map((message) => (
                  <div key={message._id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className={`inline-block w-2 h-2 rounded-full mt-2 ${
                        message.isRead ? 'bg-gray-400' : 'bg-blue-400'
                      }`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {message.subject || 'Без темы'}
                      </p>
                      <p className="text-sm text-gray-500">
                        от {message.senderName} • 
                        {new Date(message.createdAt).toLocaleString('ru')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Нет сообщений</p>
            )}
          </div>
        </div>
      </div>

      {/* Управление */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Управление системой</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={syncAllData}
              disabled={isAnySyncing}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnySyncing ? (
                <>
                  <span className="animate-spin mr-2">🔄</span>
                  Синхронизация...
                </>
              ) : (
                <>
                  <span className="mr-2">🔄</span>
                  Синхронизировать
                </>
              )}
            </button>

            <button
              onClick={handleEmergencySync}
              disabled={isAnySyncing}
              className="flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">⚡</span>
              Экстренная синхронизация
            </button>

            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <span className="mr-2">🔧</span>
              {showDebugInfo ? 'Скрыть отладку' : 'Показать отладку'}
            </button>
          </div>
        </div>
      </div>

      {/* Отладочная информация */}
      {showDebugInfo && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Отладочная информация</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Состояние синхронизации</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify({
                      isOnline,
                      loading,
                      isAnySyncing,
                      syncQueue,
                      currentSyncOperation,
                      lastSync: lastSync?.toISOString(),
                      error
                    }, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Статистика сообщений</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify({
                      totalMessages: messages.length,
                                            unreadMessages: messages.filter(m => !m.isRead).length,
                      messageQueue: messageQueue.length,
                      isProcessingMessages,
                      eventLogs: eventLogs.length,
                      debugData: {
                        events: debugData.events.length,
                        notifications: debugData.notifications.length,
                        syncStatus: debugData.syncStatus
                      }
                    }, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Данные системы</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify({
                      trainers: trainers.length,
                      clients: clients.length,
                      events: events.length,
                      products: products.length,
                      analytics: analytics ? 'Загружены' : 'Не загружены',
                      lastUpdate: systemStats?.lastUpdate
                    }, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Производительность</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify({
                      memoryUsage: typeof window !== 'undefined' ? {
                        used: Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024) || 'N/A',
                        total: Math.round((performance as any).memory?.totalJSHeapSize / 1024 / 1024) || 'N/A',
                        limit: Math.round((performance as any).memory?.jsHeapSizeLimit / 1024 / 1024) || 'N/A'
                      } : 'Недоступно',
                      userAgent: typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'Недоступно',
                      timestamp: new Date().toISOString()
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Последние логи событий */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Последние логи событий</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {eventLogs.slice(0, 10).map((log, index) => (
                  <div key={index} className="text-xs text-gray-600 mb-2 border-b border-gray-200 pb-2">
                    <div className="font-mono">
                      [{new Date(log.timestamp).toLocaleString('ru')}] 
                      <span className="font-semibold"> {log.action.toUpperCase()}</span> - 
                      {log.event.title}
                    </div>
                    <div className="ml-4 text-gray-500">
                      Создано: {log.createdBy} | Тип: {log.event.type} | 
                      Тренер: {log.event.trainerName}
                      {log.event.clientName && ` | Клиент: ${log.event.clientName}`}
                    </div>
                  </div>
                ))}
                {eventLogs.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Нет логов событий</p>
                )}
              </div>
            </div>

            {/* Последние сообщения с деталями */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Детали сообщений</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {messages.slice(0, 5).map((message, index) => (
                  <div key={index} className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-3">
                    <div className="font-mono">
                      [{new Date(message.createdAt).toLocaleString('ru')}] 
                      <span className="font-semibold"> {message.priority.toUpperCase()}</span>
                    </div>
                    <div className="ml-4">
                      <div><strong>От:</strong> {message.senderName} ({message.senderId})</div>
                      <div><strong>Кому:</strong> {message.recipientNames.join(', ')}</div>
                      <div><strong>Тема:</strong> {message.subject || 'Без темы'}</div>
                      <div><strong>Статус:</strong> {message.status} | 
                        <strong> Прочитано:</strong> {message.isRead ? 'Да' : 'Нет'}
                      </div>
                      {message.relatedTo && (
                        <div><strong>Связано с:</strong> {message.relatedTo.type} - {message.relatedTo.title}</div>
                      )}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Нет сообщений</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Футер с информацией о системе */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Система управления фитнес-клубом | 
          Версия: 2.0.0 | 
          Последнее обновление: {systemStats?.lastUpdate || 'Загрузка...'}
        </p>
        <p className="mt-1">
          Пользователь: {userRole} | 
          Сессия активна | 
          {isOnline ? '🟢 Подключено' : '🔴 Не подключено'}
        </p>
      </div>
    </div>
  );
}

// Компонент для быстрого тестирования системы
export function SystemTestPanel() {
  const { logEvent } = useMessaging();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [`[${new Date().toLocaleTimeString()}] ${result}`, ...prev.slice(0, 9)]);
  };

  const createTestEvent = async () => {
    try {
      await logEvent({
        action: 'created',
        createdBy: 'test-user',
        event: {
          _id: `test_${Date.now()}`,
          title: 'Тестовая тренировка',
          type: 'personal',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // через 2 часа
          endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // через 3 часа
          trainerName: 'Тест Тренер',
          trainerId: 'trainer_test',
          clientName: 'Тест Клиент',
          clientId: 'client_test',
          location: 'Тестовый зал',
          price: 1500,
          status: 'confirmed'
        }
      });
      addTestResult('✅ Тестовое событие создано успешно');
    } catch (error) {
      addTestResult(`❌ Ошибка создания события: ${error}`);
    }
  };

  const createTestGroupEvent = async () => {
    try {
      await logEvent({
        action: 'created',
        createdBy: 'test-user',
        event: {
          _id: `test_group_${Date.now()}`,
          title: 'Групповая йога',
          type: 'group',
          startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // через 4 часа
          endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // через 5 часов
          trainerName: 'Анна Йогина',
          trainerId: 'trainer_yoga',
          location: 'Зал групповых программ',
          price: 800,
          status: 'open'
        }
      });
      addTestResult('✅ Тестовое групповое событие создано успешно');
    } catch (error) {
      addTestResult(`❌ Ошибка создания группового события: ${error}`);
    }
  };

  const simulateSystemLoad = async () => {
    addTestResult('🔄 Начинаем симуляцию нагрузки...');
    
    for (let i = 0; i < 5; i++) {
      try {
        await logEvent({
          action: 'created',
          createdBy: `load-test-${i}`,
          event: {
            _id: `load_test_${Date.now()}_${i}`,
            title: `Нагрузочный тест ${i + 1}`,
            type: i % 2 === 0 ? 'personal' : 'group',
            startTime: new Date(Date.now() + (i + 1) * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + (i + 2) * 60 * 60 * 1000).toISOString(),
            trainerName: `Тренер ${i + 1}`,
            trainerId: `trainer_${i}`,
            clientName: i % 2 === 0 ? `Клиент ${i + 1}` : undefined,
            clientId: i % 2 === 0 ? `client_${i}` : undefined,
            location: `Зал ${i + 1}`,
            price: 1000 + i * 100,
            status: 'confirmed'
          }
        });
        
        // Небольшая задержка между созданием событий
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        addTestResult(`❌ Ошибка в нагрузочном тесте ${i + 1}: ${error}`);
      }
    }
    
    addTestResult('✅ Нагрузочный тест завершен');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h3 className="text-lg font-medium text-gray-900">Панель тестирования системы</h3>
        <p className="text-sm text-gray-600">Создание тестовых событий для проверки работы системы уведомлений</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={createTestEvent}
          className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <span className="mr-2">👤</span>
          Создать персональную тренировку
        </button>

        <button
          onClick={createTestGroupEvent}
          className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <span className="mr-2">👥</span>
          Создать групповую тренировку
        </button>

        <button
          onClick={simulateSystemLoad}
          className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
        >
          <span className="mr-2">⚡</span>
          Нагрузочный тест
        </button>
      </div>

      {/* Результаты тестов */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Результаты тестов</h4>
        <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
          {testResults.length > 0 ? (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono text-gray-700">
                  {result}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Нет результатов тестов</p>
          )}
        </div>
      </div>
    </div>
  );
}


