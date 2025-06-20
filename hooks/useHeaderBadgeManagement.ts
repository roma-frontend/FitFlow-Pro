// hooks/useHeaderBadgeManagement.ts (исправление функции updateBadgeSetting)
"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type {
  HeaderBadgeSetting,
  BadgeFormData,
  BadgeStats
} from '@/types/badge';
import {
  validateBadgeFormData,
  createEmptyBadgeFormData
} from '@/utils/badgeUtils';

export function useHeaderBadgeManagement() {
  const { user, token } = useAuth();
  const [allSettings, setAllSettings] = useState<HeaderBadgeSetting[]>([]);
  const [stats, setStats] = useState<BadgeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  const isApiAvailable = true;

  // Стабильные функции загрузки
  const fetchAllSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/badge-settings', {
        credentials: 'include'
      });

      if (response.status === 401) {
        console.error('Не авторизован для получения настроек badge');
        setError('Не авторизован');
        setAllSettings([]);
        return;
      }

      const result = await response.json();

      if (result.success) {
        setAllSettings(result.data || []);
        setError(null);
      } else {
        throw new Error(result.error || 'Ошибка загрузки настроек');
      }
    } catch (err) {
      console.error('Ошибка загрузки настроек:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      setAllSettings([]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/badge-stats', {
        credentials: 'include'
      });

      if (response.status === 401) {
        console.error('Не авторизован для получения статистики badge');
        return;
      }

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        console.warn('Ошибка загрузки статистики:', result.error);
      }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    }
  }, []);

  // Функция обновления с debounce
  const refreshData = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        await Promise.all([fetchAllSettings(), fetchStats()]);
      } catch (err) {
        console.error('Ошибка обновления данных:', err);
      }
    }, 100);
  }, [fetchAllSettings, fetchStats]);

  // Инициализация данных
  useEffect(() => {
    const loadData = async () => {
      if (isInitializedRef.current) return;
      
      setIsLoading(true);
      if (user) {
        await Promise.all([fetchAllSettings(), fetchStats()]);
        isInitializedRef.current = true;
      } else {
        setError('Не авторизован');
        setAllSettings([]);
      }
      setIsLoading(false);
    };

    loadData();
  }, [user, fetchAllSettings, fetchStats]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Создание настройки
  const createBadgeSetting = useCallback(async (formData: BadgeFormData & { createdBy: string }) => {
    try {
      setError(null);

      const validation = validateBadgeFormData(formData);
      if (!validation.isValid) {
        const errorMsg = `Ошибка валидации: ${validation.errors.join(', ')}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (!user || user.role !== 'super-admin') {
        const errorMsg = 'Недостаточно прав для создания badge';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Создание badge с данными:', formData);

      const response = await fetch('/api/badge-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          const errorMsg = 'Не авторизован';
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        if (response.status === 403) {
          const errorMsg = 'Недостаточно прав для создания badge';
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        const errorMsg = result.error || `Ошибка сервера: ${response.status}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (result.success) {
        refreshData();
        return result.data;
      } else {
        const errorMsg = result.error || 'Ошибка создания badge';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Ошибка создания badge:', err);
      throw err;
    }
  }, [user, refreshData]);

  // ИСПРАВЛЕННАЯ функция обновления настройки
  const updateBadgeSetting = useCallback(async ({
    id,
    updates,
    updatedBy
  }: {
    id: string;
    updates: BadgeFormData;
    updatedBy: string;
  }) => {
    try {
      setError(null);

      // Валидация
      const validation = validateBadgeFormData(updates);
      if (!validation.isValid) {
        const errorMsg = `Ошибка валидации: ${validation.errors.join(', ')}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Проверяем права
      if (!user || user.role !== 'super-admin') {
        const errorMsg = 'Недостаточно прав для обновления badge';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Обновление badge с ID:', id, 'данные:', updates);

      // ВАЖНО: Убираем createdBy из updates, если оно там есть
      const cleanUpdates = { ...updates };
      if ('createdBy' in cleanUpdates) {
        delete (cleanUpdates as any).createdBy;
      }

      const response = await fetch('/api/badge-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          id, 
          updates: cleanUpdates, // Используем очищенные данные
          updatedBy 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          const errorMsg = 'Не авторизован';
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        if (response.status === 403) {
          const errorMsg = 'Недостаточно прав для обновления badge';
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        const errorMsg = result.error || `Ошибка сервера: ${response.status}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (result.success) {
        refreshData();
        return result.data;
      } else {
        const errorMsg = result.error || 'Неизвестная ошибка при обновлении badge';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Ошибка обновления badge:', err);
      
      if (!error) {
        const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка обновления badge';
        setError(errorMsg);
      }
      
      throw err;
    }
  }, [user, refreshData, error]);

  // Удаление настройки
  const deleteBadgeSetting = useCallback(async ({ id }: { id: string }) => {
    try {
      setError(null);

      if (!user || user.role !== 'super-admin') {
        const errorMsg = 'Недостаточно прав для удаления badge';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Удаление badge с ID:', id);

      const response = await fetch(`/api/badge-settings?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          const errorMsg = 'Не авторизован';
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        if (response.status === 403) {
          const errorMsg = 'Недостаточно прав для удаления badge';
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        const errorMsg = result.error || `Ошибка сервера: ${response.status}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (result.success) {
        refreshData();
        return true;
      } else {
        const errorMsg = result.error || 'Ошибка удаления badge';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Ошибка удаления badge:', err);
      if (!error) {
        const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка удаления badge';
        setError(errorMsg);
      }
      throw err;
    }
  }, [user, refreshData, error]);

  // Функция обновления данных для внешнего использования
  const handleRefresh = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      await Promise.all([fetchAllSettings(), fetchStats()]);
    } catch (err) {
      console.error('Ошибка обновления данных:', err);
      setError('Ошибка обновления данных');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllSettings, fetchStats]);

  // Остальные функции остаются без изменений...
  const bulkDelete = useCallback(async (ids: string[]) => {
    try {
      setError(null);

      if (!user || user.role !== 'super-admin') {
        throw new Error('Недостаточно прав для массового удаления badge');
      }

      for (const id of ids) {
        await deleteBadgeSetting({ id });
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка массового удаления';
      setError(errorMessage);
      throw err;
    }
  }, [user, deleteBadgeSetting]);

  const getActiveBadgesForUser = useCallback((userRole?: string, deviceType?: string): HeaderBadgeSetting[] => {
    const now = Date.now();

    return allSettings.filter((setting: HeaderBadgeSetting) => {
      if (!setting.badgeEnabled) return false;
      if (setting.validFrom && setting.validFrom > now) return false;
      if (setting.validTo && setting.validTo < now) return false;

      if (userRole === 'super-admin') {
        return true;
      }

      if (setting.targetRoles && setting.targetRoles.length > 0) {
        if (!userRole || !setting.targetRoles.includes(userRole)) return false;
      }

      if (setting.targetDevices && setting.targetDevices.length > 0) {
        if (!deviceType || !setting.targetDevices.includes(deviceType)) return false;
      }

      return true;
    }).sort((a: HeaderBadgeSetting, b: HeaderBadgeSetting) => a.priority - b.priority);
  }, [allSettings]);

  const checkForConflicts = useCallback((): { href: string; conflicts: HeaderBadgeSetting[] }[] => {
    const conflicts: { href: string; conflicts: HeaderBadgeSetting[] }[] = [];
    const groupedByHref = allSettings.reduce((acc, setting) => {
      if (!acc[setting.navigationItemHref]) {
        acc[setting.navigationItemHref] = [];
      }
      acc[setting.navigationItemHref].push(setting);
      return acc;
    }, {} as Record<string, HeaderBadgeSetting[]>);

    Object.entries(groupedByHref).forEach(([href, settings]) => {
      if (settings.length > 1) {
        const activeBadges = settings.filter(s => s.badgeEnabled);
        if (activeBadges.length > 1) {
          const samePriority = activeBadges.some((badge, index) =>
            activeBadges.findIndex(b => b.priority === badge.priority) !== index
          );

          if (samePriority) {
            conflicts.push({ href, conflicts: activeBadges });
          }
        }
      }
    });

    return conflicts;
  }, [allSettings]);

  const fixPriorityConflicts = useCallback(async (): Promise<number> => {
    try {
      if (!user || user.role !== 'super-admin') {
        throw new Error('Недостаточно прав для исправления конфликтов');
      }

      const conflicts = checkForConflicts();
      let fixedCount = 0;

      for (const conflict of conflicts) {
        const sortedBadges = conflict.conflicts.sort((a, b) => a.createdAt - b.createdAt);

        for (let i = 0; i < sortedBadges.length; i++) {
          const badge = sortedBadges[i];
          const newPriority = i + 1;

          if (badge.priority !== newPriority) {
            try {
              await updateBadgeSetting({
                id: badge._id,
                updates: {
                  navigationItemHref: badge.navigationItemHref,
                  badgeVariant: badge.badgeVariant,
                  badgeText: badge.badgeText,
                  badgeEnabled: badge.badgeEnabled,
                  priority: newPriority,
                  validFrom: badge.validFrom,
                  validTo: badge.validTo,
                  targetRoles: badge.targetRoles || [],
                  targetDevices: badge.targetDevices || [],
                  conditions: badge.conditions,
                },
                updatedBy: 'auto-fix-conflicts'
              });
              fixedCount++;
            } catch (error) {
              console.error('Ошибка исправления конфликта:', error);
            }
          }
        }
      }

      return fixedCount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка исправления конфликтов';
      setError(errorMessage);
      throw err;
    }
  }, [user, checkForConflicts, updateBadgeSetting]);

  const getOptimizationSuggestions = useCallback(() => {
    const suggestions: string[] = [];

    const unusedBadges = allSettings.filter(s =>
      s.badgeEnabled &&
      s.analytics?.impressions &&
      s.analytics.impressions > 50 &&
      (!s.analytics.clicks || s.analytics.clicks === 0)
    );

    if (unusedBadges.length > 0) {
      suggestions.push(`${unusedBadges.length} badge получают показы, но не получают кликов. Рассмотрите изменение текста или дизайна.`);
    }

    const textCounts = allSettings.reduce((acc, s) => {
      acc[s.badgeText] = (acc[s.badgeText] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const duplicateTexts = Object.entries(textCounts).filter(([text, count]) => count > 1 && text.trim());
    if (duplicateTexts.length > 0) {
      suggestions.push(`Найдены дублирующиеся тексты badge: ${duplicateTexts.map(([text]) => text).join(', ')}`);
    }

    const conflicts = checkForConflicts();
    if (conflicts.length > 0) {
      suggestions.push(`Найдены конфликты приоритетов для ${conflicts.length} URL. Используйте автоисправление.`);
    }

    return suggestions;
  }, [allSettings, checkForConflicts]);

  // Дополнительные утилиты
  const searchSettings = useCallback((query: string): HeaderBadgeSetting[] => {
    if (!query.trim()) return allSettings;

    const searchTerm = query.toLowerCase();
    return allSettings.filter((setting: HeaderBadgeSetting) =>
      setting.navigationItemHref.toLowerCase().includes(searchTerm) ||
      setting.badgeText.toLowerCase().includes(searchTerm) ||
      setting.badgeVariant.toLowerCase().includes(searchTerm) ||
      (setting.targetRoles || []).some((role: string) => role.toLowerCase().includes(searchTerm))
    );
  }, [allSettings]);

  const filterByStatus = useCallback((status: 'all' | 'active' | 'inactive' | 'expired'): HeaderBadgeSetting[] => {
    const now = Date.now();

    switch (status) {
      case 'active':
        return allSettings.filter((s: HeaderBadgeSetting) =>
          s.badgeEnabled &&
          (!s.validFrom || s.validFrom <= now) &&
          (!s.validTo || s.validTo >= now)
        );
      case 'inactive':
        return allSettings.filter((s: HeaderBadgeSetting) => !s.badgeEnabled);
      case 'expired':
        return allSettings.filter((s: HeaderBadgeSetting) => s.validTo && s.validTo < now);
      default:
        return allSettings;
    }
  }, [allSettings]);

  const sortSettings = useCallback((sortBy: 'priority' | 'created' | 'updated' | 'name'): HeaderBadgeSetting[] => {
    return [...allSettings].sort((a: HeaderBadgeSetting, b: HeaderBadgeSetting) => {
      switch (sortBy) {
        case 'priority':
          return a.priority - b.priority;
        case 'created':
          return b.createdAt - a.createdAt;
        case 'updated':
          return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
        case 'name':
          return a.navigationItemHref.localeCompare(b.navigationItemHref);
        default:
          return 0;
      }
    });
  }, [allSettings]);

  const getBadgeForNavItem = useCallback((href: string, userRole?: string, deviceType?: string): HeaderBadgeSetting | null => {
    const activeBadges = getActiveBadgesForUser(userRole, deviceType);
    return activeBadges.find((setting: HeaderBadgeSetting) => setting.navigationItemHref === href) || null;
  }, [getActiveBadgesForUser]);

  const getSettingsByCategory = useCallback(() => {
    const now = Date.now();
    const categories = {
      active: allSettings.filter(s => s.badgeEnabled && (!s.validTo || s.validTo > now) && (!s.validFrom || s.validFrom <= now)),
      inactive: allSettings.filter(s => !s.badgeEnabled),
      expired: allSettings.filter(s => s.validTo && s.validTo < now),
      scheduled: allSettings.filter(s => s.validFrom && s.validFrom > now),
    };

    return categories;
  }, [allSettings]);

  const getTopBadgesByClicks = useCallback((limit: number = 5): HeaderBadgeSetting[] => {
    return [...allSettings]
      .filter(s => s.analytics?.clicks && s.analytics.clicks > 0)
      .sort((a, b) => (b.analytics?.clicks || 0) - (a.analytics?.clicks || 0))
      .slice(0, limit);
  }, [allSettings]);

  const getLowPerformingBadges = useCallback((threshold: number = 1): HeaderBadgeSetting[] => {
    return allSettings.filter(s => {
      if (!s.analytics?.impressions || s.analytics.impressions < 10) return false;
      const ctr = ((s.analytics.clicks || 0) / s.analytics.impressions) * 100;
      return ctr < threshold;
    });
  }, [allSettings]);

  const bulkToggle = useCallback(async (ids: string[]) => {
    try {
      setError(null);

      if (!user || user.role !== 'super-admin') {
        throw new Error('Недостаточно прав для массового обновления badge');
      }

      for (const id of ids) {
        const setting = allSettings.find((s: HeaderBadgeSetting) => s._id === id);
        if (setting) {
          const formData: BadgeFormData = {
            navigationItemHref: setting.navigationItemHref,
            badgeVariant: setting.badgeVariant,
            badgeText: setting.badgeText,
            badgeEnabled: !setting.badgeEnabled,
            priority: setting.priority,
            validFrom: setting.validFrom,
            validTo: setting.validTo,
            targetRoles: setting.targetRoles || [],
            targetDevices: setting.targetDevices || [],
            conditions: setting.conditions,
          };

          await updateBadgeSetting({
            id,
            updates: formData,
            updatedBy: 'bulk-operation'
          });
        }
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка массового переключения';
      setError(errorMessage);
      throw err;
    }
  }, [user, allSettings, updateBadgeSetting]);

  const duplicateBadgeSetting = useCallback(async (id: string) => {
    try {
      if (!user || user.role !== 'super-admin') {
        throw new Error('Недостаточно прав для дублирования badge');
      }

      const setting = allSettings.find((s: HeaderBadgeSetting) => s._id === id);
      if (!setting) throw new Error("Badge не найден");

      const duplicateData: BadgeFormData & { createdBy: string } = {
        navigationItemHref: setting.navigationItemHref,
        badgeVariant: setting.badgeVariant,
        badgeText: `${setting.badgeText} (копия)`,
        badgeEnabled: false,
        priority: setting.priority + 1,
        validFrom: setting.validFrom,
        validTo: setting.validTo,
        targetRoles: [...(setting.targetRoles || [])],
        targetDevices: [...(setting.targetDevices || [])],
        conditions: { ...setting.conditions },
        createdBy: 'duplicate-operation'
      };

      return await createBadgeSetting(duplicateData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка дублирования badge';
      setError(errorMessage);
      throw err;
    }
  }, [user, allSettings, createBadgeSetting]);

  const exportSettings = useCallback(() => {
    try {
      if (!user || user.role !== 'super-admin') {
        throw new Error('Недостаточно прав для экспорта badge');
      }

      const exportData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        settings: allSettings.map((setting: HeaderBadgeSetting) => ({
          navigationItemHref: setting.navigationItemHref,
          badgeVariant: setting.badgeVariant,
          badgeText: setting.badgeText,
          badgeEnabled: setting.badgeEnabled,
          priority: setting.priority,
          validFrom: setting.validFrom,
          validTo: setting.validTo,
          targetRoles: setting.targetRoles || [],
          targetDevices: setting.targetDevices || [],
          conditions: setting.conditions,
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badge-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка экспорта настроек';
      setError(errorMessage);
      throw err;
    }
  }, [user, allSettings]);

  const importSettings = useCallback(async (file: File): Promise<number> => {
    try {
      if (!user || user.role !== 'super-admin') {
        throw new Error('Недостаточно прав для импорта badge');
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e: ProgressEvent<FileReader>) => {
          try {
            const content = e.target?.result as string;
            const importData = JSON.parse(content);

            if (!importData.settings || !Array.isArray(importData.settings)) {
              throw new Error("Неверный формат файла");
            }

            let importedCount = 0;

            for (const setting of importData.settings) {
              try {
                const settingWithDefaults: BadgeFormData & { createdBy: string } = {
                  ...createEmptyBadgeFormData(),
                  ...setting,
                  createdBy: 'import-operation'
                };

                await createBadgeSetting(settingWithDefaults);
                importedCount++;
              } catch (error) {
                console.warn('Ошибка импорта настройки:', error);
              }
            }

            resolve(importedCount);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(new Error("Ошибка чтения файла"));
        reader.readAsText(file);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка импорта настроек';
      setError(errorMessage);
      throw err;
    }
  }, [user, createBadgeSetting]);

  const getBadgeStats = useCallback((id: string) => {
    const setting = allSettings.find((s: HeaderBadgeSetting) => s._id === id);
    if (!setting) return null;

    return {
      impressions: setting.analytics?.impressions || 0,
      clicks: setting.analytics?.clicks || 0,
      ctr: setting.analytics?.impressions
        ? ((setting.analytics.clicks || 0) / setting.analytics.impressions * 100).toFixed(2)
        : "0.00",
      lastShown: setting.analytics?.lastShown
        ? new Date(setting.analytics.lastShown).toLocaleDateString()
        : "Никогда"
    };
  }, [allSettings]);

  const trackBadgeInteraction = useCallback(async (badgeId: string, action: 'click' | 'impression', userId?: string) => {
    try {
      await fetch('/api/badge-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ badgeId, action, userId }),
      });

      await fetchStats();
    } catch (error) {
      console.error('Ошибка отслеживания взаимодействия:', error);
    }
  }, [fetchStats]);

  const createFromTemplate = useCallback(async (templateData: Partial<BadgeFormData>, createdBy: string = 'template') => {
    try {
      if (!user || user.role !== 'super-admin') {
        throw new Error('Недостаточно прав для создания badge из шаблона');
      }

      const formData: BadgeFormData & { createdBy: string } = {
        ...createEmptyBadgeFormData(),
        ...templateData,
        createdBy,
      };

      return await createBadgeSetting(formData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания badge из шаблона';
      setError(errorMessage);
      throw err;
    }
  }, [user, createBadgeSetting]);

  return {
    // Данные
    allSettings,
    stats,

    // Состояние
    isLoading,
    isApiAvailable,
    hasError: !!error,
    error,

    // Проверка прав
    canManageBadges: user?.role === 'super-admin',
    userRole: user?.role,
    isAuthenticated: !!user,

    // Основные действия
    createBadgeSetting,
    updateBadgeSetting,
    deleteBadgeSetting,
    refreshStats: handleRefresh,

    // Массовые операции
    bulkDelete,
    bulkToggle,

    // Дополнительные утилиты
    duplicateBadgeSetting,
    exportSettings,
    importSettings,
    getBadgeStats,
    createFromTemplate,

    // Поиск и фильтрация
    searchSettings,
    filterByStatus,
    sortSettings,
    getActiveBadgesForUser,
    getBadgeForNavItem,

    // Аналитика и оптимизация
    getSettingsByCategory,
    getTopBadgesByClicks,
    getLowPerformingBadges,
    checkForConflicts,
    fixPriorityConflicts,
    getOptimizationSuggestions,

    // Отслеживание
    trackBadgeInteraction,

    // Валидация
    validateBadgeData: validateBadgeFormData,

    // Обновление данных
    refresh: handleRefresh,
    refreshAll: handleRefresh,
  };
}

export type { HeaderBadgeSetting, BadgeFormData, BadgeStats };

