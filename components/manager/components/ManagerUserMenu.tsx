// components/manager/components/ManagerUserMenu.tsx
"use client";

import { useState, memo } from "react";
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
  DollarSign,
  Building2,
  Bug,
  Eye,
  EyeOff,
  ChevronDown,
  Crown,
  TrendingUp,
} from "lucide-react";
import { ManagerStats } from "@/contexts/ManagerContext";
import { useAuth } from "@/hooks/useAuth";

interface ManagerUserMenuProps {
  user: any;
  stats: ManagerStats; // ✅ Используем тип из контекста
  isLoading?: boolean;
  showDebug?: boolean;
  setShowDebug?: (show: boolean) => void;
}

const ManagerUserMenu = memo(({
  user,
  stats,
  isLoading = false,
  showDebug = false,
  setShowDebug = () => {},
}: ManagerUserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {logout} = useAuth()

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const handleMenuItemClick = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  // ✅ Статистика менеджера (используем только доступные поля)
  const managerStats = [
    {
      label: "Всего тренеров",
      value: stats?.totalTrainers || 0,
      icon: Users,
      color: "text-indigo-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    },
    {
      label: "Доход за месяц",
      value: `${((stats?.monthlyRevenue || 0) / 1000).toFixed(0)}К`,
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    },
    {
      label: "Всего клиентов",
      value: stats?.totalClients || 0,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
    },
    {
      label: "Новые клиенты",
      value: stats?.newClients || 0,
      icon: Building2,
      color: "text-orange-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
    },
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          disabled={isLoading}
          className="flex items-center gap-2 text-white hover:bg-white/20 hover:backdrop-blur-sm hover:scale-105 transition-all duration-300 ease-out px-2 sm:px-3 h-8 sm:h-9 rounded-xl"
        >
          <div className="relative">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-white/30 shadow-lg transition-all duration-300 hover:border-white/50">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-gradient-to-br from-orange-500/30 to-red-500/20 text-white text-xs font-semibold backdrop-blur-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'M'}
              </AvatarFallback>
            </Avatar>
            
            {/* ✅ Индикатор менеджера с короной */}
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
              <Crown className="h-2 w-2 text-white" />
            </div>
          </div>
          
          <div className="hidden sm:block text-left min-w-0">
            <div className="text-sm font-semibold text-white truncate max-w-24 lg:max-w-32 drop-shadow-sm">
              {user?.name || 'Менеджер'}
            </div>
            <div className="text-xs text-white/80 font-medium">
              {user?.role === 'manager' ? 'Менеджер' : 'Администратор'}
            </div>
          </div>
          
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-white/80 transition-transform duration-300 hover:rotate-180" />
          
          {/* ✅ Современный индикатор загрузки */}
          {isLoading && (
            <div className="absolute top-0 right-0 h-2 w-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse shadow-lg" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-72 sm:w-80 border-0 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl"
        sideOffset={8}
      >
        {/* ✅ Современный заголовок профиля менеджера */}
        <DropdownMenuLabel className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-orange-200 shadow-lg">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-orange-500 to-red-500 text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                </AvatarFallback>
              </Avatar>
              
              {/* Корона менеджера */}
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <Crown className="h-3 w-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800 truncate">
                  {user?.name || 'Менеджер'}
                </h3>
                {user?.isVerified && (
                  <div className="p-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600 truncate mb-2 font-medium">
                {user?.email || 'manager@fitnesspro.com'}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-sm">
                  <Crown className="w-2 h-2 mr-1" />
                  Менеджер
                </Badge>
                
                {stats?.averageRating && (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-amber-50 to-orange-100 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-amber-500 fill-current" />
                    <span className="text-xs font-semibold text-amber-700">{stats.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="border-gray-200" />

        {/* ✅ Современная статистика менеджера */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-gray-800">Статистика управления</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {managerStats.map((stat, index) => {
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

        {/* ✅ Современные меню действий для менеджера */}
        <div className="p-2 space-y-1">
          <DropdownMenuItem 
            onClick={() => handleMenuItemClick(() => console.log('Open profile'))}
            className="flex items-center gap-3 p-3 cursor-pointer rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-100 hover:border-orange-200 transition-all duration-300 hover:shadow-md"
          >
            <div className="p-2 bg-white/70 rounded-lg shadow-sm">
              <User className="h-4 w-4 text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-800">Профиль менеджера</div>
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
              <div className="text-sm font-semibold text-gray-800">Настройки системы</div>
              <div className="text-xs text-gray-600">Конфигурация платформы</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => handleMenuItemClick(() => console.log('Open analytics'))}
            className="flex items-center gap-3 p-3 cursor-pointer rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-md"
          >
            <div className="p-2 bg-white/70 rounded-lg shadow-sm">
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-800">Аналитика бизнеса</div>
              <div className="text-xs text-gray-600">Отчеты и метрики</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => handleMenuItemClick(() => console.log('Open trainers'))}
            className="flex items-center gap-3 p-3 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-md"
          >
            <div className="p-2 bg-white/70 rounded-lg shadow-sm">
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-800">Управление тренерами</div>
              <div className="text-xs text-gray-600">Команда и персонал</div>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="border-gray-200 mx-2" />

        {/* ✅ Отладка для менеджера (только если setShowDebug передан) */}
        {setShowDebug && (
          <>
            <div className="p-2">
              <DropdownMenuItem 
                onClick={() => handleMenuItemClick(() => setShowDebug(!showDebug))}
                className="flex items-center gap-3 p-3 cursor-pointer rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border border-yellow-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-md"
              >
                <div className="p-2 bg-white/70 rounded-lg shadow-sm">
                  <Bug className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">Системная отладка</div>
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
          </>
        )}

        {/* ✅ Современная кнопка выхода для менеджера */}
        <div className="p-2">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 cursor-pointer rounded-xl bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-md"
          >
            <div className="p-2 bg-white/70 rounded-lg shadow-sm">
              <LogOut className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-700">Завершить сессию</div>
              <div className="text-xs text-red-600">Выйти из системы</div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ManagerUserMenu.displayName = 'ManagerUserMenu';

export default ManagerUserMenu;
