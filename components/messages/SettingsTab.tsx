// components/messages/SettingsTab.tsx
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const SettingsTab = memo(() => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Уведомления</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingItem
            title="Email уведомления"
            description="Получать уведомления на email"
            isEnabled={true}
          />
          <SettingItem
            title="SMS уведомления"
            description="Получать SMS уведомления"
            isEnabled={false}
          />
          <SettingItem
            title="Push уведомления"
            description="Получать push уведомления"
            isEnabled={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Автоматические сообщения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingItem
            title="Напоминания о тренировках"
            description="За 24 часа до тренировки"
            isEnabled={true}
          />
          <SettingItem
            title="Напоминания об оплате"
            description="За 3 дня до истечения абонемента"
            isEnabled={true}
          />
          <SettingItem
            title="Приветственные сообщения"
            description="Новым участникам"
            isEnabled={true}
          />
        </CardContent>
      </Card>
    </div>
  );
});

const SettingItem = memo(({
  title,
  description,
  isEnabled
}: {
  title: string;
  description: string;
  isEnabled: boolean;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <Button variant="outline" size="sm">
      {isEnabled ? "Включено" : "Выключено"}
    </Button>
  </div>
));

SettingsTab.displayName = "SettingsTab";
