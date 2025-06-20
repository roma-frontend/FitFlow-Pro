"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Users,
  Calendar,
  ShoppingCart,
  CheckCircle
} from "lucide-react";
import { NEW_FEATURES } from "@/constants/homeData";

export default function FeaturesSection() {
  return (
    <>
      {/* Новые возможности */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ✨ Новые возможности FitFlow Pro
          </h2>
          <p className="text-lg text-gray-600">
            Передовые технологии для современного фитнес-центра
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {NEW_FEATURES.map((feature, index) => {
            const IconComponent = feature.icon;
            
            // Безопасное извлечение цветов из градиента
            const getGradientColors = (gradient: string) => {
              if (!gradient || typeof gradient !== 'string') {
                return { from: 'blue', to: 'purple' }; // значения по умолчанию
              }
              
              try {
                // Ищем цвета в строке градиента
                const fromMatch = gradient.match(/from-(\w+)-/);
                const toMatch = gradient.match(/to-(\w+)-/);
                
                return {
                  from: fromMatch ? fromMatch[1] : 'blue',
                  to: toMatch ? toMatch[1] : 'purple'
                };
              } catch (error) {
                console.warn('Ошибка парсинга градиента:', gradient);
                return { from: 'blue', to: 'purple' };
              }
            };

            const colors = getGradientColors(feature.gradient);
            
            return (
              <Card 
                key={feature.title} 
                className={`hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-${colors.from}-50 to-${colors.to}-100 border-${colors.from}-200`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Основные возможности */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Управление участниками</h3>
            <p className="text-gray-600 mb-4">
              Полный контроль над членством, абонементами и посещениями
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                Биометрический вход
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                QR-коды для быстрого доступа
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                Статистика посещений
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Запись к тренерам</h3>
            <p className="text-gray-600 mb-4">
              Онлайн-бронирование персональных и групповых тренировок
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                Выбор тренера и времени
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                Групповые занятия
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                Уведомления и напоминания
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Интегрированный магазин</h3>
            <p className="text-gray-600 mb-4">
              Продажа напитков, спортпита и мерча прямо в приложении
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                Онлайн-заказы
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                Управление складом
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                Аналитика продаж
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
