// components/dashboard/FaceIdManager.tsx - Умное управление Face ID
"use client";

import { useEffect, useState } from 'react';
import { useFaceIdSmart } from '@/hooks/useFaceIdSmart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Camera,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Monitor,
  Clock,
  Activity,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export function FaceIdManager() {
  const {
    profiles,
    currentProfileId,
    faceIdStatus,
    isRegistering,
    isScanning,
    isFaceIdRegistered,
    checkFaceIdStatus,
    loadUserProfiles,
    deleteFaceIdProfile,
    deleteAllFaceIdProfiles,
    smartScan
  } = useFaceIdSmart();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  // Загружаем данные при монтировании
  useEffect(() => {
    checkFaceIdStatus();
    loadUserProfiles();
  }, []);

  // Функция для определения иконки устройства
  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  // Функция для форматирования платформы
  const formatPlatform = (platform: string) => {
    const platformMap: Record<string, string> = {
      'macOS': 'macOS',
      'Windows': 'Windows',
      'Linux': 'Linux',
      'iOS': 'iOS',
      'Android': 'Android'
    };
    return platformMap[platform] || platform;
  };

  // Обработка удаления профиля
  const handleDeleteProfile = async () => {
    if (!selectedProfileId) return;

    const success = await deleteFaceIdProfile(selectedProfileId);
    if (success) {
      setDeleteConfirmOpen(false);
      setSelectedProfileId(null);
    }
  };

  // Обработка удаления всех профилей
  const handleDeleteAllProfiles = async () => {
    const success = await deleteAllFaceIdProfiles();
    if (success) {
      setDeleteAllConfirmOpen(false);
    }
  };

  // Обработка регистрации нового Face ID
  const handleRegisterFaceId = async () => {
    if (!videoRef) return;

    const success = await smartScan('register', videoRef);
    if (success) {
      setShowRegisterDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и статус */}
      <div className="relative flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Face ID</h2>
          <p className="text-muted-foreground">
            Управление биометрической аутентификацией
          </p>
        </div>
        
        <Badge variant={isFaceIdRegistered ? "default" : "secondary"} className="absolute right-2 top-2 text-sm">
          {isFaceIdRegistered ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Активен
            </>
          ) : (
            <>
              <AlertTriangle className="h-3 w-3 mr-1" />
              Не настроен
            </>
          )}
        </Badge>
      </div>

      {/* Статистика */}
      {faceIdStatus?.stats && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего профилей
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
              <p className="text-xs text-muted-foreground">
                из 3 возможных
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Активных
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profiles.filter(p => p.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                готовы к использованию
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего входов
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profiles.reduce((sum, p) => sum + p.usageCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                через Face ID
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Список профилей */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Face ID профили</CardTitle>
              <CardDescription>
                Зарегистрированные устройства и браузеры
              </CardDescription>
            </div>
            
            {profiles.length < 3 && (
              <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Регистрация нового Face ID</DialogTitle>
                    <DialogDescription>
                      Посмотрите в камеру для создания биометрического профиля
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-6">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <video
                        ref={(el) => setVideoRef(el)}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowRegisterDialog(false)}
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleRegisterFaceId}
                      disabled={isRegistering}
                      className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                    >
                      {isRegistering ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Регистрация...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Зарегистрировать
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <div className="text-center py-6">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                У вас нет зарегистрированных Face ID профилей
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Добавьте профиль для быстрого входа в систему
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    profile.id === currentProfileId
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getDeviceIcon(profile.deviceInfo.userAgent)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {formatPlatform(profile.deviceInfo.platform)}
                        </span>
                        {profile.id === currentProfileId && (
                          <Badge variant="secondary" className="text-xs">
                            Текущий
                          </Badge>
                        )}
                        {!profile.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Неактивен
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center space-x-4">
                          <span>
                            Создан: {format(new Date(profile.createdAt), 'dd MMM yyyy', { locale: ru })}
                          </span>
                          <span>•</span>
                          <span>
                            Использований: {profile.usageCount}
                          </span>
                        </div>
                        
                        {profile.lastUsedAt && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Последний вход: {format(new Date(profile.lastUsedAt), 'dd MMM в HH:mm', { locale: ru })}
                            </span>
                          </div>
                        )}
                        
                        <div className="text-xs">
                          Качество: {profile.confidence}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedProfileId(profile.id);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {/* Кнопка удаления всех профилей */}
              {profiles.length > 0 && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteAllConfirmOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить все профили
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Информация о безопасности */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>О безопасности Face ID</AlertTitle>
        <AlertDescription>
          Ваши биометрические данные хранятся в зашифрованном виде и никогда не передаются третьим лицам.
          Face ID использует математическое представление вашего лица и не хранит фотографии.
        </AlertDescription>
      </Alert>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить Face ID профиль?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Вы не сможете использовать Face ID 
              для входа с этого устройства.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProfile}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления всех */}
      <Dialog open={deleteAllConfirmOpen} onOpenChange={setDeleteAllConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить все Face ID профили?</DialogTitle>
            <DialogDescription>
              Это действие удалит все зарегистрированные Face ID профили. 
              Вы не сможете использовать Face ID для входа ни с одного устройства.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteAllConfirmOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllProfiles}
            >
              Удалить все
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}