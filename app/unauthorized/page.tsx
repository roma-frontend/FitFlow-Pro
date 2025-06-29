// app/unauthorized/page.tsx (новый файл)
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter()
  return (
    <div className="min-h-[100svh] bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Доступ запрещен</CardTitle>
          <CardDescription>
            У вас недостаточно прав для доступа к этой странице
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Возможные причины:
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Вы вошли под неправильной ролью</li>
            <li>• Ваша сессия истекла</li>
            <li>• У вас нет прав на эту функцию</li>
          </ul>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
