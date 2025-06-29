// components/trainer/QuickActions.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrainer } from '@/contexts/TrainerContext';
import { 
  Plus,
  Users,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Dumbbell
} from "lucide-react";
import AddWorkoutModal from './modals/AddWorkoutModal';
import AddClientModal from './modals/AddClientModal';

export default function QuickActions() {
  const { clients, workouts } = useTrainer();
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  
  // Safe filtering with date validation
  const todayWorkouts = workouts.filter(w => w.date === today);
  
  const upcomingWorkouts = workouts.filter(w => {
    if (!w.date) return false; // Skip workouts without dates
    
    try {
      const workoutDate = new Date(w.date);
      const currentDate = new Date();
      return workoutDate > currentDate && w.status === 'scheduled';
    } catch (error) {
      console.error('Invalid date format:', w.date);
      return false;
    }
  }).slice(0, 3);

  // Helper function to safely format dates
  const formatWorkoutDate = (dateString: string | undefined) => {
    if (!dateString) return 'Дата не указана';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Неверная дата';
      }
      return date.toLocaleDateString('ru-RU', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Ошибка даты';
    }
  };

  const quickActionCards = [
    {
      title: "Добавить тренировку",
      description: "Запланировать новую тренировку с клиентом",
      icon: Plus,
      color: "from-blue-500 to-blue-600",
      action: () => setShowAddWorkout(true),
      buttonText: "Создать",
      buttonVariant: "default" as const
    },
    {
      title: "Новый клиент", 
      description: "Добавить нового клиента в базу",
      icon: Users,
      color: "from-green-500 to-green-600",
      action: () => setShowAddClient(true),
      buttonText: "Добавить",
      buttonVariant: "outline" as const
    },
    {
      title: "Отчеты",
      description: "Анализ прогресса и статистика",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      action: () => console.log("Открыть отчеты"),
      buttonText: "Просмотреть",
      buttonVariant: "outline" as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActionCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                  onClick={card.action}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${card.color} rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 transition-all duration-300 group-hover:scale-105">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {card.description}
                    </p>
                    <Button 
                      className="w-full" 
                      variant={card.buttonVariant}
                      onClick={(e) => {
                        e.stopPropagation();
                        card.action();
                      }}
                    >
                      {card.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Сегодняшние тренировки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Сегодняшние тренировки
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayWorkouts.length > 0 ? (
            <div className="space-y-4">
              {todayWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Dumbbell className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{workout.clientName || 'Клиент не указан'}</p>
                      <p className="text-sm text-gray-600">{workout.type || 'Тип не указан'}</p>
                      <p className="text-xs text-gray-500">{workout.location || 'Место не указано'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{workout.time || 'Время не указано'}</p>
                    <Badge className={`${
                      workout.status === 'completed' ? 'bg-green-100 text-green-800' :
                      workout.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {workout.status === 'completed' ? 'Завершено' :
                       workout.status === 'scheduled' ? 'Запланировано' : 'Отменено'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">На сегодня тренировок не запланировано</p>
              <Button onClick={() => setShowAddWorkout(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить тренировку
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ближайшие тренировки */}
      {upcomingWorkouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Ближайшие тренировки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">{workout.clientName || 'Клиент не указан'}</p>
                    <p className="text-sm text-gray-600">{workout.type || 'Тип не указан'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatWorkoutDate(workout.date)}
                    </p>
                    <p className="text-xs text-gray-500">{workout.time || 'Время не указано'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Модальные окна */}
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)} 
      />
      <AddClientModal 
        isOpen={showAddClient} 
        onClose={() => setShowAddClient(false)} 
      />
    </div>
  );
}
