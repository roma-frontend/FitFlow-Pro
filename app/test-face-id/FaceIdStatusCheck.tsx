// app/test-face-id/FaceIdStatusCheck.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, Database, Cloud, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FaceIdStatus {
  localRegistered: boolean;
  convexRegistered: boolean;
  profileId: string | null;
  userName: string | null;
  lastChecked: string | null;
  isChecking: boolean;
  error: string | null;
}

export default function FaceIdStatusCheck() {
  const [status, setStatus] = useState<FaceIdStatus>({
    localRegistered: false,
    convexRegistered: false,
    profileId: null,
    userName: null,
    lastChecked: null,
    isChecking: false,
    error: null
  });
  const router = useRouter();

  const checkFaceIdStatus = async () => {
    setStatus(prev => ({ ...prev, isChecking: true, error: null }));
    
    try {
      // Проверяем локальный статус
      const localResponse = await fetch('/api/auth/face-register', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (localResponse.ok) {
        const localData = await localResponse.json();
        
        setStatus(prev => ({
          ...prev,
          localRegistered: localData.registered,
          profileId: localData.profile?.id || null,
          userName: localData.user?.name || null,
          convexRegistered: localData.profile?.hasConvexProfile || false,
          lastChecked: new Date().toISOString()
        }));
      } else {
        throw new Error('Ошибка получения статуса');
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Ошибка проверки статуса'
      }));
    } finally {
      setStatus(prev => ({ ...prev, isChecking: false }));
    }
  };

  const clearFaceId = async () => {
    if (!confirm('Вы уверены, что хотите удалить все Face ID профили?')) return;
    
    try {
      const response = await fetch('/api/auth/face-register', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Face ID профили успешно удалены');
        checkFaceIdStatus();
      } else {
        throw new Error('Ошибка удаления профилей');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка удаления Face ID профилей');
    }
  };

  useEffect(() => {
    checkFaceIdStatus();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Face ID Status Check
          </div>
          <Button
            onClick={checkFaceIdStatus}
            disabled={status.isChecking}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${status.isChecking ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status.error && (
          <Alert variant="destructive">
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-gray-500" />
                <span className="font-medium">Локальное хранилище</span>
              </div>
              {status.localRegistered ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <Badge variant={status.localRegistered ? "default" : "secondary"}>
              {status.localRegistered ? "Зарегистрирован" : "Не зарегистрирован"}
            </Badge>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Cloud className="h-5 w-5 mr-2 text-gray-500" />
                <span className="font-medium">Convex DB</span>
              </div>
              {status.convexRegistered ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <Badge variant={status.convexRegistered ? "default" : "secondary"}>
              {status.convexRegistered ? "Синхронизирован" : "Не синхронизирован"}
            </Badge>
          </div>
        </div>
        
        {status.profileId && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-medium">Profile ID:</span> {status.profileId}
            </div>
            {status.userName && (
              <div className="text-sm">
                <span className="font-medium">Пользователь:</span> {status.userName}
              </div>
            )}
            <div className="text-sm text-gray-500">
              <span className="font-medium">Последняя проверка:</span>{' '}
              {status.lastChecked ? new Date(status.lastChecked).toLocaleString('ru-RU') : 'Никогда'}
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button
            onClick={() => router.push('/face-auth?mode=register')}
            variant="outline"
          >
            Зарегистрировать Face ID
          </Button>
          
          {status.localRegistered && (
            <Button
              onClick={clearFaceId}
              variant="destructive"
              size="sm"
            >
              Удалить все профили
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}