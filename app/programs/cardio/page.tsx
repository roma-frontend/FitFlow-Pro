// app/programs/cardio/page.tsx (исправленная версия как в первом файле)
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Flame,
  Clock,
  Users,
  Star,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CardioProgramPage() {
  const router = useRouter();

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Проверяем, авторизован ли пользователь
    const userRole = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_role="))
      ?.split("=")[1];

    console.log("Current user role:", userRole);

    if (!userRole || userRole === "guest") {
      // Если не авторизован, перенаправляем на регистрацию
      console.log("Not authenticated, redirecting to register");
      router.push(
        "/register?redirect=" + encodeURIComponent("/trainers/elena-smirnova")
      );
      return;
    }

    // Если авторизован, идем к тренеру
    const bookingLink = "/trainers/elena-smirnova?action=book";
    console.log("Booking clicked, navigating to:", bookingLink);
    router.push(bookingLink);
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-green-50 to-emerald-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              onClick={() => router.push("/")}
              className="group flex items-center space-x-3 bg-white/80 hover:bg-white border-none sm:border sm:border-green-200/50 sm:hover:border-green-300 rounded-xl p-0 sm:px-4 sm:py-3 transition-all duration-300 ease-out transform hover:scale-105 sm:hover:shadow-lg backdrop-blur-sm"
            >
              <div className="relative w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-600 rounded-lg flex items-center justify-center overflow-hidden group-hover:from-green-500 group-hover:to-emerald-700 transition-all duration-300">
                {/* Светящийся эффект */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-300/40 to-emerald-500/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />

                {/* Flame icon с анимацией */}
                <Flame className="h-5 w-5 text-white relative z-10 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />

                {/* Искры вокруг иконки */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300" />
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-150 transition-opacity duration-300" />
              </div>

              <h1 className="hidden sm:inline-block text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                Кардио и похудение
              </h1>

              {/* Дополнительный индикатор */}
              <div className="w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-600 group-hover:w-6 transition-all duration-300 rounded-full" />
            </Button>

            <Button
              onClick={() => router.push("/")}
              className="group flex items-center gap-3 px-6 py-3 h-auto bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 hover:from-blue-100/90 hover:via-white hover:to-indigo-100/90 border border-blue-200/60 hover:border-blue-300/80 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-105 backdrop-blur-sm"
            >
              <div className="relative flex items-center gap-3">
                {/* Анимированная стрелка */}
                <div className="relative">
                  <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transform group-hover:-translate-x-1 transition-all duration-300" />

                  {/* Эффект движения */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowLeft className="h-4 w-4 text-blue-400 animate-pulse" />
                  </div>
                </div>

                <span className="font-medium text-gray-600 group-hover:text-blue-700 transition-colors duration-300">
                  На главную
                </span>

                {/* Индикатор направления */}
                <div className="w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 group-hover:w-4 transition-all duration-300 rounded-full" />
              </div>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Flame className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Кардио и похудение
          </h1>
          <p className="text-md lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Эффективные кардио-тренировки для быстрого жиросжигания. Достигните
            идеальной формы с помощью научно обоснованных методик.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">О программе</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Наша программа кардио-тренировок основана на принципах HIIT
                  (высокоинтенсивного интервального тренинга) и метаболических
                  тренировок для максимального жиросжигания.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Виды тренировок:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">HIIT тренировки</h4>
                        <p className="text-sm text-gray-600">
                          Интервальные нагрузки высокой интенсивности
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Табата</h4>
                        <p className="text-sm text-gray-600">
                          4-минутные супер-интенсивные сеты
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Кардио-силовые</h4>
                        <p className="text-sm text-gray-600">
                          Сочетание кардио и силовых упражнений
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Метаболические</h4>
                        <p className="text-sm text-gray-600">
                          Ускорение обмена веществ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Результаты:
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Быстрое сжигание жира
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Улучшение выносливости
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Ускорение метаболизма
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Улучшение работы сердца
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">Повышение энергии</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Длительность</p>
                      <p className="text-sm text-gray-600">30-45 минут</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Формат</p>
                      <p className="text-sm text-gray-600">
                        Групповые/Персональные
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Интенсивность</p>
                      <p className="text-sm text-gray-600">Высокая</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleBookClick}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium transform hover:scale-105 shadow-lg hover:shadow-xl border-none"
                  >
                    Записаться к тренеру
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Стоимость</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">HIIT тренировка</span>
                    <span className="font-bold">2200₽</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Групповое кардио</span>
                    <span className="font-bold">1000₽</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Программа питания</span>
                    <span className="font-bold">2800₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                Начните жечь жир уже сегодня!
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Присоединяйтесь к эффективным кардио-тренировкам для быстрого
                результата
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/trainers/elena-smirnova")}
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                >
                  Записаться на тренировку
                </Button>
                <Button
                  onClick={() => router.push("/trainers")}
                  className="bg-transparent px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all transform hover:scale-105"
                >
                  Все тренеры
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CSS для анимационных задержек */}
      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
}
