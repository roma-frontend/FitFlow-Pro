// components/admin/settings/SystemSettings.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Settings, 
  AlertTriangle, 
  Activity, 
  HardDrive,
  Zap,
  FileText,
  Trash2,
  Download
} from "lucide-react";

interface SystemSettingsProps {
  config: any;
  onUpdate: (updates: any) => void;
}

export function SystemSettings({ config, onUpdate }: SystemSettingsProps) {
  const clearCache = async () => {
    // Имитация очистки кэша
    alert('Кэш очищен успешно!');
  };

  const clearLogs = async () => {
    if (confirm('Вы уверены, что хотите очистить все логи?')) {
      alert('Логи очищены успешно!');
    }
  };

  const exportLogs = () => {
    // Имитация экспорта логов
    alert('Логи экспортированы!');
  };

  return (
    <div className="space-y-6">
      {/* Режим обслуживания */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Режим обслуживания
            <Switch
              checked={config.maintenance.enabled}
              onCheckedChange={(checked) => onUpdate({
                maintenance: { ...config.maintenance, enabled: checked }
              })}
            />
            {config.maintenance.enabled && (
              <Badge variant="destructive">Активен</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.maintenance.enabled && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Сайт находится в режиме обслуживания</span>
              </div>
              <p className="text-sm text-red-700">
                Пользователи увидят страницу обслуживания вместо основного сайта
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="maintenanceMessage">Сообщение для пользователей</Label>
            <Textarea
              id="maintenanceMessage"
              value={config.maintenance.message}
              onChange={(e) => onUpdate({
                maintenance: { ...config.maintenance, message: e.target.value }
              })}
              placeholder="Сайт временно недоступен для технического обслуживания"
              rows={3}
            />
          </div>

          <div>
            <Label>Разрешенные IP-адреса</Label>
            <p className="text-sm text-gray-600 mb-2">
              IP-адреса, которые могут получить доступ к сайту во время обслуживания
            </p>
            <Input
              value={config.maintenance.allowedIPs.join(', ')}
              onChange={(e) => onUpdate({
                maintenance: {
                  ...config.maintenance,
                  allowedIPs: e.target.value.split(',').map((ip: string) => ip.trim()).filter(Boolean)
                }
              })}
              placeholder="127.0.0.1, 192.168.1.1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Настройки логирования */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Логирование
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Уровень логирования</Label>
              <Select 
                value={config.logging.level} 
                onValueChange={(value) => onUpdate({
                  logging: { ...config.logging, level: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Только ошибки</SelectItem>
                  <SelectItem value="warn">Предупреждения и ошибки</SelectItem>
                  <SelectItem value="info">Информация, предупреждения и ошибки</SelectItem>
                  <SelectItem value="debug">Все события (отладка)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="retentionDays">Хранить логи (дни)</Label>
              <Input
                id="retentionDays"
                type="number"
                value={config.logging.retentionDays}
                onChange={(e) => onUpdate({
                  logging: { ...config.logging, retentionDays: parseInt(e.target.value) }
                })}
                min="1"
                max="365"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт логов
            </Button>
            <Button variant="outline" onClick={clearLogs}>
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить логи
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Производительность */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Производительность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Кэширование</Label>
                <p className="text-sm text-gray-600">Включить кэширование для ускорения работы</p>
              </div>
              <Switch
                checked={config.performance.cacheEnabled}
                onCheckedChange={(checked) => onUpdate({
                  performance: { ...config.performance, cacheEnabled: checked }
                })}
              />
            </div>

            {config.performance.cacheEnabled && (
              <div>
                <Label htmlFor="cacheTTL">Время жизни кэша (секунды)</Label>
                <Input
                  id="cacheTTL"
                  type="number"
                  value={config.performance.cacheTTL}
                  onChange={(e) => onUpdate({
                    performance: { ...config.performance, cacheTTL: parseInt(e.target.value) }
                  })}
                  min="60"
                  max="86400"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Сжатие данных</Label>
                                <p className="text-sm text-gray-600">Сжимать ответы сервера для экономии трафика</p>
              </div>
              <Switch
                checked={config.performance.compressionEnabled}
                onCheckedChange={(checked) => onUpdate({
                  performance: { ...config.performance, compressionEnabled: checked }
                })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={clearCache}>
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить кэш
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Системная информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Системная информация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">База данных</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">PostgreSQL</div>
              <div className="text-sm text-blue-700">Версия 14.2</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Место на диске</span>
              </div>
              <div className="text-2xl font-bold text-green-900">75%</div>
              <div className="text-sm text-green-700">15.2 GB / 20 GB</div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">Загрузка CPU</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">23%</div>
              <div className="text-sm text-orange-700">Нормальная</div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800">Память</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">68%</div>
              <div className="text-sm text-purple-700">2.7 GB / 4 GB</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Последние события системы</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Последний запуск системы</span>
                <span className="text-gray-600">2024-01-15 09:30:00</span>
              </div>
              <div className="flex justify-between">
                <span>Последнее резервное копирование</span>
                <span className="text-gray-600">2024-01-15 03:00:00</span>
              </div>
              <div className="flex justify-between">
                <span>Последнее обновление</span>
                <span className="text-gray-600">2024-01-10 15:45:00</span>
              </div>
              <div className="flex justify-between">
                <span>Время работы</span>
                <span className="text-gray-600">5 дней 14 часов</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

