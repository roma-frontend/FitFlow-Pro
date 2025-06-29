"use client";

import { getProfileUrl } from "@/utils/roleHelpers";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  Activity,
  Bell,
} from "lucide-react";
import { useAuth, useRole } from "@/hooks/useAuth";
import { getRoleLabel, getUserDashboardUrl } from "@/utils/roleHelpers";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { role, isAdmin } = useRole();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-white/10 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="text-left hidden sm:block">
            <div className="text-sm font-medium text-white">{user.name}</div>
            <div className="text-xs text-blue-100">
              {getRoleLabel(role || "")}
            </div>
          </div>

          <ChevronDown className="h-4 w-4 text-blue-100" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-64 bg-white border border-gray-200 shadow-lg rounded-xl"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="text-xs text-blue-600 font-medium">
                {getRoleLabel(role || "")}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <div className="py-2">
          <DropdownMenuItem
            onClick={() => navigateTo(getUserDashboardUrl(user))}
            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
          >
            <Activity className="h-4 w-4 text-blue-600" />
            <span>Мой дашборд</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigateTo(getProfileUrl(role || ""))}
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
          >
            <User className="h-4 w-4 text-gray-600" />
            <span>Профиль</span>
          </DropdownMenuItem>

          {isAdmin && (
            <>
              <DropdownMenuItem
                onClick={() => navigateTo("/admin/notifications")}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <Bell className="h-4 w-4 text-gray-600" />
                <span>Уведомления</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigateTo("/admin/settings")}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <Settings className="h-4 w-4 text-gray-600" />
                <span>Настройки</span>
              </DropdownMenuItem>
            </>
          )}

          {isAdmin && (
            <>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={() => navigateTo("/admin")}
                className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 cursor-pointer"
              >
                <Shield className="h-4 w-4 text-purple-600" />
                <span>Админ-панель</span>
              </DropdownMenuItem>
            </>
          )}
        </div>

        <DropdownMenuSeparator className="my-2" />

        <div className="py-2">
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 cursor-pointer text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Выйти</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
