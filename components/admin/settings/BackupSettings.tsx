// components/admin/settings/BackupSettings.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Download, 
  Upload, 
  Clock, 
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Play,
  Settings
} from "lucide-react";

interface BackupRecord {
  id: string;
  name: string;
  size: string;
  type: 'auto' | 'manual';
  status: 'completed' | 'failed' | 'in_progress';
  createdAt: string;
}

export function BackupSettings() {
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState('daily');
  const [backupTime, setBackupTime] = useState('03:00');
  const [retentionDays, setRetentionDays] = useState(30);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const [backups] = useState<BackupRecord[]>([
    {
      id: '1',
      name: 'backup_2024_01_15_03_00.sql',
      size: '45.2 MB',
      type: 'auto',
      status: 'completed',
      createdAt: '2024-01-15T03:00:00Z'
    },
    {
      id: '2',
      name: 'backup_2024_01_14_03_00.sql',
      size: '44.8 MB',
      type: 'auto',
      status: 'completed',
      createdAt: '2024-01-14T03:00:00Z'
    },
    {
      id: '3',
      name: 'manual_backup_2024_01_13.sql',
      size: '44.5 MB',
      type: 'manual',
      status: 'completed',
      createdAt: '2024-01-13T15:30:00Z'
    },
    {
      id: '4',
      name: 'backup_2024_01_12_03_00.sql',
      size: '0 MB',
      type: 'auto',
      status: 'failed',
      createdAt: '2024-01-12T03:00:00Z'
    }
  ]);

  const createManualBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Имитация создания резервной копии
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('Резервная копия создана успешно!');
    } catch (error) {
      alert('Ошибка создания резервной копии');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = (backup: BackupRecord) => {
    // Имитация скачивания
    alert(`Скачивание ${backup.name}`);
  };

  const deleteBackup = (backupId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту резервную копию?')) {
      alert('Резервная копия удалена');
    }
  };

  const restoreBackup = (backup: BackupRecord) => {
    if (confirm('Восстановление из резервной копии заменит все текущие данные. Продолжить?')) {
      alert(`Восстановление из ${backup.name} начато`);
    }
  };

  const getStatusInfo = (status: BackupRecord['status']) => {
    const statuses = {
      completed: { name: 'Завершено', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { name: 'Ошибка', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      in_progress: { name: 'Выполняется', color: 'bg-blue-100 text-blue-800', icon: Clock }
    };
    return statuses[status];
  };

  return (
    <div className="space-y-6">
      {/* Настройки автоматического резервного копирования */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Автоматическое резервное копирование
            <Switch
              checked={autoBackupEnabled}
              onCheckedChange={setAutoBackupEnabled}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {autoBackupEnabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Периодичность</Label>
                  <select 
                    value={backupSchedule}
                    onChange={(e) => setBackupSchedule(e.target.value)}
                    className="w-full p-2 border rounded-md mt-1"
                  >
                    <option value="daily">Ежедневно</option>
                    <option value="weekly">Еженедельно</option>
                    <option value="monthly">Ежемесячно</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="backupTime">Время создания</Label>
                  <Input
                    id="backupTime"
                    type="time"
                    value={backupTime}
                    onChange={(e) => setBackupTime(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="retentionDays">Хранить (дни)</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Следующее резервное копирование</span>
                </div>
                <p className="text-sm text-blue-700">
                  Завтра в {backupTime} (через {Math.ceil((new Date().setHours(parseInt(backupTime.split(':')[0]), parseInt(backupTime.split(':')[1])) - Date.now()) / (1000 * 60 * 60))} часов)
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ручное создание резервной копии */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Ручное резервное копирование
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Создать резервную копию сейчас</h4>
              <p className="text-sm text-gray-600">
                Создание полной резервной копии всех данных системы
              </p>
            </div>
            <Button 
              onClick={createManualBackup}
              disabled={isCreatingBackup}
              className="flex items-center gap-2"
            >
              {isCreatingBackup ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Создать копию
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Список резервных копий */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Резервные копии
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.map(backup => {
              const statusInfo = getStatusInfo(backup.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Database className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="font-medium">{backup.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        <span>Размер: {backup.size}</span>
                        <span>Создано: {new Date(backup.createdAt).toLocaleString('ru')}</span>
                        <Badge variant="outline" className={backup.type === 'auto' ? 'bg-blue-50' : 'bg-purple-50'}>
                          {backup.type === 'auto' ? 'Автоматическая' : 'Ручная'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.name}
                    </Badge>

                    {backup.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadBackup(backup)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => restoreBackup(backup)}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Database className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {backups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
                            <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Резервные копии не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Настройки хранения */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки хранения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Локальное хранение</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Максимальный размер</span>
                  <span className="text-sm font-medium">500 MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Использовано</span>
                  <span className="text-sm font-medium">134.5 MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '27%' }}></div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Облачное хранение</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Статус</span>
                  <Badge variant="outline" className="bg-gray-50">
                    Не настроено
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Настроить облачное хранение
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Рекомендации</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Настройте облачное хранение для дополнительной безопасности</li>
              <li>• Регулярно проверяйте целостность резервных копий</li>
              <li>• Храните копии в нескольких местах</li>
              <li>• Тестируйте процедуру восстановления</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Импорт/экспорт данных */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Импорт и экспорт данных
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Экспорт данных</h4>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт пользователей
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт расписания
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт платежей
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Полный экспорт
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Импорт данных</h4>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Импорт пользователей
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Импорт расписания
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Импорт из CSV
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Восстановление из копии
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

