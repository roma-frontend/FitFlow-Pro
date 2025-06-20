// components/member/SidebarCards.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, TrendingUp, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarCardsProps {
  stats: {
    completed: number;
  };
  onGoHome: () => void;
}

export default function SidebarCards({ stats, onGoHome }: SidebarCardsProps) {
  const router = useRouter();

  return (
    <>
      {/* История покупок */}
      <Card className="shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 border-0">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            История покупок
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Просматривайте чеки и повторяйте заказы
          </p>
          <Button
            onClick={() => router.push("/member-dashboard/orders")}
            variant="outline"
            className="w-full"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Мои заказы
          </Button>
        </CardContent>
      </Card>

      {/* Мотивационная карточка */}
      <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 border-0">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Отличная работа! 💪
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Вы уже выполнили {Math.round((stats.completed / 20) * 100)}%
            месячной цели
          </p>
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            onClick={() => router.push("/trainers")}
          >
            Продолжить тренировки
          </Button>
        </CardContent>
      </Card>

      {/* Главная страница */}
      <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-green-50 border-blue-200 border-0">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Главная страница
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Вернуться на главную страницу сайта
          </p>
          <Button
            onClick={onGoHome}
            variant="outline"
            className="w-full"
          >
            <Home className="h-4 w-4 mr-2" />
            Перейти на главную
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
