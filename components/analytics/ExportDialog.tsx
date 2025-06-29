// components/analytics/ExportDialog.tsx (исправленная типизация)
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, FileText, Database } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useExportManager, type ExportConfig } from "@/hooks/useAnalytics";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExportDialogProps {
  children: React.ReactNode;
}

// Типизируем возможные значения экспорта
type ExportType = ExportConfig['type'];
type ExportFormat = ExportConfig['format'];

export function ExportDialog({ children }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportType>("users");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { triggerExport, resetExport, isExporting, exportError, clearError } = useExportManager();

  const handleExport = () => {
    const startTimestamp = startDate ? startDate.getTime() : undefined;
    const endTimestamp = endDate ? endDate.getTime() : undefined;
    
    triggerExport(exportType, exportFormat, startTimestamp, endTimestamp);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetExport();
    clearError();
  };

  // Закрываем диалог при успешном экспорте
  React.useEffect(() => {
    if (!isExporting && !exportError && isOpen) {
      // Небольшая задержка для завершения скачивания
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isExporting, exportError, isOpen]);

  // Типизированные опции экспорта
  const exportTypes: Array<{ value: ExportType; label: string; icon: typeof FileText }> = [
    { value: "users", label: "Пользователи", icon: FileText },
    { value: "products", label: "Продукты", icon: FileText },
    { value: "orders", label: "Заказы", icon: FileText },
    { value: "revenue", label: "Выручка", icon: FileText },
    { value: "analytics", label: "Аналитика", icon: Database },
    { value: "full", label: "Полная аналитика", icon: Database },
  ];

  const exportFormats: Array<{ value: ExportFormat; label: string; description: string }> = [
    { value: "json", label: "JSON", description: "Структурированные данные" },
    { value: "csv", label: "CSV", description: "Таблица Excel" },
  ];

  // Функции для disabled календаря
  const isStartDateDisabled = (date: Date): boolean => {
    if (date > new Date()) return true;
    if (endDate && date > endDate) return true;
    return false;
  };

  const isEndDateDisabled = (date: Date): boolean => {
    if (date > new Date()) return true;
    if (startDate && date < startDate) return true;
    return false;
  };

  // Обработчики изменения с правильной типизацией
  const handleExportTypeChange = (value: string) => {
    setExportType(value as ExportType);
  };

  const handleExportFormatChange = (value: ExportFormat) => {
    setExportFormat(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div onClick={() => setIsOpen(true)}>
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Экспорт данных
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ошибка экспорта */}
          {exportError && (
            <Alert variant="destructive">
              <AlertDescription className="flex justify-between items-center">
                <span>{exportError}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearError}
                  className="h-auto p-1"
                >
                  ✕
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Тип экспорта */}
          <div className="space-y-2">
            <Label>Тип данных</Label>
            <Select value={exportType} onValueChange={handleExportTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportTypes.map(type => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Формат экспорта */}
          <div className="space-y-2">
            <Label>Формат файла</Label>
            <div className="grid grid-cols-2 gap-2">
              {exportFormats.map(fmt => (
                <div
                  key={fmt.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportFormat === fmt.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleExportFormatChange(fmt.value)}
                >
                  <div className="font-medium">{fmt.label}</div>
                  <div className="text-xs text-muted-foreground">{fmt.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Период */}
          <div className="space-y-2">
            <Label>Период (необязательно)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Начало</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd.MM.yyyy", { locale: ru }) : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={isStartDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label className="text-xs">Конец</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd.MM.yyyy", { locale: ru }) : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={isEndDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {(startDate || endDate) && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Очистить период
                </Button>
              </div>
            )}
          </div>

          {/* Информация о экспорте */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm">
              <div className="font-medium mb-1">Будет экспортировано:</div>
              <div className="text-muted-foreground">
                {exportTypes.find(t => t.value === exportType)?.label} в формате {exportFormat.toUpperCase()}
                {startDate && endDate && (
                  <div className="mt-1">
                    Период: {format(startDate, "dd.MM.yyyy", { locale: ru })} - {format(endDate, "dd.MM.yyyy", { locale: ru })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isExporting}>
              Отмена
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Экспорт...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Экспортировать
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
