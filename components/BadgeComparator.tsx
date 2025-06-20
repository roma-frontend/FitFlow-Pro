// components/debug/BadgeComparator.tsx
"use client";
import { useState } from 'react';
import { useHeaderBadges } from '@/hooks/useHeaderBadges';
import { useAuth } from '@/hooks/useAuth';
import { HeaderBadgeSetting } from '@/types/badge';
import BadgeIcon from '@/components/ui/BadgeIcon';

interface ComparisonResult {
    url: string;
    badgeFromHook: HeaderBadgeSetting | null;
    allBadgesForUrl: HeaderBadgeSetting[];
    differences: Array<{
        id: string;
        url: string;
        text: string;
        variant: string;
        isInHook: boolean;
        reasons: string[];
        fullData: HeaderBadgeSetting;
    }>;
}

export function BadgeComparator() {
    const [isOpen, setIsOpen] = useState(false);
    const [customUrl, setCustomUrl] = useState('/about');
    const [compareResults, setCompareResults] = useState<ComparisonResult | null>(null);
    const { activeBadges, getBadgeForItem, refresh } = useHeaderBadges();
    const { user } = useAuth();

    // Только для разработки
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const compareBadges = async () => {
        try {
            console.log('Current user:', user);

            // Получаем все badge из базы
            const response = await fetch('/api/badge-settings');
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Ошибка получения badge');
            }

            const allBadges: HeaderBadgeSetting[] = result.data || [];

            // Получаем активные badge через hook
            const activeBadgesFromHook = activeBadges;

            // Находим badge для заданного URL
            const badgeForUrl = getBadgeForItem(customUrl);
            const allBadgesForUrl = allBadges.filter((badge: HeaderBadgeSetting) =>
                badge.navigationItemHref === customUrl
            );

            // Анализируем различия
            const differences = [];

            for (const badge of allBadgesForUrl) {
                const isActive = activeBadgesFromHook.some((activeBadge: HeaderBadgeSetting) =>
                    activeBadge._id === badge._id
                );
                const reasons: string[] = [];

                if (!badge.badgeEnabled) {
                    reasons.push('Badge отключен (badgeEnabled = false)');
                }

                if (badge.validFrom && badge.validFrom > Date.now()) {
                    reasons.push(`Badge еще не активен (validFrom = ${new Date(badge.validFrom).toLocaleString()})`);
                }

                if (badge.validTo && badge.validTo < Date.now()) {
                    reasons.push(`Срок действия badge истек (validTo = ${new Date(badge.validTo).toLocaleString()})`);
                }

                if (badge.targetRoles && badge.targetRoles.length > 0) {
                    const roleMatch = user?.role && badge.targetRoles.includes(user.role);
                    const isSuperAdmin = user?.role === 'super-admin';

                    if (!user?.role) {
                        reasons.push(`Badge требует роль, но пользователь не авторизован`);
                    } else if (!roleMatch && !isSuperAdmin) {
                        reasons.push(`Badge требует роль ${badge.targetRoles.join(', ')}, но у пользователя роль ${user.role}`);
                    } else if (isSuperAdmin && !roleMatch) {
                        reasons.push(`Badge требует роль ${badge.targetRoles.join(', ')}, но отображается для super-admin`);
                    }
                }

                if (badge.targetDevices && badge.targetDevices.length > 0) {
                    reasons.push(`Badge имеет ограничения по устройствам: ${badge.targetDevices.join(', ')}`);
                }

                differences.push({
                    id: badge._id,
                    url: badge.navigationItemHref,
                    text: badge.badgeText,
                    variant: badge.badgeVariant,
                    isInHook: isActive,
                    reasons: reasons.length > 0 ? reasons : ['Нет видимых причин для неактивности'],
                    fullData: badge
                });
            }

            setCompareResults({
                url: customUrl,
                badgeFromHook: badgeForUrl,
                allBadgesForUrl: allBadgesForUrl,
                differences
            });

            console.log('Badge comparison results:', {
                url: customUrl,
                badgeFromHook: badgeForUrl,
                allBadgesForUrl: allBadgesForUrl,
                differences
            });
        } catch (error) {
            console.error('Ошибка сравнения badge:', error);
            alert('Ошибка сравнения badge');
        }
    };

    const updateBadge = async (id: string) => {
        try {
            const response = await fetch('/api/badge-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    updates: {
                        targetRoles: [], // Убираем ограничения по ролям
                    },
                    updatedBy: 'debug-panel'
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert('Badge успешно обновлен - ограничения по ролям удалены');
                compareBadges(); // Обновляем результаты сравнения
                refresh(); // Обновляем hook
            } else {
                alert(`Ошибка: ${result.error}`);
            }
        } catch (error) {
            console.error('Ошибка обновления badge:', error);
            alert('Ошибка обновления badge');
        }
    };

    // Создание нового badge без ограничений
    const createBadgeWithoutRestrictions = async () => {
        try {
            const response = await fetch('/api/badge-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    navigationItemHref: customUrl,
                    badgeVariant: "matrix",
                    badgeText: "NEW",
                    badgeEnabled: true,
                    priority: 1,
                    targetRoles: [], // Без ограничений по ролям
                    targetDevices: [], // Без ограничений по устройствам
                    conditions: {
                        requireAuth: false,
                        minUserLevel: 0,
                        showOnlyOnce: false,
                        hideAfterClick: false,
                    },
                    createdBy: "debug-panel"
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert(`Создан badge без ограничений для ${customUrl}`);
                compareBadges(); // Обновляем результаты сравнения
                refresh(); // Обновляем hook
            } else {
                alert(`Ошибка: ${result.error}`);
            }
        } catch (error) {
            console.error('Ошибка создания badge:', error);
            alert('Ошибка создания badge');
        }
    };

    // Создание badge с ограничением по роли
    const createBadgeWithRoleRestriction = async () => {
        try {
            const response = await fetch('/api/badge-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    navigationItemHref: customUrl,
                    badgeVariant: "quantum-ai",
                    badgeText: "ADMIN",
                    badgeEnabled: true,
                    priority: 2,
                    targetRoles: ["super-admin", "admin"], // Только для админов
                    targetDevices: [], // Без ограничений по устройствам
                    conditions: {
                        requireAuth: true,
                        minUserLevel: 0,
                        showOnlyOnce: false,
                        hideAfterClick: false,
                    },
                    createdBy: "debug-panel"
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert(`Создан badge с ограничением по роли для ${customUrl}`);
                compareBadges(); // Обновляем результаты сравнения
                refresh(); // Обновляем hook
            } else {
                alert(`Ошибка: ${result.error}`);
            }
        } catch (error) {
            console.error('Ошибка создания badge:', error);
            alert('Ошибка создания badge');
        }
    };

    // Создание тестовых badge для всех пунктов навигации
    const createTestBadgesForAll = async () => {
        try {
            const urls = ['/about', '/shop', '/trainers', '/programs', '/auth/face-auth'];
            const variants = ['matrix', 'quantum-ai', 'cosmic', 'neural-new', 'holographic'];
            const texts = ['NEW', 'HOT', 'SALE', 'PRO', 'BETA'];

            for (let i = 0; i < urls.length; i++) {
                const response = await fetch('/api/badge-settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        navigationItemHref: urls[i],
                        badgeVariant: variants[i],
                        badgeText: texts[i],
                        badgeEnabled: true,
                        priority: i + 1,
                        targetRoles: [], // Без ограничений по ролям
                        targetDevices: [],
                        conditions: {
                            requireAuth: false,
                            minUserLevel: 0,
                            showOnlyOnce: false,
                            hideAfterClick: false,
                        },
                        createdBy: "debug-panel"
                    }),
                });

                await response.json();
            }

            alert('Созданы тестовые badge для всех пунктов навигации');
            refresh(); // Обновляем hook
        } catch (error) {
            console.error('Ошибка создания тестовых badge:', error);
            alert('Ошибка создания тестовых badge');
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm z-50"
            >
                Compare Badge
            </button>
        );
    }

    return (
        <div className="fixed bottom-20 right-4 w-96 max-h-[60vh] overflow-y-auto bg-white shadow-xl rounded-lg border border-gray-200 p-4 z-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Badge Comparator</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">URL для проверки:</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm"
                        />
                        <button
                            onClick={compareBadges}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                        >
                            Сравнить
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 p-2 rounded text-sm mb-4">
                    <div className="font-medium">Текущий пользователь:</div>
                    {user ? (
                        <>
                            <div>Email: {user.email}</div>
                            <div>Роль: {user.role}</div>
                            <div className="mt-1">
                                {user.role === 'super-admin' ? (
                                    <span className="text-green-600">✅ Может управлять badge</span>
                                ) : (
                                    <span className="text-red-600">❌ Не может управлять badge</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-yellow-600">Пользователь не авторизован</div>
                    )}
                </div>

                {user?.role === 'super-admin' && (
                    <div className="space-y-2">
                        <h4 className="font-medium">Создание тестовых badge:</h4>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={createBadgeWithoutRestrictions}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Создать badge без ограничений для {customUrl}
                            </button>

                            <button
                                onClick={createBadgeWithRoleRestriction}
                                className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Создать badge только для админов
                            </button>

                            <button
                                onClick={createTestBadgesForAll}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Создать badge для всех пунктов
                            </button>
                        </div>
                    </div>
                )}

                {compareResults && (
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-medium">Badge из hook:</h4>
                            {compareResults.badgeFromHook ? (
                                <div className="bg-green-50 p-2 rounded flex items-center justify-between">
                                    <div className="text-sm">
                                        <div>{compareResults.badgeFromHook.badgeText}</div>
                                        <div className="text-xs text-gray-500">
                                            {compareResults.badgeFromHook.badgeVariant}
                                        </div>
                                    </div>
                                    <BadgeIcon
                                        variant={compareResults.badgeFromHook.badgeVariant}
                                        text={compareResults.badgeFromHook.badgeText}
                                        size="sm"
                                    />
                                </div>
                            ) : (
                                <div className="bg-red-50 p-2 rounded text-sm">
                                    Не найден в hook
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="font-medium">Все badge для URL из базы ({compareResults.allBadgesForUrl.length}):</h4>
                            {compareResults.allBadgesForUrl.length > 0 ? (
                                <div className="space-y-2">
                                    {compareResults.differences.map((diff) => (
                                        <div key={diff.id} className={`p-2 rounded text-sm ${diff.isInHook ? 'bg-green-50' : 'bg-red-50'}`}>
                                            <div className="flex justify-between">
                                                <span className="font-medium">{diff.text}</span>
                                                <BadgeIcon
                                                    variant={diff.variant as any}
                                                    text={diff.text}
                                                    size="sm"
                                                />
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ID: {diff.id.substring(0, 8)}...
                                            </div>
                                            <div className="text-xs mt-1">
                                                <span className={diff.isInHook ? 'text-green-600' : 'text-red-600'}>
                                                    {diff.isInHook ? '✅ Активен в hook' : '❌ Не активен в hook'}
                                                </span>
                                            </div>
                                            <div className="text-xs mt-1">
                                                <span className="font-medium">Причины:</span>
                                                <ul className="list-disc pl-4 mt-1">
                                                    {diff.reasons.map((reason: string, idx: number) => (
                                                        <li key={idx} className="text-gray-600">{reason}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {user?.role === 'super-admin' && diff.reasons.some((r: string) => r.includes('ограничения по ролям')) && (
                                                <div className="mt-2">
                                                    <button
                                                        onClick={() => updateBadge(diff.id)}
                                                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                                                    >
                                                        Убрать ограничения по ролям
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-yellow-50 p-2 rounded text-sm">
                                    Badge для этого URL не найдены в базе
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    console.log('Full comparison results:', compareResults);
                                    alert('Полные результаты сравнения выведены в консоль');
                                }}
                                className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Вывести полные данные в консоль
                            </button>

                            <button
                                onClick={refresh}
                                className="bg-indigo-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Обновить данные из hook
                            </button>
                        </div>
                    </div>
                )}

                {/* Информация о правах и ограничениях */}
                <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-2">Информация о badge:</h4>
                    <ul className="text-xs space-y-1 text-gray-600">
                        <li>• Только пользователи с ролью <span className="font-bold">super-admin</span> могут создавать, обновлять и удалять badge</li>
                        <li>• Badge без ограничений по ролям (пустой массив targetRoles) видны всем пользователям</li>
                        <li>• Badge с ограничениями по ролям видны только пользователям с указанными ролями</li>
                        <li>• Пользователи с ролью <span className="font-bold">super-admin</span> видят все badge, независимо от ограничений</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
