// app/programs/strength/page.tsx (новый файл)
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dumbbell,
  Clock,
  Users,
  Star,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function StrengthProgramPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-700 rounded-lg flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Силовой тренинг
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
        {/* Hero секция */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Dumbbell className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Силовой тренинг
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Наращивайте мышечную массу, увеличивайте силу и формируйте рельефное
            тело под руководством опытного тренера-пауэрлифтера.
          </p>
        </div>

        {/* Основная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Описание программы */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">О программе</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Наша программа силового тренинга основана на научных принципах
                  прогрессивной перегрузки и периодизации. Подходит как для
                  новичков, так и для опытных атлетов.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Направления:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Пауэрлифтинг</h4>
                        <p className="text-sm text-gray-600">
                          Приседания, жим, становая
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Бодибилдинг</h4>
                        <p className="text-sm text-gray-600">
                          Работа на массу и рельеф
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Кроссфит</h4>
                        <p className="text-sm text-gray-600">
                          Функциональная сила
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Силовая выносливость</h4>
                        <p className="text-sm text-gray-600">
                          Многоповторные режимы
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
                        Увеличение мышечной массы
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Рост силовых показателей
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Улучшение композиции тела
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Повышение метаболизма
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Укрепление костной ткани
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Быстрая информация */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Длительность</p>
                      <p className="text-sm text-gray-600">45-60 минут</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Формат</p>
                      <p className="text-sm text-gray-600">
                        Персональные/Мини-группы
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Уровень</p>
                      <p className="text-sm text-gray-600">От начального</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href="/trainers/mikhail-volkov"
                    className="block w-full bg-gradient-to-r from-blue-500 to-indigo-700 text-white py-3 px-4 rounded-lg text-center hover:from-blue-600 hover:to-indigo-800 transition-all font-medium"
                  >
                    Записаться к тренеру
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Стоимость */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Стоимость</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Персональная тренировка</span>
                    <span className="font-bold">2500₽</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Мини-группа (2-3 чел.)</span>
                    <span className="font-bold">1500₽/чел</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Составление программы</span>
                    <span className="font-bold">3000₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                Станьте сильнее уже сегодня!
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Начните свой путь к силе и мышечной массе с профессиональным
                тренером
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/trainers/mikhail-volkov"
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
