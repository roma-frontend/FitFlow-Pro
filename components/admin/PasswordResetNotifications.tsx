// components/admin/PasswordResetNotifications.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
    Bell, 
  Mail, 
  Settings, 
  TestTube,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function PasswordResetNotifications() {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendTestNotification = async (type: 'reset' | 'changed') => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/test/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          email: testEmail,
          userType: 'member'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Тестовое письмо отправлено',
          description: `${type === 'reset' ? 'Письмо восстановления' : 'Уведомление о смене'} отправлено на ${testEmail}`
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка отправки',
        description: error instanceof Error ? error.message : 'Не удалось отправить письмо'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Email уведомления</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Статус email сервиса */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">SMTP сервис</h4>
              <Badge variant={process.env.SMTP_HOST ? 'default' : 'destructive'}>
                {process.env.SMTP_HOST ? 'Настроен' : 'Не настроен'}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Хост: {process.env.SMTP_HOST || 'Не указан'}</p>
              <p>Порт: {process.env.SMTP_PORT || 'Не указан'}</p>
              <p>Безопасность: {process.env.SMTP_SECURE === 'true' ? 'TLS' : 'STARTTLS'}</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Шаблоны писем</h4>
              <Badge variant="default">Готовы</Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                <span>Восстановление пароля</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                <span>Уведомление о смене</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                <span>HTML + текстовые версии</span>
              </div>
            </div>
          </div>
        </div>

        {/* Тестирование email */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
              <TestTube className="h-4 w-4 mr-2" />
              Тестирование email (только для разработки)
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email для тестирования
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="test@example.com"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => sendTestNotification('reset')}
                  disabled={loading || !testEmail}
                  size="sm"
                  variant="outline"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Тест восстановления
                </Button>
                
                <Button
                  onClick={() => sendTestNotification('changed')}
                  disabled={loading || !testEmail}
                  size="sm"
                  variant="outline"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Тест уведомления
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Настройки уведомлений */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Настройки уведомлений
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Письма восстановления</span>
                <Badge variant="default">Включено</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Отправляются при запросе сброса пароля
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Уведомления о смене</span>
                <Badge variant="default">Включено</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Отправляются после успешной смены пароля
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Защита от спама</span>
                <Badge variant="default">Активна</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Лимит: 1 письмо в 5 минут на email
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Логирование</span>
                <Badge variant="default">Включено</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Все отправки записываются в журнал
              </p>
            </div>
          </div>
        </div>

        {/* Статистика email */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Статистика за последние 24 часа
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-700">0</div>
              <div className="text-blue-600">Восстановлений</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-700">0</div>
              <div className="text-blue-600">Уведомлений</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-700">100%</div>
              <div className="text-green-600">Доставлено</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-700">0</div>
              <div className="text-red-600">Ошибок</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
 
  
