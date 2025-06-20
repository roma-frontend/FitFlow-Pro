// app/forgot-password/page.tsx (улучшенная версия)
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ValidatedInput } from '@/components/ValidatedInput';
import { Mail, ArrowLeft, Shield, Clock, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'member' | 'staff'>('member');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const { toast } = useToast();
  const router = useRouter();

  // Валидация email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Введите email адрес'
      });
      return;
    }

    if (!isValidEmail(email.trim())) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Введите корректный email адрес'
      });
      return;
    }

    if (cooldown > 0) {
      toast({
        variant: 'destructive',
        title: 'Подождите',
        description: `Повторная отправка возможна через ${cooldown} секунд`
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), userType })
      });

      const data = await response.json();

      if (data.success) {
        setSent(true);
        // Устанавливаем кулдаун на 5 минут
        setCooldown(300);
        const interval = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast({
          title: 'Письмо отправлено! 📧',
          description: 'Проверьте вашу почту для восстановления пароля'
        });
      } else {
        throw new Error(data.error || 'Ошибка отправки письма');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить письмо'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (cooldown > 0) {
      toast({
        variant: 'destructive',
        title: 'Подождите',
        description: `Повторная отправка возможна через ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, '0')}`
      });
      return;
    }
    setSent(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-900">Письмо отправлено!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-gray-700">
                Инструкции по восстановлению пароля отправлены на:
              </p>
              <p className="font-medium text-blue-600 break-all">{email}</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <h4 className="font-medium text-blue-900 mb-2">Что делать дальше:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Проверьте почту (включая папку "Спам")</li>
                <li>• Перейдите по ссылке в письме</li>
                <li>• Ссылка действует 1 час</li>
                <li>• Если письмо не пришло, попробуйте повторно</li>
              </ul>
            </div>

            {cooldown > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-orange-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Повторная отправка через {Math.floor(cooldown / 60)}:{(cooldown % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={handleResend}
                variant="outline"
                className="w-full"
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Подождите {Math.floor(cooldown / 60)}:{(cooldown % 60).toString().padStart(2, '0')}
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Отправить повторно
                  </>
                )}
              </Button>
              <Button
                onClick={() => router.push(userType === 'staff' ? '/staff-login' : '/member-login')}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Вернуться к входу
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>Восстановление пароля</CardTitle>
          <p className="text-gray-600">
            Введите email для получения инструкций
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Тип аккаунта
              </label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={userType === 'member' ? 'default' : 'outline'}
                  onClick={() => setUserType('member')}
                  className="flex-1"
                >
                  👤 Участник
                </Button>
                <Button
                  type="button"
                  variant={userType === 'staff' ? 'default' : 'outline'}
                  onClick={() => setUserType('staff')}
                  className="flex-1"
                >
                  🛡️ Персонал
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email адрес *
              </label>
              <ValidatedInput
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full"
              />
              {email && !isValidEmail(email) && (
                <p className="text-sm text-red-600 mt-1">
                  Введите корректный email адрес
                </p>
              )}
            </div>

            <div className="p-3 bg-gray-50 border rounded-lg">
              <div className="text-xs text-gray-600 space-y-1">
                <p>🔒 Ваши данные защищены</p>
                <p>⏱️ Ссылка действует 1 час</p>
                <p>🚫 Лимит: 1 запрос в 5 минут</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim() || !isValidEmail(email.trim())}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Отправляем...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Отправить инструкции
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => router.push(userType === 'staff' ? '/staff-login' : '/member-login')}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к входу
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
