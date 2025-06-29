// components/admin/settings/SecuritySettings.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, AlertTriangle, Plus, X } from "lucide-react";
import { useState } from "react";

interface SecuritySettingsProps {
  config: any;
  onUpdate: (updates: any) => void;
}

export function SecuritySettings({ config, onUpdate }: SecuritySettingsProps) {
  const [newIP, setNewIP] = useState('');

  const addIPToWhitelist = () => {
    if (newIP && !config.accessControl.ipWhitelist.includes(newIP)) {
      onUpdate({
        accessControl: {
          ...config.accessControl,
          ipWhitelist: [...config.accessControl.ipWhitelist, newIP]
        }
      });
      setNewIP('');
    }
  };

  const removeIPFromWhitelist = (ip: string) => {
    onUpdate({
      accessControl: {
        ...config.accessControl,
        ipWhitelist: config.accessControl.ipWhitelist.filter((item: string) => item !== ip)
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Политика паролей */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Политика паролей
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="minLength">Минимальная длина пароля</Label>
            <Input
              id="minLength"
              type="number"
              value={config.passwordPolicy.minLength}
              onChange={(e) => onUpdate({
                passwordPolicy: {
                  ...config.passwordPolicy,
                  minLength: parseInt(e.target.value)
                }
              })}
              min="4"
              max="50"
              className="w-24"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Требовать заглавные буквы</Label>
                <p className="text-sm text-gray-600">Пароль должен содержать хотя бы одну заглавную букву</p>
              </div>
              <Switch
                checked={config.passwordPolicy.requireUppercase}
                onCheckedChange={(checked) => onUpdate({
                  passwordPolicy: {
                    ...config.passwordPolicy,
                    requireUppercase: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Требовать строчные буквы</Label>
                <p className="text-sm text-gray-600">Пароль должен содержать хотя бы одну строчную букву</p>
              </div>
              <Switch
                checked={config.passwordPolicy.requireLowercase}
                onCheckedChange={(checked) => onUpdate({
                  passwordPolicy: {
                    ...config.passwordPolicy,
                    requireLowercase: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Требовать цифры</Label>
                <p className="text-sm text-gray-600">Пароль должен содержать хотя бы одну цифру</p>
              </div>
              <Switch
                checked={config.passwordPolicy.requireNumbers}
                onCheckedChange={(checked) => onUpdate({
                  passwordPolicy: {
                    ...config.passwordPolicy,
                    requireNumbers: checked
                  }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Требовать специальные символы</Label>
                <p className="text-sm text-gray-600">Пароль должен содержать специальные символы (!@#$%^&*)</p>
              </div>
              <Switch
                checked={config.passwordPolicy.requireSpecialChars}
                onCheckedChange={(checked) => onUpdate({
                  passwordPolicy: {
                    ...config.passwordPolicy,
                    requireSpecialChars: checked
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки сессий */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Настройки сессий
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionTimeout">Время жизни сессии (минуты)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={config.sessionSettings.sessionTimeout}
                onChange={(e) => onUpdate({
                  sessionSettings: {
                    ...config.sessionSettings,
                    sessionTimeout: parseInt(e.target.value)
                  }
                })}
                min="5"
                max="1440"
              />
            </div>

            <div>
              <Label htmlFor="maxConcurrentSessions">Максимум одновременных сессий</Label>
              <Input
                id="maxConcurrentSessions"
                type="number"
                value={config.sessionSettings.maxConcurrentSessions}
                onChange={(e) => onUpdate({
                  sessionSettings: {
                    ...config.sessionSettings,
                    maxConcurrentSessions: parseInt(e.target.value)
                  }
                })}
                min="1"
                max="10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Двухфакторная аутентификация</Label>
              <p className="text-sm text-gray-600">Требовать 2FA для всех пользователей</p>
            </div>
            <Switch
              checked={config.sessionSettings.requireTwoFactor}
              onCheckedChange={(checked) => onUpdate({
                sessionSettings: {
                  ...config.sessionSettings,
                  requireTwoFactor: checked
                }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Контроль доступа */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Контроль доступа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxLoginAttempts">Максимум попыток входа</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={config.accessControl.maxLoginAttempts}
                onChange={(e) => onUpdate({
                  accessControl: {
                    ...config.accessControl,
                    maxLoginAttempts: parseInt(e.target.value)
                  }
                })}
                min="3"
                max="10"
              />
            </div>

            <div>
              <Label htmlFor="lockoutDuration">Время блокировки (минуты)</Label>
              <Input
                id="lockoutDuration"
                type="number"
                value={config.accessControl.lockoutDuration}
                onChange={(e) => onUpdate({
                  accessControl: {
                    ...config.accessControl,
                    lockoutDuration: parseInt(e.target.value)
                  }
                })}
                min="5"
                max="1440"
              />
            </div>
          </div>

          <div>
            <Label>Белый список IP-адресов</Label>
            <p className="text-sm text-gray-600 mb-2">
              Разрешенные IP-адреса для доступа к админ-панели
            </p>
            
            <div className="flex gap-2 mb-3">
              <Input
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                placeholder="192.168.1.1"
                className="flex-1"
              />
              <Button onClick={addIPToWhitelist} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {config.accessControl.ipWhitelist.map((ip: string, index: number) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {ip}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeIPFromWhitelist(ip)}
                  />
                </Badge>
              ))}
              {config.accessControl.ipWhitelist.length === 0 && (
                <p className="text-sm text-gray-500">Нет ограничений по IP</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Предупреждения безопасности */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Рекомендации по безопасности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Регулярное обновление паролей</h4>
                <p className="text-sm text-orange-700">
                  Рекомендуется менять пароли администраторов каждые 90 дней
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Мониторинг активности</h4>
                <p className="text-sm text-blue-700">
                  Регулярно проверяйте логи входов и подозрительную активность
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Lock className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Резервное копирование</h4>
                <p className="text-sm text-green-700">
                  Настройте автоматическое резервное копирование данных
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
