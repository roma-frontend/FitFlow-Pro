"use client";

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface DevelopmentToolsProps {
  isLogin: boolean;
  loading: boolean;
  isValidating: boolean;
  onFillData: (data: FormData) => void;
  onClearForm: () => void;
  onShowForgotPassword: () => void;
}

export const DevelopmentTools = memo(function DevelopmentTools({
  isLogin,
  loading,
  isValidating,
  onFillData,
  onClearForm,
  onShowForgotPassword
}: DevelopmentToolsProps) {
  const { toast } = useToast();

  if (process.env.NODE_ENV !== "development") return null;

  const fillTestData = (isValid: boolean = true) => {
    if (isValid) {
      onFillData({
        email: "test@example.com",
        password: isLogin ? "password123" : "SecurePass123!",
        name: isLogin ? "" : "Тестовый Пользователь",
        phone: isLogin ? "" : "+7 (999) 123-45-67",
      });
      toast({
        title: "Тестовые данные заполнены",
        description: "Проверьте валидацию и отправьте форму",
      });
    } else {
      onFillData({
        email: "invalid-email",
        password: "123",
        name: isLogin ? "" : "А",
        phone: "",
      });
      toast({
        title: "Некорректные данные заполнены",
        description: "Посмотрите на работу валидации",
      });
    }
  };

  const fillRealData = () => {
    onFillData({
      email: "user@gmail.com",
      password: isLogin ? "password123" : "SecurePass123!",
      name: isLogin ? "" : "Реальный Пользователь",
      phone: isLogin ? "" : "+7 (999) 123-45-67",
    });
    toast({
      title: "Реальные данные заполнены",
      description: "Gmail адрес для тестирования",
    });
  };

  const handleClearForm = () => {
    onClearForm();
    toast({
      title: "Форма очищена",
      description: "Все поля и валидация сброшены",
    });
  };

  const testPasswordReset = () => {
    onShowForgotPassword();
    toast({
      title: "Тест восстановления пароля",
      description: "Открыта форма восстановления с тестовым email",
    });
  };

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-yellow-900">
          🧪 Быстрое тестирование
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <Button
          onClick={() => fillTestData(true)}
          variant="outline"
          size="sm"
          className="w-full text-xs"
          disabled={loading || isValidating}
        >
          🚀 Заполнить корректные данные
        </Button>

        <Button
          onClick={fillRealData}
          variant="outline"
          size="sm"
          className="w-full text-xs"
          disabled={loading || isValidating}
        >
          📧 Заполнить реальный email
        </Button>

        <Button
          onClick={() => fillTestData(false)}
          variant="outline"
          size="sm"
          className="w-full text-xs"
          disabled={loading || isValidating}
        >
          ⚠️ Заполнить некорректные данные
        </Button>

        <Button
          onClick={handleClearForm}
          variant="outline"
          size="sm"
          className="w-full text-xs"
          disabled={loading || isValidating}
        >
          🗑️ Очистить форму
        </Button>

        <Button
          onClick={testPasswordReset}
          variant="outline"
          size="sm"
          className="w-full text-xs"
          disabled={loading || isValidating}
        >
          🔑 Тест восстановления пароля
        </Button>
      </CardContent>
    </Card>
  );
});
