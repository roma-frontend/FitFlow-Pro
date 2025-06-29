// components/admin/settings/IntegrationSettings.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Calendar, 
  CreditCard, 
  Mail, 
  TestTube,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

interface IntegrationSettingsProps {
  config: any;
  onUpdate: (updates: any) => void;
}

export function IntegrationSettings({ config, onUpdate }: IntegrationSettingsProps) {
  const testGoogleCalendar = async () => {
    alert('Тестирование подключения к Google Calendar...');
  };

  const testStripe = async () => {
    alert('Тестирование подключения к Stripe...');
  };

  const testMailchimp = async () => {
    alert('Тестирование подключения к Mailchimp...');
  };

  return (
    <div className="space-y-6">
      {/* Google Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
            <Switch
              checked={config.googleCalendar.enabled}
              onCheckedChange={(checked) => onUpdate({
                googleCalendar: { ...config.googleCalendar, enabled: checked }
              })}
            />
            {config.googleCalendar.enabled && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Подключено
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Синхронизация расписания тренировок с Google Calendar для тренеров и клиентов
          </p>

          {config.googleCalendar.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="googleClientId">Client ID</Label>
                  <Input
                    id="googleClientId"
                    value={config.googleCalendar.clientId}
                    onChange={(e) => onUpdate({
                      googleCalendar: { ...config.googleCalendar, clientId: e.target.value }
                    })}
                    placeholder="ваш-client-id.googleusercontent.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="googleClientSecret">Client Secret</Label>
                  <Input
                    id="googleClientSecret"
                    type="password"
                    value={config.googleCalendar.clientSecret}
                    onChange={(e) => onUpdate({
                      googleCalendar: { ...config.googleCalendar, clientSecret: e.target.value }
                    })}
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={testGoogleCalendar} variant="outline" size="sm">
                  <TestTube className="h-4 w-4 mr-2" />
                  Тестировать подключение
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Настройки API
                </Button>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Возможности интеграции:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Автоматическое создание событий в календаре</li>
                  <li>• Синхронизация изменений расписания</li>
                  <li>• Уведомления о предстоящих тренировках</li>
                  <li>• Двусторонняя синхронизация</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stripe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe
            <Switch
              checked={config.stripe.enabled}
              onCheckedChange={(checked) => onUpdate({
                stripe: { ...config.stripe, enabled: checked }
              })}
            />
            {config.stripe.enabled && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Подключено
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Обработка онлайн-платежей, подписок и автоматических списаний
          </p>

          {config.stripe.enabled && (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stripePublicKey">Публичный ключ</Label>
                  <Input
                    id="stripePublicKey"
                    value={config.stripe.publicKey}
                    onChange={(e) => onUpdate({
                      stripe: { ...config.stripe, publicKey: e.target.value }
                    })}
                    placeholder="pk_test_..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="stripeSecretKey">Секретный ключ</Label>
                  <Input
                    id="stripeSecretKey"
                    type="password"
                    value={config.stripe.secretKey}
                    onChange={(e) => onUpdate({
                      stripe: { ...config.stripe, secretKey: e.target.value }
                    })}
                    placeholder="sk_test_..."
                  />
                </div>

                <div>
                  <Label htmlFor="stripeWebhookSecret">Webhook Secret</Label>
                  <Input
                    id="stripeWebhookSecret"
                    type="password"
                    value={config.stripe.webhookSecret}
                    onChange={(e) => onUpdate({
                      stripe: { ...config.stripe, webhookSecret: e.target.value }
                    })}
                    placeholder="whsec_..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={testStripe} variant="outline" size="sm">
                  <TestTube className="h-4 w-4 mr-2" />
                  Тестировать подключение
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Панель Stripe
                </Button>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Поддерживаемые функции:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Разовые платежи за тренировки</li>
                  <li>• Подписки на абонементы</li>
                  <li>• Автоматические списания</li>
                  <li>• Возвраты и отмены</li>
                  <li>• Детальная отчетность</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mailchimp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Mailchimp
            <Switch
              checked={config.mailchimp.enabled}
              onCheckedChange={(checked) => onUpdate({
                mailchimp: { ...config.mailchimp, enabled: checked }
              })}
            />
            {config.mailchimp.enabled && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Подключено
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Email-маркетинг и автоматические рассылки для клиентов
          </p>

          {config.mailchimp.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mailchimpApiKey">API ключ</Label>
                  <Input
                    id="mailchimpApiKey"
                    type="password"
                    value={config.mailchimp.apiKey}
                    onChange={(e) => onUpdate({
                      mailchimp: { ...config.mailchimp, apiKey: e.target.value }
                    })}
                    placeholder="••••••••••••••••"
                  />
                </div>
                
                <div>
                                    <Label htmlFor="mailchimpListId">ID списка рассылки</Label>
                  <Input
                    id="mailchimpListId"
                    value={config.mailchimp.listId}
                    onChange={(e) => onUpdate({
                      mailchimp: { ...config.mailchimp, listId: e.target.value }
                    })}
                    placeholder="a1b2c3d4e5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={testMailchimp} variant="outline" size="sm">
                  <TestTube className="h-4 w-4 mr-2" />
                  Тестировать подключение
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Панель Mailchimp
                </Button>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Автоматические рассылки:</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Приветственные письма новым клиентам</li>
                  <li>• Напоминания о предстоящих тренировках</li>
                  <li>• Информация о новых программах</li>
                  <li>• Персональные предложения</li>
                  <li>• Опросы удовлетворенности</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Дополнительные интеграции */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Дополнительные интеграции
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telegram Bot */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                  <span className="font-medium">Telegram Bot</span>
                </div>
                <Badge variant="outline" className="bg-gray-50">
                  Скоро
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Уведомления и бронирование через Telegram
              </p>
              <Button variant="outline" size="sm" disabled>
                Настроить
              </Button>
            </div>

            {/* WhatsApp Business */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">W</span>
                  </div>
                  <span className="font-medium">WhatsApp Business</span>
                </div>
                <Badge variant="outline" className="bg-gray-50">
                  Скоро
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Общение с клиентами через WhatsApp
              </p>
              <Button variant="outline" size="sm" disabled>
                Настроить
              </Button>
            </div>

            {/* Apple Health */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">♥</span>
                  </div>
                  <span className="font-medium">Apple Health</span>
                </div>
                <Badge variant="outline" className="bg-gray-50">
                  Скоро
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Синхронизация данных о здоровье
              </p>
              <Button variant="outline" size="sm" disabled>
                Настроить
              </Button>
            </div>

            {/* Google Fit */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">F</span>
                  </div>
                  <span className="font-medium">Google Fit</span>
                </div>
                <Badge variant="outline" className="bg-gray-50">
                  Скоро
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Отслеживание активности и прогресса
              </p>
              <Button variant="outline" size="sm" disabled>
                Настроить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook настройки */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook уведомления</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Настройте webhook URL для получения уведомлений о событиях в системе
          </p>

          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              placeholder="https://your-app.com/webhook"
            />
          </div>

          <div>
            <Label>События для отправки</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                'Новая запись',
                'Отмена записи',
                'Новый платеж',
                'Новый клиент',
                'Изменение расписания',
                'Истечение абонемента'
              ].map(event => (
                <label key={event} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm">
            <TestTube className="h-4 w-4 mr-2" />
            Тестировать webhook
          </Button>
        </CardContent>
      </Card>

      {/* API настройки */}
      <Card>
        <CardHeader>
          <CardTitle>API доступ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Управление API ключами для интеграции с внешними системами
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Основной API ключ</div>
                <div className="text-sm text-gray-600">Полный доступ к API</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Активен</Badge>
                <Button variant="outline" size="sm">
                  Обновить
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Ключ только для чтения</div>
                <div className="text-sm text-gray-600">Доступ только к чтению данных</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Неактивен</Badge>
                <Button variant="outline" size="sm">
                  Создать
                </Button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Безопасность API</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Никогда не передавайте API ключи третьим лицам</li>
              <li>• Регулярно обновляйте ключи доступа</li>
              <li>• Используйте HTTPS для всех API запросов</li>
              <li>• Мониторьте использование API</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

