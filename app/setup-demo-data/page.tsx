// app/setup-demo-data/page.tsx (новый файл)
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";

export default function SetupDemoDataPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const setupDemoData = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Создаем тренеров
      setResults((prev) => [...prev, "🏃‍♂️ Создание тренеров..."]);
      await createTrainers();

      // Создаем участников
      setResults((prev) => [...prev, "👥 Создание участников..."]);
      await createMembers();

      // Создаем продукты
      setResults((prev) => [...prev, "🛒 Создание продуктов..."]);
      await createProducts();

      // Создаем групповые занятия
      setResults((prev) => [...prev, "🏋️‍♀️ Создание групповых занятий..."]);
      await createClasses();

      // Создаем тестовые бронирования
      setResults((prev) => [...prev, "📅 Создание тестовых бронирований..."]);
      await createBookings();

      // Создаем тестовые заказы
      setResults((prev) => [...prev, "🛍️ Создание тестовых заказов..."]);
      await createOrders();

      setResults((prev) => [...prev, "✅ Демо-данные успешно созданы!"]);
      setCompleted(true);
    } catch (error) {
      setResults((prev) => [...prev, `❌ Ошибка: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  const createTrainers = async () => {
    const trainers = [
      {
        name: "Анна Петрова",
        email: "anna@fitclub.com",
        phone: "+7 (999) 111-11-11",
        password: "trainer123",
        bio: "Сертифицированный инструктор по йоге и пилатесу с 5-летним опытом. Помогу вам обрести гармонию тела и духа.",
        specializations: ["Йога", "Пилатес", "Растяжка", "Медитация"],
        experience: 5,
        hourlyRate: 2500,
        workingHours: {
          monday: { start: "08:00", end: "16:00" },
          tuesday: { start: "08:00", end: "16:00" },
          wednesday: { start: "08:00", end: "16:00" },
          thursday: { start: "08:00", end: "16:00" },
          friday: { start: "08:00", end: "16:00" },
          saturday: { start: "10:00", end: "14:00" },
        },
      },
      {
        name: "Михаил Волков",
        email: "mikhail@fitclub.com",
        phone: "+7 (999) 222-22-22",
        password: "trainer123",
        bio: "Мастер спорта по тяжелой атлетике. Специализируюсь на силовых тренировках и функциональном тренинге.",
        specializations: [
          "Силовые тренировки",
          "Кроссфит",
          "Функциональный тренинг",
          "Пауэрлифтинг",
        ],
        experience: 8,
        hourlyRate: 3000,
        workingHours: {
          monday: { start: "16:00", end: "22:00" },
          tuesday: { start: "16:00", end: "22:00" },
          wednesday: { start: "16:00", end: "22:00" },
          thursday: { start: "16:00", end: "22:00" },
          friday: { start: "16:00", end: "22:00" },
          sunday: { start: "10:00", end: "18:00" },
        },
      },
      {
        name: "Елена Смирнова",
        email: "elena@fitclub.com",
        phone: "+7 (999) 333-33-33",
        password: "trainer123",
        bio: "Энергичный тренер по аэробике и танцам. Сделаю ваши тренировки яркими и результативными!",
        specializations: ["Кардио", "Аэробика", "Танцы", "Зумба"],
        experience: 6,
        hourlyRate: 2800,
        workingHours: {
          monday: { start: "18:00", end: "21:00" },
          tuesday: { start: "18:00", end: "21:00" },
          wednesday: { start: "18:00", end: "21:00" },
          thursday: { start: "18:00", end: "21:00" },
          friday: { start: "18:00", end: "21:00" },
          saturday: { start: "16:00", end: "20:00" },
          sunday: { start: "16:00", end: "20:00" },
        },
      },
    ];

    for (const trainer of trainers) {
      await fetch("/api/trainers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainer),
      });
    }
  };

  const createMembers = async () => {
    const members = [
      {
        name: "Иван Иванов",
        email: "ivan@example.com",
        phone: "+7 (999) 444-44-44",
        password: "member123",
        membershipType: "premium",
        membershipStart: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 дней назад
        membershipExpiry: Date.now() + 60 * 24 * 60 * 60 * 1000, // через 60 дней
        emergencyContact: "Мария Иванова",
        emergencyPhone: "+7 (999) 555-55-55",
        status: "active",
        fitnessGoals: ["Похудение", "Набор мышечной массы"],
        joinDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      },
      {
        name: "Мария Петрова",
        email: "maria@example.com",
        phone: "+7 (999) 666-66-66",
        password: "member123",
        membershipType: "basic",
        membershipStart: Date.now() - 15 * 24 * 60 * 60 * 1000,
        membershipExpiry: Date.now() + 45 * 24 * 60 * 60 * 1000,
        status: "active",
        fitnessGoals: ["Поддержание формы", "Гибкость"],
        joinDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
      },
      {
        name: "Алексей Сидоров",
        email: "alexey@example.com",
        phone: "+7 (999) 777-77-77",
        password: "member123",
        membershipType: "vip",
        membershipStart: Date.now() - 60 * 24 * 60 * 60 * 1000,
        membershipExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        status: "active",
        fitnessGoals: ["Силовые тренировки", "Выносливость"],
        joinDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
      },
    ];

    for (const member of members) {
      await fetch("/api/members/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(member),
      });
    }
  };

  const createProducts = async () => {
    const products = [
      {
        name: "Протеиновый коктейль",
        description: "Восстанавливающий коктейль с высоким содержанием белка",
        category: "drinks",
        price: 350,
        inStock: 25,
        minStock: 5,
        nutrition: { calories: 180, protein: 25, carbs: 8, fat: 3 },
        isPopular: true,
      },
      {
        name: "Изотоник",
        description: "Спортивный напиток для восстановления электролитов",
        category: "drinks",
        price: 120,
        inStock: 40,
        minStock: 10,
        nutrition: { calories: 45, protein: 0, carbs: 11, fat: 0 },
        isPopular: true,
      },
      {
        name: "Энергетический батончик",
        description: "Натуральный батончик с орехами и сухофруктами",
        category: "snacks",
        price: 180,
        inStock: 15,
        minStock: 5,
        nutrition: { calories: 220, protein: 12, carbs: 25, fat: 8 },
      },
      {
        name: "BCAA",
        description: "Аминокислоты с разветвленной цепью для восстановления",
        category: "supplements",
        price: 450,
        inStock: 20,
        minStock: 3,
        isPopular: true,
      },
      {
        name: "Креатин",
        description: "Моногидрат креатина для увеличения силы и выносливости",
        category: "supplements",
        price: 800,
        inStock: 12,
        minStock: 2,
      },
      {
        name: "Фитнес-бутылка",
        description: "Спортивная бутылка FitAccess 750мл",
        category: "merchandise",
        price: 590,
        inStock: 30,
        minStock: 5,
      },
      {
        name: "Полотенце FitAccess",
        description: "Микрофибровое полотенце с логотипом клуба",
        category: "merchandise",
        price: 890,
        inStock: 20,
        minStock: 5,
      },
      {
        name: "Свежевыжатый сок",
        description: "Апельсиновый сок 300мл",
        category: "drinks",
        price: 200,
        inStock: 18,
        minStock: 5,
        nutrition: { calories: 120, protein: 2, carbs: 28, fat: 0, sugar: 24 },
      },
    ];

    for (const product of products) {
      await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
    }
  };

  const createClasses = async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const classes = [
      {
        name: "Утренняя йога",
        description: "Мягкая практика для пробуждения тела и духа",
        instructorName: "Анна Петрова", // Будет заменено на ID
        startTime: new Date(tomorrow.setHours(8, 0, 0, 0)).getTime(),
        endTime: new Date(tomorrow.setHours(9, 0, 0, 0)).getTime(),
        location: "Студия йоги",
        capacity: 15,
        difficulty: "Начинающий",
        equipment: ["Коврик для йоги", "Блоки"],
        price: 800,
        isRecurring: true,
        recurringPattern: "weekly",
      },
      {
        name: "Силовая тренировка",
        description: "Интенсивная тренировка с отягощениями",
        instructorName: "Михаил Волков",
        startTime: new Date(today.setHours(19, 0, 0, 0)).getTime(),
        endTime: new Date(today.setHours(20, 0, 0, 0)).getTime(),
        location: "Тренажерный зал",
        capacity: 10,
        difficulty: "Средний",
        equipment: ["Гантели", "Штанга", "Тренажеры"],
        price: 1200,
        isRecurring: true,
      },
      {
        name: "Зумба",
        description:
          "Танцевальная фитнес-программа под латиноамериканскую музыку",
        instructorName: "Елена Смирнова",
        startTime: new Date(dayAfter.setHours(18, 0, 0, 0)).getTime(),
        endTime: new Date(dayAfter.setHours(19, 0, 0, 0)).getTime(),
        location: "Танцевальный зал",
        capacity: 20,
        difficulty: "Начинающий",
        price: 600,
        isRecurring: true,
      },
      {
        name: "Кроссфит",
        description: "Высокоинтенсивная функциональная тренировка",
        instructorName: "Михаил Волков",
        startTime: new Date(tomorrow.setHours(20, 0, 0, 0)).getTime(),
        endTime: new Date(tomorrow.setHours(21, 0, 0, 0)).getTime(),
        location: "Зал кроссфита",
        capacity: 12,
        difficulty: "Продвинутый",
        equipment: ["Гири", "Канаты", "Медболы"],
        price: 1500,
        isRecurring: true,
      },
    ];

    for (const classItem of classes) {
      await fetch("/api/classes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classItem),
      });
    }
  };

  const createBookings = async () => {
    // Создаем несколько тестовых бронирований
    const bookings = [
      {
        memberName: "Иван Иванов",
        trainerName: "Анна Петрова",
        startTime: Date.now() + 24 * 60 * 60 * 1000, // завтра
        duration: 60,
        workoutType: "Персональная тренировка",
        notes: "Хочу поработать над гибкостью",
        price: 2500,
      },
      {
        memberName: "Мария Петрова",
        trainerName: "Михаил Волков",
        startTime: Date.now() + 48 * 60 * 60 * 1000, // послезавтра
        duration: 90,
        workoutType: "Силовая тренировка",
        notes: "Первая тренировка, нужна консультация",
        price: 4500,
      },
    ];

    for (const booking of bookings) {
      await fetch("/api/bookings/create-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
    }
  };

  const createOrders = async () => {
    // Создаем несколько тестовых заказов
    const orders = [
      {
        memberName: "Иван Иванов",
        items: [
          { productName: "Протеиновый коктейль", quantity: 1, price: 350 },
          { productName: "Энергетический батончик", quantity: 2, price: 180 },
        ],
        totalAmount: 710,
        status: "ready",
        pickupType: "counter",
        paymentMethod: "card",
      },
      {
        memberName: "Алексей Сидоров",
        items: [
          { productName: "BCAA", quantity: 1, price: 450 },
          { productName: "Фитнес-бутылка", quantity: 1, price: 590 },
        ],
        totalAmount: 1040,
        status: "preparing",
        pickupType: "locker",
        paymentMethod: "membership",
      },
    ];

    for (const order of orders) {
      await fetch("/api/orders/create-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚀 Настройка демо-данных FitAccess
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Этот инструмент создаст тестовые данные для демонстрации всех
              возможностей системы FitAccess. Будут созданы тренеры, участники,
              продукты, занятия и тестовые записи.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">
                Что будет создано:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 3 тренера с разными специализациями</li>
                <li>• 3 участника с активными абонементами</li>
                <li>• 8 продуктов в магазине (напитки, спортпит, мерч)</li>
                <li>• 4 групповых занятия на ближайшие дни</li>
                <li>• Тестовые бронирования и заказы</li>
                <li>• Уведомления и статистика</li>
              </ul>
            </div>

            <Button
              onClick={setupDemoData}
              disabled={loading || completed}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Создание данных...
                </>
              ) : completed ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Демо-данные созданы
                </>
              ) : (
                "🎯 Создать демо-данные"
              )}
            </Button>
          </CardContent>
        </Card>
        {/* Лог создания */}
        {results.length > 0 && (
          <Card>
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
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>🔑 Тестовые аккаунты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Участники */}
                <div>
                  <h4 className="font-medium mb-3">Участники:</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="font-medium">Иван Иванов</p>
                      <p className="text-sm text-gray-600">
                        ivan@example.com / member123
                      </p>
                      <Badge className="bg-purple-100 text-purple-800 mt-1">
                        Premium
                      </Badge>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="font-medium">Мария Петрова</p>
                      <p className="text-sm text-gray-600">
                        maria@example.com / member123
                      </p>
                      <Badge className="bg-green-100 text-green-800 mt-1">
                        Basic
                      </Badge>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="font-medium">Алексей Сидоров</p>
                      <p className="text-sm text-gray-600">
                        alexey@example.com / member123
                      </p>
                      <Badge className="bg-yellow-100 text-yellow-800 mt-1">
                        VIP
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Тренеры */}
                <div>
                  <h4 className="font-medium mb-3">Тренеры:</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-pink-50 border border-pink-200 rounded">
                      <p className="font-medium">Анна Петрова</p>
                      <p className="text-sm text-gray-600">
                        anna@fitclub.com / trainer123
                      </p>
                      <p className="text-xs text-gray-500">Йога, Пилатес</p>
                    </div>
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded">
                      <p className="font-medium">Михаил Волков</p>
                      <p className="text-sm text-gray-600">
                        mikhail@fitclub.com / trainer123
                      </p>
                      <p className="text-xs text-gray-500">Силовые, Кроссфит</p>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                      <p className="font-medium">Елена Смирнова</p>
                      <p className="text-sm text-gray-600">
                        elena@fitclub.com / trainer123
                      </p>
                      <p className="text-xs text-gray-500">Кардио, Танцы</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">
                  Быстрые ссылки для тестирования:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("/member-login", "_blank")}
                  >
                    Вход участника
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("/staff-login", "_blank")}
                  >
                    Вход персонала
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("/book-trainer", "_blank")}
                  >
                    Запись к тренеру
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("/shop", "_blank")}
                  >
                    Магазин
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Следующие шаги */}
        {completed && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>🎯 Следующие шаги</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Протестируйте систему</h4>
                    <p className="text-sm text-gray-600">
                      Войдите под разными аккаунтами и протестируйте все функции
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Настройте реальные данные</h4>
                    <p className="text-sm text-gray-600">
                      Добавьте реальных тренеров, продукты и расписание занятий
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Интегрируйте оборудование</h4>
                    <p className="text-sm text-gray-600">
                      Подключите камеры для распознавания лиц и сканеры QR-кодов
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Запуск в продакшн</h4>
                    <p className="text-sm text-gray-600">
                      Система готова к использованию в реальном фитнес-центре!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
