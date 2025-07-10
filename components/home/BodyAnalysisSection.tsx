// components/home/BodyAnalysisSection.tsx
"use client";

import React from 'react';
import { 
  Camera, TrendingUp, Users, Award, 
  Star, ArrowRight, Sparkles, Zap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BodyAnalysisTrigger from '@/components/BodyAnalysisTrigger';

// Данные успешных трансформаций для социального доказательства
const transformations = [
  {
    name: "Анна М.",
    age: 28,
    result: "-12 кг за 12 недель",
    bodyFat: "-8%",
    image: "/testimonials/anna.jpg",
    rating: 5,
    quote: "AI точно предсказал мои результаты!"
  },
  {
    name: "Сергей К.",
    age: 35,
    result: "+5 кг мышц за 16 недель",
    muscleMass: "+15%",
    image: "/testimonials/sergey.jpg",
    rating: 5,
    quote: "Персональный план работает идеально"
  },
  {
    name: "Мария П.",
    age: 42,
    result: "-15 кг за 16 недель",
    bodyFat: "-12%",
    image: "/testimonials/maria.jpg",
    rating: 5,
    quote: "Лучшее решение в моей жизни!"
  }
];

export default function BodyAnalysisSection() {
  return (
    <section className="overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок с WOW-эффектом */}
        <div
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-indigo-500">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Технология 2024
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Узнайте свой
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}потенциал трансформации{" "}
            </span>
            за 30 секунд
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Наш AI анализирует ваше фото и создает персональный план с гарантированным прогнозом результатов
          </p>
        </div>

        {/* Основной блок с визуализацией */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Левая часть - интерактивная демо */}
          <div
            className="relative"
          >
            <div className="relative mx-auto max-w-md">
              {/* Before/After слайдер */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-white/90 text-gray-900">До</Badge>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-green-500 text-white">После 12 недель</Badge>
                </div>
                
                {/* Изображения */}
                <div className="grid grid-cols-2">
                  <div className="bg-gray-200 h-96" />
                  <div className="bg-gray-300 h-96 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent" />
                  </div>
                </div>
                
                {/* AI анализ оверлей */}
                <div
                  className="absolute inset-0 pointer-events-none"
                >
                  {/* Точки анализа */}
                  <div
                    className="absolute top-20 left-10 w-4 h-4 bg-blue-500 rounded-full"
                  />
                  <div
                    className="absolute top-40 right-10 w-4 h-4 bg-pink-500 rounded-full"
                  />
                  <div
                    className="absolute bottom-40 left-20 w-4 h-4 bg-blue-500 rounded-full"
                  />
                </div>
              </div>
              
              {/* Результаты анализа */}
              <div
                className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 max-w-xs"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Прогноз AI</p>
                    <p className="text-lg font-bold text-gray-900">-12 кг за 12 недель</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700">Точность 87%</Badge>
                  <Badge className="bg-blue-100 text-blue-700">Высокий потенциал</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Правая часть - преимущества */}
          <div
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Получите персональный план трансформации
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Наш AI анализирует более 50 параметров вашего тела и создает 
                уникальный план, учитывающий ваши особенности
              </p>
            </div>

            {/* Что вы получите */}
            <div className="space-y-4">
              <FeatureItem
                icon={Camera}
                title="Мгновенный анализ тела"
                description="AI определит тип телосложения, процент жира и мышц"
              />
              <FeatureItem
                icon={TrendingUp}
                title="Точный прогноз результатов"
                description="Визуализация вашей трансформации через 4, 8 и 12 недель"
              />
              <FeatureItem
                icon={Users}
                title="Идеальный тренер и программа"
                description="Автоматический подбор специалиста под ваши цели"
              />
              <FeatureItem
                icon={Zap}
                title="Персональное питание и добавки"
                description="План питания и спортпит для максимальных результатов"
              />
            </div>

            {/* CTA */}
            <div className="pt-6">
              <BodyAnalysisTrigger variant="banner" />
            </div>
          </div>
        </div>

        {/* Социальное доказательство */}
        <div
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Более 1000+ успешных трансформаций
            </h3>
            <p className="text-lg text-gray-600">
              AI точность прогнозов подтверждена реальными результатами
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {transformations.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full" />
                    <div>
                      <h4 className="font-bold text-lg">{item.name}</h4>
                      <p className="text-gray-600">{item.age} лет</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 italic">"{item.quote}"</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div>
                      <p className="text-lg font-bold text-blue-900">{item.result}</p>
                      <p className="text-sm text-blue-700">
                        {item.bodyFat || item.muscleMass}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Финальный CTA */}
        <div
          className="text-center bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl p-12"
        >
          <h3 className="text-3xl font-bold mb-4">
            Готовы узнать свой потенциал?
          </h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам людей, которые уже изменили свою жизнь с помощью AI-анализа
          </p>
          
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            onClick={() => {
              // Открываем модальное окно анализа
              const trigger = document.createElement('div');
              trigger.innerHTML = '<div data-trigger="body-analysis"></div>';
              document.body.appendChild(trigger);
              trigger.click();
              document.body.removeChild(trigger);
            }}
          >
            <Camera className="h-6 w-6 mr-2" />
            Начать бесплатный анализ
            <ArrowRight className="h-6 w-6 ml-2" />
          </Button>
          
          <p className="mt-4 text-sm text-gray-600">
            Без регистрации • Результат за 30 секунд • 100% конфиденциально
          </p>
        </div>
      </div>
    </section>
  );
}

// Компонент для отображения преимуществ
function FeatureItem({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any; 
  title: string; 
  description: string;
}) {
  return (
    <div
      className="flex gap-4 group cursor-pointer"
    >
      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <h4 className="font-bold text-lg mb-1">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}