// app/reset-password/page.tsx
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

// Компонент с логикой, который использует useSearchParams
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const userType = searchParams.get('type') || 'member';

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Ошибка</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Недействительная ссылка для сброса пароля
            </p>
            <p className="text-sm text-gray-500">
              Пожалуйста, запросите новую ссылку для восстановления пароля
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Новый пароль
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Введите новый пароль для вашего аккаунта
          </p>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={token} userType={userType} />
        </CardContent>
      </Card>
    </div>
  );
}

// Компонент загрузки
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Загрузка формы сброса пароля...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Основной компонент страницы
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
