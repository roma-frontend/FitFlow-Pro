// components/admin/settings/notificationSettings: ,.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Bell, Send, TestTube } from "lucide-react";

interface NotificationSettingsProps {
  config: any;
  onUpdate: (updates: any) => void;
}

export function NotificationSettings({ config, onUpdate }: NotificationSettingsProps) {
  const testEmailConnection = async () => {
    // Имитация тестирования email соединения
    alert('Тестовое письмо отправлено!');
  };

  const testSMSConnection = async () => {
    // Имитация тестирования SMS соединения
    alert('Тестовое SMS отправлено!');
  };

  return (
    <div className="space-y-6">
      {/* Email настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email уведомления
            <Switch
              checked={config.email.enabled}
              onCheckedChange={(checked) => onUpdate({
                email: { ...config.email, enabled: checked }
              })}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.email.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP сервер</Label>
                  <Input
                    id="smtpHost"
                    value={config.email.smtpHost}
                    onChange={(e) => onUpdate({
                      email: { ...config.email, smtpHost: e.target.value }
                    })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtpPort">SMTP порт</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={config.email.smtpPort}
                    onChange={(e) => onUpdate({
                      email: { ...config.email, smtpPort: parseInt(e.target.value) }
                    })}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpUser">SMTP пользователь</Label>
                  <Input
                    id="smtpUser"
                    value={config.email.smtpUser}
                    onChange={(e) => onUpdate({
                      email: { ...config.email, smtpUser: e.target.value }
                    })}
                    placeholder="noreply@fitaccess.ru"
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtpPassword">SMTP пароль</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={config.email.smtpPassword}
                    onChange={(e) => onUpdate({
                      email: { ...config.email, smtpPassword: e.target.value }
                    })}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromEmail">Email отправителя</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={config.email.fromEmail}
                    onChange={(e) => onUpdate({
                      email: { ...config.email, fromEmail: e.target.value }
                    })}
                    placeholder="noreply@fitaccess.ru"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fromName">Имя отправителя</Label>
                  <Input
                    id="fromName"
                    value={config.email.fromName}
                    onChange={(e) => onUpdate({
                      email: { ...config.email, fromName: e.target.value }
                    })}
                    placeholder="FitAccess"
                  />
                </div>
              </div>

              <Button onClick={testEmailConnection} variant="outline" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Тестировать соединение
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMS настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            SMS уведомления
            <Switch
              checked={config.sms.enabled}
              onCheckedChange={(checked) => onUpdate({
                sms: { ...config.sms, enabled: checked }
              })}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.sms.enabled && (
            <>
              <div>
                <Label htmlFor="smsProvider">SMS провайдер</Label>
                <Select 
                  value={config.sms.provider} 
                  onValueChange={(value) => onUpdate({
                    sms: { ...config.sms, provider: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="sms_ru">SMS.RU</SelectItem>
                    <SelectItem value="smsc">SMSC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smsApiKey">API ключ</Label>
                  <Input
                    id="smsApiKey"
                    type="password"
                    value={config.sms.apiKey}
                    onChange={(e) => onUpdate({
                      sms: { ...config.sms, apiKey: e.target.value }
                    })}
                    placeholder="••••••••••••••••"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fromNumber">Номер отправителя</Label>
                  <Input
                    id="fromNumber"
                    value={config.sms.fromNumber}
                    onChange={(e) => onUpdate({
                      sms: { ...config.sms, fromNumber: e.target.value }
                    })}
                    placeholder="+7 (495) 123-45-67"
                  />
                </div>
              </div>

              <Button onClick={testSMSConnection} variant="outline" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Тестировать соединение
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push уведомления */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push уведомления
            <Switch
              checked={config.push.enabled}
              onCheckedChange={(checked) => onUpdate({
                push: { ...config.push, enabled: checked }
              })}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.push.enabled && (
            <div>
              <Label htmlFor="firebaseKey">Firebase Server Key</Label>
              <Input
                id="firebaseKey"
                type="password"
                value={config.push.firebaseKey}
                onChange={(e) => onUpdate({
                  push: { ...config.push, firebaseKey: e.target.value }
                })}
                placeholder="••••••••••••••••••••••••••••••••"
              />
              <p className="text-sm text-gray-600 mt-1">
                Получите ключ в консоли Firebase для отправки push-уведомлений
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Шаблоны уведомлений */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Автоматические уведомления
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { key: 'bookingConfirmation', name: 'Подтверждение бронирования', description: 'Отправлять при создании новой записи' },
              { key: 'bookingReminder', name: 'Напоминание о тренировке', description: 'Отправлять за 24 часа до тренировки' },
              { key: 'paymentDue', name: 'Напоминание об оплате', description: 'Отправлять при приближении срока платежа' },
              { key: 'membershipExpiry', name: 'Истечение абонемента', description: 'Отправлять за 3 дня до окончания абонемента' },
              { key: 'welcomeMessage', name: 'Приветственное сообщение', description: 'Отправлять новым участникам при регистрации' }
            ].map(template => (
              <div key={template.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-600">{template.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.templates[template.key]}
                    onCheckedChange={(checked) => onUpdate({
                      templates: { ...config.templates, [template.key]: checked }
                    })}
                  />
                  <Button variant="outline" size="sm">
                    Настроить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
