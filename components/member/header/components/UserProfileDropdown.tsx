// components/member/header/components/UserProfileDropdown.tsx
"use client";

import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserProfileDropdownProps } from '../types';

export function UserProfileDropdown({
  user,
  onNavigation,
  onLogout
}: UserProfileDropdownProps) {
  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() 
    : 'JD';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full p-0 hover:bg-white/20 transition-colors"
        >
          <Avatar className="h-8 w-8 ring-2 ring-white/20 hover:ring-white/40 transition-all">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-sm font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
          <Avatar className="h-12 w-12 ring-2 ring-white">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {user?.name || 'John Doe'}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {user?.email || 'john@example.com'}
            </p>
          </div>
        </div>
        
        <DropdownMenuSeparator className="my-2" />
        
        <DropdownMenuItem 
          className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer"
          onClick={() => onNavigation('/profile')}
        >
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <span className="font-medium text-gray-900">Мой профиль</span>
            <p className="text-sm text-gray-500">Управление аккаунтом</p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer"
          onClick={() => onNavigation('/settings')}
        >
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Settings className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <span className="font-medium text-gray-900">Настройки</span>
            <p className="text-sm text-gray-500">Персонализация</p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-2" />
        
        <DropdownMenuItem 
          className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer text-red-600 hover:bg-red-50"
          onClick={onLogout}
        >
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <LogOut className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex-1">
            <span className="font-medium">Выйти</span>
            <p className="text-sm text-red-500">Завершить сеанс</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
