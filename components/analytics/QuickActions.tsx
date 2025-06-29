"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Download,
  Calendar,
  AlertTriangle,
  Eye
} from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Быстрые действия
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm">Экспорт отчета</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Настроить период</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">Уведомления</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Eye className="w-5 h-5" />
            <span className="text-sm">Детальный отчет</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
