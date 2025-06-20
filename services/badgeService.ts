// services/badgeService.ts
import type { HeaderBadgeSetting, BadgeFormData, BadgeStats } from '@/types/badge';

// Ключ для localStorage
const STORAGE_KEY = 'header-badge-settings';

// Демо данные
const DEMO_BADGES: HeaderBadgeSetting[] = [
  {
    _id: "demo-1",
    _creationTime: Date.now(),
    navigationItemHref: "/auth/face-auth",
    badgeVariant: "neural-new",
    badgeText: "NEW",
    badgeEnabled: true,
    isActive: true,
    priority: 1,
    targetRoles: [],
    targetDevices: [],
    conditions: {
      requireAuth: false,
      minUserLevel: 0,
      showOnlyOnce: false,
      hideAfterClick: false,
    },
    analytics: {
      impressions: 0,
      clicks: 0,
      clickedUsers: [],
    },
    createdBy: "system",
    createdAt: Date.now(),
  },
  {
    _id: "demo-2",
    _creationTime: Date.now(),
    navigationItemHref: "/shop",
    badgeVariant: "cosmic",
    badgeText: "SALE",
    badgeEnabled: true,
    isActive: true,
    priority: 2,
    targetRoles: [],
    targetDevices: [],
    conditions: {
      requireAuth: false,
      minUserLevel: 0,
      showOnlyOnce: false,
      hideAfterClick: false,
    },
    analytics: {
      impressions: 0,
      clicks: 0,
      clickedUsers: [],
    },
    createdBy: "system",
    createdAt: Date.now(),
  }
];

// Функция для загрузки badge из localStorage
function loadBadges(): HeaderBadgeSetting[] {
  if (typeof window === 'undefined') return DEMO_BADGES;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Если нет сохраненных данных, используем демо данные
      saveBadges(DEMO_BADGES);
      return DEMO_BADGES;
    }
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Ошибка загрузки badge из localStorage:', error);
    return DEMO_BADGES;
  }
}

// Функция для сохранения badge в localStorage
function saveBadges(badges: HeaderBadgeSetting[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
  } catch (error) {
    console.error('Ошибка сохранения badge в localStorage:', error);
  }
}

// Проверка активности настройки
function isSettingActive(setting: HeaderBadgeSetting): boolean {
  const now = Date.now();
  
  if (!setting.badgeEnabled) return false;
  if (setting.validFrom && setting.validFrom > now) return false;
  if (setting.validTo && setting.validTo < now) return false;
  
  return true;
}

// Получение всех настроек
export async function getAllBadgeSettings(): Promise<HeaderBadgeSetting[]> {
  const badges = loadBadges();
  
  return badges.map(badge => ({
    ...badge,
    isActive: isSettingActive(badge),
  }));
}

// Получение активных настроек
export async function getActiveBadgeSettings(userRole?: string, deviceType?: string): Promise<HeaderBadgeSetting[]> {
  const allBadges = await getAllBadgeSettings();
  const now = Date.now();
  
  return allBadges.filter(setting => {
    // Базовые проверки
    if (!setting.badgeEnabled) return false;
    if (setting.validFrom && setting.validFrom > now) return false;
    if (setting.validTo && setting.validTo < now) return false;
    
    // Проверка ролей
    if (setting.targetRoles && setting.targetRoles.length > 0) {
      if (!userRole || !setting.targetRoles.includes(userRole)) return false;
    }
    
    // Проверка устройств
    if (setting.targetDevices && setting.targetDevices.length > 0) {
      if (!deviceType || !setting.targetDevices.includes(deviceType)) return false;
    }
    
    return true;
  }).sort((a, b) => a.priority - b.priority);
}

// Создание новой настройки
export async function createBadgeSetting(formData: BadgeFormData & { createdBy: string }): Promise<HeaderBadgeSetting> {
  const badges = loadBadges();
  const now = Date.now();
  
  const newBadge: HeaderBadgeSetting = {
    _id: `badge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    _creationTime: now,
    navigationItemHref: formData.navigationItemHref,
    badgeVariant: formData.badgeVariant,
    badgeText: formData.badgeText || '',
    badgeEnabled: formData.badgeEnabled,
    isActive: formData.badgeEnabled,
    priority: formData.priority,
    validFrom: formData.validFrom,
    validTo: formData.validTo,
    targetRoles: formData.targetRoles || [],
    targetDevices: formData.targetDevices || [],
    conditions: formData.conditions,
    analytics: {
      impressions: 0,
      clicks: 0,
      clickedUsers: [],
    },
    createdBy: formData.createdBy,
    createdAt: now,
  };
  
  badges.push(newBadge);
  saveBadges(badges);
  
  return newBadge;
}

// Обновление настройки
export async function updateBadgeSetting(id: string, updates: Partial<BadgeFormData>, updatedBy: string): Promise<void> {
  const badges = loadBadges();
  const index = badges.findIndex(badge => badge._id === id);
  
  if (index === -1) {
    throw new Error(`Badge с ID ${id} не найден`);
  }
  
  badges[index] = {
    ...badges[index],
    ...updates,
    updatedBy,
    updatedAt: Date.now(),
  };
  
  saveBadges(badges);
}

// Удаление настройки
export async function deleteBadgeSetting(id: string): Promise<void> {
  const badges = loadBadges();
  const filteredBadges = badges.filter(badge => badge._id !== id);
  
  if (filteredBadges.length === badges.length) {
    throw new Error(`Badge с ID ${id} не найден`);
  }
  
  saveBadges(filteredBadges);
}

// Отслеживание клика
export async function trackBadgeClick(badgeId: string, userId?: string): Promise<void> {
  const badges = loadBadges();
  const index = badges.findIndex(badge => badge._id === badgeId);
  
  if (index === -1) return;
  
  const badge = badges[index];
  const analytics = badge.analytics || { impressions: 0, clicks: 0, clickedUsers: [] };
  
  const clickedUsers = userId && !analytics.clickedUsers.includes(userId)
    ? [...analytics.clickedUsers, userId]
    : analytics.clickedUsers;
  
  badges[index] = {
    ...badge,
    analytics: {
      ...analytics,
      clicks: analytics.clicks + 1,
      clickedUsers,
    },
  };
  
  saveBadges(badges);
}

// Отслеживание показа
export async function trackBadgeImpression(badgeId: string): Promise<void> {
  const badges = loadBadges();
  const index = badges.findIndex(badge => badge._id === badgeId);
  
  if (index === -1) return;
  
  const badge = badges[index];
  const analytics = badge.analytics || { impressions: 0, clicks: 0, clickedUsers: [] };
  
  badges[index] = {
    ...badge,
    analytics: {
      ...analytics,
      impressions: analytics.impressions + 1,
      lastShown: Date.now(),
    },
  };
  
  saveBadges(badges);
}

// Получение статистики
export async function getBadgeStats(): Promise<BadgeStats> {
  const badges = loadBadges();
  
  const totalBadges = badges.length;
  const activeBadges = badges.filter(badge => badge.badgeEnabled && isSettingActive(badge)).length;
  const totalClicks = badges.reduce((sum, badge) => sum + (badge.analytics?.clicks || 0), 0);
  const totalImpressions = badges.reduce((sum, badge) => sum + (badge.analytics?.impressions || 0), 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  
  return {
    totalBadges,
    activeBadges,
    totalClicks,
    totalImpressions,
    averageCTR,
  };
}
