// components/trainer/ScheduleManagement.tsx (исправленная версия)
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrainer } from '@/contexts/TrainerContext';
import { 
  Calendar, 
  Clock, 
  Plus, 
  MapPin,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";
import AddWorkoutModal from './modals/AddWorkoutModal';
import EditWorkoutModal from './modals/EditWorkoutModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ScheduleManagement() {
  const { workouts, deleteWorkout } = useTrainer();
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Фильтруем тренировки по выбранной дате
  const selectedDateWorkouts = workouts.filter(w => {
    // Проверяем разные форматы дат
    if (w.date) {
      return w.date === selectedDate;
    }
    if (w.scheduledDate) {
      return w.scheduledDate.split('T')[0] === selectedDate;
    }
    if (w.createdAt) {
      return new Date(w.createdAt).toISOString().split('T')[0] === selectedDate;
    }
    return false;
  });

  const getWorkoutStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Запланировано';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      case 'in-progress': return 'В процессе';
      default: return status || 'Неизвестно';
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!workoutId) return;
    
    const success = await deleteWorkout(workoutId);
    if (success) {
      setDeletingWorkout(null);
      // Можно добавить уведомление об успехе
    } else {
      // Можно добавить уведомление об ошибке
      console.error('Не удалось удалить тренировку');
    }
  };

  // Генерация календаря
  const generateCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const currentDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayWorkouts = workouts.filter(w => {
          if (w.date) return w.date === dateStr;
          if (w.scheduledDate) return w.scheduledDate.split('T')[0] === dateStr;
          if (w.createdAt) return new Date(w.createdAt).toISOString().split('T')[0] === dateStr;
          return false;
        });
        
        const isToday = dateStr === today.toISOString().split('T')[0];
        const isSelected = dateStr === selectedDate;
        const isCurrentMonth = currentDate.getMonth() === currentMonth;

        weekDays.push({
          date: new Date(currentDate),
          dateStr,
          dayNumber: currentDate.getDate(),
          isToday,
          isSelected,
          isCurrentMonth,
          workoutsCount: dayWorkouts.length
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
      calendar.push(weekDays);
    }

    return calendar;
  };

  const calendar = generateCalendar();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Календарь */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Календарь тренировок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                <div key={day} className="text-center font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="space-y-1">
              {calendar.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={`
                        aspect-square p-2 text-center text-sm border rounded-lg cursor-pointer transition-colors
                        ${day.isToday ? 'bg-blue-500 text-white' : ''}
                        ${day.isSelected && !day.isToday ? 'bg-blue-100 border-blue-500' : ''}
                        ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                        ${day.workoutsCount > 0 ? 'border-green-500' : 'border-gray-200'}
                        hover:bg-gray-50
                      `}
                    >
                      <div className="font-medium">{day.dayNumber}</div>
                      {day.workoutsCount > 0 && (
                        <div className="flex justify-center mt-1">
                          <div className={`w-2 h-2 rounded-full ${day.isToday ? 'bg-white' : 'bg-green-500'}`}></div>
                          {day.workoutsCount > 1 && (
                            <span className="text-xs ml-1">{day.workoutsCount}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Тренировки выбранного дня */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Тренировки на {new Date(selectedDate).toLocaleDateString('ru-RU')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateWorkouts.length > 0 ? (
              <div className="space-y-3">
                {selectedDateWorkouts
                  .sort((a, b) => {
                    const timeA = a.time || a.scheduledTime || '00:00';
                    const timeB = b.time || b.scheduledTime || '00:00';
                    return timeA.localeCompare(timeB);
                  })
                  .map((workout) => (
                  <div key={workout.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">
                          {workout.clientName || workout.userName || 'Клиент не указан'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {workout.type || 'Тип не указан'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-800 text-xs px-2 py-1">
                          {workout.time || workout.scheduledTime || 'Время не указано'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingWorkout(workout.id || null)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeletingWorkout(workout.id || null)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {workout.location && (
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{workout.location}</span>
                      </div>
                    )}
                    
                    <Badge className={`${getWorkoutStatusColor(workout.status || '')} text-xs px-2 py-1`}>
                      {getStatusText(workout.status || '')}
                    </Badge>
                    
                    {workout.notes && (
                      <p className="text-xs text-gray-600 mt-2">{workout.notes}</p>
                    )}
                    
                    {workout.duration && (
                      <p className="text-xs text-gray-500 mt-1">
                        Длительность: {workout.duration} мин
                      </p>
                    )}
                    
                    {workout.price && (
                      <p className="text-xs text-gray-500">
                        Стоимость: {workout.price} ₽
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-4">На этот день тренировок нет</p>
                <Button size="sm" onClick={() => setShowAddWorkout(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить тренировку
                </Button>
              </div>
            )}
            
            {selectedDateWorkouts.length > 0 && (
              <Button className="w-full mt-4" onClick={() => setShowAddWorkout(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить тренировку
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Статистика по дням недели */}
      <Card>
        <CardHeader>
          <CardTitle>Загруженность по дням недели</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
              const dayWorkouts = workouts.filter(w => {
                let workoutDate: Date | null = null;
                
                if (w.date) {
                  workoutDate = new Date(w.date);
                } else if (w.scheduledDate) {
                  workoutDate = new Date(w.scheduledDate);
                } else if (w.createdAt) {
                  workoutDate = new Date(w.createdAt);
                }
                
                if (!workoutDate) return false;
                
                const workoutDay = workoutDate.getDay();
                const adjustedDay = workoutDay === 0 ? 6 : workoutDay - 1; // Преобразуем воскресенье
                return adjustedDay === index;
              });
              
              const hours = dayWorkouts.reduce((sum, w) => sum + (w.duration || 60), 0) / 60;
              const maxHours = 10;
              const percentage = Math.min((hours / maxHours) * 100, 100);
              
              return (
                <div key={day} className="text-center">
                  <div className="mb-2">
                    <div className="h-32 bg-gray-200 rounded-lg relative overflow-hidden">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                        style={{ height: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{day}</p>
                  <p className="text-xs text-gray-600">{hours.toFixed(1)}ч</p>
                  <p className="text-xs text-gray-500">{dayWorkouts.length} тр.</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Модальные окна */}
      <AddWorkoutModal 
        isOpen={showAddWorkout} 
        onClose={() => setShowAddWorkout(false)}
        selectedDate={selectedDate}
      />
      
      {editingWorkout && (
        <EditWorkoutModal 
          isOpen={!!editingWorkout}
          workoutId={editingWorkout}
          onClose={() => setEditingWorkout(null)} 
        />
      )}

      {deletingWorkout && (
        <DeleteConfirmModal
          isOpen={!!deletingWorkout}
          title="Удалить тренировку"
          message="Вы уверены, что хотите удалить эту тренировку? Это действие нельзя отменить."
          onConfirm={() => deletingWorkout && handleDeleteWorkout(deletingWorkout)}
          onClose={() => setDeletingWorkout(null)}
        />
      )}
    </div>
  );
}
