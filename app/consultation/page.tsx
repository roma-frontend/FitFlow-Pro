'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    MessageCircle,
    Bot,
    Users,
    Heart,
    Target,
    Zap,
    Clock,
    Award,
    CheckCircle,
    Star,
    ArrowRight,
    ArrowLeft,
    Home
} from 'lucide-react';

// Импортируем реальный хук вместо mock-версии
import { useAIAgent, AI_ACTIONS } from '@/stores/useAIAgentStore';
import { useRouter } from 'next/navigation';

export default function ConsultationPage() {
    const { openWithAction } = useAIAgent();
    const [autoOpened, setAutoOpened] = useState(false);
    const router = useRouter()

    // Автоматически открываем AI агент при входе на страницу консультации
    useEffect(() => {
        if (!autoOpened) {
            const timer = setTimeout(() => {
                openWithAction(AI_ACTIONS.CONSULTATION, {
                    page: 'consultation',
                    intent: 'fitness_consultation'
                });
                setAutoOpened(true);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [openWithAction, autoOpened]);

    const consultationTypes = [
        {
            icon: Target,
            title: 'Постановка целей',
            description: 'Определим ваши фитнес-цели и составим план их достижения',
            duration: '15-20 мин',
            features: ['Анализ текущего состояния', 'Постановка SMART целей', 'План действий'],
            gradient: 'from-blue-500 to-cyan-500',
            action: () => openWithAction(AI_ACTIONS.CONSULTATION, {
                page: 'consultation',
                intent: 'goal_setting'
            })
        },
        {
            icon: Users,
            title: 'Подбор тренера',
            description: 'Найдем идеального тренера под ваши потребности',
            duration: '10-15 мин',
            features: ['Анализ предпочтений', 'Подбор по специализации', 'Сравнение вариантов'],
            gradient: 'from-purple-500 to-pink-500',
            action: () => openWithAction(AI_ACTIONS.FIND_TRAINER, {
                page: 'consultation',
                intent: 'trainer_selection'
            })
        },
        {
            icon: Heart,
            title: 'Анализ здоровья',
            description: 'Оценим ваше текущее состояние и дадим рекомендации',
            duration: '20-25 мин',
            features: ['Анализ показателей', 'Оценка рисков', 'Персональные рекомендации'],
            gradient: 'from-red-500 to-orange-500',
            action: () => openWithAction(AI_ACTIONS.RECOVERY_ANALYSIS, {
                page: 'consultation',
                intent: 'health_analysis'
            })
        },
        {
            icon: Zap,
            title: 'Программа тренировок',
            description: 'Составим персональную программу тренировок',
            duration: '25-30 мин',
            features: ['Индивидуальный план', 'Прогрессия нагрузок', 'Календарь тренировок'],
            gradient: 'from-green-500 to-emerald-500',
            action: () => openWithAction(AI_ACTIONS.PROGRAM_SELECTION, {
                page: 'consultation',
                intent: 'program_creation'
            })
        }
    ];

    const benefits = [
        {
            icon: Bot,
            title: 'AI-помощник 24/7',
            description: 'Персональный помощник доступен в любое время'
        },
        {
            icon: Award,
            title: 'Экспертные знания',
            description: 'Основано на опыте лучших тренеров и специалистов'
        },
        {
            icon: CheckCircle,
            title: 'Индивидуальный подход',
            description: 'Учитываем ваши особенности и предпочтения'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative mx-auto px-4 py-20">

                    <div className="text-center max-w-4xl mx-auto">
                        <div className='mb-6'>
                            <button
                                onClick={() => router.push("/")}
                                className="group inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20 shadow-lg"
                            >
                                <div className="relative">
                                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300"></div>
                                </div>
                                <span className="text-sm">На главную</span>
                                <Home className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
                            <Bot className="h-5 w-5" />
                            <span className="text-sm font-medium">AI-помощник активирован</span>
                        </div>

                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6">
                            Персональная консультация
                        </h1>
                        <p className="text-base md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Получите экспертную помощь от нашего AI-помощника.
                            Индивидуальный подход к каждому клиенту.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                                <Clock className="h-4 w-4 mr-2" />
                                Быстрые результаты
                            </Badge>
                            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                                <Star className="h-4 w-4 mr-2" />
                                Персональный подход
                            </Badge>
                            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                                <Users className="h-4 w-4 mr-2" />
                                Экспертные знания
                            </Badge>
                        </div>

                        <button
                            onClick={() => openWithAction(AI_ACTIONS.GENERAL_CONSULTATION, {
                                page: 'consultation',
                                intent: 'general_consultation'
                            })}
                            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl text-sm md:text-base font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                        >
                            <MessageCircle className="h-5 w-5" />
                            Начать консультацию
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16">
                {/* Consultation Types */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Виды консультаций
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Выберите подходящий тип консультации для достижения ваших целей
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {consultationTypes.map((type, index) => (
                            <Card
                                key={index}
                                className="group hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border-0 overflow-hidden"
                                onClick={type.action}
                            >
                                <div className={`h-2 bg-gradient-to-r ${type.gradient}`}></div>

                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className={`w-16 h-16 bg-gradient-to-r ${type.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <type.icon className="h-8 w-8 text-white" />
                                        </div>
                                        <Badge variant="custom" className="text-sm">
                                            {type.duration}
                                        </Badge>
                                    </div>

                                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                        {type.title}
                                    </CardTitle>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {type.description}
                                    </p>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-sm text-gray-700">Что включено:</h4>
                                        <ul className="space-y-2">
                                            {type.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-50 group-hover:text-blue-600">
                                            Начать консультацию
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Преимущества AI-консультации
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Современные технологии для максимально эффективного результата
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="text-center group">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <benefit.icon className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 max-w-4xl mx-auto">
                        <CardContent className="p-12">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bot className="h-10 w-10 text-white" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Готовы начать?
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                                Наш AI-помощник уже готов помочь вам достичь ваших фитнес-целей.
                                Получите персональную консультацию прямо сейчас!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => openWithAction(AI_ACTIONS.GENERAL_CONSULTATION, {
                                        page: 'consultation',
                                        intent: 'general_consultation'
                                    })}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Начать консультацию
                                </button>

                                <button
                                    onClick={() => openWithAction(AI_ACTIONS.FIND_TRAINER, {
                                        page: 'consultation',
                                        intent: 'trainer_selection'
                                    })}
                                    className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg border border-gray-200"
                                >
                                    <Users className="h-5 w-5" />
                                    Подобрать тренера
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}