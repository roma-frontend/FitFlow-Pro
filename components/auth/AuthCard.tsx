// components/auth/AuthCard.tsx - обновленная версия
"use client";

import { memo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserPlus } from "lucide-react";

interface AuthCardProps {
  children: ReactNode;
  isLogin: boolean;
}

export const AuthCard = memo(function AuthCard({ children, isLogin }: AuthCardProps) {
  const IconComponent = isLogin ? Shield : UserPlus;
  
  return (
    <Card className="w-full shadow-xl border-0 bg-white">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <IconComponent className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {isLogin ? "Вход в систему" : "Регистрация"}
        </CardTitle>
        <CardDescription className="text-gray-600 text-base">
          {isLogin 
            ? "Войдите в свой аккаунт FitFlow Pro" 
            : "Создайте новый аккаунт FitFlow Pro"
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
});
