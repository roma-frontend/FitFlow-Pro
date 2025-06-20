// hooks/useSettingsActions.ts
"use client";

import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export function useSettingsActions(
  loadSettings: () => Promise<void>,
  setHasUnsavedChanges: (value: boolean) => void
) {
  const resetSettings = useCallback(() => {
    // Показываем предупреждение
    toast({
      title: "Подтвердите действие",
      description: "Вы уверены, что хотите сбросить все настройки? Нажмите еще раз для подтверждения.",
      variant: "destructive",
    });

    // Можно добавить состояние для подтверждения или использовать confirm
    const confirmed = window.confirm(
      "Вы уверены, что хотите сбросить все настройки? Это действие нельзя отменить."
    );

    if (confirmed) {
      handleReset();
    }
  }, [loadSettings, setHasUnsavedChanges]);

  const handleReset = useCallback(async () => {
    try {
      await loadSettings();
      setHasUnsavedChanges(false);
      toast({
        title: "Настройки сброшены",
        description: "Все настройки возвращены к значениям по умолчанию",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Ошибка сброса",
        description: "Не удалось сбросить настройки",
        variant: "destructive",
      });
    }
  }, [loadSettings, setHasUnsavedChanges]);

  const showHelp = useCallback(() => {
    toast({
      title: "Справка по настройкам",
      description: "Здесь вы можете настроить все параметры системы. Используйте вкладки для навигации между разделами.",
      variant: "default",
    });
  }, []);

  const showNotifications = useCallback(() => {
    toast({
      title: "Настройки уведомлений",
      description: "Перейдите на вкладку 'Уведомления' для настройки системы оповещений",
      variant: "default",
    });
  }, []);

  return {
    resetSettings,
    showHelp,
    showNotifications,
  };
}
