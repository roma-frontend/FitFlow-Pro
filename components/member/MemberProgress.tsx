// components/member/MemberProgress.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  Clock,
  Award,
  Flame,
  Heart
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ProgressStats {
  workoutsThisMonth: number;
  workoutsGoal: number;
  hoursThisMonth: number;
  hoursGoal: number;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  memberSince: string;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

interface MemberProgressProps {
  stats?: ProgressStats;
}

export default function MemberProgress({ 
  stats = {
    workoutsThisMonth: 12,
    workoutsGoal: 20,
    hoursThisMonth: 18,
    hoursGoal: 40,
    currentStreak: 5,
    longestStreak: 12,
    totalWorkouts: 89,
    memberSince: '2023-01-15',
    achievements: [
      {
        id: 'first-workout',
        title: 'Первая тренировка',
        description: 'Добро пожаловать в FitFlow-Pro!',
        icon: '🎯',
        unlockedAt: '2023-01-20'
      },
      {
        id: 'week-streak',
        title: 'Неделя подряд',
        description: '7 дней тренировок подряд',
        icon: '🔥',
        unlockedAt: '2023-02-15'
      },
      {
        id: 'month-goal',
        title: 'Цель месяца',
        description: 'Выполнили план на месяц',
        icon: '🏆',
        unlockedAt: '2023-03-01'
      },
      {
        id: 'fifty-workouts',
        title: '50 тренировок',
        description: 'Половина сотни!',
        icon: '💪',
        unlockedAt: '2023-04-10'
      },
      {
        id: 'hundred-hours',
        title: '100 часов',
        description: 'Впечатляющая выносливость',
        icon: '⏰',
        progress: 85,
        target: 100
      }
    ]
  }
}: MemberProgressProps) {

  const router = useRouter()

  const workoutProgress = (stats.workoutsThisMonth / stats.workoutsGoal) * 100;
  const hoursProgress = (stats.hoursThisMonth / stats.hoursGoal) * 100;
  
  const membershipDuration = Math.floor(
    (new Date().getTime() - new Date(stats.memberSince).getTime()) / (1000 * 60 * 60 * 24)
  );

  const unlockedAchievements = stats.achievements.filter(a => a.unlockedAt);
  const inProgressAchievements = stats.achievements.filter(a => !a.unlockedAt && a.progress);

  return (
    <div className="space-y-6">
      {/* Основная статистика прогресса */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Тренировки в месяце */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-blue-600" />
              Тренировки в месяце
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-bold text-blue-600">
                  {stats.workoutsThisMonth}
                </span>
                <span className="text-sm text-gray-500">
                  из {stats.workoutsGoal}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(workoutProgress, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {Math.round(workoutProgress)}% выполнено
                </span>
                <span className="text-gray-600">
                  {stats.workoutsGoal - stats.workoutsThisMonth > 0 
                    ? `Осталось ${stats.workoutsGoal - stats.workoutsThisMonth}` 
                    : 'Цель достигнута! 🎉'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Часы тренировок */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-green-600" />
              Часы тренировок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-bold text-green-600">
                  {stats.hoursThisMonth}
                </span>
                <span className="text-sm text-gray-500">
                  из {stats.hoursGoal} часов
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(hoursProgress, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {Math.round(hoursProgress)}% выполнено
                </span>
                <span className="text-gray-600">
                  {stats.hoursGoal - stats.hoursThisMonth > 0 
                    ? `Осталось ${stats.hoursGoal - stats.hoursThisMonth}ч` 
                    : 'Отличный результат! 💪'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Статистика и достижения */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Общая статистика */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Общая статистика
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Всего тренировок:</span>
              <span className="font-semibold">{stats.totalWorkouts}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Текущая серия:</span>
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">{stats.currentStreak} дней</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Лучшая серия:</span>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{stats.longestStreak} дней</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Участник уже:</span>
              <span className="font-semibold">{membershipDuration} дней</span>
            </div>
          </CardContent>
        </Card>

        {/* Достижения */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <CardTitle className="flex flex-col md:flex-row gap-4 items-center md:gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Достижения
              <Badge className="bg-yellow-100 text-yellow-800">
                {unlockedAchievements.length}
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm">
              Все достижения
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Разблокированные достижения */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Разблокированные ({unlockedAchievements.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {unlockedAchievements.slice(0, 4).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <h5 className="text-xs font-medium text-gray-900 mb-1">
                        {achievement.title}
                      </h5>
                      <p className="text-xs text-gray-600 leading-tight">
                        {achievement.description}
                      </p>
                      {achievement.unlockedAt && (
                        <p className="text-xs text-yellow-600 mt-1">
                          {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Достижения в процессе */}
              {inProgressAchievements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    В процессе ({inProgressAchievements.length})
                  </h4>
                  <div className="space-y-3">
                    {inProgressAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="text-xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">
                            {achievement.title}
                          </h5>
                          <p className="text-xs text-gray-600 mb-2">
                            {achievement.description}
                          </p>
                          {achievement.progress && achievement.target && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>{achievement.progress}/{achievement.target}</span>
                                <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${(achievement.progress / achievement.target) * 100}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Мотивационная панель */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row text-center md:text-start items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {stats.currentStreak >= 7 
                  ? `Отличная серия! ${stats.currentStreak} дней подряд! 🔥`
                  : stats.workoutsThisMonth >= stats.workoutsGoal
                  ? 'Цель месяца достигнута! Вы великолепны! 🎉'
                  : 'Продолжайте в том же духе! 💪'
                }
              </h3>
              <p className="text-sm text-gray-600">
                                {stats.currentStreak >= 7 
                  ? 'Вы на правильном пути к формированию здоровых привычек!'
                  : stats.workoutsThisMonth >= stats.workoutsGoal
                  ? 'Отличная работа! Теперь можете поставить новую цель.'
                  : `Осталось ${stats.workoutsGoal - stats.workoutsThisMonth} тренировок до цели месяца.`
                }
              </p>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              onClick={() => router.push('/trainers')}
            >
              Записаться на тренировку
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
