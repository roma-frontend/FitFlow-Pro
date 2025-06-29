// utils/badgeUtils.ts (обновленная версия)
import type { 
  HeaderBadgeSetting, 
  BadgeFormData, 
  BadgeConditions, 
  BadgeConditionsDB
} from '@/types/badge';
import { createDefaultConditions } from '@/types/badge'; // ✅ Обычный импорт

// ✅ Преобразование настройки в данные формы
export function settingToFormData(setting: HeaderBadgeSetting): BadgeFormData {
  return {
    navigationItemHref: setting.navigationItemHref,
    badgeVariant: setting.badgeVariant,
    badgeText: setting.badgeText || '',
    badgeEnabled: setting.badgeEnabled,
    priority: setting.priority,
    validFrom: setting.validFrom,
    validTo: setting.validTo,
    targetRoles: setting.targetRoles || [],
    targetDevices: setting.targetDevices || [],
    conditions: {
      requireAuth: setting.conditions?.requireAuth ?? false,
      minUserLevel: setting.conditions?.minUserLevel ?? 0,
      showOnlyOnce: setting.conditions?.showOnlyOnce ?? false,
      hideAfterClick: setting.conditions?.hideAfterClick ?? false,
    }
  };
}

// ✅ Преобразование условий для базы данных
export function conditionsToDB(conditions: BadgeConditions): BadgeConditionsDB | undefined {
  const hasConditions = conditions.requireAuth || 
                       conditions.minUserLevel > 0 || 
                       conditions.showOnlyOnce || 
                       conditions.hideAfterClick;

  if (!hasConditions) return undefined;

  return {
    requireAuth: conditions.requireAuth || undefined,
    minUserLevel: conditions.minUserLevel > 0 ? conditions.minUserLevel : undefined,
    showOnlyOnce: conditions.showOnlyOnce || undefined,
    hideAfterClick: conditions.hideAfterClick || undefined,
  };
}

// ✅ Преобразование условий из базы данных
export function conditionsFromDB(conditions?: BadgeConditionsDB): BadgeConditions {
  return {
    requireAuth: conditions?.requireAuth ?? false,
    minUserLevel: conditions?.minUserLevel ?? 0,
    showOnlyOnce: conditions?.showOnlyOnce ?? false,
    hideAfterClick: conditions?.hideAfterClick ?? false,
  };
}

// ✅ Валидация данных формы
export function validateBadgeFormData(data: BadgeFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.navigationItemHref.trim()) {
    errors.push('URL навигации обязателен');
  }

  if (!data.navigationItemHref.startsWith('/')) {
    errors.push('URL должен начинаться с "/"');
  }

  if (!data.badgeVariant.trim()) {
    errors.push('Тип badge обязателен');
  }

  if (data.priority < 1 || data.priority > 100) {
    errors.push('Приоритет должен быть от 1 до 100');
  }

  if (data.validFrom && data.validTo && data.validFrom >= data.validTo) {
    errors.push('Дата начала должна быть раньше даты окончания');
  }

  if (data.conditions.minUserLevel < 0 || data.conditions.minUserLevel > 100) {
    errors.push('Минимальный уровень пользователя должен быть от 0 до 100');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ✅ Создание пустых данных формы
export function createEmptyBadgeFormData(): BadgeFormData {
  return {
    navigationItemHref: '',
    badgeVariant: 'standard',
    badgeText: '',
    badgeEnabled: true,
    priority: 1,
    validFrom: undefined,
    validTo: undefined,
    targetRoles: [],
    targetDevices: [],
    conditions: createDefaultConditions() // ✅ Используем импортированную функцию
  };
}

// ✅ Форматирование даты для отображения
export function formatBadgeDate(timestamp?: number): string {
  if (!timestamp) return '';
  
  return new Date(timestamp).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ✅ Расчет CTR
export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

// ✅ Проверка активности badge
export function isBadgeActive(setting: HeaderBadgeSetting): boolean {
  const now = Date.now();
  
  if (!setting.badgeEnabled) return false;
  if (setting.validFrom && setting.validFrom > now) return false;
  if (setting.validTo && setting.validTo < now) return false;
  
  return true;
}

// ✅ Получение цвета статуса
export function getBadgeStatusColor(setting: HeaderBadgeSetting): string {
  if (!setting.badgeEnabled) return 'gray';
  if (!isBadgeActive(setting)) return 'red';
  return 'green';
}

// ✅ Получение текста статуса
export function getBadgeStatusText(setting: HeaderBadgeSetting): string {
  if (!setting.badgeEnabled) return 'Выключен';
  
  const now = Date.now();
  if (setting.validFrom && setting.validFrom > now) return 'Запланирован';
  if (setting.validTo && setting.validTo < now) return 'Истек';
  
  return 'Активен';
}

// ✅ Получение следующего доступного приоритета
export function getNextAvailablePriority(existingSettings: HeaderBadgeSetting[], href: string): number {
  const settingsForHref = existingSettings.filter(s => s.navigationItemHref === href && s.badgeEnabled);
  const usedPriorities = settingsForHref.map(s => s.priority);
  
  for (let i = 1; i <= 100; i++) {
    if (!usedPriorities.includes(i)) {
      return i;
    }
  }
  
  return 1; // fallback
}

// ✅ Проверка уникальности комбинации href + priority
export function isUniquePriority(
  settings: HeaderBadgeSetting[], 
  href: string, 
  priority: number, 
  excludeId?: string
): boolean {
  return !settings.some(s => 
    s.navigationItemHref === href && 
    s.priority === priority && 
    s.badgeEnabled &&
    s._id !== excludeId
  );
}

// ✅ Группировка настроек по href
export function groupSettingsByHref(settings: HeaderBadgeSetting[]): Record<string, HeaderBadgeSetting[]> {
  return settings.reduce((acc, setting) => {
    if (!acc[setting.navigationItemHref]) {
      acc[setting.navigationItemHref] = [];
    }
    acc[setting.navigationItemHref].push(setting);
    return acc;
  }, {} as Record<string, HeaderBadgeSetting[]>);
}

// ✅ Получение статистики по производительности
export function getPerformanceStats(settings: HeaderBadgeSetting[]) {
  const totalSettings = settings.length;
  const activeSettings = settings.filter(s => isBadgeActive(s)).length;
  const settingsWithAnalytics = settings.filter(s => s.analytics?.impressions).length;
  
  const totalImpressions = settings.reduce((sum, s) => sum + (s.analytics?.impressions || 0), 0);
  const totalClicks = settings.reduce((sum, s) => sum + (s.analytics?.clicks || 0), 0);
  
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  
  const topPerformers = settings
    .filter(s => s.analytics?.impressions && s.analytics.impressions > 10)
    .map(s => ({
      ...s,
      ctr: s.analytics ? calculateCTR(s.analytics.clicks, s.analytics.impressions) : 0
    }))
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, 5);

  const lowPerformers = settings
    .filter(s => s.analytics?.impressions && s.analytics.impressions > 50)
    .map(s => ({
      ...s,
      ctr: s.analytics ? calculateCTR(s.analytics.clicks, s.analytics.impressions) : 0
    }))
    .filter(s => s.ctr < 1)
    .sort((a, b) => a.ctr - b.ctr)
    .slice(0, 5);

  return {
    totalSettings,
    activeSettings,
    settingsWithAnalytics,
    totalImpressions,
    totalClicks,
    averageCTR,
    topPerformers,
    lowPerformers,
  };
}

// ✅ Экспорт настроек в JSON
export function exportSettingsToJSON(settings: HeaderBadgeSetting[]): string {
  const exportData = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    totalSettings: settings.length,
    settings: settings.map(setting => ({
      navigationItemHref: setting.navigationItemHref,
      badgeVariant: setting.badgeVariant,
      badgeText: setting.badgeText,
      badgeEnabled: setting.badgeEnabled,
      priority: setting.priority,
      validFrom: setting.validFrom,
      validTo: setting.validTo,
      targetRoles: setting.targetRoles,
      targetDevices: setting.targetDevices,
      conditions: setting.conditions,
      createdAt: setting.createdAt,
    }))
  };

  return JSON.stringify(exportData, null, 2);
}

// ✅ Валидация импортируемых данных
export function validateImportData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Неверный формат файла');
    return { isValid: false, errors };
  }

  if (!data.settings || !Array.isArray(data.settings)) {
    errors.push('Отсутствует массив настроек');
    return { isValid: false, errors };
  }

  data.settings.forEach((setting: any, index: number) => {
    if (!setting.navigationItemHref) {
      errors.push(`Настройка ${index + 1}: отсутствует navigationItemHref`);
    }

    if (!setting.badgeVariant) {
      errors.push(`Настройка ${index + 1}: отсутствует badgeVariant`);
    }

    if (typeof setting.priority !== 'number' || setting.priority < 1 || setting.priority > 100) {
      errors.push(`Настройка ${index + 1}: неверный приоритет`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

