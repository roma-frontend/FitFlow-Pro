// hooks/useAnalyticsExport.ts
"use client";

import { useState } from 'react';

export function useAnalyticsExport() {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportToCSV = async (data: any, filename: string) => {
    try {
      setExporting(true);
      setExportError(null);

      // Преобразуем данные в CSV формат
      const csvContent = convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      downloadFile(blob, `${filename}.csv`);
    } catch (error) {
      setExportError('Ошибка экспорта в CSV');
      console.error('CSV export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async (data: any, filename: string) => {
    try {
      setExporting(true);
      setExportError(null);

      const response = await fetch('/api/analytics/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('PDF export failed');
      }

      const blob = await response.blob();
      downloadFile(blob, `${filename}.pdf`);
    } catch (error) {
      setExportError('Ошибка экспорта в PDF');
      console.error('PDF export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async (data: any, filename: string) => {
    try {
      setExporting(true);
      setExportError(null);

      const response = await fetch('/api/analytics/export/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Excel export failed');
      }

      const blob = await response.blob();
      downloadFile(blob, `${filename}.xlsx`);
    } catch (error) {
      setExportError('Ошибка экспорта в Excel');
      console.error('Excel export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    exportError,
    exportToCSV,
    exportToPDF,
    exportToExcel
  };
}

// Утилиты для экспорта
function convertToCSV(data: any): string {
  const headers = Object.keys(data);
  const csvRows = [];
  
  // Добавляем заголовки
  csvRows.push(headers.join(','));
  
  // Добавляем данные (упрощенная версия)
  // В реальном проекте нужна более сложная логика
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      value.forEach(item => {
        csvRows.push(Object.values(item).join(','));
      });
    }
  }
  
  return csvRows.join('\n');
}

function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
