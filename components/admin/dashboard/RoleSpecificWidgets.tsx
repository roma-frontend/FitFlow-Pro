"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Calendar,
  Target,
  Award
} from "lucide-react";

interface RoleSpecificWidgetsProps {
  userRole: string;
}

export function RoleSpecificWidgets({ userRole }: RoleSpecificWidgetsProps) {
  if (userRole === "super-admin") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Системный мониторинг
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">CPU Usage</span>
                <Badge variant="outline" className="text-green-700 bg-green-100">
                  23%
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Memory Usage</span>
                <Badge variant="outline" className="text-blue-700 bg-blue-100">
                  67%
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Database Load</span>
                <Badge variant="outline" className="text-purple-700 bg-purple-100">
                  45%
                </Badge>
              </div>
              <Button variant="outline" className="w-full">
                Подробная диагностика
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Активность пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">1,247</div>
                <div className="text-sm text-gray-600">Активных пользователей</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">89</div>
                  <div className="text-xs text-gray-600">Онлайн сейчас</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-semibold text-orange-600">156</div>
                  <div className="text-xs text-gray-600">За последний час</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole === "admin" || userRole === "manager") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Финансовая сводка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Выручка сегодня</span>
                <span className="font-semibold text-green-600">₽28,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Выручка за неделю</span>
                <span className="font-semibold text-blue-600">₽187,230</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Выручка за месяц</span>
                <span className="font-semibold text-purple-600">₽847,230</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Рост к прошлому месяцу</span>
                  <Badge variant="outline" className="text-green-700 bg-green-100">
                    +18%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Загрузка на сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">87%</div>
                <div className="text-sm text-gray-600">Средняя загрузка залов</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Зал №1</span>
                  <span className="font-medium">95%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Зал №2</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Групповые занятия</span>
                  <span className="font-medium">89%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole === "trainer") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Мои клиенты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">23</div>
                <div className="text-sm text-gray-600">Активных клиентов</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">5</div>
                  <div className="text-xs text-gray-600">Тренировок сегодня</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">4.9</div>
                  <div className="text-xs text-gray-600">Средний рейтинг</div>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Управление клиентами
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Расписание на сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                <div className="w-2 h-8 bg-blue-500 rounded"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">09:00 - Анна Петрова</div>
                  <div className="text-xs text-gray-600">Персональная тренировка</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                <div className="w-2 h-8 bg-green-500 rounded"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">11:00 - Михаил Иванов</div>
                  <div className="text-xs text-gray-600">Силовая тренировка</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                <div className="w-2 h-8 bg-purple-500 rounded"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">15:00 - Елена Сидорова</div>
                  <div className="text-xs text-gray-600">Кардио тренировка</div>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Полное расписание
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole === "member" || userRole === "client") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Моя активность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">7</div>
                <div className="text-sm text-gray-600">Дней подряд</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">12</div>
                  <div className="text-xs text-gray-600">Тренировок в месяце</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">85%</div>
                  <div className="text-xs text-gray-600">Прогресс к цели</div>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Подробная статистика
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Ближайшие тренировки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRole === "client" ? (
                <>
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <div className="w-2 h-8 bg-green-500 rounded"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Завтра 10:00</div>
                      <div className="text-xs text-gray-600">С тренером Еленой</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <div className="w-2 h-8 bg-blue-500 rounded"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Пятница 15:00</div>
                      <div className="text-xs text-gray-600">Персональная тренировка</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                    <div className="w-2 h-8 bg-orange-500 rounded"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Сегодня 19:00</div>
                      <div className="text-xs text-gray-600">Йога для начинающих</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                    <div className="w-2 h-8 bg-purple-500 rounded"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Завтра 18:00</div>
                      <div className="text-xs text-gray-600">Функциональная тренировка</div>
                    </div>
                  </div>
                </>
              )}
              <Button variant="outline" className="w-full">
                {userRole === "client" 
                  ? "Записаться на тренировку" 
                  : "Все групповые занятия"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

