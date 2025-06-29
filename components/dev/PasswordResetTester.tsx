// components/dev/PasswordResetTester.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  Mail, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Copy
} from 'lucide-react';

export function PasswordResetTester() {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [userType, setUserType] = useState<'staff' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  const addTestResult = (step: string, success: boolean, details: string) => {
    setTestResults(prev => [...prev, {
      step,
      success,
      details,
      timestamp: new Date().toLocaleString()
    }]);
  };

  const testPasswordReset = async () => {
    setLoading(true);
    setTestResults([]);
    setResetToken('');

    try {
      // Шаг 1: Запрос на восстановление
      addTestResult('Запрос восстановления', false, 'Отправка запроса...');
      
      const resetResponse = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          userType
        })
      });

      const resetData = await resetResponse.json();
      
      if (resetData.success) {
        addTestResult('Запрос восстановления', true, 'Запрос успешно отправлен');
        
        // В режиме разработки можем получить токен для тестирования
        if (process.env.NODE_ENV === 'development') {
          // Здесь можно добавить логику для получения токена из базы для тестирования
          toast({
            title: 'Тест запроса',
            description: 'Запрос на восстановление отправлен успешно'
          });
        }
      } else {
        addTestResult('Запрос восстановления', false, resetData.error);
      }

    } catch (error) {
      addTestResult('Запрос восстановления', false, `Ошибка: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testTokenVerification = async () => {
    if (!resetToken) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Введите токен для проверки'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          userType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        addTestResult('Проверка токена', true, `Токен валиден для ${data.email}`);
        toast({
          title: 'Токен валиден',
          description: `Пользователь: ${data.name} (${data.email})`
        });
      } else {
        addTestResult('Проверка токена', false, data.error);
        toast({
          variant: 'destructive',
          title: 'Токен невалиден',
          description: data.error
        });
      }
    } catch (error) {
      addTestResult('Проверка токена', false, `Ошибка: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const copyTestUrl = () => {
    if (resetToken) {
      const url = `${window.location.origin}/reset-password?token=${resetToken}&type=${userType}`;
      navigator.clipboard.writeText(url);
      toast({
        title: 'URL скопирован',
                description: 'Ссылка для сброса пароля скопирована в буфер обмена'
      });
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-yellow-900">
          <TestTube className="h-5 w-5" />
          <span>Тестирование восстановления пароля</span>
          <Badge variant="outline">DEV ONLY</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Настройки теста */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email для теста</label>
            <Input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Тип пользователя</label>
            <div className="flex space-x-2">
              <Button
                variant={userType === 'member' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUserType('member')}
              >
                Участник
              </Button>
              <Button
                variant={userType === 'staff' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUserType('staff')}
              >
                Персонал
              </Button>
            </div>
          </div>
        </div>

        {/* Кнопки тестирования */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={testPasswordReset}
            disabled={loading}
            size="sm"
          >
            <Mail className="h-4 w-4 mr-2" />
            Тест запроса восстановления
          </Button>
          
          {resetToken && (
            <>
              <Button
                onClick={testTokenVerification}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <Key className="h-4 w-4 mr-2" />
                Проверить токен
              </Button>
              
              <Button
                onClick={copyTestUrl}
                size="sm"
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Копировать URL
              </Button>
            </>
          )}
        </div>

        {/* Поле для ввода токена */}
        <div>
          <label className="block text-sm font-medium mb-2">Токен для тестирования</label>
          <div className="flex space-x-2">
            <Input
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              placeholder="Вставьте токен из логов или email"
              className="font-mono text-xs"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Получите токен из логов сервера или email (в режиме разработки)
          </p>
        </div>

        {/* Результаты тестирования */}
        {testResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Результаты тестирования:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-2 rounded text-sm ${
                    result.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{result.step}</div>
                    <div className="text-xs opacity-75">{result.details}</div>
                  </div>
                  <div className="text-xs opacity-50">{result.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Инструкции */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-900 mb-2">Инструкции по тестированию:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Убедитесь, что в базе есть пользователь с указанным email</li>
            <li>Нажмите "Тест запроса восстановления"</li>
            <li>Проверьте логи сервера для получения токена</li>
            <li>Вставьте токен в поле и нажмите "Проверить токен"</li>
            <li>Используйте "Копировать URL" для перехода на страницу сброса</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

