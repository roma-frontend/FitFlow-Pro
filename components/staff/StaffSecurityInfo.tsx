// components/staff/StaffSecurityInfo.tsx - улучшенная версия
"use client";

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const StaffSecurityInfo = memo(function StaffSecurityInfo() {
  const securityFeatures = [
    { icon: "🔐", text: "Повышенные требования к паролям" },
    { icon: "📧", text: "Обязательная проверка email адресов" },
    { icon: "🔍", text: "Логирование всех действий" },
    { icon: "⚠️", text: "Автоматическая блокировка при подозрительной активности" },
    { icon: "🔄", text: "Безопасное восстановление пароля" }
  ];

  return (
    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg text-red-900 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Безопасность персонала
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-red-800 space-y-3">
        <div className="space-y-3">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="flex items-start">
              <span className="text-red-600 mr-3 flex-shrink-0">{feature.icon}</span>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-white/60 rounded-lg border border-red-200">
          <p className="text-center font-medium text-red-900">
            🛡️ Максимальный уровень защиты
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
