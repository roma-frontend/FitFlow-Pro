// app/programs/functional/page.tsx (новый файл)
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Target,
  Clock,
  Users,
  Star,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function FunctionalProgramPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-600 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Функциональный тренинг
              </h1>
            </a>

            <a
              href="/"
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Функциональный тренинг
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Тренировки для повседневной жизни. Развивайте координацию, баланс,
            силу и выносливость через естественные движения.
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
                  Функциональный тренинг направлен на развитие способностей,
                  которые пригодятся в повседневной жизни. Мы используем
                  многосуставные движения и работаем с собственным весом тела,
                  свободными весами и специальным оборудованием.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Направления тренинга:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">TRX тренировки</h4>
                        <p className="text-sm text-gray-600">
                          Работа с петлями TRX
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Кроссфит</h4>
                        <p className="text-sm text-gray-600">
                          Функциональные WOD
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Гиревой спорт</h4>
                        <p className="text-sm text-gray-600">
                          Тренировки с гирями
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Реабилитация</h4>
                        <p className="text-sm text-gray-600">
                          Восстановление после травм
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Преимущества:
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Улучшение координации и баланса
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Развитие функциональной силы
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Повышение выносливости
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">Профилактика травм</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Улучшение качества жизни
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Длительность</p>
                      <p className="text-sm text-gray-600">50-70 минут</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Формат</p>
                      <p className="text-sm text-gray-600">
                        Мини-группы до 6 чел
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Уровень</p>
                      <p className="text-sm text-gray-600">Средний-высокий</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href="/trainers/dmitriy-kozlov"
                    className="block w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg text-center hover:from-orange-600 hover:to-red-700 transition-all font-medium"
                  >
                    Записаться к тренеру
                  </a>
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
                    <span className="text-sm">Функциональная тренировка</span>
                    <span className="font-bold">2300₽</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">TRX тренировка</span>
                    <span className="font-bold">2100₽</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Реабилитационная программа</span>
                    <span className="font-bold">2800₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                Станьте функционально сильными!
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Развивайте силу и координацию для повседневной активности
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/trainers/dmitriy-kozlov"
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Записаться на тренировку
                </a>
                <a
                  href="/trainers"
                  className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Все тренеры
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
