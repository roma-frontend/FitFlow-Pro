// components/admin/dashboard/SecurityWidget.tsx - обновленная версия
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Camera, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Users,
  Eye
} from "lucide-react";
import { FaceIdSetup } from "@/components/face-id/FaceIdSetup";
import { faceIdUtils } from "@/utils/faceIdUtils"; // ✅ Используем те же утилиты
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function SecurityWidget() {
  const [showFaceIdSetup, setShowFaceIdSetup] = useState(false);
  const [faceIdStatus, setFaceIdStatus] = useState(() => faceIdUtils.getStatus());
  const router = useRouter()

  useEffect(() => {
    const status = faceIdUtils.getStatus();
    setFaceIdStatus(status);
  }, []);

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
            onComplete={(success: boolean, data?: any) => {
              if (success && data) {
                const profile = {
                  id: data.profileId || `face_${Date.now()}`,
                  userId: 'current_user',
                  created: new Date().toISOString(),
                  lastUsed: new Date().toISOString()
                };

                faceIdUtils.saveProfile(profile);
                setFaceIdStatus(faceIdUtils.getStatus());
                setShowFaceIdSetup(false);
                
                toast({
                  title: "Face ID настроен в Security! 🎉",
                  description: `Профиль: ${profile.id.slice(0, 8)}...`,
                });
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
        
        {/* ✅ Face ID статус с реальными данными */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Camera className="h-4 w-4 text-blue-600 mr-2" />
            <div>
              <div className="font-medium text-sm">Face ID</div>
              <div className="text-xs text-gray-600">
                {faceIdStatus.enabled ? `ID: ${faceIdStatus.profile?.id.slice(0, 8)}...` : 'Биометрический вход'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {faceIdStatus.enabled ? (
              <>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Активен
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFaceIdSetup(true)}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Настроить
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowFaceIdSetup(true)}
                className="bg-blue-600 hover:bg-blue-700"
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
            2 активные
          </Badge>
        </div>

        {/* ✅ Статистика безопасности */}
        {faceIdStatus.enabled && faceIdStatus.profile && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <Eye className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-900">Статистика Face ID</span>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <div>Создан: {new Date(faceIdStatus.profile.created).toLocaleDateString()}</div>
              {faceIdStatus.profile.lastUsed && (
                <div>Последний вход: {new Date(faceIdStatus.profile.lastUsed).toLocaleDateString()}</div>
              )}
            </div>
          </div>
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
          
          {/* ✅ Кнопка сброса Face ID */}
          {faceIdStatus.enabled && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                faceIdUtils.removeProfile();
                setFaceIdStatus(faceIdUtils.getStatus());
                toast({
                  title: "Face ID отключен",
                  description: "Биометрический профиль удален",
                });
              }}
            >
              <Camera className="h-3 w-3 mr-1" />
              Отключить Face ID
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
