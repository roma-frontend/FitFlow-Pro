// app/verify-email/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

type VerificationState = 'loading' | 'success' | 'error' | 'expired' | 'already_verified';

function VerifyEmailContent() {
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const userType = searchParams.get('type') as 'staff' | 'member' || 'member';
  
  const verifyEmail = useMutation(api.auth.verifyEmail);
  const requestNewVerification = useMutation(api.auth.requestEmailVerification);

  // Проверяем токен при загрузке страницы
  const tokenCheck = useQuery(
    api.auth.verifyEmailToken,
    token ? { token, userType } : 'skip'
  );

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Токен подтверждения не найден в ссылке');
      return;
    }

    if (tokenCheck !== undefined) {
      if (tokenCheck.success) {
        setUserInfo(tokenCheck.user);
        if (tokenCheck.user?.emailVerified) {
          setState('already_verified');
          setMessage('Ваш email уже был подтвержден ранее');
        } else {
          // Автоматически подтверждаем email
          handleVerification();
        }
      } else {
        if (tokenCheck.expired) {
          setState('expired');
          setMessage('Ссылка подтверждения истекла. Запросите новую ссылку.');
        } else {
          setState('error');
          setMessage(tokenCheck.error || 'Недействительная ссылка подтверждения');
        }
      }
    }
  }, [token, tokenCheck]);

  const handleVerification = async () => {
    if (!token) return;

    try {
      setState('loading');
      const result = await verifyEmail({ token, userType });
      
      if (result.success) {
        setState('success');
        setMessage('Email успешно подтвержден! Теперь вы можете войти в систему.');
      } else {
        setState('error');
        setMessage(result.error || 'Произошла ошибка при подтверждении email');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setState('error');
      setMessage('Произошла неожиданная ошибка');
    }
  };

  const handleRequestNewVerification = async () => {
    if (!userInfo?.email) return;

    try {
      const result = await requestNewVerification({ 
        email: userInfo.email, 
        userType 
      });
      
      if (result.success) {
        setMessage('Новое письмо подтверждения отправлено на ваш email');
      } else {
        setMessage(result.error || 'Не удалось отправить новое письмо');
      }
    } catch (error) {
      setMessage('Произошла ошибка при отправке письма');
    }
  };

  const handleRedirect = () => {
    router.push('/auth/signin');
  };

  const getIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'already_verified':
        return <CheckCircle className="h-16 w-16 text-blue-500" />;
      case 'expired':
        return <AlertCircle className="h-16 w-16 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (state) {
      case 'loading':
        return 'Подтверждение email...';
      case 'success':
        return 'Email подтвержден!';
      case 'already_verified':
        return 'Email уже подтвержден';
      case 'expired':
        return 'Ссылка истекла';
      case 'error':
        return 'Ошибка подтверждения';
    }
  };

  return (
    <div className="min-h-[100svh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <CardTitle className="text-2xl font-bold">
              {getTitle()}
            </CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
            {userInfo && (
              <p className="text-sm text-gray-600 mt-2">
                Email: {userInfo.email}
              </p>
            )}
          </CardHeader>
          
          {state !== 'loading' && (
            <CardContent className="text-center space-y-4">
              {state === 'success' || state === 'already_verified' ? (
                <Button onClick={handleRedirect} className="w-full">
                  Войти в систему
                </Button>
              ) : state === 'expired' ? (
                <div className="space-y-3">
                  <Button 
                    onClick={handleRequestNewVerification} 
                    className="w-full"
                    disabled={!userInfo?.email}
                  >
                    Отправить новое письмо
                  </Button>
                  <Button 
                    onClick={handleRedirect} 
                    variant="outline" 
                    className="w-full"
                  >
                    Вернуться к входу
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button 
                    onClick={handleRedirect} 
                    variant="outline" 
                    className="w-full"
                  >
                    Вернуться к входу
                  </Button>
                  <p className="text-sm text-gray-600">
                    Если у вас возникли проблемы, обратитесь в службу поддержки.
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-[100svh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Загрузка...
            </CardTitle>
            <CardDescription>
              Пожалуйста, подождите
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}