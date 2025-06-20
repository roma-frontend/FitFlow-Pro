// hooks/useSettingsImportExport.ts
"use client";

import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import type { SystemConfig } from '@/types/settings';

export function useSettingsImportExport(
  config: SystemConfig | null,
  setConfig: (config: SystemConfig) => void,
  setHasUnsavedChanges: (value: boolean) => void
) {
  const exportSettings = useCallback(() => {
    if (!config) return;

    try {
      const dataStr = JSON.stringify(config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fitaccess-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Экспорт завершен",
        description: "Настройки успешно экспортированы в файл",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать настройки",
        variant: "destructive",
      });
    }
  }, [config]);

  const importSettings = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        
        // Валидация структуры конфига
        if (!importedConfig || typeof importedConfig !== 'object') {
          throw new Error('Неверная структура файла');
        }

        setConfig(importedConfig);
        setHasUnsavedChanges(true);
        
        toast({
          title: "Импорт успешен",
          description: "Настройки успешно импортированы из файла",
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Ошибка импорта",
          description: "Не удалось импортировать настройки. Проверьте формат файла.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Сброс значения input для возможности повторного импорта того же файла
    event.target.value = '';
  }, [setConfig, setHasUnsavedChanges]);

  return {
    exportSettings,
    importSettings,
  };
}
