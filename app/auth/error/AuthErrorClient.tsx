// app/auth/error/AuthErrorClient.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Shield, Users } from "lucide-react";

export default function AuthErrorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "Configuration":
        return {
          title: "Ошибка конфигурации",
          message: "Проблема с настройками системы аутентификации. Обратитесь к администратору.",
          icon: <AlertTriangle className="h-12 w-12 text-orange-500" />
        };
      case "AccessDenied":
        return {
          title: "Доступ запрещен",
          message: "У вашей учетной записи нет доступа к этой части системы. Используйте соответствующую форму входа.",
          icon: <Shield className="h-12 w-12 text-red-500" />
        };
      case "Verification":
        return {
          title: "Требуется верификация",
          message: "Ваш email не подтвержден. Проверьте почту для завершения регистрации.",
          icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />
        };
      default:
        return {
          title: "Ошибка аутентификации",
          message: "Произошла ошибка при попытке входа. Попробуйте еще раз или обратитесь в поддержку.",
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />
        };
    }
  };

  const { title, message, icon } = getErrorMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{icon}</div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-gray-600">{message}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push("/staff-login")}
                className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Shield className="h-5 w-5" />
                Вход для персонала
              </button>
              
              <button
                onClick={() => router.push("/member-login")}
                className="w-full flex items-center justify-center gap-2 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Users className="h-5 w-5" />
                Вход для участников
              </button>
              
              <button
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                На главную
              </button>
            </div>
            
            {error === "AccessDenied" && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Подсказка:</strong> Если вы сотрудник, убедитесь что используете корпоративный Google аккаунт 
                  или войдите с помощью служебных учетных данных.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}