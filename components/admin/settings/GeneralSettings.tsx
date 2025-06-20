// components/admin/settings/GeneralSettings.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building, Clock, CreditCard, Calendar } from "lucide-react";

interface GeneralSettingsProps {
  config: any;
  businessConfig: any;
  onUpdate: (updates: any) => void;
  onBusinessUpdate: (updates: any) => void;
}

export function GeneralSettings({ config, businessConfig, onUpdate, onBusinessUpdate }: GeneralSettingsProps) {
  const weekDays = [
    { key: 'monday', name: 'Понедельник' },
    { key: 'tuesday', name: 'Вторник' },
    { key: 'wednesday', name: 'Среда' },
    { key: 'thursday', name: 'Четверг' },
    { key: 'friday', name: 'Пятница' },
    { key: 'saturday', name: 'Суббота' },
    { key: 'sunday', name: 'Воскресенье' }
  ];

  const updateWorkingHours = (day: string, field: string, value: any) => {
    onBusinessUpdate({
      workingHours: {
        ...businessConfig.workingHours,
        [day]: {
          ...businessConfig.workingHours[day],
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Основная информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Название организации</Label>
              <Input
                id="siteName"
                value={config.siteName}
                onChange={(e) => onUpdate({ siteName: e.target.value })}
                placeholder="FitAccess"
              />
            </div>
            
            <div>
              <Label htmlFor="contactPhone">Телефон</Label>
              <Input
                id="contactPhone"
                value={config.contactPhone}
                onChange={(e) => onUpdate({ contactPhone: e.target.value })}
                placeholder="+7 (495) 123-45-67"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="siteDescription">Описание</Label>
            <Textarea
              id="siteDescription"
              value={config.siteDescription}
              onChange={(e) => onUpdate({ siteDescription: e.target.value })}
              placeholder="Краткое описание вашего фитнес-центра"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={config.contactEmail}
                onChange={(e) => onUpdate({ contactEmail: e.target.value })}
                placeholder="info@fitaccess.ru"
              />
            </div>
            
            <div>
              <Label htmlFor="currency">Валюта</Label>
              <Select value={config.currency} onValueChange={(value) => onUpdate({ currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">Российский рубль (₽)</SelectItem>
                  <SelectItem value="USD">Доллар США ($)</SelectItem>
                  <SelectItem value="EUR">Евро (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={config.address}
              onChange={(e) => onUpdate({ address: e.target.value })}
              placeholder="г. Москва, ул. Спортивная, д. 1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">Часовой пояс</Label>
              <Select value={config.timezone} onValueChange={(value) => onUpdate({ timezone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                  <SelectItem value="Europe/Kiev">Киев (UTC+2)</SelectItem>
                  <SelectItem value="Asia/Almaty">Алматы (UTC+6)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="language">Язык</Label>
              <Select value={config.language} onValueChange={(value) => onUpdate({ language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="uk">Українська</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Часы работы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Часы работы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weekDays.map(day => (
              <div key={day.key} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="w-24">
                  <span className="font-medium">{day.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!businessConfig.workingHours[day.key]?.closed}
                    onCheckedChange={(checked) => updateWorkingHours(day.key, 'closed', !checked)}
                  />
                  <span className="text-sm text-gray-600">
                    {businessConfig.workingHours[day.key]?.closed ? 'Закрыто' : 'Открыто'}
                  </span>
                </div>

                {!businessConfig.workingHours[day.key]?.closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">с</Label>
                      <Input
                        type="time"
                        value={businessConfig.workingHours[day.key]?.start || '09:00'}
                        onChange={(e) => updateWorkingHours(day.key, 'start', e.target.value)}
                        className="w-24"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">до</Label>
                      <Input
                        type="time"
                        value={businessConfig.workingHours[day.key]?.end || '18:00'}
                        onChange={(e) => updateWorkingHours(day.key, 'end', e.target.value)}
                        className="w-24"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Настройки бронирования */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Настройки бронирования
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="advanceBookingDays">Максимальный период бронирования (дни)</Label>
              <Input
                id="advanceBookingDays"
                type="number"
                value={businessConfig.bookingSettings.advanceBookingDays}
                onChange={(e) => onBusinessUpdate({
                  bookingSettings: {
                    ...businessConfig.bookingSettings,
                    advanceBookingDays: parseInt(e.target.value)
                  }
                })}
                min="1"
                max="365"
              />
            </div>
            
            <div>
              <Label htmlFor="cancellationHours">Минимальное время отмены (часы)</Label>
              <Input
                id="cancellationHours"
                type="number"
                value={businessConfig.bookingSettings.cancellationHours}
                onChange={(e) => onBusinessUpdate({
                  bookingSettings: {
                    ...businessConfig.bookingSettings,
                    cancellationHours: parseInt(e.target.value)
                  }
                })}
                min="1"
                max="168"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Автоматическое подтверждение бронирований</Label>
                <p className="text-sm text-gray-600">Бронирования будут подтверждаться автоматически</p>
              </div>
              <Switch
                checked={businessConfig.bookingSettings.autoConfirmBookings}
                                onCheckedChange={(checked) => onBusinessUpdate({
                  bookingSettings: {
                    ...businessConfig.bookingSettings,
                    autoConfirmBookings: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Разрешить лист ожидания</Label>
                <p className="text-sm text-gray-600">Клиенты могут записаться в лист ожидания при отсутствии мест</p>
              </div>
              <Switch
                checked={businessConfig.bookingSettings.allowWaitlist}
                onCheckedChange={(checked) => onBusinessUpdate({
                  bookingSettings: {
                    ...businessConfig.bookingSettings,
                    allowWaitlist: checked
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки платежей */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Настройки платежей
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Принимаемые способы оплаты</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { key: 'card', name: 'Банковская карта' },
                { key: 'cash', name: 'Наличные' },
                { key: 'bank_transfer', name: 'Банковский перевод' },
                { key: 'mobile_payment', name: 'Мобильные платежи' }
              ].map(method => (
                <Badge
                  key={method.key}
                  variant={businessConfig.paymentSettings.acceptedMethods.includes(method.key) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const methods = businessConfig.paymentSettings.acceptedMethods;
                    const newMethods = methods.includes(method.key)
                      ? methods.filter((m: string) => m !== method.key)
                      : [...methods, method.key];
                    
                    onBusinessUpdate({
                      paymentSettings: {
                        ...businessConfig.paymentSettings,
                        acceptedMethods: newMethods
                      }
                    });
                  }}
                >
                  {method.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lateFeeAmount">Штраф за просрочку (₽)</Label>
              <Input
                id="lateFeeAmount"
                type="number"
                value={businessConfig.paymentSettings.lateFeeAmount}
                onChange={(e) => onBusinessUpdate({
                  paymentSettings: {
                    ...businessConfig.paymentSettings,
                    lateFeeAmount: parseInt(e.target.value)
                  }
                })}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="gracePeriodDays">Льготный период (дни)</Label>
              <Input
                id="gracePeriodDays"
                type="number"
                value={businessConfig.paymentSettings.gracePeriodDays}
                onChange={(e) => onBusinessUpdate({
                  paymentSettings: {
                    ...businessConfig.paymentSettings,
                    gracePeriodDays: parseInt(e.target.value)
                  }
                })}
                min="0"
                max="30"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Автоматическое списание средств</Label>
              <p className="text-sm text-gray-600">Автоматически списывать средства при наступлении срока платежа</p>
            </div>
            <Switch
              checked={businessConfig.paymentSettings.autoChargeEnabled}
              onCheckedChange={(checked) => onBusinessUpdate({
                paymentSettings: {
                  ...businessConfig.paymentSettings,
                  autoChargeEnabled: checked
                }
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

