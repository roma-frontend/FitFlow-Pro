// types/badge.ts (исправленная версия с правильными экспортами)
import type { Id } from "@/convex/_generated/dataModel";

export type BadgeVariant = 
  | "quantum-ai" 
  | "neural-new" 
  | "holographic" 
  | "minimal" 
  | "cosmic" 
  | "matrix" 
  | "standard";

// ✅ Условия в базе данных (могут быть undefined)
export interface BadgeConditionsDB {
  requireAuth?: boolean;
  minUserLevel?: number;
  showOnlyOnce?: boolean;
  hideAfterClick?: boolean;
}

// ✅ Условия для форм (строгие типы)
export interface BadgeConditions {
  requireAuth: boolean;
  minUserLevel: number;
  showOnlyOnce: boolean;
  hideAfterClick: boolean;
}

// ✅ Аналитика в базе данных
export interface BadgeAnalyticsDB {
  impressions: number;
  clicks: number;
  clickedUsers: string[];
  lastShown?: number;
}

// ✅ Данные из Convex (как они приходят из базы)
export interface HeaderBadgeSettingDB {
  _id: Id<"headerBadgeSettings">;
  _creationTime: number;
  navigationItemHref: string;
  badgeVariant: string;
  badgeText?: string;
  badgeEnabled: boolean;
  customClassName?: string;
  isActive: boolean;
  priority: number;
  validFrom?: number;
  validTo?: number;
  targetRoles?: string[];
  targetDevices?: string[];
  conditions?: BadgeConditionsDB;
  analytics?: BadgeAnalyticsDB;
  createdBy: string;
  createdAt: number;
  updatedBy?: string;
  updatedAt?: number;
}

// ✅ Данные для работы в приложении (нормализованные)
export interface HeaderBadgeSetting {
  _id: string;
  _creationTime: number;
  navigationItemHref: string;
  badgeVariant: BadgeVariant;
  badgeText: string;
  badgeEnabled: boolean;
  customClassName?: string;
  isActive?: boolean;
  priority: number;
  validFrom?: number;
  validTo?: number;
  targetRoles: string[];
  targetDevices: string[];
  conditions: BadgeConditions;
  analytics?: {
    impressions: number;
    clicks: number;
    clickedUsers: string[];
    lastShown?: number;
  };
  createdBy: string;
  createdAt: number;
  updatedBy?: string;
  updatedAt?: number;
}

// ✅ Данные формы для создания/редактирования
export interface BadgeFormData {
  navigationItemHref: string;
  badgeVariant: BadgeVariant;
  badgeText: string;
  badgeEnabled: boolean;
  priority: number;
  validFrom?: number;
  validTo?: number;
  targetRoles: string[];
  targetDevices: string[];
  conditions: BadgeConditions;
}

// ✅ Статистика Badge
export interface BadgeStats {
  totalBadges: number;
  activeBadges: number;
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
}

// ✅ Базовый шаблон (для предустановленных шаблонов)
export interface BadgeTemplateBase {
  name: string;
  description?: string;
  variant: BadgeVariant;
  defaultText: string;
  category: string;
  presetData?: {
    priority?: number;
    targetRoles?: string[];
    targetDevices?: string[];
    conditions?: Partial<BadgeConditions>;
  };
}

// ✅ Полный шаблон из базы данных
export interface BadgeTemplate {
  _id: Id<"badgeTemplates">;
  _creationTime: number;
  name: string;
  description?: string;
  variant: BadgeVariant;
  defaultText: string;
  defaultClassName?: string;
  category: string;
  isSystemTemplate: boolean;
  usageCount: number;
  previewUrl?: string;
  createdBy: string;
  createdAt: number;
  presetData: {
    priority: number;
    targetRoles: string[];
    targetDevices: string[];
    conditions: BadgeConditions;
  };
}

// ✅ Утилиты для работы с badge
export function createDefaultConditions(): BadgeConditions {
  return {
    requireAuth: false,
    minUserLevel: 0,
    showOnlyOnce: false,
    hideAfterClick: false,
  };
}

export function createDefaultFormData(): BadgeFormData {
  return {
    navigationItemHref: '',
    badgeVariant: 'standard',
    badgeText: '',
    badgeEnabled: true,
    priority: 1,
    targetRoles: [],
    targetDevices: [],
    conditions: createDefaultConditions(),
  };
}

// ✅ Функция для преобразования шаблона в данные формы
export function normalizeTemplate(template: BadgeTemplateBase): BadgeFormData {
  return {
    navigationItemHref: '',
    badgeVariant: template.variant,
    badgeText: template.defaultText,
    badgeEnabled: true,
    priority: template.presetData?.priority || 1,
    targetRoles: template.presetData?.targetRoles || [],
    targetDevices: template.presetData?.targetDevices || [],
    conditions: {
      requireAuth: template.presetData?.conditions?.requireAuth ?? false,
      minUserLevel: template.presetData?.conditions?.minUserLevel ?? 0,
      showOnlyOnce: template.presetData?.conditions?.showOnlyOnce ?? false,
      hideAfterClick: template.presetData?.conditions?.hideAfterClick ?? false,
    },
  };
}

// ✅ Функция для нормализации данных из Convex
export function normalizeHeaderBadgeSetting(dbSetting: HeaderBadgeSettingDB): HeaderBadgeSetting {
  return {
    _id: dbSetting._id,
    _creationTime: dbSetting._creationTime,
    navigationItemHref: dbSetting.navigationItemHref,
    badgeVariant: dbSetting.badgeVariant as BadgeVariant,
    badgeText: dbSetting.badgeText || "",
    badgeEnabled: dbSetting.badgeEnabled,
    customClassName: dbSetting.customClassName,
    isActive: dbSetting.isActive,
    priority: dbSetting.priority,
    validFrom: dbSetting.validFrom,
    validTo: dbSetting.validTo,
    targetRoles: dbSetting.targetRoles || [],
    targetDevices: dbSetting.targetDevices || [],
    conditions: {
      requireAuth: dbSetting.conditions?.requireAuth ?? false,
      minUserLevel: dbSetting.conditions?.minUserLevel ?? 0,
      showOnlyOnce: dbSetting.conditions?.showOnlyOnce ?? false,
      hideAfterClick: dbSetting.conditions?.hideAfterClick ?? false,
    },
    analytics: dbSetting.analytics,
    createdBy: dbSetting.createdBy,
    createdAt: dbSetting.createdAt,
    updatedBy: dbSetting.updatedBy,
    updatedAt: dbSetting.updatedAt,
  };
}

// ✅ Функция для преобразования в данные для Convex
export function denormalizeHeaderBadgeSetting(setting: BadgeFormData & { createdBy: string }): Omit<HeaderBadgeSettingDB, '_id' | '_creationTime' | 'createdAt' | 'isActive'> {
  return {
    navigationItemHref: setting.navigationItemHref,
    badgeVariant: setting.badgeVariant,
    badgeText: setting.badgeText || undefined,
    badgeEnabled: setting.badgeEnabled,
    priority: setting.priority,
    validFrom: setting.validFrom,
    validTo: setting.validTo,
    targetRoles: setting.targetRoles.length > 0 ? setting.targetRoles : undefined,
    targetDevices: setting.targetDevices.length > 0 ? setting.targetDevices : undefined,
    conditions: {
      requireAuth: setting.conditions.requireAuth || undefined,
      minUserLevel: setting.conditions.minUserLevel || undefined,
      showOnlyOnce: setting.conditions.showOnlyOnce || undefined,
      hideAfterClick: setting.conditions.hideAfterClick || undefined,
    },
    createdBy: setting.createdBy,
  };
}
