"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRight } from "lucide-react";

interface RoleTipsProps {
  userRole: string;
}

export function RoleTips({ userRole }: RoleTipsProps) {
  const getTips = () => {
    switch (userRole) {
      case "super-admin":
        return [
          "Проверьте системные логи на наличие ошибок",
          "Обновите резервные копии данных",
          "Мониторьте производительность серверов",
        ];
      case "admin":
        return [
          "Проанализируйте финансовые показатели за месяц",
          "Проверьте отзывы клиентов",
          "Оцените эффективность маркетинговых кампаний",
        ];
      case "manager":
        return [
          "Проведите встречу с командой тренеров",
          "Оптимизируйте расписание на следующую неделю",
          "Проверьте состояние оборудования",
        ];
      case "trainer":
        return [
          "Подготовьте программы для новых клиентов",
          "Обновите планы тренировок",
          "Свяжитесь с клиентами для обратной связи",
        ];
      case "member":
        return [
          "Запишитесь на новые групповые занятия",
          "Отследите свой прогресс",
          "Попробуйте новый вид активности",
        ];
      case "client":
        return [
          "Обсудите цели с персональным тренером",
          "Ведите дневник тренировок",
          "Следите за питанием и восстановлением",
        ];
      default:
        return [];
    }
  };

  const tips = getTips();

  if (tips.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-500" />
          Рекомендации
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
            >
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full mt-4 group">
            Все рекомендации
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
