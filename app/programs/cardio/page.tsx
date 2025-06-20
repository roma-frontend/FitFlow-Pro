// app/programs/cardio/page.tsx (новый файл)
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Clock, Users, Star, CheckCircle, ArrowLeft } from "lucide-react";

export default function CardioProgramPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Кардио и похудение</h1>
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
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Flame className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Кардио и похудение
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Эффективные кардио-тренировки для быстрого жиросжигания. 
            Достигните идеальной формы с помощью научно обоснованных методик.
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
                  (высокоинтенсивного интервального тренинга) и метаболических тренировок 
                  для максимального жиросжигания.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Виды тренировок:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">HIIT тренировки</h4>
                        <p className="text-sm text-gray-600">Интервальные нагрузки высокой интенсивности</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Табата</h4>
                        <p className="text-sm text-gray-600">4-минутные супер-интенсивные сеты</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Кардио-силовые</h4>
                        <p className="text-sm text-gray-600">Сочетание кардио и силовых упражнений</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Метаболические</h4>
                        <p className="text-sm text-gray-600">Ускорение обмена веществ</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Результаты:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">Быстрое сжигание жира</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">Улучшение выносливости</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">Ускорение метаболизма</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">Улучшение работы сердца</span>
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
                      <p className="text-sm text-gray-600">Групповые/Персональные</p>
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
                  <a 
                    href="/trainers/elena-smirnova"
                    className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg text-center hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
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
                Присоединяйтесь к эффективным кардио-тренировкам для быстрого результата
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/trainers/elena-smirnova"
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
