"use client";

import { Activity, Clock, Star } from "lucide-react";

interface StatusCardsProps {
  userRole: string;
}

export function StatusCards({ userRole }: StatusCardsProps) {
  const getAccessLevel = () => {
    switch (userRole) {
      case "super-admin":
        return "Максимальный";
      case "admin":
        return "Административный";
      case "manager":
        return "Управленческий";
      case "trainer":
        return "Тренерский";
      default:
        return "Пользовательский";
    }
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-yellow-300" />
          <div>
            <p className="text-sm text-blue-400">Статус</p>
            <p className="font-semibold">Активен</p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-green-300" />
          <div>
            <p className="text-sm text-blue-400">Последний вход</p>
            <p className="font-semibold">Сегодня</p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Star className="h-8 w-8 text-purple-300" />
          <div>
            <p className="text-sm text-blue-400">Уровень доступа</p>
            <p className="font-semibold">{getAccessLevel()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
