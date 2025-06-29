// app/admin/header-badges/page.tsx (исправленная версия)
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Palette, AlertTriangle, Zap, Lock } from "lucide-react";
import { BadgeManagementDashboard } from "@/components/BadgeManagementDashboard";
import { BadgeTemplateSelector } from "@/components/BadgeTemplateSelector";
import { BadgeSettingDialog } from "@/components/BadgeSettingDialog";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  BadgeFormData,
  HeaderBadgeSetting,
  BadgeTemplateBase
} from '@/types/badge';
import {
  settingToFormData,
  createEmptyBadgeFormData
} from "@/utils/badgeUtils";
import { normalizeTemplate } from '@/types/badge';
import { useHeaderBadgeManagement } from "@/hooks/useHeaderBadgeManagement";

export default function HeaderBadgesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    allSettings,
    updateBadgeSetting,
    deleteBadgeSetting,
    createBadgeSetting,
    isLoading,
    isApiAvailable,
    checkForConflicts,
    fixPriorityConflicts,
    getOptimizationSuggestions,
    error,
    hasError,
    isAuthenticated,
    canManageBadges,
    userRole,
    refresh, // Добавляем refresh функцию
  } = useHeaderBadgeManagement();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BadgeFormData | null>(null);
  const [isFixingConflicts, setIsFixingConflicts] = useState(false);

  // Получаем данные для отображения предупреждений
  const conflicts = checkForConflicts ? checkForConflicts() : [];
  const suggestions = getOptimizationSuggestions ? getOptimizationSuggestions() : [];

  // Проверяем доступность API
  if (!isApiAvailable) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              API недоступен
            </h1>
            <p className="text-gray-600 mb-6">
              Не удается подключиться к API badge настроек.
            </p>
            <Button onClick={() => router.push("/admin/settings")}>
              Назад к настройкам
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Проверяем авторизацию
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <Lock className="h-16 w-16 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Требуется авторизация
            </h1>
            <p className="text-gray-600 mb-6">
              Для доступа к управлению badge необходимо войти в систему.
            </p>
            <div className="space-x-4">
              <Button onClick={() => router.push("/auth/login")}>
                Войти
              </Button>
              <Button variant="outline" onClick={() => router.push("/admin/settings")}>
                Назад к настройкам
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Проверяем права доступа
  if (!canManageBadges) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <Lock className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-6">
              У вас недостаточно прав для управления badge. Требуется роль super-admin.
            </p>
            <p className="text-gray-500 mb-6">
              Ваша текущая роль: {userRole || 'не определена'}
            </p>
            <Button variant="outline" onClick={() => router.push("/admin/settings")}>
              Назад к настройкам
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Проверяем наличие ошибок
  if (hasError) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Произошла ошибка
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'Не удалось загрузить данные badge.'}
            </p>
            <div className="space-x-4">
              <Button onClick={() => window.location.reload()}>
                Попробовать снова
              </Button>
              <Button variant="outline" onClick={() => router.push("/admin/settings")}>
                Назад к настройкам
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleBack = useCallback(() => {
    router.push("/admin/settings");
  }, [router]);

  const handleCreateNew = useCallback(() => {
    setIsTemplateDialogOpen(true);
  }, []);

  const handleCreateBlank = useCallback(() => {
    setFormData(createEmptyBadgeFormData());
    setEditingId(null);
    setIsTemplateDialogOpen(false);
    setIsCreateDialogOpen(true);
  }, []);

  // Исправленная функция для работы с шаблонами
  const handleSelectTemplate = useCallback((template: BadgeTemplateBase) => {
    try {
      const templateFormData = normalizeTemplate(template);

      setFormData(templateFormData);
      setEditingId(null);
      setIsTemplateDialogOpen(false);
      setIsCreateDialogOpen(true);
    } catch (error) {
      console.error('Ошибка обработки шаблона:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обработать выбранный шаблон",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Функция редактирования
  const handleEdit = useCallback((setting: HeaderBadgeSetting) => {
    try {
      const formDataFromSetting = settingToFormData(setting);
      setFormData(formDataFromSetting);
      setEditingId(setting._id);
      setIsCreateDialogOpen(true);
    } catch (error) {
      console.error('Ошибка подготовки данных для редактирования:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось подготовить данные для редактирования",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Исправленная функция сохранения
  const handleSave = useCallback(async (data: BadgeFormData & { createdBy: string }) => {
    if (!createBadgeSetting || !updateBadgeSetting) {
      toast({
        title: "Ошибка",
        description: "API функции недоступны",
        variant: "destructive",
      });
      return;
    }

    try {
      // Валидация данных перед отправкой
      if (!data.navigationItemHref || !data.badgeText || !data.badgeVariant) {
        toast({
          title: "Ошибка валидации",
          description: "Заполните все обязательные поля",
          variant: "destructive",
        });
        return;
      }

      if (editingId) {
        // Обновление существующей настройки
        console.log('Обновление badge с ID:', editingId, 'данные:', data);

        await updateBadgeSetting({
          id: editingId,
          updates: data,
          updatedBy: data.createdBy,
        });

        toast({
          title: "Успешно",
          description: "Badge успешно обновлен",
          variant: "default",
        });
      } else {
        // Создание новой настройки
        console.log('Создание нового badge с данными:', data);

        await createBadgeSetting(data);

        toast({
          title: "Успешно",
          description: "Badge успешно создан",
          variant: "default",
        });
      }

      // Закрываем диалог и очищаем состояние
      setIsCreateDialogOpen(false);
      setEditingId(null);
      setFormData(null);

      // Обновляем данные
      if (refresh) {
        await refresh();
      }
    } catch (error) {
      console.error("Подробная ошибка сохранения:", error);

      let errorMessage = "Ошибка при сохранении настройки";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }

      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [editingId, createBadgeSetting, updateBadgeSetting, toast, refresh]);

  // Функция удаления
  const handleDelete = useCallback(async (id: string) => {
    if (!deleteBadgeSetting) {
      toast({
        title: "Ошибка",
        description: "API функция недоступна",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Вы уверены, что хотите удалить эту настройку?")) return;

    try {
      console.log('Удаление badge с ID:', id);

      await deleteBadgeSetting({ id });

      toast({
        title: "Успешно",
        description: "Badge успешно удален",
        variant: "default",
      });

      // Обновляем данные
      if (refresh) {
        await refresh();
      }
    } catch (error) {
      console.error("Ошибка удаления:", error);

      let errorMessage = "Ошибка при удалении настройки";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [deleteBadgeSetting, toast, refresh]);

  // Исправление конфликтов приоритетов
  const handleFixConflicts = useCallback(async () => {
    if (!fixPriorityConflicts) {
      toast({
        title: "Ошибка",
        description: "API функция недоступна",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Автоматически исправить конфликты приоритетов?")) return;

    setIsFixingConflicts(true);
    try {
      const fixedCount = await fixPriorityConflicts();

      toast({
        title: "Успешно",
        description: `Исправлено ${fixedCount} конфликтов приоритетов`,
        variant: "default",
      });

      // Обновляем данные
      if (refresh) {
        await refresh();
      }
    } catch (error) {
      console.error("Ошибка исправления конфликтов:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при исправлении конфликтов",
        variant: "destructive",
      });
    } finally {
      setIsFixingConflicts(false);
    }
  }, [fixPriorityConflicts, toast, refresh]);

  // Функция обновления данных
  const handleRefresh = useCallback(async () => {
    if (refresh) {
      try {
        await refresh();
        toast({
          title: "Успешно",
          description: "Данные обновлены",
          variant: "default",
        });
      } catch (error) {
        console.error("Ошибка обновления данных:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось обновить данные",
          variant: "destructive",
        });
      }
    }
  }, [refresh, toast]);

  if (isLoading) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b rounded-xl">
        <div className="md:px-6 md:py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2 justify-between p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hidden sm:flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Управление Badge
                </h1>
                <p className="text-gray-600">
                  Полная система управления значками навигации
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Кнопка исправления конфликтов */}
              {conflicts.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleFixConflicts}
                  disabled={isFixingConflicts}
                  className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Zap className="h-4 w-4" />
                  {isFixingConflicts ? "Исправление..." : "Исправить конфликты"}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setIsTemplateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Шаблоны
              </Button>
              <Button
                onClick={handleCreateNew}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Создать Badge
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Предупреждения и рекомендации */}
      <div className="md:px-6 md:py-3 space-y-4">
        {conflicts.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Найдены конфликты приоритетов!</strong>
              {conflicts.length} URL имеют несколько активных badge с одинаковыми приоритетами.
              Это может привести к непредсказуемому отображению.
              <Button
                variant="link"
                className="p-0 h-auto ml-2 text-orange-600 underline"
                onClick={handleFixConflicts}
                disabled={isFixingConflicts}
              >
                Исправить автоматически
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {suggestions.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Рекомендации по оптимизации:</strong>
              <ul className="mt-2 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm">• {suggestion}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <BadgeManagementDashboard
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRefresh={handleRefresh}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Dialog для выбора шаблона */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создание Badge</DialogTitle>
            <DialogDescription>
              Выберите готовый шаблон или создайте с нуля
            </DialogDescription>
          </DialogHeader>
          <BadgeTemplateSelector
            onSelectTemplate={handleSelectTemplate}
            onCreateBlank={handleCreateBlank}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog для создания/редактирования */}
      <BadgeSettingDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleSave}
        initialData={formData}
        isEditing={!!editingId}
      />
    </div>
  );
}

