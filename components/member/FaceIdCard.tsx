// components/member/FaceIdCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, Shield, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface FaceIdStatus {
  isEnabled: boolean;
  lastUsed?: string;
  dateRegistered?: string;
  deviceCount?: number;
}

interface FaceIdCardProps {
  status: FaceIdStatus;
  isLoading: boolean;
  onTest: () => void;
  onDisable: () => void;
}

export default function FaceIdCard({ status, isLoading, onTest, onDisable }: FaceIdCardProps) {
  const router = useRouter();

  return (
    <Card className={`shadow-lg border-l-4 border-0 transition-all duration-300 ${
      isLoading 
        ? 'border-l-gray-300 bg-gradient-to-br from-gray-50 to-gray-100'
        : status.isEnabled 
          ? 'border-l-green-500 bg-gradient-to-br from-green-50 to-emerald-50' 
          : 'border-l-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50'
    }`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Scan className={`h-5 w-5 ${
            isLoading 
              ? 'text-gray-400' 
              : status.isEnabled 
                ? 'text-green-600' 
                : 'text-blue-600'
          }`} />
          Face ID
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          ) : status.isEnabled ? (
            <Badge className="bg-green-100 text-green-800 text-xs">
              Активен
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-600 text-xs">
              Не настроен
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <div>
                <p className="font-medium text-gray-600 text-sm">
                  Проверяем статус Face ID...
                </p>
              </div>
            </div>
          ) : status.isEnabled ? (
            <>
              <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 text-sm">
                    Face ID настроен
                  </p>
                  <p className="text-xs text-green-600">
                    Быстрый и безопасный вход
                  </p>
                </div>
              </div>
              
              {/* Дополнительная информация */}
              <div className="space-y-2 text-xs text-gray-600">
                {status.dateRegistered && (
                  <div className="flex justify-between">
                    <span>Настроен:</span>
                    <span className="font-medium">
                      {new Date(status.dateRegistered).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}
                {status.lastUsed && (
                  <div className="flex justify-between">
                    <span>Последний вход:</span>
                    <span className="font-medium">
                      {new Date(status.lastUsed).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}
                {status.deviceCount !== undefined && status.deviceCount > 0 && (
                  <div className="flex justify-between">
                    <span>Устройств:</span>
                    <span className="font-medium">{status.deviceCount}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={onTest}
                >
                  <Scan className="h-4 w-4 mr-1" />
                  Тест
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => router.push('/profile')}
                >
                  Настройки
                </Button>
              </div>

              {/* Кнопка отключения */}
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={onDisable}
              >
                Отключить Face ID
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800 text-sm">
                    Face ID не настроен
                  </p>
                  <p className="text-xs text-blue-600">
                    Настройте для быстрого входа
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push('/auth/face-auth?mode=setup')}
              >
                <Scan className="h-4 w-4 mr-2" />
                Настроить Face ID
              </Button>

              <div className="text-xs text-gray-500 text-center">
                Войдите по лицу за 2 секунды
              </div>

              {/* Преимущества */}
              <div className="space-y-2">
                <div className="text-xs text-gray-600">
                  <strong>Преимущества Face ID:</strong>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span>Вход за 2 секунды</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                    <span>Максимальная безопасность</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span>Данные не покидают устройство</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

