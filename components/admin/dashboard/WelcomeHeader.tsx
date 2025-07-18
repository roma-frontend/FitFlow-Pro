// components/admin/dashboard/WelcomeHeader.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, User, Home, Settings, LogOut, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useState, useCallback, useMemo } from "react";
import { useLoaderStore } from "@/stores/loaderStore"; // ✅ ДОБАВИЛИ

interface WelcomeHeaderProps {
  roleTexts: {
    roleDisplayName: string;
    dashboardSubtitle: string;
  };
  greeting: string;
  onHome: () => void;
  onProfile: () => void;
  onSettings: () => void;
}

export function WelcomeHeader({
  roleTexts,
  greeting,
  onHome,
  onProfile,
  onSettings,
}: WelcomeHeaderProps) {
  const { user, logout } = useAuth();
  const showLoader = useLoaderStore((state) => state.showLoader); // ✅ ДОБАВИЛИ
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Если пользователь уже вышел, не рендерим компонент
  if (!user) return null;

  // Мемоизированные вычисления
  const userInitials = useMemo(() => {
    return user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }, [user?.name]);

  // ✅ ИЗМЕНИЛИ: новая функция handleLogout с loader
  const handleLogout = async () => {
    setIsLoggingOut(true);

    // ✅ ДОБАВИЛИ: Определяем роль и название для loader
    const getUserRole = () => {
      // Для админ дашборда может быть admin или super-admin
      if (user?.role === "super-admin") return "super-admin";
      if (user?.role === "admin") return "admin";
      // Fallback для других ролей если компонент используется где-то еще
      return user?.role || "admin";
    };

    const getUserRoleName = () => {
      const role = getUserRole();
      switch (role) {
        case "super-admin": return "Супер-админ";
        case "admin": return "Администратор";
        case "manager": return "Менеджер";
        case "trainer": return "Тренер";
        default: return "Администратор";
      }
    };

    // ✅ ДОБАВИЛИ: Показываем loader
    showLoader("logout", {
      userRole: getUserRole(),
      userName: user?.name || user?.email || getUserRoleName(),
      redirectUrl: "/"
    });

    await logout(true);
  };


  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-3 sm:p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between sm:mb-4">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-2xl font-bold mb-2">
              {greeting}, {user?.name || "Пользователь"}!
              <Sparkles className="inline h-6 w-6 ml-2 text-yellow-300" />
            </h1>
            <p className="text-blue-100 text-lg">
              {roleTexts.dashboardSubtitle}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30 truncate"
            >
              {roleTexts.roleDisplayName}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-12 w-12 mx-auto md:mx-0 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 border-2 border-white/30 hover:border-white/50 p-0 overflow-hidden"
                >
                  <Avatar className="h-12 w-12 ring-2 ring-white">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold">
                      {isLoggingOut ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        userInitials
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-3 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-white">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold">
                        {isLoggingOut ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          userInitials
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {user?.name || "Пользователь"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-blue-600 mt-1 font-medium">
                        {roleTexts.roleDisplayName}
                      </p>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onHome} className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Главная страница</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onProfile} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Мой профиль</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onSettings} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* ✅ ИЗМЕНИЛИ: Кнопка выхода с новой логикой */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? "Выход..." : "Выйти из системы"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}