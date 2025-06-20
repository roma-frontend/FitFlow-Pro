import type { HeaderBadgeSetting, BadgeFormData, BadgeVariant} from "@/types/badge";

// Экспорт аналитики badge в CSV формат
export function exportBadgeAnalytics(settings: HeaderBadgeSetting[]): void {
  const headers = [
    "Пункт навигации",
    "Тип Badge",
    "Текст",
    "Статус",
    "Показы",
    "Клики",
    "CTR (%)",
    "Уникальные клики",
    "Приоритет",
    "Создан",
    "Обновлен"
  ];

  const rows = settings.map(setting => {
    const analytics = setting.analytics || { impressions: 0, clicks: 0, clickedUsers: [] };
    const ctr = analytics.impressions > 0
      ? ((analytics.clicks / analytics.impressions) * 100).toFixed(2)
      : "0.00";

    return [
      setting.navigationItemHref,
      setting.badgeVariant,
      setting.badgeText || "",
      setting.badgeEnabled ? "Включен" : "Выключен",
      analytics.impressions.toString(),
      analytics.clicks.toString(),
      ctr,
      analytics.clickedUsers.length.toString(),
      setting.priority.toString(),
      new Date(setting.createdAt).toLocaleDateString("ru-RU"),
      setting.updatedAt ? new Date(setting.updatedAt).toLocaleDateString("ru-RU") : ""
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");

  downloadFile(csvContent, `badge-analytics-${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
}

// Экспорт настроек badge в JSON формат
export function exportBadgeSettingsToJSON(settings: HeaderBadgeSetting[]): string {
  const exportData = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    settings: settings.map(setting => ({
      navigationItemHref: setting.navigationItemHref,
      badgeVariant: setting.badgeVariant,
      badgeText: setting.badgeText,
      badgeEnabled: setting.badgeEnabled,
      customClassName: (setting as any).customClassName, // если есть
      priority: setting.priority,
      validFrom: setting.validFrom,
      validTo: setting.validTo,
      targetRoles: setting.targetRoles,
      targetDevices: setting.targetDevices,
      conditions: setting.conditions
    }))
  };

  return JSON.stringify(exportData, null, 2);
}

// Импорт настроек badge из JSON
export function importBadgeSettings(jsonContent: string): BadgeFormData[] {
  try {
    const data = JSON.parse(jsonContent);

    if (!data.settings || !Array.isArray(data.settings)) {
      throw new Error('Неверный формат файла. Ожидается объект с полем "settings"');
    }

    const validVariants: BadgeVariant[] = [
      "quantum-ai", "neural-new", "holographic",
      "minimal", "cosmic", "matrix", "standard"
    ];

    return data.settings.map((setting: any) => {
      if (!setting.navigationItemHref) {
        throw new Error("Отсутствует обязательное поле navigationItemHref");
      }
      if (!setting.badgeVariant) {
        throw new Error("Отсутствует обязательное поле badgeVariant");
      }
      if (!validVariants.includes(setting.badgeVariant)) {
        throw new Error(`Неверный тип badge: ${setting.badgeVariant}`);
      }

      return {
        navigationItemHref: setting.navigationItemHref,
        badgeVariant: setting.badgeVariant,
        badgeText: setting.badgeText || "",
        badgeEnabled: setting.badgeEnabled !== false,
        customClassName: setting.customClassName,
        priority: setting.priority || 1,
        validFrom: setting.validFrom,
        validTo: setting.validTo,
        targetRoles: setting.targetRoles || [],
        targetDevices: setting.targetDevices || [],
        conditions: {
          requireAuth: setting.conditions?.requireAuth || false,
          minUserLevel: setting.conditions?.minUserLevel || 0,
          showOnlyOnce: setting.conditions?.showOnlyOnce || false,
          hideAfterClick: setting.conditions?.hideAfterClick || false
        }
      } as BadgeFormData;
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Неверный JSON формат файла");
    }
    throw error;
  }
}

// Экспорт шаблона badge настроек для примера
export function exportBadgeTemplate(): string {
  const template = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    description: "Шаблон для импорта badge настроек",
    settings: [
      {
        navigationItemHref: "/example",
        badgeVariant: "standard",
        badgeText: "NEW",
        badgeEnabled: true,
        priority: 1,
        targetRoles: ["admin", "manager"],
        targetDevices: ["desktop", "mobile"],
        conditions: {
          requireAuth: false,
          minUserLevel: 0,
          showOnlyOnce: false,
          hideAfterClick: false
        }
      }
    ]
  };

  return JSON.stringify(template, null, 2);
}

// Экспорт статистики в расширенном формате
export function exportDetailedAnalytics(settings: HeaderBadgeSetting[]): void {
  const data = settings.map(setting => {
    const analytics = setting.analytics || { impressions: 0, clicks: 0, clickedUsers: [] };
    return {
      href: setting.navigationItemHref,
      variant: setting.badgeVariant,
      text: setting.badgeText || "",
      enabled: setting.badgeEnabled,
      priority: setting.priority,
      impressions: analytics.impressions,
      clicks: analytics.clicks,
      ctr: analytics.impressions > 0
        ? ((analytics.clicks / analytics.impressions) * 100).toFixed(2)
        : "0.00",
      uniqueClicks: analytics.clickedUsers.length,
      lastShown: analytics.lastShown
        ? new Date(analytics.lastShown).toISOString()
        : null,
      targetRoles: setting.targetRoles?.join(";") || "",
      targetDevices: setting.targetDevices?.join(";") || "",
      validFrom: setting.validFrom
        ? new Date(setting.validFrom).toISOString()
        : null,
      validTo: setting.validTo
        ? new Date(setting.validTo).toISOString()
        : null,
      createdAt: new Date(setting.createdAt).toISOString(),
      updatedAt: setting.updatedAt
        ? new Date(setting.updatedAt).toISOString()
        : null
    };
  });

  const jsonContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    totalSettings: settings.length,
    activeSettings: settings.filter(s => s.badgeEnabled && s.isActive).length,
    analytics: data
  }, null, 2);

  downloadFile(
    jsonContent,
    `badge-detailed-analytics-${new Date().toISOString().split("T")[0]}.json`,
    "application/json"
  );
}

// Валидация импортируемых данных
export function validateImportData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("Файл должен содержать JSON объект");
    return { isValid: false, errors };
  }

  if (!data.settings || !Array.isArray(data.settings)) {
    errors.push('Отсутствует массив "settings"');
    return { isValid: false, errors };
  }

  if (data.settings.length === 0) {
    errors.push("Массив настроек пуст");
    return { isValid: false, errors };
  }

  const validVariants: BadgeVariant[] = [
    "quantum-ai", "neural-new", "holographic",
    "minimal", "cosmic", "matrix", "standard"
  ];

  data.settings.forEach((setting: any, index: number) => {
    if (!setting.navigationItemHref) {
      errors.push(`Настройка ${index + 1}: отсутствует navigationItemHref`);
    }
    if (!setting.badgeVariant) {
      errors.push(`Настройка ${index + 1}: отсутствует badgeVariant`);
    } else if (!validVariants.includes(setting.badgeVariant)) {
      errors.push(`Настройка ${index + 1}: неверный badgeVariant "${setting.badgeVariant}"`);
    }
    if (setting.priority && (typeof setting.priority !== "number" || setting.priority < 1)) {
      errors.push(`Настройка ${index + 1}: неверный приоритет`);
    }
    if (setting.targetRoles && !Array.isArray(setting.targetRoles)) {
      errors.push(`Настройка ${index + 1}: targetRoles должен быть массивом`);
    }
    if (setting.targetDevices && !Array.isArray(setting.targetDevices)) {
      errors.push(`Настройка ${index + 1}: targetDevices должен быть массивом`);
    }
  });

  return { isValid: errors.length === 0, errors };
}

// Утилита для скачивания файла
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Утилита для форматирования размера файла
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Утилита для проверки типа файла
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.startsWith(".")) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    return file.type === type;
  });
}

// Генерация отчета по badge использованию
export function generateUsageReport(settings: HeaderBadgeSetting[]): string {
  const totalSettings = settings.length;
  const activeSettings = settings.filter(s => s.badgeEnabled && s.isActive).length;
  const totalImpressions = settings.reduce((sum, s) => sum + (s.analytics?.impressions || 0), 0);
  const totalClicks = settings.reduce((sum, s) => sum + (s.analytics?.clicks || 0), 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : "0.00";

  const variantStats = settings.reduce((acc, setting) => {
    const variant = setting.badgeVariant;
    if (!acc[variant]) {
      acc[variant] = { count: 0, impressions: 0, clicks: 0 };
    }
    acc[variant].count++;
    acc[variant].impressions += setting.analytics?.impressions || 0;
    acc[variant].clicks += setting.analytics?.clicks || 0;
    return acc;
  }, {} as Record<string, { count: number; impressions: number; clicks: number }>);

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalSettings,
      activeSettings,
      inactiveSettings: totalSettings - activeSettings,
      totalImpressions,
      totalClicks,
      averageCTR: `${averageCTR}%`
    },
    variantBreakdown: Object.entries(variantStats).map(([variant, stats]) => ({
      variant,
      count: stats.count,
      impressions: stats.impressions,
      clicks: stats.clicks,
      ctr: stats.impressions > 0
        ? `${(stats.clicks / stats.impressions * 100).toFixed(2)}%`
        : "0.00%"
    })),
    topPerformers: settings
      .filter(s => s.analytics && s.analytics.impressions > 0)
      .sort((a, b) => {
        const aCTR = (a.analytics!.clicks / a.analytics!.impressions) * 100;
        const bCTR = (b.analytics!.clicks / b.analytics!.impressions) * 100;
        return bCTR - aCTR;
      })
      .slice(0, 10)
      .map(s => ({
        href: s.navigationItemHref,
        variant: s.badgeVariant,
        text: s.badgeText,
        impressions: s.analytics!.impressions,
        clicks: s.analytics!.clicks,
        ctr: `${((s.analytics!.clicks / s.analytics!.impressions) * 100).toFixed(2)}%`
      }))
  };

  return JSON.stringify(report, null, 2);
}
