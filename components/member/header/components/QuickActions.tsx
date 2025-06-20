// components/member/header/components/QuickActions.tsx
"use client";

import React from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { QuickActionsProps } from '../types';

export function QuickActions({ onNavigation }: QuickActionsProps) {
  return (
    <div className="hidden md:flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/20 hover:text-white p-2 h-9 w-9 rounded-lg transition-all"
        onClick={() => onNavigation('/search')}
        aria-label="Поиск"
      >
        <Search className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/20 hover:text-white p-2 h-9 w-9 rounded-lg transition-all"
        onClick={() => onNavigation('/create')}
        aria-label="Создать"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
