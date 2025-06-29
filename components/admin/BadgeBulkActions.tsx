// components/admin/BadgeBulkActions.tsx (исправленная версия)
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Trash2,
  Eye,
  EyeOff,
  FileJson,
  FileSpreadsheet,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import {
  exportBadgeAnalytics,
  exportBadgeSettingsToJSON,
  importBadgeSettings,
  exportDetailedAnalytics,
  exportBadgeTemplate,
  validateImportData,
  generateUsageReport,
  isValidFileType,
  formatFileSize,
} from "@/utils/badgeExport";
import type { Id } from "@/convex/_generated/dataModel";
import type { HeaderBadgeSetting } from "@/types/badge";
import { settingToFormData } from "@/utils/badgeUtils";
import { useHeaderBadgeManagement } from "@/hooks/useHeaderBadgeManagement";

interface BadgeBulkActionsProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRefresh: () => void;
}

export function BadgeBulkActions({
  selectedIds,
  onSelectionChange,
  onRefresh,
}: BadgeBulkActionsProps) {
  const {
    allSettings,
    updateBadgeSetting,
    deleteBadgeSetting,
    createBadgeSetting,
  } = useHeaderBadgeManagement();

  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | "warning" | null;
    message: string;
  }>({ type: null, message: "" });

  // ✅ Исправлено массовое включение/выключение с правильными типами
  const handleBulkToggle = async (enabled: boolean) => {
    if (selectedIds.length === 0 || !updateBadgeSetting || !allSettings) return;

    setIsProcessing(true);
    try {
      // Получаем выбранные настройки
      const selectedSettings = allSettings.filter((s: HeaderBadgeSetting) =>
        selectedIds.includes(s._id)
      );

      for (const setting of selectedSettings) {
        // Преобразуем в FormData и обновляем только нужное поле
        const formData = settingToFormData(setting);
        const updatedFormData = { ...formData, badgeEnabled: enabled };

        await updateBadgeSetting({
          id: setting._id,
          updates: updatedFormData,
          updatedBy: "current-user-id",
        });
      }

      onSelectionChange([]);
      onRefresh();
      setImportStatus({
        type: "success",
        message: `${enabled ? "Включено" : "Выключено"} ${selectedIds.length} настроек`,
      });
    } catch (error) {
      console.error("Ошибка массового обновления:", error);
      setImportStatus({
        type: "error",
        message: "Ошибка при обновлении настроек",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Исправлено массовое удаление с проверкой функции
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || !deleteBadgeSetting) return;

    if (
      !confirm(`Вы уверены, что хотите удалить ${selectedIds.length} настроек?`)
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      for (const id of selectedIds) {
        await deleteBadgeSetting({ id: id as Id<"headerBadgeSettings"> });
      }
      onSelectionChange([]);
      onRefresh();
      setImportStatus({
        type: "success",
        message: `Удалено ${selectedIds.length} настроек`,
      });
    } catch (error) {
      console.error("Ошибка массового удаления:", error);
      setImportStatus({
        type: "error",
        message: "Ошибка при удалении настроек",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Экспорт аналитики в CSV
  const handleExportAnalytics = () => {
    if (!allSettings) return;
    exportBadgeAnalytics(allSettings);
    setImportStatus({
      type: "success",
      message: "Аналитика экспортирована в CSV",
    });
  };

  // Экспорт детальной аналитики
  const handleExportDetailedAnalytics = () => {
    if (!allSettings) return;
    exportDetailedAnalytics(allSettings);
    setImportStatus({
      type: "success",
      message: "Детальная аналитика экспортирована",
    });
  };

  // Экспорт настроек в JSON
  const handleExportSettings = () => {
    if (!allSettings) return;

    const settingsToExport =
      selectedIds.length > 0
        ? allSettings.filter((s: HeaderBadgeSetting) =>
            selectedIds.includes(s._id)
          )
        : allSettings;

    const jsonContent = exportBadgeSettingsToJSON(settingsToExport);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `badge-settings-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setImportStatus({
      type: "success",
      message: `Экспортировано ${settingsToExport.length} настроек`,
    });
  };

  // Экспорт шаблона
  const handleExportTemplate = () => {
    const template = exportBadgeTemplate();
    const blob = new Blob([template], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "badge-settings-template.json";
    link.click();
    URL.revokeObjectURL(url);

    setImportStatus({
      type: "success",
      message: "Шаблон настроек скачан",
    });
  };

  // Генерация отчета использования
  const handleGenerateReport = () => {
    if (!allSettings) return;

    const report = generateUsageReport(allSettings);
    const blob = new Blob([report], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `badge-usage-report-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setImportStatus({
      type: "success",
      message: "Отчет использования сгенерирован",
    });
  };

  // ✅ Исправлен импорт настроек с проверкой функции
  const handleImportSettings = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !createBadgeSetting) return;

    // Проверка типа файла
    if (!isValidFileType(file, [".json", "application/json"])) {
      setImportStatus({
        type: "error",
        message: "Поддерживаются только JSON файлы",
      });
      event.target.value = "";
      return;
    }

    // Проверка размера файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImportStatus({
        type: "error",
        message: `Файл слишком большой (${formatFileSize(file.size)}). Максимум 5MB`,
      });
      event.target.value = "";
      return;
    }

    try {
      const content = await file.text();

      // Валидация данных
      const validation = validateImportData(JSON.parse(content));
      if (!validation.isValid) {
        setImportStatus({
          type: "error",
          message: `Ошибки валидации: ${validation.errors.join(", ")}`,
        });
        event.target.value = "";
        return;
      }

      const settings = importBadgeSettings(content);

      setIsProcessing(true);
      let successCount = 0;
      let errorCount = 0;

      for (const setting of settings) {
        try {
          await createBadgeSetting({
            ...setting,
            createdBy: "current-user-id",
          });
          successCount++;
        } catch (error) {
          console.error("Ошибка создания настройки:", error);
          errorCount++;
        }
      }

      onRefresh();

      if (errorCount === 0) {
        setImportStatus({
          type: "success",
          message: `Успешно импортировано ${successCount} настроек`,
        });
      } else {
        setImportStatus({
          type: "warning",
          message: `Импортировано ${successCount} настроек, ошибок: ${errorCount}`,
        });
      }
    } catch (error) {
      console.error("Ошибка импорта:", error);
      setImportStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Ошибка при импорте файла",
      });
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  };

  // Очистка статуса через 5 секунд
  React.useEffect(() => {
    if (importStatus.type) {
      const timer = setTimeout(() => {
        setImportStatus({ type: null, message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [importStatus]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Массовые операции
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Статус операций */}
        {importStatus.type && (
          <div
            className={`p-3 rounded-lg flex items-center gap-2 ${
              importStatus.type === "success"
                ? "bg-green-50 text-green-800"
                : importStatus.type === "warning"
                  ? "bg-yellow-50 text-yellow-800"
                  : "bg-red-50 text-red-800"
            }`}
          >
            {importStatus.type === "success" && (
              <CheckCircle className="h-4 w-4" />
            )}
            {importStatus.type === "warning" && (
              <AlertCircle className="h-4 w-4" />
            )}
            {importStatus.type === "error" && (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{importStatus.message}</span>
          </div>
        )}

        {/* Выбранные элементы */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              Выбрано: {selectedIds.length} настроек
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkToggle(true)}
                disabled={isProcessing || !updateBadgeSetting}
                className="text-green-600 hover:text-green-700"
              >
                <Eye className="h-3 w-3 mr-1" />
                Включить
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkToggle(false)}
                disabled={isProcessing || !updateBadgeSetting}
                className="text-gray-600 hover:text-gray-700"
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Выключить
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                disabled={isProcessing || !deleteBadgeSetting}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Удалить
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectionChange([])}
              >
                Отменить выбор
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Экспорт */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Download className="h-4 w-4" />
            Экспорт данных
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAnalytics}
              disabled={!allSettings}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Аналитика CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSettings}
              disabled={!allSettings}
              className="flex items-center gap-2"
            >
              <FileJson className="h-4 w-4" />
              Настройки JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDetailedAnalytics}
              disabled={!allSettings}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Детальная аналитика
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateReport}
              disabled={!allSettings}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Отчет использования
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            {selectedIds.length > 0
             ? `Экспорт будет включать ${selectedIds.length} выбранных настроек`
              : "Экспорт будет включать все настройки"}
          </p>
        </div>

        <Separator />

        {/* Импорт */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Импорт настроек
          </Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                disabled={isProcessing || !createBadgeSetting}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTemplate}
                className="whitespace-nowrap"
              >
                <Download className="h-4 w-4 mr-1" />
                Шаблон
              </Button>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Поддерживается импорт настроек badge из JSON файла</p>
              <p>• Максимальный размер файла: 5MB</p>
              <p>• Скачайте шаблон для примера формата</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Статистика */}
        {allSettings && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Статистика
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-semibold text-gray-900">
                  {allSettings.length}
                </div>
                <div className="text-xs text-gray-600">Всего настроек</div>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-semibold text-green-700">
                  {
                    allSettings.filter(
                      (s: HeaderBadgeSetting) => s.badgeEnabled && s.isActive
                    ).length
                  }
                </div>
                <div className="text-xs text-green-600">Активных</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-lg font-semibold text-blue-700">
                  {allSettings.reduce(
                    (sum: number, s: HeaderBadgeSetting) =>
                      sum + (s.analytics?.impressions || 0),
                    0
                  )}
                </div>
                <div className="text-xs text-blue-600">Показов</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="text-lg font-semibold text-purple-700">
                  {allSettings.reduce(
                    (sum: number, s: HeaderBadgeSetting) =>
                      sum + (s.analytics?.clicks || 0),
                    0
                  )}
                </div>
                <div className="text-xs text-purple-600">Кликов</div>
              </div>
            </div>
          </div>
        )}

        {/* Индикатор загрузки */}
        {isProcessing && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Обработка...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
