"use client";

import { Card, CardContent } from "@/components/ui/card";

interface DashboardFooterProps {
  userRole: string;
}

export function DashboardFooter({ userRole }: DashboardFooterProps) {
  const getFooterData = () => {
    switch (userRole) {
      case "super-admin":
        return [
          { value: "24/7", label: "Поддержка системы" },
          { value: "99.9%", label: "Время работы" },
          { value: "5", label: "Лет опыта" },
          { value: "∞", label: "Возможности" }
        ];
      case "admin":
        return [
                    { value: "100%", label: "Удовлетворенность" },
          { value: "₽2M+", label: "Годовая выручка" },
          { value: "15", label: "Филиалов" },
          { value: "95%", label: "Рост продаж" }
        ];
      case "manager":
        return [
          { value: "365", label: "Дней в году" },
          { value: "50+", label: "Сотрудников" },
          { value: "10", label: "Залов" },
          { value: "98%", label: "Эффективность" }
        ];
      case "trainer":
        return [
          { value: "5★", label: "Средний рейтинг" },
          { value: "200+", label: "Тренировок" },
          { value: "25", label: "Клиентов" },
          { value: "4.9", label: "Рейтинг" }
        ];
      default:
        return [
          { value: "24/7", label: "Доступность" },
          { value: "1000+", label: "Участников" },
          { value: "12", label: "Месяцев занятий" },
          { value: "85%", label: "Прогресс" }
        ];
    }
  };

  const footerData = getFooterData();

  return (
    <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Добро пожаловать в панель управления!
          </h3>
          <p className="text-gray-600 mb-4">
            Здесь вы можете управлять всеми аспектами вашей деятельности в фитнес-центре
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {footerData.map((item, index) => (
              <div key={index} className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{item.value}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Последнее обновление: {new Date().toLocaleString("ru-RU")}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Система работает нормально
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

