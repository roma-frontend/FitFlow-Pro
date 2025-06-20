// components/trainer/components/TrainerUserMenu.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

"use client";

import { useState, memo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  LogOut,
  Shield,
  Star,
  BarChart3,
  Users,
  MessageSquare,
  Calendar,
  Bug,
  Eye,
  EyeOff,
  ChevronDown,
  Sparkles,
  Crown,
  Verified,
  Loader2,
  UserCheck,
} from "lucide-react";
import type { MessageStats, WorkoutStats, SystemStats } from "@/types/trainer";

interface TrainerUserMenuProps {
  messageStats: MessageStats;
  workoutStats: WorkoutStats;
  stats: SystemStats;
  isLoading: boolean;
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
}

const TrainerUserMenu = memo(({
  messageStats,
  workoutStats,
  stats,
  showDebug,
  setShowDebug,
}: TrainerUserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // ✅ Получаем данные пользователя напрямую из useAuth
  const { user, logout, isLoading: authLoading, refreshUser } = useAuth();

  // ✅ Добавляем логирование для отладки
  useEffect(() => {
    console.log('🎯 TrainerUserMenu: состояние', {
      user,
      authLoading,
      hasUser: !!user,
      userName: user?.name,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    });
  }, [user, authLoading]);

  // ✅ Пробуем обновить данные если их нет
  useEffect(() => {
    if (!authLoading && !user && refreshUser) {
      console.log('🔄 TrainerUserMenu: пытаемся обновить данные пользователя...');
      refreshUser();
    }
  }, [authLoading, user, refreshUser]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const handleMenuItemClick = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  // Вспомогательные функции
  const getFullName = (user: any) => {
    if (!user) return 'Загрузка...';
    if (user.name) return user.name;
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email?.split('@')[0] || 'trainer';
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'super-admin': 'Супер-админ',
      'admin': 'Администратор',
      'manager': 'Менеджер',
      'trainer': 'Тренер',
      'member': 'Участник',
      'client': 'Клиент',
      'user': 'Пользователь'
    };
    return roleMap[role] || 'Тренер';
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'super-admin': 'from-purple-500 to-pink-500',
      'admin': 'from-red-500 to-orange-500',
      'manager': 'from-blue-500 to-indigo-500',
      'trainer': 'from-green-500 to-emerald-500',
      'member': 'from-gray-500 to-slate-500',
      'client': 'from-cyan-500 to-blue-500',
      'user': 'from-gray-500 to-slate-500'
    };
    return colorMap[role] || 'from-gray-500 to-slate-500';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super-admin':
        return Crown;
      case 'admin':
        return Shield;
      case 'trainer':
        return UserCheck;
      case 'manager':
        return BarChart3;
      default:
        return User;
    }
  };

  // Статистика
  const userStats = [
    {
      label: "Активные клиенты",
      value: stats?.activeClients || 0,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
    },
    {
      label: "Тренировки сегодня",
      value: workoutStats?.todayWorkouts || 0,
      icon: Calendar,
      color: "text-emerald-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    },
    {
      label: "Непрочитанные",
      value: messageStats?.unreadMessages || 0,
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
    },
    {
      label: "Рейтинг",
      value: user?.rating?.toFixed(1) || stats?.avgRating?.toFixed(1) || "4.5",
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
    },
  ];

  const getUserInitials = (user: any) => {
    if (!user) return '...';
    
    const fullName = getFullName(user);
    const words = fullName.split(' ');
    
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  };

  const getUserAvatar = (user: any) => {
    return user?.avatar || user?.avatarUrl || user?.profileImage;
  };

  const RoleIcon = getRoleIcon(user?.role || 'trainer');

  // ✅ Всегда показываем кнопку, но с разным состоянием
  const isDataLoading = authLoading || (!user && !authLoading);
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          disabled={isDataLoading}
          className="flex items-center gap-2 text-white hover:bg-white/20 hover:backdrop-blur-sm hover:scale-105 transition-all duration-300 ease-out px-2 sm:px-3 h-8 sm:h-9 rounded-xl"
        >
          <div className="relative">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-white/30 shadow-lg transition-all duration-300 hover:border-white/50">
              {isDataLoading ? (
                <AvatarFallback className="bg-gradient-to-br from-white/30 to-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                  <Loader2 className="h-3 w-3 animate-spin" />
                </AvatarFallback>
              ) : (
                <>
                  <AvatarImage 
                    src={getUserAvatar(user)} 
                    alt={getFullName(user)} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-white/30 to-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            
            {/* Индикаторы только если есть данные */}
            {!isDataLoading && user && (
              <>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
                
                {user.role === 'super-admin' && (
                  <div className="absolute -top-1 -left-1 h-4 w-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                    <Crown className="h-2 w-2 text-white" />
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="hidden sm:block text-left min-w-0">
            <div className="text-sm font-semibold text-white truncate max-w-24 lg:max-w-32 drop-shadow-sm">
              {isDataLoading ? 'Загрузка...' : getFullName(user)}
            </div>
            <div className="text-xs text-white/80 font-medium">
              {isDataLoading ? 'Ожидание...' : getRoleDisplayName(user?.role || 'trainer')}
            </div>
          </div>
          
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-white/80 transition-transform duration-300 hover:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-72 sm:w-80 border-0 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl"
        sideOffset={8}
      >
        {isDataLoading ? (
          // Показываем загрузку
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-500">Загрузка данных пользователя...</p>
          </div>
        ) : user ? (
          <>
            {/* Заголовок профиля */}
            <DropdownMenuLabel className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-gray-200 shadow-lg">
                    <AvatarImage 
                      src={getUserAvatar(user)} 
                      alt={getFullName(user)} 
                    />
                    <AvatarFallback className={`text-lg font-semibold bg-gradient-to-br ${getRoleColor(user?.role || 'trainer')} text-white`}>
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Статус онлайн */}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-sm" />
                  
                  {/* Индикатор роли для супер-админа */}
                  {user?.role === 'super-admin' && (
                    <div className="absolute -top-1 -left-1 h-5 w-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 truncate">
                      {getFullName(user)}
                    </h3>
                    {user?.isVerified && (
                      <div className="p-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                        <Verified className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <RoleIcon className="h-3 w-3 text-gray-500" />
                  </div>
                  
                  <div className="text-sm text-gray-600 truncate mb-2 font-medium">
                    {user?.email}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`bg-gradient-to-r ${getRoleColor(user?.role || 'user')} text-white border-0 shadow-sm`}>
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                      {getRoleDisplayName(user?.role || 'user')}
                    </Badge>
                    
                    {user?.rating && (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-50 to-amber-100 px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 text-amber-500 fill-current" />
                        <span className="text-xs font-semibold text-amber-700">
                          {user.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Дополнительная информация */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">ID:</span> {user?.id || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Создан:</span> {
                      user?.createdAt ? 
                      new Date(user.createdAt).toLocaleDateString('ru-RU') : 
                      'N/A'
                    }
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="border-gray-200" />

            {/* Статистика */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-semibold text-gray-800">Статистика</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {userStats.map((stat) => {
                  const IconComponent = stat.icon;
                  
                  return (
                    <div 
                      key={stat.label}
                      className={`flex items-center gap-2 p-3 ${stat.bgColor} rounded-xl border border-gray-100 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer`}
                    >
                      <div className="p-1.5 bg-white/70 rounded-lg shadow-sm">
                        <IconComponent className={`h-3 w-3 ${stat.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-800">{stat.value}</div>
                        <div className="text-xs text-gray-600 truncate font-medium">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DropdownMenuSeparator className="border-gray-200 mx-2" />

            {/* Меню действий */}
            <div className="p-2 space-y-1">
              <DropdownMenuItem 
                onClick={() => handleMenuItemClick(() => console.log('Open profile:', user))}
                className="flex items-center gap-3 p-3 cursor-pointer rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md"
              >
                <div className="p-2 bg-white/70 rounded-lg shadow-sm">
                  <User className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">Профиль</div>
                  <div className="text-xs text-gray-600">Управление профилем</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => handleMenuItemClick(() => console.log('Open settings'))}
                className="flex items-center gap-3 p-3 cursor-pointer rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-md"
              >
                <div className="p-2 bg-white/70 rounded-lg shadow-sm">
                  <Settings className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">Настройки</div>
                  <div className="text-xs text-gray-600">Настройки приложения</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => handleMenuItemClick(() => console.log('Open analytics'))}
                className="flex items-center gap-3 p-3 cursor-pointer rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-100 hover:border-orange-200 transition-all duration-300 hover:shadow-md"
              >
                <div className="p-2 bg-white/70 rounded-lg shadow-sm">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">Аналитика</div>
                  <div className="text-xs text-gray-600">Подробная статистика</div>
                </div>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="border-gray-200 mx-2" />

            {/* Отладка */}
            <div className="p-2">
              <DropdownMenuItem 
                onClick={() => handleMenuItemClick(() => setShowDebug(!showDebug))}
                className="flex items-center gap-3 p-3 cursor-pointer rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border border-yellow-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-md"
              >
                <div className="p-2 bg-white/70 rounded-lg shadow-sm">
                  <Bug className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">Отладка</div>
                  <div className="text-xs text-gray-600">
                    {showDebug ? 'Скрыть отладку' : 'Показать отладку'}
                  </div>
                </div>
                <div className="p-1 bg-white/70 rounded-lg">
                  {showDebug ? (
                    <EyeOff className="h-3 w-3 text-gray-500" />
                  ) : (
                    <Eye className="h-3 w-3 text-gray-500" />
                  )}
                </div>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="border-gray-200 mx-2" />

            {/* Кнопка выхода */}
            <div className="p-2">
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 cursor-pointer rounded-xl bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-md"
              >
                <div className="p-2 bg-white/70 rounded-lg shadow-sm">
                  <LogOut className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-700">Выйти</div>
                  <div className="text-xs text-red-600">Завершить сеанс</div>
                </div>
              </DropdownMenuItem>
            </div>
          </>
        ) : (
          // Если нет данных после загрузки
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500 mb-4">Не удалось загрузить данные пользователя</p>
            <Button
              onClick={() => refreshUser && refreshUser()}
              size="sm"
              variant="outline"
            >
              Повторить попытку
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

TrainerUserMenu.displayName = 'TrainerUserMenu';

export default TrainerUserMenu;