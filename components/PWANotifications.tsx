// components/PWANotifications.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  BellOff, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Smartphone,
  Volume2,
  VolumeX
} from 'lucide-react';
import { usePWANotifications, useAppNotifications } from '@/hooks/usePWANotifications';
import { toast } from '@/hooks/use-toast';

interface NotificationSettings {
  workoutReminders: boolean;
  membershipAlerts: boolean;
  systemUpdates: boolean;
  offlineSync: boolean;
  marketing: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export function PWANotifications() {
  const { permission, isSupported, requestPermission, showNotification } = usePWANotifications();
  const { showWelcome, showWorkoutReminder, showUpdateAvailable } = useAppNotifications();
  const [settings, setSettings] = useState<NotificationSettings>({
    workoutReminders: true,
    membershipAlerts: true,
    systemUpdates: true,
    offlineSync: false,
    marketing: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Загружаем сохраненные настройки
    const savedSettings = localStorage.getItem('pwa-notification-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse notification settings:', error);
      }
    }
  }, []);

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pwa-notification-settings', JSON.stringify(newSettings));
    
    toast({
      title: "Настройки сохранены",
      description: "Параметры уведомлений обновлены",
    });
  };

  const handlePermissionRequest = async () => {
    setIsLoading(true);
    
    try {
      const granted = await requestPermission();
      
      if (granted) {
        toast({
          title: "Уведомления разрешены",
          description: "Теперь вы будете получать push-уведомления",
        });
        
        // Показываем приветственное уведомление
        setTimeout(() => {
          showWelcome("Пользователь");
        }, 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Уведомления отклонены",
          description: "Вы можете включить их позже в настройках браузера",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось запросить разрешение на уведомления",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async (type: string) => {
    if (permission !== 'granted') {
      toast({
        variant: "destructive",
        title: "Разрешение требуется",
        description: "Сначала разрешите уведомления",
      });
      return;
    }

    try {
      switch (type) {
        case 'welcome':
          await showWelcome("Тестовый пользователь");
          break;
        case 'workout':
          await showWorkoutReminder("Силовая тренировка", "15:30");
          break;
        case 'update':
          await showUpdateAvailable();
          break;
        default:
          await showNotification("Тестовое уведомление", {
            body: "Это тестовое уведомление FitFlow Pro",
            tag: 'test',
            requireInteraction: false,
          });
      }
      
      toast({
        title: "Уведомление отправлено",
        description: "Проверьте ваши уведомления",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отправить тестовое уведомление",
      });
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const updateQuietHours = (key: keyof NotificationSettings['quietHours'], value: any) => {
    const newSettings = {
      ...settings,
      quietHours: {
        ...settings.quietHours,
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
          text: 'Разрешены',
          description: 'Уведомления активны'
        };
      case 'denied':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: BellOff,
          text: 'Заблокированы',
          description: 'Включите в настройках браузера'
        };
      default:
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: AlertCircle,
          text: 'Не определены',
          description: 'Требуется разрешение'
        };
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-gray-400" />
            Уведомления недоступны
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ваш браузер не поддерживает push-уведомления или они отключены
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getPermissionStatus();

  return (
    <div className="space-y-6">
      {/* Статус уведомлений */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Статус уведомлений
          </CardTitle>
          <CardDescription>
            Текущее состояние push-уведомлений
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${statusInfo.bgColor} rounded-xl flex items-center justify-center`}>
                <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />
              </div>
              <div>
                <div className={`font-semibold ${statusInfo.color}`}>
                  {statusInfo.text}
                </div>
                <div className="text-sm text-gray-600">
                  {statusInfo.description}
                </div>
              </div>
            </div>
            
            {permission !== 'granted' && (
              <Button
                onClick={handlePermissionRequest}
                disabled={isLoading}
                className="ml-4"
              >
                {isLoading ? 'Запрос...' : 'Разрешить'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Настройки уведомлений */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Настройки уведомлений
          </CardTitle>
          <CardDescription>
            Управление типами уведомлений
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Основные типы уведомлений */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Типы уведомлений</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Напоминания о тренировках</div>
                    <div className="text-sm text-gray-600">Уведомления о предстоящих занятиях</div>
                  </div>
                </div>
                <Switch
                  checked={settings.workoutReminders}
                  onCheckedChange={(checked) => updateSetting('workoutReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium">Оповещения о членстве</div>
                    <div className="text-sm text-gray-600">Напоминания об истечении абонемента</div>
                  </div>
                </div>
                <Switch
                  checked={settings.membershipAlerts}
                  onCheckedChange={(checked) => updateSetting('membershipAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Обновления системы</div>
                    <div className="text-sm text-gray-600">Новые версии и важные изменения</div>
                  </div>
                </div>
                <Switch
                  checked={settings.systemUpdates}
                  onCheckedChange={(checked) => updateSetting('systemUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">Офлайн синхронизация</div>
                    <div className="text-sm text-gray-600">Уведомления о синхронизации данных</div>
                  </div>
                </div>
                <Switch
                  checked={settings.offlineSync}
                  onCheckedChange={(checked) => updateSetting('offlineSync', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Дополнительные настройки */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Дополнительные настройки</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    {settings.soundEnabled ? 
                      <Volume2 className="h-4 w-4 text-blue-600" /> : 
                      <VolumeX className="h-4 w-4 text-gray-400" />
                    }
                  </div>
                  <div>
                    <div className="font-medium">Звуковые уведомления</div>
                    <div className="text-sm text-gray-600">Воспроизводить звук при уведомлениях</div>
                  </div>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Вибрация</div>
                    <div className="text-sm text-gray-600">Вибрация при получении уведомлений</div>
                  </div>
                </div>
                <Switch
                  checked={settings.vibrationEnabled}
                  onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Тихие часы */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Тихие часы</h4>
              <Switch
                checked={settings.quietHours.enabled}
                onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
              />
            </div>
            
            {settings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 pl-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Начало
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => updateQuietHours('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Конец
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => updateQuietHours('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Тестирование уведомлений */}
      <Card>
        <CardHeader>
          <CardTitle>Тестирование уведомлений</CardTitle>
          <CardDescription>
            Проверьте работу различных типов уведомлений
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={() => testNotification('welcome')}
              disabled={permission !== 'granted'}
              className="w-full"
            >
              Приветствие
            </Button>
            <Button
              variant="outline"
              onClick={() => testNotification('workout')}
              disabled={permission !== 'granted'}
              className="w-full"
            >
              Тренировка
            </Button>
            <Button
              variant="outline"
              onClick={() => testNotification('update')}
              disabled={permission !== 'granted'}
              className="w-full"
            >
              Обновление
            </Button>
            <Button
              variant="outline"
              onClick={() => testNotification('test')}
              disabled={permission !== 'granted'}
              className="w-full"
            >
              Тестовое
            </Button>
          </div>
          
          {permission !== 'granted' && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Для тестирования уведомлений необходимо сначала разрешить их в настройках браузера
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
