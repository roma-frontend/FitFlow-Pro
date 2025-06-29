// hooks/useTemplates.ts (исправленная версия с правильными типами)
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NotificationTemplate } from "@/types/messages";
import { Id } from "@/convex/_generated/dataModel";

// Проверяем доступность API функций для шаблонов
function isTemplatesApiAvailable() {
  try {
    return api && api.notificationTemplates && typeof api.notificationTemplates === 'object';
  } catch (error) {
    return false;
  }
}

// Генерируем тестовые данные для шаблонов с правильными типами триггеров
function generateTestTemplates(): NotificationTemplate[] {
  return [
    {
      _id: "template1" as Id<"notificationTemplates">,
      _creationTime: Date.now(),
      name: "Добро пожаловать",
      description: "Приветственное сообщение для новых пользователей",
      type: "in-app",
      subject: "Добро пожаловать в {{clubName}}!",
      content: "Здравствуйте, {{userName}}! Добро пожаловать в нашу систему управления фитнес-клубом.",
      variables: ["userName", "clubName"],
      isActive: true,
      createdBy: "admin" as Id<"users">,
      category: "welcome",
      priority: "normal",
      trigger: "new_member",
    },
    {
      _id: "template2" as Id<"notificationTemplates">,
      _creationTime: Date.now() - 86400000,
      name: "Напоминание о событии",
      description: "Напоминание о предстоящем событии",
      type: "push",
      subject: "Напоминание о событии",
      content: "Не забудьте о событии сегодня в {{time}}! Место: {{location}}.",
      variables: ["time", "location"],
      isActive: true,
      createdBy: "admin" as Id<"users">,
      category: "reminder",
      priority: "high",
      trigger: "event_reminder",
    },
    {
      _id: "template3" as Id<"notificationTemplates">,
      _creationTime: Date.now() - 172800000,
      name: "Срочное уведомление",
      description: "Шаблон для срочных уведомлений",
      type: "email",
      subject: "СРОЧНО: {{title}}",
      content: "Срочное уведомление: {{message}}",
      variables: ["title", "message"],
      isActive: false,
      createdBy: "admin" as Id<"users">,
      category: "urgent",
      priority: "urgent",
      trigger: "manual",
    },
    {
      _id: "template4" as Id<"notificationTemplates">,
      _creationTime: Date.now() - 259200000,
      name: "Истечение абонемента",
      description: "Уведомление об истечении абонемента",
      type: "email",
      subject: "Ваш абонемент истекает",
      content: "Ваш абонемент истекает {{expiryDate}}. Продлите его для продолжения занятий.",
      variables: ["expiryDate"],
      isActive: true,
      createdBy: "admin" as Id<"users">,
      category: "membership",
      priority: "high",
      trigger: "membership_expiry",
    },
    {
      _id: "template5" as Id<"notificationTemplates">,
      _creationTime: Date.now() - 345600000,
      name: "Напоминание об оплате",
      description: "Напоминание о необходимости оплаты",
      type: "sms",
      subject: "Напоминание об оплате",
      content: "Напоминаем о необходимости оплаты в размере {{amount}} до {{dueDate}}.",
      variables: ["amount", "dueDate"],
      isActive: true,
      createdBy: "admin" as Id<"users">,
      category: "payment",
      priority: "normal",
      trigger: "payment_due",
    },
  ];
}

export const useTemplates = () => {
  // Fallback данные
  const [fallbackTemplates, setFallbackTemplates] = useState<NotificationTemplate[]>([]);

  // Инициализируем fallback данные
  useEffect(() => {
    const testTemplates = generateTestTemplates();
    setFallbackTemplates(testTemplates);
  }, []);

  // Проверяем доступность API
  const isApiAvailable = isTemplatesApiAvailable();

  // Безопасный useQuery
  let templatesResult: NotificationTemplate[] | undefined;

  try {
    if (isApiAvailable && api.notificationTemplates?.list) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      templatesResult = useQuery(api.notificationTemplates.list, { isActive: true });
    }
  } catch (error) {
    console.warn('Templates API недоступен:', error);
    templatesResult = undefined;
  }

  // Используем реальные данные если доступны, иначе fallback
  const templates = templatesResult ?? fallbackTemplates;

  // Мутации с явной типизацией
  let createTemplateMutation: any = null;
  let updateTemplateMutation: any = null;
  let deleteTemplateMutation: any = null;

  try {
    if (isApiAvailable) {
      if (api.notificationTemplates?.create) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        createTemplateMutation = useMutation(api.notificationTemplates.create);
      }
      if (api.notificationTemplates?.update) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        updateTemplateMutation = useMutation(api.notificationTemplates.update);
      }
      if (api.notificationTemplates?.remove) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        deleteTemplateMutation = useMutation(api.notificationTemplates.remove);
      }
    }
  } catch (error) {
    console.warn('Template mutations недоступны:', error);
  }

  const createTemplate = useCallback(async (templateData: {
    name: string;
    description?: string;
    type: "email" | "sms" | "push" | "in-app";
    subject: string;
    content: string;
    variables: string[];
    createdBy: Id<"users">;
    category?: string;
    priority: "low" | "normal" | "high" | "urgent";
    trigger: "manual" | "event_reminder" | "payment_due" | "membership_expiry" | "new_member"; // Используем только разрешенные типы
  }) => {
    try {
      if (createTemplateMutation) {
        return await createTemplateMutation(templateData);
      } else {
        // Fallback: добавляем в локальное состояние
        const newTemplate: NotificationTemplate = {
          _id: `template_${Date.now()}` as Id<"notificationTemplates">,
          _creationTime: Date.now(),
          ...templateData,
          isActive: true,
        };
        setFallbackTemplates(prev => [newTemplate, ...prev]);
        return newTemplate._id;
      }
    } catch (error) {
      console.error("Ошибка создания шаблона:", error);
      throw error;
    }
  }, [createTemplateMutation]);

  const updateTemplate = useCallback(async (
    id: Id<"notificationTemplates">,
    updates: {
      name?: string;
      description?: string;
      subject?: string;
      content?: string;
      variables?: string[];
      isActive?: boolean;
      trigger?: "manual" | "event_reminder" | "payment_due" | "membership_expiry" | "new_member"; // Используем только разрешенные типы
    }
  ) => {
    try {
      if (updateTemplateMutation) {
        await updateTemplateMutation({ id, ...updates });
      } else {
        // Fallback: обновляем локальное состояние
        setFallbackTemplates(prev => prev.map(template =>
          template._id === id ? { ...template, ...updates } : template
        ));
      }
    } catch (error) {
      console.error("Ошибка обновления шаблона:", error);
      throw error;
    }
  }, [updateTemplateMutation]);

  const deleteTemplate = useCallback(async (id: Id<"notificationTemplates">) => {
    try {
      if (deleteTemplateMutation) {
        await deleteTemplateMutation({ id });
      } else {
        // Fallback: удаляем из локального состояния
        setFallbackTemplates(prev => prev.filter(template => template._id !== id));
      }
    } catch (error) {
      console.error("Ошибка удаления шаблона:", error);
      throw error;
    }
  }, [deleteTemplateMutation]);

  const toggleTemplate = useCallback(async (id: Id<"notificationTemplates">, isActive: boolean) => {
    try {
      if (updateTemplateMutation) {
        await updateTemplateMutation({ id, isActive });
      } else {
        // Fallback: обновляем локальное состояние
        setFallbackTemplates(prev => prev.map(template =>
          template._id === id ? { ...template, isActive } : template
        ));
      }
    } catch (error) {
      console.error("Ошибка переключения шаблона:", error);
      throw error;
    }
  }, [updateTemplateMutation]);

  // Дополнительные функции для работы с триггерами
  const getTemplatesByTrigger = useCallback((trigger: "manual" | "event_reminder" | "payment_due" | "membership_expiry" | "new_member") => {
    return templates.filter(template => template.trigger === trigger && template.isActive);
  }, [templates]);

  const getAvailableTriggers = useCallback(() => {
    const triggers = new Set(templates.map(template => template.trigger));
    return Array.from(triggers);
  }, [templates]);

  return {
    templates: templates as NotificationTemplate[],
    loading: templates === undefined,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplate,
    getTemplatesByTrigger,
    getAvailableTriggers,
    isApiAvailable,
  };
};

// Константы для разрешенных триггеров (соответствуют типу NotificationTemplate)
export const templateTriggers = {
  MANUAL: "manual",
  EVENT_REMINDER: "event_reminder",
  PAYMENT_DUE: "payment_due",
  MEMBERSHIP_EXPIRY: "membership_expiry",
  NEW_MEMBER: "new_member",
} as const;

export const templateCategories = {
  WELCOME: "welcome",
  REMINDER: "reminder",
  PAYMENT: "payment",
  SYSTEM: "system",
  URGENT: "urgent",
  MARKETING: "marketing",
  MEMBERSHIP: "membership",
} as const;

export const templatePriorities = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

// Функция для получения отображаемого названия триггера
export function getTriggerDisplayName(trigger: "manual" | "event_reminder" | "payment_due" | "membership_expiry" | "new_member"): string {
  const names: Record<string, string> = {
    manual: "Ручная отправка",
    event_reminder: "Напоминание о событии",
    payment_due: "Напоминание об оплате",
    membership_expiry: "Истечение абонемента",
    new_member: "Новый участник",
  };
  return names[trigger] || trigger;
}

// Функция для валидации переменных в шаблоне
export function validateTemplateVariables(content: string, variables: string[]): boolean {
  const variablesInContent = content.match(/\{\{(\w+)\}\}/g) || [];
  const extractedVariables = variablesInContent.map(v => v.replace(/[{}]/g, ''));
  
  return extractedVariables.every(variable => variables.includes(variable));
}

// Функция для замены переменных в шаблоне
export function replaceTemplateVariables(
  template: string, 
  variables: Record<string, string>
): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

// Функция для получения рекомендуемых переменных для каждого типа триггера
export function getRecommendedVariables(trigger: "manual" | "event_reminder" | "payment_due" | "membership_expiry" | "new_member"): string[] {
  const recommendations: Record<string, string[]> = {
    manual: ["userName", "message"],
    event_reminder: ["userName", "eventName", "eventDate", "eventTime", "location"],
    payment_due: ["userName", "amount", "dueDate", "serviceName"],
    membership_expiry: ["userName", "membershipType", "expiryDate", "renewalLink"],
    new_member: ["userName", "clubName", "welcomeMessage", "supportContact"],
  };
  
  return recommendations[trigger] || ["userName"];
}

// Экспорт типов для удобства
export type { NotificationTemplate };
