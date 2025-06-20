// app/programs/yoga/page.tsx (новый файл)
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Heart,
  Clock,
  Users,
  Star,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function YogaProgramPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Йога и релакс</h1>
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
          <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Йога и релакс
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Обретите гармонию тела и духа через древние практики йоги. Улучшите
            гибкость, снимите стресс и найдите внутренний покой.
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
                  Наша программа йоги подходит для людей любого уровня
                  подготовки. Мы сочетаем традиционные асаны с современными
                  методиками, создавая комплексный подход к оздоровлению тела и
                  разума.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Что вас ждет:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Хатха-йога</h4>
                        <p className="text-sm text-gray-600">
                          Базовые асаны для начинающих
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Виньяса-флоу</h4>
                        <p className="text-sm text-gray-600">
                          Динамичные последовательности
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Медитация</h4>
                        <p className="text-sm text-gray-600">
                          Техники осознанности
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Пранаяма</h4>
                        <p className="text-sm text-gray-600">
                          Дыхательные практики
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
                        Улучшение гибкости и подвижности
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Снижение уровня стресса
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Укрепление мышечного корсета
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Улучшение качества сна
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">
                        Повышение концентрации
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
            <Card className="border-pink-200 bg-pink-50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-pink-600" />
                    <div>
                      <p className="font-medium">Длительность</p>
                      <p className="text-sm text-gray-600">60-90 минут</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-pink-600" />
                    <div>
                      <p className="font-medium">Группы</p>
                      <p className="text-sm text-gray-600">До 12 человек</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-pink-600" />
                    <div>
                      <p className="font-medium">Уровень</p>
                      <p className="text-sm text-gray-600">Любой</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href="/trainers/anna-petrova"
                    className="block w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg text-center hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
                  >
                    Записаться к инструктору
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Расписание */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Расписание</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Понедельник</span>
                    <span className="text-sm text-gray-600">19:00 - 20:30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Среда</span>
                    <span className="text-sm text-gray-600">18:00 - 19:30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Пятница</span>
                    <span className="text-sm text-gray-600">17:00 - 18:30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Суббота</span>
                    <span className="text-sm text-gray-600">10:00 - 11:30</span>
                  </div>
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
                    <span className="text-sm">Разовое занятие</span>
                    <span className="font-bold">800₽</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Абонемент 8 занятий</span>
                    <span className="font-bold">5600₽</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Персональное занятие</span>
                    <span className="font-bold">2000₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Галерея/Видео */}
        <div className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Атмосфера занятий</CardTitle>
              <CardDescription>
                Посмотрите, как проходят наши занятия йогой
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Заглушки для изображений */}
                <div className="aspect-video bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg flex items-center justify-center">
                  <Heart className="h-12 w-12 text-pink-600" />
                </div>
                <div className="aspect-video bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center">
                  <Users className="h-12 w-12 text-purple-600" />
                </div>
                <div className="aspect-video bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg flex items-center justify-center">
                  <Star className="h-12 w-12 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Отзывы */}
        <div className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Отзывы участников</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-pink-50 p-6 rounded-lg">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Йога с Анной изменила мою жизнь! Стала более гибкой,
                    спокойной и уверенной в себе. Очень рекомендую!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">М</span>
                    </div>
                    <div>
                      <p className="font-medium">Мария</p>
                      <p className="text-sm text-gray-600">
                        Занимается 8 месяцев
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Прекрасная атмосфера, профессиональный подход. После
                    занятий чувствую себя обновленной и энергичной."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">Е</span>
                    </div>
                    <div>
                      <p className="font-medium">Елена</p>
                      <p className="text-sm text-gray-600">Занимается 1 год</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                Начните свой путь к гармонии
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Присоединяйтесь к нашим занятиям йогой и откройте для себя мир
                внутреннего покоя
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/trainers/anna-petrova"
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Записаться на занятие
                </a>
                <a
                  href="/trainers"
                  className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Все программы
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
