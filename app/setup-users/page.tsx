// app/setup-users/page.tsx (новый файл)
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, Users, UserCheck, Shield } from "lucide-react";

export default function SetupUsersPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const createTestUsers = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Создаем администратора
      setResults((prev) => [...prev, "👑 Создание администратора..."]);
      await createUser({
        name: "Главный Администратор",
        email: "admin@fitclub.com",
        password: "admin123",
        role: "admin",
      });

      // Создаем менеджера
      setResults((prev) => [...prev, "👔 Создание менеджера..."]);
      await createUser({
        name: "Менеджер Иванов",
        email: "manager@fitclub.com",
        password: "manager123",
        role: "manager",
      });

      // Создаем тренеров
      setResults((prev) => [...prev, "🏃‍♀️ Создание тренеров..."]);
      await createTrainer({
        name: "Анна Петрова",
        email: "anna@fitclub.com",
        password: "trainer123",
      });

      await createTrainer({
        name: "Михаил Волков",
        email: "mikhail@fitclub.com",
        password: "trainer123",
      });

      await createTrainer({
        name: "Елена Смирнова",
        email: "elena@fitclub.com",
        password: "trainer123",
      });

      // Создаем персонал
      setResults((prev) => [...prev, "👥 Создание персонала..."]);
      await createUser({
        name: "Сотрудник Петров",
        email: "staff@fitclub.com",
        password: "staff123",
        role: "staff",
      });

      setResults((prev) => [...prev, "✅ Все пользователи созданы успешно!"]);
      setCompleted(true);
    } catch (error) {
      setResults((prev) => [...prev, `❌ Ошибка: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: any) => {
    const response = await fetch("/api/create-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Ошибка создания пользователя");
    }
  };

  const createTrainer = async (trainerData: any) => {
    const response = await fetch("/api/create-trainer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trainerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Ошибка создания тренера");
    }
  };

  if (process.env.NODE_ENV !== 'development') {

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 Создание тестовых пользователей
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Создайте тестовых пользователей для демонстрации всех ролей в
                системе FitAccess.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Будут созданы:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">
                      Администрация:
                    </h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Главный администратор</li>
                      <li>• Менеджер</li>
                      <li>• Сотрудник ресепшн</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">Тренеры:</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Анна Петрова (Йога)</li>
                      <li>• Михаил Волков (Силовые)</li>
                      <li>• Елена Смирнова (Кардио)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={createTestUsers}
                disabled={loading || completed}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Создание пользователей...
                  </>
                ) : completed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Пользователи созданы
                  </>
                ) : (
                  "👥 Создать тестовых пользователей"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Лог создания */}
          {results.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Процесс создания</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      {result.includes("✅") ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : result.includes("❌") ? (
                        <div className="h-4 w-4 rounded-full bg-red-500" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                      <span className="text-sm">{result}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Тестовые аккаунты */}
          {completed && (
            <Card>
              <CardHeader>
                <CardTitle>🔑 Созданные аккаунты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Администрация */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Администрация:
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="font-medium">Главный Администратор</p>
                        <p className="text-sm text-gray-600">admin@fitclub.com</p>
                        <p className="text-xs text-gray-500">Пароль: admin123</p>
                        <Badge className="bg-red-100 text-red-800 mt-1">
                          Admin
                        </Badge>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="font-medium">Менеджер Иванов</p>
                        <p className="text-sm text-gray-600">
                          manager@fitclub.com
                        </p>
                        <p className="text-xs text-gray-500">
                          Пароль: manager123
                        </p>
                        <Badge className="bg-blue-100 text-blue-800 mt-1">
                          Manager
                        </Badge>
                      </div>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="font-medium">Сотрудник Петров</p>
                        <p className="text-sm text-gray-600">staff@fitclub.com</p>
                        <p className="text-xs text-gray-500">Пароль: staff123</p>
                        <Badge className="bg-gray-100 text-gray-800 mt-1">
                          Staff
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Тренеры */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Тренеры:
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-pink-50 border border-pink-200 rounded">
                        <p className="font-medium">Анна Петрова</p>
                        <p className="text-sm text-gray-600">anna@fitclub.com</p>
                        <p className="text-xs text-gray-500">
                          Пароль: trainer123
                        </p>
                        <Badge className="bg-pink-100 text-pink-800 mt-1">
                          Trainer
                        </Badge>
                      </div>
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded">
                        <p className="font-medium">Михаил Волков</p>
                        <p className="text-sm text-gray-600">
                          mikhail@fitclub.com
                        </p>
                        <p className="text-xs text-gray-500">
                          Пароль: trainer123
                        </p>
                        <Badge className="bg-indigo-100 text-indigo-800 mt-1">
                          Trainer
                        </Badge>
                      </div>
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                        <p className="font-medium">Елена Смирнова</p>
                        <p className="text-sm text-gray-600">elena@fitclub.com</p>
                        <p className="text-xs text-gray-500">
                          Пароль: trainer123
                        </p>
                        <Badge className="bg-orange-100 text-orange-800 mt-1">
                          Trainer
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Быстрые ссылки */}
                  <div>
                    <h4 className="font-medium mb-3">Быстрые ссылки:</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open("/staff-login", "_blank")}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Вход персонала
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open("/admin", "_blank")}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Админ-панель
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open("/setup-demo-data", "_blank")}
                      >
                        <Loader2 className="h-4 w-4 mr-2" />
                        Создать демо-данные
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">
                    ✅ Готово к тестированию!
                  </h4>
                  <p className="text-sm text-green-700">
                    Теперь вы можете войти под любым из созданных аккаунтов и
                    протестировать все функции системы.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }
}