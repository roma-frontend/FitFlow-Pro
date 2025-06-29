// app/admin/memberships/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// UI компоненты
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Иконки
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Star,
  Zap,
  Trophy,
  Users,
  Dumbbell,
  Sparkles,
  TrendingUp,
  Shield,
  Gift,
  AlertCircle,
  RefreshCw,
  Info,
  ChevronRight,
  Timer,
  Infinity,
  Eye,
  Settings
} from 'lucide-react';

// Демо-данные абонементов
const membershipPlanTemplates = [
  {
    id: 'basic',
    type: 'basic',
    name: 'Базовый',
    description: 'Идеально для начинающих',
    price: 2990,
    duration: 30,
    features: [
      'Доступ в тренажерный зал',
      'Базовые групповые занятия',
      'Раздевалка и душ',
      'Консультация тренера'
    ],
    limitations: [
      'Без персональных тренировок',
      'Ограниченное время посещения'
    ],
    color: 'from-gray-500 to-gray-600',
    icon: Dumbbell
  },
  {
    id: 'premium',
    type: 'premium',
    name: 'Премиум',
    description: 'Для активных спортсменов',
    price: 4990,
    duration: 30,
    features: [
      'Всё из Базового',
      'Все групповые программы',
      'Сауна и бассейн',
      '2 персональные тренировки',
      'Приоритетная запись'
    ],
    color: 'from-blue-500 to-indigo-600',
    icon: Star,
    popular: true
  },
  {
    id: 'vip',
    type: 'vip',
    name: 'VIP',
    description: 'Максимум возможностей',
    price: 7990,
    duration: 30,
    features: [
      'Всё из Премиум',
      '8 персональных тренировок',
      'Личный шкафчик',
      'Питание в фитнес-баре',
      'Массаж 2 раза в месяц',
      'Приоритетная парковка'
    ],
    color: 'from-purple-500 to-pink-600',
    icon: Trophy,
    discount: 10
  },
  {
    id: 'unlimited',
    type: 'unlimited',
    name: 'Безлимит',
    description: 'Годовой абонемент',
    price: 39900,
    duration: 365,
    features: [
      'Все возможности VIP',
      'Безлимитные тренировки',
      'Гостевые визиты',
      'Заморозка до 30 дней',
      'Специальные мероприятия',
      'Подарочный фитнес-набор'
    ],
    color: 'from-yellow-500 to-orange-600',
    icon: Infinity,
    discount: 25
  }
];

// Демо текущий абонемент
const demoCurrentMembership = {
  _id: 'demo-membership',
  type: 'premium',
  status: 'active',
  startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 дней назад
  expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // через 20 дней
  remainingDays: 20,
  usageStats: {
    visitsThisMonth: 12,
    totalVisits: 47,
    favoriteTime: '18:00-20:00'
  }
};

export default function AdminMembershipsDemo() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('current');

  // Функция для получения шаблона плана
  const getCurrentPlanTemplate = (type: string) => {
    return membershipPlanTemplates.find(template => template.type === type);
  };

  // Функция для получения цвета статуса
  const getDaysLeftColor = (days: number) => {
    if (days > 14) return 'text-green-600';
    if (days > 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Функция для получения сообщения о статусе
  const getDaysLeftMessage = (days: number) => {
    if (days > 14) return 'Абонемент активен';
    if (days > 7) return 'Скоро истекает';
    if (days > 0) return 'Срочно продлите!';
    return 'Абонемент истек';
  };

  const handleBack = () => {
    router.push('/admin');
  };

  const handleDemoAction = () => {
    // Заглушка для демо-действий
    alert('Это демонстрационная страница. Функции покупки недоступны для администраторов.');
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Шапка с уведомлением о демо-режиме */}
      <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm">
        {/* Декоративная линия */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 justify-between">
            {/* Левая часть */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {/* Кнопка назад */}
              <button
                onClick={handleBack}
                className="group p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                aria-label="Назад"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>

              {/* Иконка абонементов */}
              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                
                {/* Индикатор демо */}
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm bg-orange-400" />
              </div>

              {/* Информация о странице */}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Абонементы (Демо)
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Eye className="h-3 w-3 text-orange-500" />
                  <p className="text-sm text-gray-500 truncate">
                    Демонстрация клиентского интерфейса
                  </p>
                </div>
              </div>
            </div>

            {/* Правая часть - действия */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Кнопка настроек */}
              <button
                onClick={() => router.push('/admin/settings')}
                className="group p-2.5 hover:bg-orange-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
                aria-label="Настройки"
              >
                <Settings className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
              </button>

              {/* Индикатор демо-режима */}
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <Eye className="h-3 w-3 mr-1" />
                Демо-режим
              </Badge>
            </div>
          </div>
        </div>

        {/* Предупреждение о демо-режиме */}
        <div className="px-4 pb-3 sm:px-6">
          <Alert className="border-orange-200 bg-orange-50">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Демонстрационный режим:</strong> Это предварительный просмотр страницы абонементов для клиентов. Функции покупки недоступны.
            </AlertDescription>
          </Alert>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="current" className="data-[state=active]:bg-gradient-to-r from-blue-500 to-indigo-500 data-[state=active]:text-white">
              <CreditCard className="h-4 w-4 mr-2" />
              Текущий абонемент
            </TabsTrigger>
            <TabsTrigger value="available" className="data-[state=active]:bg-gradient-to-r from-blue-500 to-indigo-500 data-[state=active]:text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              Доступные планы
            </TabsTrigger>
          </TabsList>

          {/* Текущий абонемент */}
          <TabsContent value="current" className="space-y-6">
            {/* Карточка текущего абонемента */}
            <Card className="overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${getCurrentPlanTemplate(demoCurrentMembership.type)?.color || 'from-gray-500 to-gray-600'}`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {getCurrentPlanTemplate(demoCurrentMembership.type)?.name || demoCurrentMembership.type}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {getCurrentPlanTemplate(demoCurrentMembership.type)?.description}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Активен
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Прогресс оставшихся дней */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Осталось дней</span>
                    <span className={`font-bold ${getDaysLeftColor(demoCurrentMembership.remainingDays)}`}>
                      {demoCurrentMembership.remainingDays} дней
                    </span>
                  </div>
                  <Progress 
                    value={(demoCurrentMembership.remainingDays / 30) * 100} 
                    className="h-3"
                  />
                  <p className={`text-sm ${getDaysLeftColor(demoCurrentMembership.remainingDays)}`}>
                    {getDaysLeftMessage(demoCurrentMembership.remainingDays)}
                  </p>
                </div>

                {/* Даты */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Начало</span>
                    </div>
                    <p className="font-semibold">
                      {new Date(demoCurrentMembership.startDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Окончание</span>
                    </div>
                    <p className="font-semibold">
                      {new Date(demoCurrentMembership.expiresAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                {/* Статистика использования */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Статистика посещений
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {demoCurrentMembership.usageStats.visitsThisMonth}
                      </p>
                      <p className="text-sm text-gray-600">В этом месяце</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {demoCurrentMembership.usageStats.totalVisits}
                      </p>
                      <p className="text-sm text-gray-600">Всего визитов</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">
                        {demoCurrentMembership.usageStats.favoriteTime}
                      </p>
                      <p className="text-sm text-gray-600">Любимое время</p>
                    </div>
                  </div>
                </div>

                {/* Действия (заблокированы в демо) */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 opacity-50 cursor-not-allowed"
                    onClick={handleDemoAction}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Продлить абонемент
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 opacity-50 cursor-not-allowed"
                    onClick={handleDemoAction}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Улучшить план
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-50 cursor-not-allowed"
                    onClick={handleDemoAction}
                  >
                    Отменить
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Преимущества текущего плана */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Ваши преимущества
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getCurrentPlanTemplate(demoCurrentMembership.type)?.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Доступные планы */}
          <TabsContent value="available" className="space-y-6">
            {/* Специальное предложение */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Специальное предложение!</strong> При покупке годового абонемента скидка 25% + подарочный набор для тренировок.
              </AlertDescription>
            </Alert>

            {/* Сетка абонементов */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {membershipPlanTemplates.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = demoCurrentMembership.type === plan.type;
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                      plan.popular ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                        Популярный
                      </div>
                    )}
                    
                    {plan.discount && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-3 py-1 rounded-br-lg">
                        -{plan.discount}%
                      </div>
                    )}
                    
                    <div className={`h-2 bg-gradient-to-r ${plan.color}`} />
                    
                    <CardHeader className="text-center pb-2">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold">
                            {plan.discount 
                              ? Math.round(plan.price * (100 - plan.discount) / 100).toLocaleString()
                              : plan.price.toLocaleString()
                            }
                          </span>
                          <span className="text-gray-600">₽</span>
                        </div>
                        {plan.discount && (
                          <p className="text-sm text-gray-500 line-through">
                            {plan.price.toLocaleString()} ₽
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          {plan.duration === 365 ? 'в год' : 'в месяц'}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                        
                        {plan.features.length > 4 && (
                          <p className="text-sm text-blue-600 font-medium">
                            + еще {plan.features.length - 4} преимуществ
                          </p>
                        )}
                      </div>
                      
                      {plan.limitations && (
                        <div className="space-y-2 pt-2 border-t">
                          {plan.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                              <span className="text-sm text-gray-500">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button 
                        className={`w-full opacity-50 cursor-not-allowed ${
                          isCurrentPlan 
                            ? 'bg-gray-200 text-gray-600' 
                            : `bg-gradient-to-r ${plan.color}`
                        }`}
                        onClick={handleDemoAction}
                      >
                        {isCurrentPlan ? (
                          'Текущий план'
                        ) : (
                          <>
                            Выбрать план (Демо)
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* FAQ секция */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Часто задаваемые вопросы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Можно ли заморозить абонемент?</h4>
                  <p className="text-sm text-gray-600">
                    Да, вы можете заморозить абонемент на срок до 30 дней для годовых планов и до 7 дней для месячных.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Как работает автопродление?</h4>
                  <p className="text-sm text-gray-600">
                    При включенном автопродлении оплата списывается автоматически за день до окончания текущего периода.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Можно ли вернуть деньги?</h4>
                  <p className="text-sm text-gray-600">
                    Возврат возможен в течение 14 дней с момента покупки при условии неиспользования абонемента.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}