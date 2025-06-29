// app/password-reset-success/page.tsx
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

function PasswordResetSuccessContent() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'member';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const loginUrl = userType === 'staff' ? '/staff-login' : '/member-login';
          router.push(loginUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, userType]);

  const handleGoToLogin = () => {
    const loginUrl = userType === 'staff' ? '/staff-login' : '/member-login';
    router.push(loginUrl);
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-green-900 text-2xl">
            Пароль успешно изменен! 🎉
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">
              Ваш пароль был успешно обновлен
            </p>
            <p className="text-sm text-gray-500">
              Теперь вы можете войти в систему с новым паролем
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Автоматическое перенаправление через {countdown} секунд...
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            >
              Войти в систему
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="w-full"
            >
              На главную страницу
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p>🔐 Ваш аккаунт защищен</p>
              <p>📧 Уведомление отправлено на email</p>
              <p>🛡️ Рекомендуем включить двухфакторную аутентификацию</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Компонент загрузки
function LoadingFallback() {
  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Загрузка...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Основной компонент страницы
export default function PasswordResetSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PasswordResetSuccessContent />
    </Suspense>
  );
}
