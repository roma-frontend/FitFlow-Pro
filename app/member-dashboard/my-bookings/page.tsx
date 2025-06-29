// app/member-dashboard/my-bookings/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  User,
  Dumbbell,
  ArrowLeft,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Star,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Workout {
  id: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  price: number;
  notes?: string;
  category?: 'trainer' | 'program';
  trainerName?: string;
  trainerSpecializations?: string[];
  programTitle?: string;
  instructor?: string;
  createdAt: string;
}

export default function MyBookingsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter()

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Запрашиваем тренировки...');

      const response = await fetch('/api/my-workouts');
      console.log('📡 Ответ сервера:', response.status, response.statusText);

      const data = await response.json();
      console.log('📦 Данные ответа:', data);

      if (data.success) {
        setWorkouts(data.workouts);
        console.log('✅ Тренировки загружены:', data.workouts.length);
      } else {
        setError(data.error || 'Ошибка получения тренировок');
      }
    } catch (error) {
      console.error('❌ Ошибка запроса:', error);
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Подтверждено';
      case 'pending':
        return 'Ожидает';
      case 'completed':
        return 'Завершено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.trainerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.programTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return new Date(workout.date) > new Date() && workout.status !== 'cancelled';
    }
    if (filter === 'completed') return workout.status === 'completed';
    if (filter === 'cancelled') return workout.status === 'cancelled';
    return true;
  });

  const filterCounts = {
    all: workouts.length,
    upcoming: workouts.filter(w => new Date(w.date) > new Date() && w.status !== 'cancelled').length,
    completed: workouts.filter(w => w.status === 'completed').length,
    cancelled: workouts.filter(w => w.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка тренировок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={handleBack}
                className="group p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                aria-label="Назад"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>

              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>

                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm bg-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  Мои тренировки
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Управление записями и история тренировок
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                onClick={() => router.push('/trainers')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm px-3 sm:px-4"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Записаться к тренеру</span>
                <span className="sm:hidden">Тренер</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/programs')}
                className="border-gray-300 hover:bg-gray-50 transition-colors text-xs sm:text-sm px-3 sm:px-4"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Выбрать программу</span>
                <span className="sm:hidden">Программа</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="text-red-600 font-medium">❌ {error}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWorkouts}
              className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
            >
              Попробовать снова
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, тренеру или программе..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
            />
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <div className="flex items-center justify-between lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Фильтры</span>
            </Button>
            <span className="text-sm text-gray-500">
              {filteredWorkouts.length} из {workouts.length}
            </span>
          </div>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Все', count: filterCounts.all },
                { key: 'upcoming', label: 'Предстоящие', count: filterCounts.upcoming },
                { key: 'completed', label: 'Завершенные', count: filterCounts.completed },
                { key: 'cancelled', label: 'Отмененные', count: filterCounts.cancelled },
              ].map(({ key, label, count }) => (
                <Button
                  key={key}
                  variant={filter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(key)}
                  className={`transition-all ${filter === key
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md'
                    : 'hover:bg-gray-50 border-gray-300'
                    }`}
                >
                  {label} ({count})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Workout List */}
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 max-w-md mx-auto">
              <Dumbbell className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                {filter === 'all' ? 'У вас пока нет тренировок' : `Нет тренировок в категории "${filter}"`}
              </h3>
              <p className="text-gray-600 mb-8 text-sm sm:text-base">
                Запишитесь на тренировку с тренером или групповую программу
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={() => router.push('/trainers')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Записаться к тренеру
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/programs')}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Выбрать программу
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredWorkouts.map((workout) => (
              <Card key={workout.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-gray-100/50">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {workout.type}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getStatusColor(workout.status)} border text-xs font-medium px-2 py-1 rounded-full`}>
                        {getStatusText(workout.status)}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 p-4 sm:p-6">
                  {/* Date and Time */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">
                        {new Date(workout.date).toLocaleDateString('ru-RU', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-lg">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <span>{workout.time} • {workout.duration} мин</span>
                    </div>
                  </div>

                  {/* Trainer or Program Info */}
                  {workout.category === 'trainer' && workout.trainerName && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg shrink-0">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm">{workout.trainerName}</div>
                        {workout.trainerSpecializations && workout.trainerSpecializations.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {workout.trainerSpecializations.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {workout.category === 'program' && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50/50 rounded-xl">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg shrink-0">
                        <Dumbbell className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm">{workout.programTitle}</div>
                        {workout.instructor && (
                          <div className="text-xs text-gray-500 mt-1">
                            Инструктор: {workout.instructor}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  {workout.price > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-600">Стоимость:</span>
                      <span className="text-lg font-bold text-gray-900">{workout.price} ₽</span>
                    </div>
                  )}

                  {/* Notes */}
                  {workout.notes && (
                    <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                      <div className="font-medium text-yellow-800 mb-1">Заметки:</div>
                      {workout.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {workout.status === 'pending' && (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 flex-1 sm:flex-none">
                        Отменить
                      </Button>
                    )}
                    {workout.status === 'confirmed' && new Date(workout.date) > new Date() && (
                      <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200 flex-1 sm:flex-none">
                        Перенести
                      </Button>
                    )}
                    {workout.status === 'completed' && (
                      <Button variant="outline" size="sm" className="text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200 flex-1 sm:flex-none">
                        <Star className="h-3 w-3 mr-1" />
                        Отзыв
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
