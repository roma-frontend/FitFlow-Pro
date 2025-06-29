// components/staff/StaffDevelopmentTools.tsx - улучшенная версия
"use client";

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Code } from "lucide-react";

interface StaffDevelopmentToolsProps {
  isLoading: boolean;
  onQuickLogin: () => Promise<void>;
}

export const StaffDevelopmentTools = memo(function StaffDevelopmentTools({
  isLoading,
  onQuickLogin
}: StaffDevelopmentToolsProps) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg text-yellow-900 flex items-center">
          <Code className="h-5 w-5 mr-2" />
          Инструменты разработки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onQuickLogin}
          variant="outline"
          size="sm"
          className="w-full text-sm bg-white hover:bg-yellow-50 border-yellow-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Входим...
            </>
          ) : (
            <>
              👑 Быстрый вход супер-админа
            </>
          )}
        </Button>
        <div className="p-3 bg-white/60 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700 text-center">
            🧪 Только для тестирования в режиме разработки
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
