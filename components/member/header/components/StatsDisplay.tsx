// components/member/header/components/StatsDisplay.tsx (обновленная версия для градиента)
import React from 'react';
import { Calendar, Target, Clock, TrendingUp } from 'lucide-react';

interface StatsDisplayProps {
  stats: {
    upcoming: number;
    completed: number;
    totalHours: number;
    daysLeft: number;
  };
}

export const StatsDisplay = React.memo(({ stats }: StatsDisplayProps) => {
  const statsData = [
    {
      value: stats.upcoming.toString(),
      label: 'Записей',
      icon: Calendar
    },
    {
      value: stats.completed.toString(),
      label: 'Завершено',
      icon: Target
    },
    {
      value: `${stats.totalHours}ч`,
      label: 'Часов',
      icon: Clock
    },
    {
      value: `${stats.daysLeft}д`,
      label: 'Осталось',
      icon: TrendingUp
    }
  ];

  return (
    <div className="hidden 2xl:flex items-center space-x-4 mr-4">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;

        return (
          <div key={index} className="text-center group cursor-pointer">
            <div className="flex items-center gap-1 mb-1">
              <IconComponent className="h-4 w-4 text-white/80 flex-shrink-0" />
              <div className="text-lg font-bold text-white group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
            </div>
            <div className="text-xs text-white/70 whitespace-nowrap">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
});

StatsDisplay.displayName = 'StatsDisplay';
