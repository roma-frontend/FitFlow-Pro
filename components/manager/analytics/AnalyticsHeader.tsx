// components/manager/analytics/AnalyticsHeader.tsx (обновленная версия)
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, RefreshCw, FileText, FileSpreadsheet, FileImage } from "lucide-react";
import { useAnalyticsExport } from "@/hooks/useAnalyticsExport";

interface AnalyticsHeaderProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  data?: any;
}

export default function AnalyticsHeader({ 
  timeRange, 
  onTimeRangeChange, 
  onRefresh, 
  refreshing,
  data
}: AnalyticsHeaderProps) {
  const { exporting, exportToCSV, exportToPDF, exportToExcel } = useAnalyticsExport();

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    if (!data) return;
    
    const filename = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'csv':
        await exportToCSV(data, filename);
        break;
      case 'pdf':
        await exportToPDF(data, filename);
        break;
      case 'excel':
        await exportToExcel(data, filename);
        break;
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Аналитика и отчеты
        </h1>
        <p className="text-gray-600">
          Подробная статистика работы фитнес-центра
        </p>
      </div>
      
      <div className="flex items-center gap-3 mt-4 md:mt-0">
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Последняя неделя</SelectItem>
            <SelectItem value="month">Последний месяц</SelectItem>
            <SelectItem value="quarter">Последний квартал</SelectItem>
            <SelectItem value="year">Последний год</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              className="flex items-center gap-2"
              disabled={exporting || !data}
            >
              <Download className="h-4 w-4" />
              Экспорт
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Экспорт в CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Экспорт в Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="mr-2 h-4 w-4" />
              Экспорт в PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
