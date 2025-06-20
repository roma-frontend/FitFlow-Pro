// components/member/header/components/ProgressSection.tsx
import React from 'react';
import { Target } from 'lucide-react';

interface ProgressSectionProps {
  stats: {
    upcoming: number;
    completed: number;
    totalHours: number;
    daysLeft: number;
  };
}

export const ProgressSection = React.memo(({ stats }: ProgressSectionProps) => {
  const workoutProgress = Math.min((stats.completed / 20) * 100, 100);
  const subscriptionProgress = Math.min((stats.daysLeft / 30) * 100, 100);

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50/80 to-green-50/80 dark:from-blue-950/30 dark:to-green-950/30 rounded-xl border border-gray-200 dark:border-gray-700">
      <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        Ваш прогресс
      </h4>
      
      <div className="space-y-4">
        {/* Тренировки */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Тренировки в месяце
            </span>
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {stats.completed}/20
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${workoutProgress}%` }}
            />
          </div>
        </div>

        {/* Абонемент */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Абонемент
            </span>
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {stats.daysLeft} дней осталось
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${subscriptionProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Дополнительная информация о прогрессе */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {stats.totalHours}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Часов всего</div>
          </div>
          <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {Math.round(workoutProgress)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Выполнено</div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProgressSection.displayName = 'ProgressSection';
