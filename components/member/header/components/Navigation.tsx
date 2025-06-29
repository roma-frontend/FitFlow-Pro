// components/member/header/components/Navigation.tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NavigationProps } from '../types';

export function Navigation({ items, onNavigation }: NavigationProps) {
  return (
    <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-2xl">
      {items.filter(item => item.visible).map((item) => {
        const IconComponent = item.icon;
        return (
          <Button
            key={item.href}
            variant="ghost"
            className="relative text-white/90 hover:text-white hover:bg-white/20 px-3 xl:px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
            onClick={() => onNavigation(item.href)}
          >
            <IconComponent className="h-4 w-4 flex-shrink-0 text-white" />
            <span className="font-medium text-sm text-white">{item.label}</span>
            {item.badge && item.badge !== null && (
              <Badge 
                className={`ml-1 text-xs px-1.5 py-0.5 ${
                  item.badgeColor || 'bg-orange-500 text-white'
                }`}
              >
                {item.badge}
              </Badge>
            )}
          </Button>
        );
      })}
    </nav>
  );
}
