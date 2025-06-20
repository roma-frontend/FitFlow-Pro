// hooks/useDashboardData.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    UnifiedTrainer,
    UnifiedClient,
    UnifiedEvent,
    DashboardStats,
    Analytics,
    UseDashboardDataReturn,
    SyncStatus
} from '../types/dashboard';
import { initDebugCommands, registerGlobalDebugCommands } from '@/utils/debugCommands';

// Моковые данные для демонстрации
const mockTrainers: UnifiedTrainer[] = [
    {
        id: '1',
        name: 'Алексей Петров',
        email: 'alexey@gym.com',
        role: 'Персональный тренер',
        status: 'active',
        activeClients: 15,
        rating: 4.8,
        specializations: ['Силовые тренировки', 'Кроссфит'],
        phone: '+7 (999) 123-45-67',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-11-01')
    },
    {
        id: '2',
        name: 'Мария Сидорова',
        email: 'maria@gym.com',
        role: 'Групповой тренер',
        status: 'active',
        activeClients: 25,
        rating: 4.9,
        specializations: ['Йога', 'Пилатес'],
        phone: '+7 (999) 234-56-78',
        createdAt: new Date('2023-03-20'),
        updatedAt: new Date('2024-10-28')
    },
    {
        id: '3',
        name: 'Дмитрий Козлов',
        email: 'dmitry@gym.com',
        role: 'Персональный тренер',
        status: 'inactive',
        activeClients: 0,
        rating: 4.5,
        specializations: ['Бокс', 'Функциональные тренировки'],
        phone: '+7 (999) 345-67-89',
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date('2024-09-15')
    }
];

const mockClients: UnifiedClient[] = [
    {
        id: '1',
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        phone: '+7 (999) 111-11-11',
        status: 'active',
        trainerName: 'Алексей Петров',
        trainerId: '1',
        totalSessions: 24,
        lastVisit: new Date('2024-11-25'),
        membershipType: 'Premium',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-11-25')
    },
    {
        id: '2',
        name: 'Елена Смирнова',
        email: 'elena@example.com',
        phone: '+7 (999) 222-22-22',
        status: 'trial',
        trainerName: 'Мария Сидорова',
        trainerId: '2',
        totalSessions: 3,
        lastVisit: new Date('2024-11-20'),
        membershipType: 'Trial',
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-20')
    },
    {
        id: '3',
        name: 'Петр Васильев',
        email: 'petr@example.com',
        phone: '+7 (999) 333-33-33',
        status: 'inactive',
        trainerName: 'Алексей Петров',
        trainerId: '1',
        totalSessions: 12,
        lastVisit: new Date('2024-10-15'),
        membershipType: 'Basic',
        createdAt: new Date('2024-08-05'),
        updatedAt: new Date('2024-10-15')
    }
];

const mockEvents: UnifiedEvent[] = [
    {
        id: '1',
        title: 'Персональная тренировка',
        startTime: new Date('2024-11-27T10:00:00'),
        endTime: new Date('2024-11-27T11:00:00'),
        status: 'scheduled',
        type: 'personal',
        trainerName: 'Алексей Петров',
        trainerId: '1',
        clientName: 'Иван Иванов',
        clientId: '1',
        price: 2500,
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date('2024-11-20')
    },
    {
        id: '2',
        title: 'Групповая йога',
        startTime: new Date('2024-11-27T18:00:00'),
        endTime: new Date('2024-11-27T19:30:00'),
        status: 'confirmed',
        type: 'group',
        trainerName: 'Мария Сидорова',
        trainerId: '2',
        clientName: 'Елена Смирнова',
        clientId: '2',
        price: 1200,
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-11-25')
    },
    {
        id: '3',
        title: 'Консультация',
        startTime: new Date('2024-11-26T15:00:00'),
        endTime: new Date('2024-11-26T16:00:00'),
        status: 'completed',
        type: 'consultation',
        trainerName: 'Алексей Петров',
        trainerId: '1',
        clientName: 'Петр Васильев',
        clientId: '3',
        price: 1500,
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date('2024-11-26')
    }
];

const getErrorMessage = (error: unknown): string => {
    // Handle Error objects
    if (error instanceof Error) {
        return error.message;
    }

    // Handle string errors
    if (typeof error === 'string') {
        return error;
    }

    // Handle objects with message property
    if (error && typeof error === 'object') {
        if ('message' in error && typeof (error as any).message === 'string') {
            return (error as any).message;
        }

        // Handle objects with error property
        if ('error' in error && typeof (error as any).error === 'string') {
            return (error as any).error;
        }

        // Try to stringify the object
        try {
            return JSON.stringify(error);
        } catch {
            return 'Ошибка сериализации объекта ошибки';
        }
    }

    // Handle null or undefined
    if (error === null) return 'Null error';
    if (error === undefined) return 'Undefined error';

    // Fallback for other types
    try {
        return String(error);
    } catch {
        return 'Неизвестная ошибка';
    }
};

export const useDashboardData = (): UseDashboardDataReturn => {
    const [trainers, setTrainers] = useState<UnifiedTrainer[]>([]);
    const [clients, setClients] = useState<UnifiedClient[]>([]);
    const [events, setEvents] = useState<UnifiedEvent[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isOnline: true,
        lastSync: null,
        retryCount: 0,
        error: null
    });

    // Вычисляемая статистика
    const stats: DashboardStats = useMemo(() => {
        const activeTrainers = trainers.filter(t => t.status === 'active').length;
        const activeClients = clients.filter(c => c.status === 'active').length;
        const trialClients = clients.filter(c => c.status === 'trial').length;
        const inactiveClients = clients.filter(c => c.status === 'inactive').length;

        const today = new Date();
        const todayEvents = events.filter(e =>
            new Date(e.startTime).toDateString() === today.toDateString()
        ).length;

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisMonthEvents = events.filter(e =>
            new Date(e.startTime) >= thisMonth
        );

        const thisMonthRevenue = thisMonthEvents
            .filter(e => e.status === 'completed' && e.price)
            .reduce((sum, e) => sum + (e.price || 0), 0);

        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        const lastMonthEvents = events.filter(e => {
            const eventDate = new Date(e.startTime);
            return eventDate >= lastMonth && eventDate <= lastMonthEnd;
        });

        const lastMonthRevenue = lastMonthEvents
            .filter(e => e.status === 'completed' && e.price)
            .reduce((sum, e) => sum + (e.price || 0), 0);

        const revenueGrowth = lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        return {
            trainers: {
                total: trainers.length,
                active: activeTrainers,
                inactive: trainers.length - activeTrainers
            },
            clients: {
                total: clients.length,
                active: activeClients,
                trial: trialClients,
                inactive: inactiveClients
            },
            workouts: {
                today: todayEvents,
                total: events.length,
                thisWeek: events.filter(e => {
                    const eventDate = new Date(e.startTime);
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    return eventDate >= weekStart;
                }).length,
                thisMonth: thisMonthEvents.length
            },
            revenue: {
                thisMonth: thisMonthRevenue,
                lastMonth: lastMonthRevenue,
                growth: Math.round(revenueGrowth * 100) / 100,
                total: events
                    .filter(e => e.status === 'completed' && e.price)
                    .reduce((sum, e) => sum + (e.price || 0), 0)
            }
        };
    }, [trainers, clients, events]);

    // Функция загрузки данных
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Симуляция API вызовов
            await new Promise(resolve => setTimeout(resolve, 1000));

            // В реальном приложении здесь были бы API вызовы
            setTrainers(mockTrainers);
            setClients(mockClients);
            setEvents(mockEvents);

            // Загрузка аналитики
            const mockAnalytics: Analytics = {
                revenue: {
                    total: 450000,
                    thisMonth: 85000,
                    lastMonth: 78000,
                    growth: 8.97,
                    averageCheck: 2100,
                    monthlyData: [
                        { month: 'Янв', amount: 65000 },
                        { month: 'Фев', amount: 72000 },
                        { month: 'Мар', amount: 68000 },
                        { month: 'Апр', amount: 75000 },
                        { month: 'Май', amount: 82000 },
                        { month: 'Июн', amount: 78000 },
                        { month: 'Июл', amount: 85000 },
                        { month: 'Авг', amount: 88000 },
                        { month: 'Сен', amount: 92000 },
                        { month: 'Окт', amount: 78000 },
                        { month: 'Ноя', amount: 85000 }
                    ]
                },
                workouts: {
                    total: 1250,
                    completed: 1150,
                    cancelled: 65,
                    noShows: 35,
                    weeklyDistribution: [
                        { day: 'Пн', count: 45 },
                        { day: 'Вт', count: 52 },
                        { day: 'Ср', count: 48 },
                        { day: 'Чт', count: 55 },
                        { day: 'Пт', count: 42 },
                        { day: 'Сб', count: 38 },
                        { day: 'Вс', count: 25 }
                    ]
                },
                topTrainers: [
                    { id: '1', name: 'Алексей Петров', clients: 15, revenue: 45000, rating: 4.8 },
                    { id: '2', name: 'Мария Сидорова', clients: 25, revenue: 38000, rating: 4.9 },
                    { id: '3', name: 'Дмитрий Козлов', clients: 12, revenue: 28000, rating: 4.5 }
                ],
                clientRetention: {
                    rate: 85.5,
                    newClients: 28,
                    lostClients: 5
                }
            };

            setAnalytics(mockAnalytics);

            setSyncStatus(prev => ({
                ...prev,
                lastSync: new Date(),
                retryCount: 0,
                error: null
            }));

        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            setError(errorMessage);
            setSyncStatus(prev => ({
                ...prev,
                error: errorMessage,
                retryCount: prev.retryCount + 1
            }));
        } finally {
            setLoading(false);
        }
    }, []);

    // Функция синхронизации всех данных
    const syncAllData = useCallback(async () => {
        await loadData();
    }, [loadData]);

    // Функция обновления статистики
    const refreshStats = useCallback(async () => {
        setLoading(true);
        try {
            // Симуляция обновления статистики
            await new Promise(resolve => setTimeout(resolve, 500));
            // В реальном приложении здесь был бы API вызов для получения свежей статистики
        } catch (error: unknown) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    // Автоматическая загрузка данных при монтировании компонента
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Автоматическая переподключение при ошибках
    useEffect(() => {
        if (syncStatus.error && syncStatus.retryCount < 3) {
            const retryDelay = Math.pow(2, syncStatus.retryCount) * 5000; // Экспоненциальная задержка
            const timer = setTimeout(() => {
                loadData();
            }, retryDelay);

            return () => clearTimeout(timer);
        }
    }, [syncStatus.error, syncStatus.retryCount, loadData]);

    // Периодическое обновление данных
    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading && !error) {
                refreshStats();
            }
        }, 5 * 60 * 1000); // Каждые 5 минут

        return () => clearInterval(interval);
    }, [loading, error, refreshStats]);


    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            // Небольшая задержка чтобы все контексты успели загрузиться
            const timer = setTimeout(() => {
                const debugCommands = initDebugCommands({
                    schedule: { events, addEvent: () => { }, deleteEvent: () => { } },
                    dashboard: { trainers, clients, events, syncAllData, refreshStats },
                    superAdmin: { trainers, clients }
                });
                registerGlobalDebugCommands(debugCommands);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [trainers, clients, events, syncAllData, refreshStats]);

    return {
        trainers,
        clients,
        events,
        stats,
        analytics,
        loading,
        error,
        syncAllData,
        refreshStats
    };
};

// Хук для работы с фильт
// Хук для работы с фильтрацией данных
export const useFilteredData = (
    trainers: UnifiedTrainer[],
    clients: UnifiedClient[],
    events: UnifiedEvent[],
    permissions: any
) => {
    return useMemo(() => {
        // Фильтрация на основе разрешений пользователя
        const filteredTrainers = trainers.filter(trainer => {
            if (permissions?.isAdmin?.()) return true;
            if (permissions?.currentRole === 'manager') return true;
            if (permissions?.currentRole === 'trainer') {
                return trainer.id === permissions?.currentUserId;
            }
            return permissions?.canAccess?.('trainers', 'read', trainer.id) || false;
        });

        const filteredClients = clients.filter(client => {
            if (permissions?.isAdmin?.()) return true;
            if (permissions?.currentRole === 'manager') return true;
            if (permissions?.currentRole === 'trainer') {
                return client.trainerId === permissions?.currentUserId;
            }
            return permissions?.canAccess?.('clients', 'read', client.id) || false;
        });

        const filteredEvents = events.filter(event => {
            if (permissions?.isAdmin?.()) return true;
            if (permissions?.currentRole === 'manager') return true;
            if (permissions?.currentRole === 'trainer') {
                return event.trainerId === permissions?.currentUserId;
            }
            return permissions?.canAccess?.('schedule', 'read', event.trainerId) || false;
        });

        return {
            filteredTrainers,
            filteredClients,
            filteredEvents
        };
    }, [trainers, clients, events, permissions]);
};

// Хук для работы с поиском
export const useSearch = <T extends Record<string, any>>(
    items: T[],
    searchTerm: string,
    searchFields: (keyof T)[]
) => {
    return useMemo(() => {
        if (!searchTerm.trim()) return items;

        const lowercaseSearch = searchTerm.toLowerCase();
        return items.filter(item =>
            searchFields.some(field => {
                const value = item[field];
                return value &&
                    typeof value === 'string' &&
                    value.toLowerCase().includes(lowercaseSearch);
            })
        );
    }, [items, searchTerm, searchFields]);
};

// Хук для работы с сортировкой
export const useSort = <T extends Record<string, any>>(
    items: T[],
    sortField: keyof T | null,
    sortDirection: 'asc' | 'desc'
) => {
    return useMemo(() => {
        if (!sortField) return items;

        return [...items].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === bValue) return 0;

            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else {
                comparison = String(aValue).localeCompare(String(bValue));
            }

            return sortDirection === 'desc' ? -comparison : comparison;
        });
    }, [items, sortField, sortDirection]);
};

// Хук для работы с пагинацией
export const usePagination = <T>(
    items: T[],
    itemsPerPage: number = 10
) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    const goToPage = useCallback((page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }, [totalPages]);

    const nextPage = useCallback(() => {
        goToPage(currentPage + 1);
    }, [currentPage, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(currentPage - 1);
    }, [currentPage, goToPage]);

    // Сброс на первую страницу при изменении данных
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [items.length, totalPages, currentPage]);

    return {
        currentItems,
        currentPage,
        totalPages,
        itemsPerPage,
        totalItems: items.length,
        goToPage,
        nextPage,
        prevPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
    };
};

// Хук для работы с локальным хранилищем
export const useLocalStorage = <T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof window !== 'undefined') {
                const item = window.localStorage.getItem(key);
                return item ? JSON.parse(item) : initialValue;
            }
            return initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = typeof value === 'function' ? (value as (val: T) => T)(storedValue) : value;
            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
};

// Хук для работы с дебаунсом
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Хук для отслеживания изменений в реальном времени
export const useRealTimeUpdates = (
    onUpdate: (data: any) => void,
    dependencies: any[] = []
) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    useEffect(() => {
        // Симуляция WebSocket соединения
        let interval: NodeJS.Timeout;

        const connect = () => {
            setIsConnected(true);
            console.log('🔌 Подключение к real-time обновлениям...');

            // Симуляция получения обновлений каждые 30 секунд
            interval = setInterval(() => {
                const mockUpdate = {
                    type: 'stats_update',
                    timestamp: new Date(),
                    data: {
                        activeUsers: Math.floor(Math.random() * 50) + 100,
                        newBookings: Math.floor(Math.random() * 5)
                    }
                };

                onUpdate(mockUpdate);
                setLastUpdate(new Date());
            }, 30000);
        };

        const disconnect = () => {
            setIsConnected(false);
            if (interval) {
                clearInterval(interval);
            }
            console.log('🔌 Отключение от real-time обновлений');
        };

        // Подключение при монтировании
        connect();

        // Переподключение при изменении зависимостей
        return () => {
            disconnect();
        };
    }, dependencies);

    return {
        isConnected,
        lastUpdate
    };
};

// Хук для работы с экспортом данных
export const useDataExport = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const exportToCSV = useCallback(async (
        data: any[],
        filename: string,
        columns?: string[]
    ) => {
        setIsExporting(true);
        setExportProgress(0);

        try {
            // Симуляция процесса экспорта
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                setExportProgress(i);
            }

            // Подготовка данных для CSV
            const headers = columns || (data.length > 0 ? Object.keys(data[0]) : []);
            const csvContent = [
                headers.join(','),
                ...data.map(row =>
                    headers.map(header => {
                        const value = row[header];
                        // Экранирование значений с запятыми или кавычками
                        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value || '';
                    }).join(',')
                )
            ].join('\n');

            // Создание и скачивание файла
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log(`✅ Данные экспортированы в файл: ${filename}.csv`);

        } catch (error) {
            console.error('❌ Ошибка экспорта:', error);
            throw new Error(getErrorMessage(error));
        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
    }, []);

    const exportToJSON = useCallback(async (
        data: any,
        filename: string
    ) => {
        setIsExporting(true);
        setExportProgress(0);

        try {
            // Симуляция процесса экспорта
            for (let i = 0; i <= 100; i += 20) {
                await new Promise(resolve => setTimeout(resolve, 50));
                setExportProgress(i);
            }

            const jsonContent = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.json`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log(`✅ Данные экспортированы в файл: ${filename}.json`);

        } catch (error) {
            console.error('❌ Ошибка экспорта:', error);
            throw new Error(getErrorMessage(error));
        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
    }, []);

    return {
        isExporting,
        exportProgress,
        exportToCSV,
        exportToJSON
    };
};

// Хук для работы с уведомлениями
export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Array<{
        id: string;
        type: 'info' | 'success' | 'warning' | 'error';
        title: string;
        message: string;
        timestamp: Date;
        read: boolean;
    }>>([]);

    const addNotification = useCallback((
        type: 'info' | 'success' | 'warning' | 'error',
        title: string,
        message: string
    ) => {
        const notification = {
            id: Date.now().toString(),
            type,
            title,
            message,
            timestamp: new Date(),
            read: false
        };

        setNotifications(prev => [notification, ...prev]);

        // Автоматическое удаление через 5 секунд для success и info
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                removeNotification(notification.id);
            }, 5000);
        }

        return notification.id;
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = useMemo(() =>
        notifications.filter(n => !n.read).length,
        [notifications]
    );

    return {
        notifications,
        unreadCount,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll
    };
};

// Хук для работы с валидацией форм
export const useFormValidation = <T extends Record<string, any>>(
    initialValues: T,
    validationRules: Record<keyof T, (value: any) => string | null>
) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof T, boolean>>>({});

    const validateField = useCallback((field: keyof T, value: any) => {
        const rule = validationRules[field];
        if (rule) {
            return rule(value);
        }
        return null;
    }, [validationRules]);

    const validateAll = useCallback(() => {
        const newErrors: Partial<Record<keyof T, string>> = {};
        let isValid = true;

        Object.keys(values).forEach((key) => {
            const field = key as keyof T;
            const error = validateField(field, values[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [values, validateField]);

    const setValue = useCallback((field: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));

        // Валидация поля при изменении

        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));
    }, [validateField]);

    const setFieldTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
        setTouchedFields(prev => ({ ...prev, [field]: isTouched }));
    }, []);

    const handleChange = useCallback((field: keyof T) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const value = event.target.type === 'checkbox'
            ? (event.target as HTMLInputElement).checked
            : event.target.value;
        setValue(field, value);
    }, [setValue]);

    const handleBlur = useCallback((field: keyof T) => () => {
        setFieldTouched(field, true);
    }, [setFieldTouched]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouchedFields({});
    }, [initialValues]);

    const isValid = useMemo(() => {
        return Object.values(errors).every(error => !error);
    }, [errors]);

    return {
        values,
        errors,
        touched: touchedFields,
        isValid,
        setValue,
        setTouched: setFieldTouched,
        handleChange,
        handleBlur,
        validateAll,
        reset
    };
};

// Хук для работы с модальными окнами
export const useModal = (initialState: boolean = false) => {
    const [isOpen, setIsOpen] = useState(initialState);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    return {
        isOpen,
        open,
        close,
        toggle
    };
};

// Хук для работы с состоянием загрузки
export const useAsyncOperation = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async <T>(
        operation: () => Promise<T>
    ): Promise<T | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await operation();
            return result;
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        execute,
        reset
    };
};

// Хук для работы с таймерами
export const useTimer = (initialTime: number = 0) => {
    const [time, setTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const start = useCallback(() => {
        if (!isRunning) {
            setIsRunning(true);
            intervalRef.current = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }
    }, [isRunning]);

    const pause = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        pause();
        setTime(initialTime);
    }, [pause, initialTime]);

    const stop = useCallback(() => {
        pause();
        setTime(0);
    }, [pause]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const formatTime = useCallback((seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    return {
        time,
        isRunning,
        start,
        pause,
        reset,
        stop,
        formattedTime: formatTime(time)
    };
};

// Хук для работы с геолокацией
export const useGeolocation = () => {
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
        accuracy: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Геолокация не поддерживается вашим браузером');
            return;
        }

        setIsLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setIsLoading(false);
            },
            (err) => {
                setError(err.message);
                setIsLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }, []);

    return {
        location,
        error,
        isLoading,
        getCurrentLocation
    };
};

// Хук для работы с медиа-запросами
export const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);

        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
};

// Хук для работы с клипбордом
export const useClipboard = () => {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return true;
        } catch (err) {
            console.error('Ошибка копирования в буфер обмена:', err);
            return false;
        }
    }, []);

    return {
        copied,
        copy
    };
};

// Хук для работы с историей действий (undo/redo)
export const useHistory = <T>(initialState: T) => {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const current = history[currentIndex];
    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const push = useCallback((state: T) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, currentIndex + 1);
            newHistory.push(state);
            return newHistory;
        });
        setCurrentIndex(prev => prev + 1);
    }, [currentIndex]);

    const undo = useCallback(() => {
        if (canUndo) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [canUndo]);

    const redo = useCallback(() => {
        if (canRedo) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [canRedo]);

    const reset = useCallback(() => {
        setHistory([initialState]);
        setCurrentIndex(0);
    }, [initialState]);

    return {
        current,
        canUndo,
        canRedo,
        push,
        undo,
        redo,
        reset
    };
};

// Хук для работы с веб-сокетами
export const useWebSocket = (url: string, options?: {
    onOpen?: () => void;
    onMessage?: (data: any) => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
    reconnectAttempts?: number;
    reconnectInterval?: number;
}) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = options?.reconnectAttempts || 5;
    const reconnectInterval = options?.reconnectInterval || 3000;

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                setIsConnected(true);
                setError(null);
                reconnectAttemptsRef.current = 0;
                options?.onOpen?.();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    options?.onMessage?.(data);
                } catch (err) {
                    options?.onMessage?.(event.data);
                }
            };

            ws.onerror = (error) => {
                setError('Ошибка WebSocket соединения');
                options?.onError?.(error);
            };

            ws.onclose = () => {
                setIsConnected(false);
                setSocket(null);
                options?.onClose?.();

                // Автоматическое переподключение
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }, reconnectInterval);
                }
            };

            setSocket(ws);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    }, [url, options, maxReconnectAttempts, reconnectInterval]);

    const disconnect = useCallback(() => {
        if (socket) {
            socket.close();
        }
    }, [socket]);

    const send = useCallback((data: any) => {
        if (socket && isConnected) {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            socket.send(message);
        }
    }, [socket, isConnected]);

    useEffect(() => {
        connect();
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    return {
        isConnected,
        error,
        send,
        disconnect,
        reconnect: connect
    };
};

// Хук для работы с drag and drop
export const useDragAndDrop = <T>(
    items: T[],
    onReorder: (newItems: T[]) => void
) => {
    const [draggedItem, setDraggedItem] = useState<T | null>(null);
    const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

    const handleDragStart = useCallback((item: T) => {
        setDraggedItem(item);
    }, []);

    const handleDragOver = useCallback((index: number) => {
        setDraggedOverIndex(index);
    }, []);

    const handleDragEnd = useCallback(() => {
        if (draggedItem && draggedOverIndex !== null) {
            const draggedIndex = items.indexOf(draggedItem);
            const newItems = [...items];

            // Удаляем элемент из старой позиции
            newItems.splice(draggedIndex, 1);
            // Вставляем в новую позицию
            newItems.splice(draggedOverIndex, 0, draggedItem);

            onReorder(newItems);
        }

        setDraggedItem(null);
        setDraggedOverIndex(null);
    }, [draggedItem, draggedOverIndex, items, onReorder]);

    const handleDragLeave = useCallback(() => {
        setDraggedOverIndex(null);
    }, []);

    return {
        draggedItem,
        draggedOverIndex,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragLeave
    };
};

// Хук для работы с бесконечной прокруткой
export const useInfiniteScroll = <T>(
    fetchMore: () => Promise<T[]>,
    hasMore: boolean = true
) => {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<HTMLDivElement | null>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        setError(null);

        try {
            const newItems = await fetchMore();
            setItems(prev => [...prev, ...newItems]);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [fetchMore, hasMore, loading]);

    useEffect(() => {
        if (!loadingRef.current) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        observerRef.current.observe(loadingRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loading, loadMore]);

    const reset = useCallback(() => {
        setItems([]);
        setError(null);
    }, []);

    return {
        items,
        loading,
        error,
        loadingRef,
        reset
    };
};

// Хук для работы с виртуализацией списков
export const useVirtualList = <T>(
    items: T[],
    itemHeight: number,
    containerHeight: number
) => {
    const [scrollTop, setScrollTop] = useState(0);
    const scrollElementRef = useRef<HTMLDivElement | null>(null);

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    );

    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(event.currentTarget.scrollTop);
    }, []);

    return {

        visibleItems,
        totalHeight,
        offsetY,
        scrollElementRef,
        handleScroll,
        startIndex,
        endIndex
    };
};

// Хук для работы с кэшированием данных
export const useCache = <T>(key: string, ttl: number = 5 * 60 * 1000) => {
    const [cache, setCache] = useState<Map<string, { data: T; timestamp: number }>>(new Map());

    const get = useCallback((cacheKey: string): T | null => {
        const cached = cache.get(cacheKey);
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > ttl) {
            // Данные устарели
            cache.delete(cacheKey);
            setCache(new Map(cache));
            return null;
        }

        return cached.data;
    }, [cache, ttl]);

    const set = useCallback((cacheKey: string, data: T) => {
        const newCache = new Map(cache);
        newCache.set(cacheKey, { data, timestamp: Date.now() });
        setCache(newCache);
    }, [cache]);

    const remove = useCallback((cacheKey: string) => {
        const newCache = new Map(cache);
        newCache.delete(cacheKey);
        setCache(newCache);
    }, [cache]);

    const clear = useCallback(() => {
        setCache(new Map());
    }, []);

    const has = useCallback((cacheKey: string): boolean => {
        const cached = cache.get(cacheKey);
        if (!cached) return false;

        const now = Date.now();
        if (now - cached.timestamp > ttl) {
            cache.delete(cacheKey);
            setCache(new Map(cache));
            return false;
        }

        return true;
    }, [cache, ttl]);

    return {
        get,
        set,
        remove,
        clear,
        has,
        size: cache.size
    };
};

// Хук для работы с оптимистичными обновлениями
export const useOptimisticUpdate = <T>(
    initialData: T,
    updateFn: (data: T) => Promise<T>
) => {
    const [data, setData] = useState<T>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = useCallback(async (optimisticData: T) => {
        const previousData = data;

        // Оптимистичное обновление
        setData(optimisticData);
        setIsLoading(true);
        setError(null);

        try {
            const result = await updateFn(optimisticData);
            setData(result);
        } catch (err) {
            // Откат к предыдущему состоянию при ошибке
            setData(previousData);
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [data, updateFn]);

    return {
        data,
        isLoading,
        error,
        update
    };
};

// Хук для работы с состоянием формы с автосохранением
export const useAutoSave = <T>(
    initialData: T,
    saveFn: (data: T) => Promise<void>,
    delay: number = 2000
) => {
    const [data, setData] = useState<T>(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedSave = useCallback(async (dataToSave: T) => {
        setIsSaving(true);
        setError(null);

        try {
            await saveFn(dataToSave);
            setLastSaved(new Date());
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    }, [saveFn]);

    const updateData = useCallback((newData: T | ((prev: T) => T)) => {
        const updatedData = typeof newData === 'function' ? (newData as (prev: T) => T)(data) : newData;
        setData(updatedData);

        // Отменяем предыдущий таймер
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Устанавливаем новый таймер для автосохранения
        timeoutRef.current = setTimeout(() => {
            debouncedSave(updatedData);
        }, delay);
    }, [data, debouncedSave, delay]);

    const forceSave = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        debouncedSave(data);
    }, [data, debouncedSave]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        data,
        updateData,
        isSaving,
        lastSaved,
        error,
        forceSave
    };
};

// Хук для работы с батчингом запросов
export const useBatchRequests = <T, R>(
    batchFn: (items: T[]) => Promise<R[]>,
    batchSize: number = 10,
    delay: number = 100
) => {
    const [queue, setQueue] = useState<Array<{
        item: T;
        resolve: (result: R) => void;
        reject: (error: Error) => void;
    }>>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const processBatch = useCallback(async () => {
        if (queue.length === 0) return;

        const batch = queue.splice(0, batchSize);
        const items = batch.map(entry => entry.item);

        try {
            const results = await batchFn(items);
            batch.forEach((entry, index) => {
                entry.resolve(results[index]);
            });
        } catch (error) {
            const err = error instanceof Error ? error : new Error(getErrorMessage(error));
            batch.forEach(entry => {
                entry.reject(err);
            });
        }

        setQueue(prevQueue => [...prevQueue]);
    }, [queue, batchFn, batchSize]);

    const addToQueue = useCallback((item: T): Promise<R> => {
        return new Promise<R>((resolve, reject) => {
            setQueue(prevQueue => [
                ...prevQueue,
                { item, resolve, reject }
            ]);

            // Планируем обработку батча
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                processBatch();
            }, delay);
        });
    }, [processBatch, delay]);

    const flushQueue = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        processBatch();
    }, [processBatch]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        addToQueue,
        flushQueue,
        queueSize: queue.length
    };
};

// Хук для работы с состоянием загрузки файлов
export const useFileUpload = () => {
    const [uploads, setUploads] = useState<Map<string, {
        file: File;
        progress: number;
        status: 'pending' | 'uploading' | 'completed' | 'error';
        error?: string;
        url?: string;
    }>>(new Map());

    const uploadFile = useCallback(async (
        file: File,
        uploadFn: (file: File, onProgress: (progress: number) => void) => Promise<string>
    ) => {
        const fileId = `${file.name}-${Date.now()}`;

        setUploads(prev => new Map(prev).set(fileId, {
            file,
            progress: 0,
            status: 'uploading'
        }));

        try {
            const url = await uploadFn(file, (progress) => {
                setUploads(prev => {
                    const newMap = new Map(prev);
                    const upload = newMap.get(fileId);
                    if (upload) {
                        newMap.set(fileId, { ...upload, progress });
                    }
                    return newMap;
                });
            });

            setUploads(prev => {
                const newMap = new Map(prev);
                const upload = newMap.get(fileId);
                if (upload) {
                    newMap.set(fileId, {
                        ...upload,
                        status: 'completed',
                        progress: 100,
                        url
                    });
                }
                return newMap;
            });

            return { fileId, url };
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            setUploads(prev => {
                const newMap = new Map(prev);
                const upload = newMap.get(fileId);
                if (upload) {
                    newMap.set(fileId, {
                        ...upload,
                        status: 'error',
                        error: errorMessage
                    });
                }
                return newMap;
            });
            throw error;
        }
    }, []);

    const removeUpload = useCallback((fileId: string) => {
        setUploads(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileId);
            return newMap;
        });
    }, []);

    const clearCompleted = useCallback(() => {
        setUploads(prev => {
            const newMap = new Map();
            prev.forEach((upload, fileId) => {
                if (upload.status !== 'completed') {
                    newMap.set(fileId, upload);
                }
            });
            return newMap;
        });
    }, []);

    const getUploadsByStatus = useCallback((status: 'pending' | 'uploading' | 'completed' | 'error') => {
        return Array.from(uploads.entries())
            .filter(([, upload]) => upload.status === status)
            .map(([fileId, upload]) => ({ fileId, ...upload }));
    }, [uploads]);

    return {
        uploads: Array.from(uploads.entries()).map(([fileId, upload]) => ({ fileId, ...upload })),
        uploadFile,
        removeUpload,
        clearCompleted,
        getUploadsByStatus,
        totalUploads: uploads.size,
        completedUploads: getUploadsByStatus('completed').length,
        failedUploads: getUploadsByStatus('error').length
    };
};

// Хук для работы с состоянием приложения (глобальный стейт)
export const useGlobalState = <T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
    // Простая реализация глобального состояния через localStorage и события
    const [state, setState] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(`global-state-${key}`);
            return stored ? JSON.parse(stored) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        setState(prev => {
            const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
            try {
                localStorage.setItem(`global-state-${key}`, JSON.stringify(newValue));
                // Уведомляем другие компоненты об изменении
                window.dispatchEvent(new CustomEvent(`global-state-${key}`, {
                    detail: newValue
                }));
            } catch (error) {
                console.warn('Failed to save to localStorage:', error);
            }
            return newValue;
        });
    }, [key]);

    // Слушаем изменения от других компонентов
    useEffect(() => {
        const handleStorageChange = (event: CustomEvent) => {
            setState(event.detail);
        };

        window.addEventListener(`global-state-${key}` as any, handleStorageChange);
        return () => {
            window.removeEventListener(`global-state-${key}` as any, handleStorageChange);
        };
    }, [key]);

    return [state, setValue];
};



export default useDashboardData;
