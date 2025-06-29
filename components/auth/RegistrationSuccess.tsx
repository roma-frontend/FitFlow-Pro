// components/auth/RegistrationSuccess.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Mail, 
  ArrowRight, 
  RefreshCw,
  Clock,
  Shield,
  AlertCircle
} from "lucide-react";

interface RegistrationSuccessProps {
  email: string;
  onBackToLogin: () => void;
  onResendEmail?: () => void;
}

export function RegistrationSuccess({ 
  email, 
  onBackToLogin, 
  onResendEmail 
}: RegistrationSuccessProps) {
  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl border-0">
        <CardHeader className="text-center pb-4">
          {/* ✅ Анимированная иконка успеха */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            🎉 Регистрация успешна!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Основное сообщение */}
          <div className="text-center space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center text-green-700 mb-2">
                <Mail className="h-5 w-5 mr-2" />
                <span className="font-medium">Письмо отправлено!</span>
              </div>
              <p className="text-sm text-green-600">
                Мы отправили письмо с подтверждением на:
              </p>
              <p className="font-mono text-sm text-green-800 bg-green-100 px-3 py-1 rounded mt-2 break-all">
                {email}
              </p>
            </div>

            {/* Инструкции */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Что делать дальше:
              </h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Проверьте свою почту (включая папку "Спам")</li>
                <li>Нажмите на ссылку в письме для подтверждения</li>
                <li>Войдите в систему с вашими данными</li>
              </ol>
            </div>

            {/* Предупреждение о спаме */}
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start text-orange-700 text-xs">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Не видите письмо?</p>
                  <p>Проверьте папку "Спам" или "Промоакции"</p>
                </div>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center text-gray-600 text-xs">
                <Shield className="h-4 w-4 mr-2" />
                <span>Ссылка действительна в течение 24 часов</span>
              </div>
            </div>
          </div>

          {/* Действия */}
          <div className="space-y-3">
            <Button
              onClick={onBackToLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Перейти к входу
            </Button>

            {onResendEmail && (
              <Button
                onClick={onResendEmail}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Отправить письмо повторно
              </Button>
            )}
          </div>

          {/* Помощь */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">
              Нужна помощь?
            </p>
            <div className="space-y-1">
              <button className="text-xs text-blue-600 hover:text-blue-800 block mx-auto hover:underline">
                Связаться с поддержкой
              </button>
              <button className="text-xs text-blue-600 hover:text-blue-800 block mx-auto hover:underline">
                Часто задаваемые вопросы
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
