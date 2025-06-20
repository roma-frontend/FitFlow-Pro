// components/admin/settings/components/SettingsHeaderActions.tsx
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Download, 
  Upload, 
  RotateCcw, 
  HelpCircle, 
  Bell,
  Settings,
  FileText,
  Shield
} from 'lucide-react';

interface SettingsHeaderActionsProps {
  onExport?: () => void;
  onImport?: () => void;
  onReset?: () => void;
  onHelp?: () => void;
  onNotifications?: () => void;
  onViewLogs?: () => void;
  onSecurity?: () => void;
  disabled?: boolean;
}

export const SettingsHeaderActions = ({
  onExport,
  onImport,
  onReset,
  onHelp,
  onNotifications,
  onViewLogs,
  onSecurity,
  disabled = false
}: SettingsHeaderActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="group p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
        >
          <MoreVertical className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {/* Основные действия */}
        {onExport && (
          <DropdownMenuItem onClick={onExport} className="cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Экспорт настроек
          </DropdownMenuItem>
        )}
        
        {onImport && (
          <DropdownMenuItem onClick={onImport} className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Импорт настроек
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Дополнительные действия */}
        {onViewLogs && (
          <DropdownMenuItem onClick={onViewLogs} className="cursor-pointer">
            <FileText className="h-4 w-4 mr-2" />
            Просмотр логов
          </DropdownMenuItem>
        )}
        
        {onSecurity && (
          <DropdownMenuItem onClick={onSecurity} className="cursor-pointer">
            <Shield className="h-4 w-4 mr-2" />
            Безопасность
          </DropdownMenuItem>
        )}
        
        {onNotifications && (
          <DropdownMenuItem onClick={onNotifications} className="cursor-pointer">
            <Bell className="h-4 w-4 mr-2" />
            Уведомления
          </DropdownMenuItem>
        )}
        
        {onHelp && (
          <DropdownMenuItem onClick={onHelp} className="cursor-pointer">
            <HelpCircle className="h-4 w-4 mr-2" />
            Справка
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Опасные действия */}
        {onReset && (
          <DropdownMenuItem 
            onClick={onReset} 
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Сбросить настройки
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

