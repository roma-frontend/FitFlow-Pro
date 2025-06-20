// components/auth/ResetPasswordForm.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';

interface ResetPasswordFormProps {
  token: string;
  userType: string;
}

export function ResetPasswordForm({ token, userType }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Пароль должен содержать минимум 8 символов';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Пароль должен содержать строчные буквы';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Пароль должен содержать заглавные буквы';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Пароль должен содержать цифры';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
          userType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Перенаправляем на страницу успеха
        router.push(`/password-reset-success?type=${userType}`);
      } else {
        setError(data.error || 'Произошла ошибка при сбросе пароля');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Произошла ошибка сети. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">Новый пароль</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите новый пароль"
            required
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Подтвердите новый пароль"
            required
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Индикатор силы пароля */}
      {password && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Сила пароля:</div>
          <div className="space-y-1">
            <div className={`text-xs ${password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
              ✓ Минимум 8 символов
            </div>
            <div className={`text-xs ${/(?=.*[a-z])/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
              ✓ Строчные буквы
            </div>
            <div className={`text-xs ${/(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
              ✓ Заглавные буквы
            </div>
            <div className={`text-xs ${/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-red-600'}`}>
              ✓ Цифры
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !password || !confirmPassword}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Сброс пароля...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Сбросить пароль
          </>
        )}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={() => router.push(userType === 'staff' ? '/staff-login' : '/member-login')}
          className="text-sm"
        >
          Вернуться к входу
        </Button>
      </div>
    </form>
  );
}
