// components/admin/dashboard/SecurityWidget.tsx - Интегрированная версия
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Camera, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Users,
  Eye,
  Fingerprint,
  RefreshCw
} from "lucide-react";
import { useFaceIdSmart } from "@/hooks/useFaceIdSmart";
import { FaceIdSetup } from "@/components/face-id/FaceIdSetup";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export function SecurityWidget() {
  const router = useRouter();
  const {
    isFaceIdRegistered,
    faceIdStatus,
    profiles,
    checkFaceIdStatus,
    deleteFaceIdProfile,
    deleteAllFaceIdProfiles,
    user
  } = useFaceIdSmart();

  const [showFaceIdSetup, setShowFaceIdSetup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Проверяем статус при монтировании
  useEffect(() => {
    checkFaceIdStatus();
  }, []);

  // Обработчик удаления Face ID
  const handleDeleteFaceId = async () => {
    if (!confirm("Вы уверены, что хотите отключить Face ID? Все биометрические профили будут удалены.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteAllFaceIdProfiles();
      if (success) {
        await checkFaceIdStatus(); // Обновляем статус
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Если показываем настройку Face ID
  if (showFaceIdSetup) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Camera className="h-5 w-5 mr-2 text-blue-600" />
              Настройка Face ID
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFaceIdSetup(false)}
            >
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FaceIdSetup 
            onComplete={(success: boolean) => {
              if (success) {
                checkFaceIdStatus(); // Обновляем статус
                setShowFaceIdSetup(false);
              }
            }} 
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-green-600" />
          Центр безопасности
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Face ID статус с реальными данными из API */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Camera className="h-4 w-4 text-blue-600 mr-2" />
            <div>
              <div className="font-medium text-sm">Face ID</div>
              <div className="text-xs text-gray-600">
                {isFaceIdRegistered 
                  ? `${profiles.length} профиль${profiles.length > 1 ? 'ей' : ''} активно`
                  : 'Биометрический вход'
                }
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isFaceIdRegistered ? (
              <>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Активен
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push('/member-dashboard?tab=security')}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Управление
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowFaceIdSetup(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                disabled={!user}
              >
                <Camera className="h-3 w-3 mr-1" />
                Настроить
              </Button>
            )}
          </div>
        </div>

        {/* 2FA статус */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Lock className="h-4 w-4 text-gray-600 mr-2" />
            <div>
              <div className="font-medium text-sm">Двухфакторная аутентификация</div>
              <div className="text-xs text-gray-600">2FA через SMS/Email</div>
            </div>
          </div>
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Не настроена
          </Badge>
        </div>

        {/* Активные сессии */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Users className="h-4 w-4 text-gray-600 mr-2" />
            <div>
              <div className="font-medium text-sm">Активные сессии</div>
              <div className="text-xs text-gray-600">Текущие входы в систему</div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            1 активная
          </Badge>
        </div>

        {/* Детальная статистика Face ID */}
        {isFaceIdRegistered && faceIdStatus?.profile && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Eye className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">Статистика Face ID</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => checkFaceIdStatus()}
                className="h-6 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <div className="flex justify-between">
                <span>Создан:</span>
                <span className="font-medium">
                  {format(new Date(faceIdStatus.profile.createdAt), 'dd MMM yyyy', { locale: ru })}
                </span>
              </div>
              {faceIdStatus.profile.lastUsedAt && (
                <div className="flex justify-between">
                  <span>Последний вход:</span>
                  <span className="font-medium">
                    {format(new Date(faceIdStatus.profile.lastUsedAt), 'dd MMM в HH:mm', { locale: ru })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Использований:</span>
                <span className="font-medium">{faceIdStatus.profile.usageCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Устройство:</span>
                <span className="font-medium">
                  {faceIdStatus.profile.deviceInfo?.platform || 'Неизвестно'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Предупреждение для неавторизованных */}
        {!user && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Для настройки Face ID необходимо войти в систему
            </AlertDescription>
          </Alert>
        )}

        {/* Быстрые действия безопасности */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => router.push('/admin/security')}
          >
            <Settings className="h-3 w-3 mr-1" />
            Все настройки безопасности
          </Button>

          {/* Кнопка тестирования Face ID */}
          {isFaceIdRegistered && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => router.push('/auth/face-auth')}
            >
              <Fingerprint className="h-3 w-3 mr-1" />
              Тестировать Face ID вход
            </Button>
          )}
          
          {/* Кнопка удаления Face ID */}
          {isFaceIdRegistered && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDeleteFaceId}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Удаление...
                </>
              ) : (
                <>
                  <Camera className="h-3 w-3 mr-1" />
                  Отключить Face ID
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}