// components/admin/products/FilterManager.tsx
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, RotateCcw, Settings } from 'lucide-react';

export const FilterManager = memo(function FilterManager() {
  const handleExport = () => {
    // Логика экспорта фильтров
    console.log('Export filters');
  };

  const handleImport = () => {
    // Логика импорта фильтров
    console.log('Import filters');
  };

  const handleReset = () => {
    // Логика сброса фильтров
    console.log('Reset filters');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings className="h-4 w-4" />
          Управление фильтрами
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-1 justify-start"
          >
            <RotateCcw className="h-3 w-3" />
            Сбросить
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-1 justify-start"
          >
            <Download className="h-3 w-3" />
            Экспорт
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="flex items-center gap-1 justify-start"
          >
            <Upload className="h-3 w-3" />
            Импорт
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
