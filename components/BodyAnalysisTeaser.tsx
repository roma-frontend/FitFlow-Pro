// components/home/BodyAnalysisTeaser.tsx
"use client";

import React, { useState } from 'react';
import {
    Sparkles, Camera, TrendingUp, Award,
    ArrowRight, Zap, Eye, Timer, Target,
    Brain, CheckCircle, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function BodyAnalysisTeaser() {
    const router = useRouter();
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    const handleAnalysisClick = () => {
        router.push('/body-analyze');
    };

    const features = [
        {
            icon: Brain,
            title: "AI Анализ за 30 секунд",
            description: "Просто загрузите фото - AI определит всё автоматически",
            color: "from-blue-500 to-indigo-500"
        },
        {
            icon: Target,
            title: "Точный прогноз результатов",
            description: "Увидьте своё тело через 4, 8 и 12 недель",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: Zap,
            title: "Персональный план",
            description: "Тренировки, питание и добавки под ваши цели",
            color: "from-orange-500 to-red-500"
        }
    ];

    const stats = [
        { value: "98%", label: "Точность прогнозов" },
        { value: "1000+", label: "Успешных анализов" },
        { value: "30 сек", label: "Время анализа" }
    ];

    return (
        <section className="relative overflow-hidden">
            {/* Фоновые элементы */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 py-6">
                {/* Заголовок */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full mb-4">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-medium">Новая AI-технология</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Узнайте потенциал своего
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {" "}тела за 30 секунд
                        </span>
                    </h2>

                    <p className="text-base lg:text-xl text-gray-600 max-w-3xl mx-auto">
                        Революционный AI-анализ создаст персональный план трансформации
                        с точным прогнозом ваших результатов
                    </p>
                </div>

                {/* Основной контент */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                    {/* Левая часть - Демо */}
                    <div className="relative">
                        <div className="relative max-w-md mx-auto">
                            {/* Мокап телефона */}
                            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2" />

                                {/* Интерфейс анализа */}
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                                            <Camera className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">AI Анализ тела</h3>
                                            <p className="text-sm text-gray-600">Загрузите фото</p>
                                        </div>
                                    </div>

                                    {/* Превью фото */}

                                    <div className="relative group">
                                        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-500 blur-2xl opacity-30 group-hover:opacity-60 transition-all duration-700"></div>
                                        <div className="relative backdrop-blur-sm bg-white/20 rounded-2xl p-1 border border-white/30 shadow-2xl">
                                            <div className="h-64 rounded-xl overflow-hidden relative">
                                                <img
                                                    src="https://res.cloudinary.com/dgbtipi5o/image/upload/v1752169759/Hero/ysvhsf3uyfawzqlbq4d9.webp"
                                                    alt="Floating Glass"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-sm opacity-70"></div>
                                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full blur-sm opacity-70"></div>
                                    </div>

                                    {/* Результаты */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                            <span className="text-sm font-medium">Тип тела</span>
                                            <Badge className="bg-blue-100 text-blue-700">Эндоморф</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                            <span className="text-sm font-medium">Потенциал</span>
                                            <Badge className="bg-green-100 text-green-700">Высокий</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                                            <span className="text-sm font-medium">Прогноз</span>
                                            <Badge className="bg-purple-100 text-purple-700">-12 кг</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating элементы */}
                            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 animate-pulse">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                                    <span className="text-sm font-medium">Анализ завершен</span>
                                </div>
                            </div>

                            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm font-medium">Точность 98%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Правая часть - Преимущества */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl lg:text-3xl font-bold mb-6">
                                Персональный анализ тела от AI
                            </h3>
                            <p className="text-base md:text-lg text-gray-600 mb-8">
                                Загрузите фото и получите детальный анализ с персональным планом трансформации
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {features.map((feature, index) => (
                                <Card
                                    key={index}
                                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${hoveredCard === index ? 'scale-105' : ''
                                        }`}
                                    onMouseEnter={() => setHoveredCard(index)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                                                <feature.icon className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                                                <p className="text-gray-600">{feature.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Статистика */}
                        <div className="grid grid-cols-3 gap-4 p-6 bg-white rounded-2xl shadow-lg">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Социальное доказательство */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                    <p className="text-lg text-gray-600">
                        <strong>1000+</strong> пользователей уже получили точные прогнозы
                    </p>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Button
                        size="lg"
                        onClick={handleAnalysisClick}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Camera className="h-6 w-6 mr-3" />
                        Начать бесплатный анализ
                        <ArrowRight className="h-6 w-6 ml-3" />
                    </Button>

                    <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Бесплатно</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-blue-500" />
                            <span>30 секунд</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-purple-500" />
                            <span>Конфиденциально</span>
                        </div>
                    </div>
                </div>

                {/* Дополнительная мотивация */}
                <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">
                        Увидьте свое будущее тело уже сегодня
                    </h3>
                    <p className="text-lg mb-6 opacity-90">
                        Наш AI покажет, как вы будете выглядеть через 3 месяца при соблюдении плана
                    </p>
                    <Button
                        size="lg"
                        variant="secondary"
                        onClick={handleAnalysisClick}
                        className="bg-white text-blue-600 hover:bg-gray-100"
                    >
                        Попробовать прямо сейчас
                    </Button>
                </div>
            </div>
        </section>
    );
}