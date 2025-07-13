// components/face-auth/StatisticsPanel.tsx - Обновленный компонент с Face ID статистикой
"use client";

import React, { memo } from 'react';
import { Activity, Clock, Hash, Shield, Users } from 'lucide-react';
import { StatisticsPanelProps } from '@/types/face-auth.types';

interface ExtendedStatisticsPanelProps extends StatisticsPanelProps {
  additionalStats?: {
    registeredProfiles: number;
    maxProfiles: number;
    isRegistered: boolean;
  };
}

export const StatisticsPanel = memo(({ 
  scanCount, 
  mode, 
  sessionId, 
  lastScanTime,
  additionalStats
}: ExtendedStatisticsPanelProps) => (
  <div className="bg-white/60 backdrop-blur-lg rounded-3xl border border-gray-200/30 p-6 shadow-xl">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <Activity className="w-5 h-5 mr-2 text-purple-500" />
      Статистика сессии
    </h3>

    <div className="space-y-4">
      <StatItem
        icon={<Hash className="w-4 h-4 text-blue-500" />}
        label="Количество сканирований"
        value={scanCount.toString()}
      />
      
      <StatItem
        icon={<Clock className="w-4 h-4 text-green-500" />}
        label="Последнее сканирование"
        value={lastScanTime ? lastScanTime.toLocaleTimeString() : "Нет данных"}
      />
      
      <StatItem
        icon={<Activity className="w-4 h-4 text-orange-500" />}
        label="Режим работы"
        value={mode === "login" ? "Аутентификация" : "Регистрация"}
      />
      
      {additionalStats && (
        <>
          <StatItem
            icon={<Shield className="w-4 h-4 text-purple-500" />}
            label="Face ID статус"
            value={additionalStats.isRegistered ? "Активен" : "Не настроен"}
          />
          
          {additionalStats.isRegistered && (
            <StatItem
              icon={<Users className="w-4 h-4 text-indigo-500" />}
              label="Профили Face ID"
              value={`${additionalStats.registeredProfiles} из ${additionalStats.maxProfiles}`}
            />
          )}
        </>
      )}
      
      <div className="pt-3 border-t border-gray-200/50">
        <div className="text-xs text-gray-500">
          Session: {sessionId.slice(0, 12)}...
        </div>
      </div>
    </div>
  </div>
));

const StatItem = memo(({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
}) => (
  <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg">
    <div className="flex items-center space-x-2">
      {icon}
      <span className="text-sm text-gray-700">{label}:</span>
    </div>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
));