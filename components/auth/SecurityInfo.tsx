"use client";

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface SecurityInfoProps {
  isLogin: boolean;
}

export const SecurityInfo = memo(function SecurityInfo({ isLogin }: SecurityInfoProps) {
  const features = [
    "Улучшенная проверка email адресов",
    "Анализ безопасности паролей",
    "Защищенная передача данных",
    "Безопасное восстановление пароля",
    ...(isLogin ? [] : ["Валидация в реальном времени"])
  ];

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-green-900 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          {isLogin ? "Безопасный вход" : "Защищенная регистрация"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-green-800 space-y-2">
          <div className="grid grid-cols-1 gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-white/50 rounded-md">
            <p className="text-center font-medium">
              {isLogin
                ? "🔐 Ваши данные защищены"
                : "✨ Создайте надежный аккаунт"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
