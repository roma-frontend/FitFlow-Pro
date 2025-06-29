// components/providers/OptimizedProviders.tsx
"use client";

import { memo, useMemo, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth, useRole } from '@/hooks/useAuth';
import FitnessLoader from '@/components/ui/FitnessLoader';

// Импорты провайдеров
import { DashboardProvider } from "@/contexts/DashboardContext";
import { UnifiedDataProvider } from "@/contexts/UnifiedDataContext";
import { ScheduleProvider } from "@/contexts/ScheduleContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { SuperAdminProvider } from "@/contexts/SuperAdminContext";
import { ManagerProvider } from "@/contexts/ManagerContext";
import { TrainerProvider } from "@/contexts/TrainerContext";

interface OptimizedProvidersProps {
    children: React.ReactNode;
}

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

// Страницы где показывать лоадер
const PAGES_WITH_LOADER = [
    '/about',
];

// Страницы где НЕ показывать лоадер (исключения)
const PAGES_WITHOUT_LOADER = [
    '/member-dashboard',
    '/trainer-dashboard',
    '/manager/trainers',
    '/manager/analytics',
    '/manager/bookings',
    '/admin/users',
    '/admin/settings',
    '/admin/reports',
    '/admin/analytics',
    '/admin/members',
    '/admin/trainers',
    '/admin/schedules',
    '/member-login',
    '/staff-login',
    '/shop',
    '/manager-dashboard',
    '/trainers',
    '/programs',
];

// Защищенные маршруты (где всегда нужны провайдеры)
const PROTECTED_ROUTES = [
    '',
];

// Функция проверки лоадера
const shouldShowLoader = (pathname: string): boolean => {
    const isExcluded = PAGES_WITHOUT_LOADER.some(page =>
        pathname?.startsWith(page)
    );

    if (isExcluded) return false;

    return PAGES_WITH_LOADER.some(page => pathname?.startsWith(page));
};

// Функция проверки защищенного маршрута
const isProtectedRoute = (pathname: string): boolean => {
    return PROTECTED_ROUTES.some(route => pathname?.startsWith(route));
};

// Функция определения темы на основе пути
const getThemeFromPath = (pathname: string): 'member' | 'staff' => {
    if (pathname?.startsWith('/admin') || 
        pathname?.startsWith('/staff-dashboard') || 
        pathname?.startsWith('/manager') || 
        pathname?.startsWith('/trainer')) {
        return 'staff';
    }
    return 'member';
};

// Функция определения варианта лоадера
const getVariantFromPath = (pathname: string): 'dumbbell' | 'heartbeat' | 'running' | 'strength' | 'yoga' => {
    if (pathname?.startsWith('/admin')) return 'strength';
    if (pathname?.startsWith('/trainer')) return 'dumbbell';
    if (pathname?.startsWith('/manager')) return 'running';
    if (pathname?.startsWith('/staff-dashboard')) return 'yoga';
    return 'heartbeat';
};

// Мемоизированные компоненты провайдеров
const BaseProviders = memo(({ children }: { children: React.ReactNode }) => {
    console.log('📊 BaseProviders: Инициализация с UnifiedDataProvider');
    return (
        <DashboardProvider>
            <UnifiedDataProvider>
                <ScheduleProvider>
                    {children}
                </ScheduleProvider>
            </UnifiedDataProvider>
        </DashboardProvider>
    );
});

const AdminProviders = memo(({ children }: { children: React.ReactNode }) => {
    console.log('👑 AdminProviders: Инициализация');
    return (
        <AdminProvider>
            <SuperAdminProvider>
                <ManagerProvider>
                    {children}
                </ManagerProvider>
            </SuperAdminProvider>
        </AdminProvider>
    );
});

const TrainerProviders = memo(({ children }: { children: React.ReactNode }) => {
    console.log('🏋️ TrainerProviders: Инициализация');
    return (
        <TrainerProvider>
            {children}
        </TrainerProvider>
    );
});

export const OptimizedProviders = memo(({ children }: OptimizedProvidersProps) => {
    const pathname = usePathname();
    const { authStatus, loading } = useAuth();
    const { isAdmin, isSuperAdmin, isTrainer } = useRole();
    const isMobile = useIsMobile();

    // Состояние для отслеживания готовности
    const [isReady, setIsReady] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    console.log('🔍 OptimizedProviders Debug:', {
        pathname,
        authStatus: authStatus?.authenticated,
        userRole: authStatus?.user?.role,
        loading,
        isAdmin,
        isSuperAdmin,
        isTrainer,
        isProtected: isProtectedRoute(pathname || ''),
        isReady,
        hasInitialized,
        isMobile
    });

    // Проверяем, нужен ли лоадер
    const needsLoader = useMemo(() => {
        const result = shouldShowLoader(pathname || '');
        console.log('🔄 needsLoader:', result, 'для пути:', pathname);
        return result;
    }, [pathname]);

    // Определяем когда система готова к работе
    useEffect(() => {
        console.log('🔄 Проверяем готовность системы:', {
            loading,
            authStatus: authStatus?.authenticated,
            pathname,
            needsLoader,
            hasInitialized
        });

        // Для страниц с лоадером ждем завершения загрузки авторизации
        if (needsLoader) {
            if (!loading && authStatus !== null) {
                console.log('✅ Система готова (авторизация завершена)');
                setIsReady(true);
                setHasInitialized(true);
            } else {
                console.log('⏳ Ждем завершения авторизации...');
                setIsReady(false);
            }
        } else {
            // Для страниц без лоадера сразу готовы
            console.log('✅ Система готова (лоадер не нужен)');
            setIsReady(true);
            setHasInitialized(true);
        }
    }, [loading, authStatus, needsLoader, pathname]);

    // Определяем нужные провайдеры
    const providersConfig = useMemo(() => {
        console.log('🎯 Определяем конфигурацию провайдеров...');

        // Если система не готова и нужен лоадер, минимальные провайдеры
        if (!isReady && needsLoader) {
            console.log('🔄 Система не готова, показываем лоадер');
            return { needsBase: false, needsAdmin: false, needsTrainer: false };
        }

        // 🚨 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Для защищенных маршрутов всегда загружаем провайдеры
        if (isProtectedRoute(pathname || '')) {
            console.log('🔒 Защищенный маршрут, загружаем провайдеры');

            const isDashboardRoute = pathname?.startsWith('/dashboard');
            const isAdminRoute = pathname?.startsWith('/admin');
            const isTrainerRoute = pathname?.startsWith('/trainer');
            const isManagerRoute = pathname?.startsWith('/manager');
            const isMemberRoute = pathname?.startsWith('/member-dashboard');
            const isStaffRoute = pathname?.startsWith('/staff-dashboard');

            console.log('🛣️ Анализ защищенных маршрутов:', {
                isDashboardRoute,
                isAdminRoute,
                isTrainerRoute,
                isManagerRoute,
                isMemberRoute,
                isStaffRoute,
                authStatus: authStatus?.authenticated
            });

            // Базовые провайдеры для всех защищенных маршрутов
            const needsBase = true;

            // Админские провайдеры для админских маршрутов
            const needsAdmin = isAdminRoute;

            // Тренерские провайдеры для тренерских маршрутов
            const needsTrainer = isTrainerRoute;

            console.log('🔒 Конфигурация для защищенного маршрута:', {
                needsBase,
                needsAdmin,
                needsTrainer
            });

            return { needsBase, needsAdmin, needsTrainer };
        }

        // Публичные страницы - без провайдеров
        console.log('🌐 Публичная страница, провайдеры не нужны');
        return { needsBase: false, needsAdmin: false, needsTrainer: false };

    }, [pathname, authStatus, isReady, needsLoader, isAdmin, isSuperAdmin, isTrainer]);

    // Показываем лоадер если система не готова и лоадер нужен
    const shouldShowLoaderNow = !isReady && needsLoader;

    if (shouldShowLoaderNow) {
        console.log('🎬 Рендерим лоадер (система не готова)');
        
        const theme = getThemeFromPath(pathname || '');
        const variant = getVariantFromPath(pathname || '');
        
        // Мотивационные тексты в зависимости от типа страницы
        const getMotivationalTexts = (path: string) => {
            if (path.startsWith('/admin')) {
                return [
                    "Инициализируем панель администратора...",
                    "Загружаем системные настройки...",
                    "Проверяем права доступа...",
                    "Подготавливаем отчеты...",
                    "Настраиваем административный интерфейс..."
                ];
            }
            if (path.startsWith('/trainer')) {
                return [
                    "Загружаем программы тренировок...",
                    "Синхронизируем расписание...",
                    "Подготавливаем клиентскую базу...",
                    "Настраиваем тренерский интерфейс..."
                ];
            }
            if (path.startsWith('/manager')) {
                return [
                    "Загружаем аналитику...",
                    "Подготавливаем отчеты...",
                    "Синхронизируем данные о продажах...",
                    "Настраиваем управленческий интерфейс..."
                ];
            }
            return [
                "Инициализируем систему...",
                "Проверяем авторизацию...",
                "Загружаем конфигурацию...",
                "Подготавливаем интерфейс...",
                "Настраиваем права доступа...",
                "Финальная подготовка..."
            ];
        };

        const motivationalTexts = getMotivationalTexts(pathname || '');

        if (isMobile) {
            // МОБИЛЬНАЯ ВЕРСИЯ - полноэкранный градиентный лоадер
            console.log('📱 Рендерим МОБИЛЬНЫЙ лоадер');
            return (
                <FitnessLoader
                    isMobile={true}
                    theme={theme}
                    size="lg"
                    variant={variant}
                    text="FitFlow Pro"
                    showProgress={true}
                    motivationalTexts={motivationalTexts}
                />
            );
        } else {
            // ДЕСКТОПНАЯ ВЕРСИЯ - с декоративными элементами и светлым фоном
            console.log('💻 Рендерим ДЕСКТОПНЫЙ лоадер');
            return (
                <div className="min-h-[100svh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
                    {/* Статичный фон */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500/10 rounded-full" />
                        <div className="absolute top-40 right-20 w-12 h-12 bg-green-500/10 rounded-full" />
                        <div className="absolute bottom-40 left-20 w-20 h-20 bg-purple-500/10 rounded-full" />
                        <div className="absolute bottom-20 right-10 w-14 h-14 bg-orange-500/10 rounded-full" />

                        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-transparent rounded-full" />
                        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-l from-green-400/20 to-transparent rounded-full" />
                    </div>

                    {/* Основной лоадер */}
                    <div className="relative z-10">
                        <FitnessLoader
                            isMobile={false}
                            theme={theme}
                            size="xl"
                            variant={variant}
                            text="FitFlow Pro"
                            showProgress={true}
                            motivationalTexts={motivationalTexts}
                            className="drop-shadow-2xl"
                        />

                        {/* Дополнительная информация */}
                        <div className="mt-12 text-center space-y-4">
                            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                    <span>Авторизация</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-500" />
                                    <span>Конфигурация</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse animation-delay-1000" />
                                    <span>Интерфейс</span>
                                </div>
                            </div>

                            {/* Статус загрузки */}
                            <div className="text-xs text-gray-400 space-y-1">
                                <p>FitFlow Pro v2.0 • Система управления фитнесом</p>
                                <p className="animate-pulse">
                                    {loading ? '🔄 Проверяем авторизацию...' : '⚡ Подготавливаем интерфейс...'}
                                </p>
                                <p className="text-gray-300">
                                    {theme === 'staff' ? '👥 Режим персонала' : '💪 Клиентский режим'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    console.log('🎭 Рендерим провайдеры с конфигурацией:', providersConfig);

    // Рендерим провайдеры в правильном порядке
    let content = children;

    // Сначала тренерские провайдеры (если нужны)
    if (providersConfig.needsTrainer) {
        console.log('🏋️ Добавляем TrainerProviders');
        content = <TrainerProviders>{content}</TrainerProviders>;
    }

    // Затем админские провайдеры (если нужны)
    if (providersConfig.needsAdmin) {
        console.log('👑 Добавляем AdminProviders');
        content = <AdminProviders>{content}</AdminProviders>;
    }

    // В конце базовые провайдеры (если нужны)
    if (providersConfig.needsBase) {
        console.log('📊 Добавляем BaseProviders (включая UnifiedDataProvider)');
        content = <BaseProviders>{content}</BaseProviders>;
    }

    console.log('🏁 Финальный рендер с провайдерами');
    return <>{content}</>;
});

OptimizedProviders.displayName = 'OptimizedProviders';
BaseProviders.displayName = 'BaseProviders';
AdminProviders.displayName = 'AdminProviders';
TrainerProviders.displayName = 'TrainerProviders';