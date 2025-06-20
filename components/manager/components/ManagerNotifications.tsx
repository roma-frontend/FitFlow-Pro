// components/manager/components/ManagerNotifications.tsx
"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";

interface ManagerNotificationsProps {
  isLoggingOut: boolean;
}

const ManagerNotifications = memo(({ isLoggingOut }: ManagerNotificationsProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadNotifications = 2;

  return (
    <DropdownMenu
      open={notificationsOpen}
      onOpenChange={setNotificationsOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 h-8 w-8 sm:h-9 sm:w-9 text-white"
          disabled={isLoggingOut}
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadNotifications > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs bg-red-500 text-white flex items-center justify-center rounded-full animate-pulse">
              {unreadNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 sm:w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      >
        <DropdownMenuLabel className="flex items-center justify-between text-gray-900 dark:text-gray-100">
          <span>Уведомления</span>
          <Badge
            variant="secondary"
            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {unreadNotifications} новых
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        <div className="max-h-64 overflow-y-auto">
          <DropdownMenuItem className="flex-col items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-start justify-between w-full">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  Новый тренер подал заявку
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  Дмитрий Козлов ожидает одобрения
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  5 мин назад
                </p>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex-col items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-start justify-between w-full">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  Превышен лимит записей
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  У Адама Петрова 15 записей на завтра
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  1 час назад
                </p>
              </div>
              <div className="w-2 h-2 bg-red-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuItem className="text-center text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
          Посмотреть все уведомления
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ManagerNotifications.displayName = 'ManagerNotifications';

export default ManagerNotifications;
