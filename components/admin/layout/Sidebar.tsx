"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Shield,
  BarChart3,
  HelpCircle,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";

interface SidebarProps {
  user: any;
  roleTexts: any;
  navigationItems: any[];
  sidebarStats: any;
  systemStatus: any;
  isOnline: boolean;
  lastSync: Date | null;
  retryCount: number;
  scheduleError: any;
  scheduleLoading: boolean;
  syncAllData: () => void;
  hints: string[];
}

export function Sidebar({
  user,
  roleTexts,
  navigationItems,
  sidebarStats,
  systemStatus,
  isOnline,
  lastSync,
  retryCount,
  scheduleError,
  scheduleLoading,
  syncAllData,
  hints
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter()
  const [showHints, setShowHints] = useState(true);
  const StatusIcon = systemStatus.icon;

  const handleIconClick = () => {
    router.push('/');
  };

  return (
    <aside className="sticky top-0 left-0 hidden lg:flex lg:flex-col w-80 bg-white/90 backdrop-blur-sm border-r shadow-sm flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 xl:gap-0 mb-4">
          <div
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={handleIconClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleIconClick();
              }
            }}
            aria-label="Перейти на главную страницу"
          >
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">FitAccess</h2>
            <p className="text-sm text-gray-600">{roleTexts.dashboardTitle || 'Панель управления'}</p>
          </div>
        </div>

        
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Live Stats */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border mx-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {roleTexts.statsTitle || 'Статистика'}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Всего событий:</span>
              <div className="text-right">
                <span className="font-medium text-blue-600">{sidebarStats.totalEvents}</span>
                <div className="text-xs text-blue-600">в системе</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{roleTexts.sessionsLabel || 'Сессии'}:</span>
              <div className="text-right">
                <span className="font-medium text-green-600">{sidebarStats.todayEvents}</span>
                <div className="text-xs text-green-600">сегодня</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">На неделе:</span>
              <div className="text-right">
                <span className="font-medium text-purple-600">{sidebarStats.weekEvents}</span>
                <div className="text-xs text-purple-600">событий</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Завершено:</span>
              <div className="text-right">
                <span className="font-medium text-orange-600">{sidebarStats.completionRate}%</span>
                <div className="text-xs text-orange-600">успешность</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className={`mt-4 mx-4 p-3 rounded-lg bg-gradient-to-r ${systemStatus.bgColor} border`}>
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${systemStatus.color} ${systemStatus.icon === RefreshCw && scheduleLoading ? 'animate-spin' : ''
              }`} />
            <span className={`text-sm font-medium ${systemStatus.color}`}>
              {systemStatus.text}
            </span>
          </div>

          {lastSync && (
            <div className="text-xs text-gray-600 mt-1">
              Обновлено: {lastSync.toLocaleTimeString()}
            </div>
          )}

          {retryCount > 0 && !isOnline && (
            <div className="text-xs text-orange-600 mt-1">
              Попытка {retryCount}/5...
            </div>
          )}

          {scheduleError && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={syncAllData}
                className="text-xs h-7"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Повторить
              </Button>
            </div>
          )}
        </div>

        {/* Hints */}
        {showHints && hints.length > 0 && (
          <div className="mt-4 mx-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-yellow-800 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Подсказки
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHints(false)}
                className="h-5 w-5 p-0 text-yellow-600 hover:text-yellow-800"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {hints.slice(0, 3).map((hint, index) => (
                <div key={index} className="text-xs text-yellow-700 flex items-start gap-1">
                  <div className="w-1 h-1 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
            <span>{isOnline ? 'Онлайн' : 'Офлайн'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={syncAllData}
              disabled={scheduleLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${scheduleLoading ? 'animate-spin' : ''}`} />
            </Button>
            <span>v2.1.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
