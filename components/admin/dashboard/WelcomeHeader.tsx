"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, User, Home, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WelcomeHeaderProps {
  user: any;
  roleTexts: any;
  greeting: string;
  onHome: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export function WelcomeHeader({
  user,
  roleTexts,
  greeting,
  onHome,
  onProfile,
  onSettings,
  onLogout
}: WelcomeHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
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
                  className="relative h-12 w-12 mx-auto md:mx-0 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 border-2 border-white/30 hover:border-white/50"
                >
                  <span className="text-lg font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-3 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {user?.name}
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

                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти из системы</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
