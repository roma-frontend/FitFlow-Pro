import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  TrendingUp,
  Star,
  AlertTriangle,
  UserCheck,
  XCircle,
  Activity,
  Plus,
  Calendar,
  Settings
} from "lucide-react";
import type { Trainer } from "@/contexts/ManagerContext";
import { useRouter } from "next/navigation";

interface SideWidgetsProps {
  trainers: Trainer[];
}

const SideWidgets: React.FC<SideWidgetsProps> = ({ trainers }) => {
  const router = useRouter();
  return (
    <div className="space-y-6">
      {/* Быстрая аналитика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Быстрая аналитика
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Загрузка тренеров</span>
              <span className="text-sm font-medium">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Выполнение плана</span>
              <span className="text-sm font-medium">92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Удовлетворенность</span>
              <span className="text-sm font-medium">96%</span>
            </div>
            <Progress value={96} className="h-2" />
          </div>
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/manager/analytics")}
            >
              Подробная аналитика
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Топ тренеры месяца */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Топ тренеры месяца
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainers
              .sort((a, b) => b.monthlyEarnings - a.monthlyEarnings)
              .slice(0, 3)
              .map((trainer, index) => (
                <div key={trainer.id} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-800"
                        : index === 1
                        ? "bg-gray-100 text-gray-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={trainer.avatar} />
                    <AvatarFallback>
                      {trainer.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {trainer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {trainer.monthlyEarnings.toLocaleString()} ₽
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium">
                      {trainer.rating}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Требует внимания */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Требует внимания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Превышение записей
                </p>
                <p className="text-xs text-yellow-700">
                  У Адама Петрова 15 записей на завтра
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <UserCheck className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  Новая заявка
                </p>
                <p className="text-xs text-blue-700">
                  Дмитрий Козлов подал заявку на работу
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Жалоба клиента
                </p>
                <p className="text-xs text-red-700">
                  Требует рассмотрения в течение 24 часов
                </p>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/manager/notifications")}
            >
              Все уведомления
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full justify-start"
            onClick={() => router.push("/manager/trainers/add")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить тренера
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push("/manager/bookings/create")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Создать запись
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push("/manager/reports")}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Сгенерировать отчет
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push("/manager/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Настройки системы
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SideWidgets;
