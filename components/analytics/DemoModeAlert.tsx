"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface DemoModeAlertProps {
  isAvailable: boolean;
}

export function DemoModeAlert({ isAvailable }: DemoModeAlertProps) {
  if (isAvailable) return null;

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-yellow-800">
          <Activity className="h-5 w-5" />
          <span className="font-medium">Демонстрационный режим</span>
        </div>
        <p className="text-yellow-700 mt-1">
          Функции аналитики Convex недоступны. Показаны тестовые данные для
          демонстрации интерфейса.
        </p>
      </CardContent>
    </Card>
  );
}
