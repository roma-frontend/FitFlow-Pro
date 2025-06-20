// components/admin/settings/components/SettingsPageBreadcrumb.tsx
"use client";

import React from 'react';
import { ChevronRight, Home, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

interface SettingsPageBreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  isMobile?: boolean;
}

export const SettingsPageBreadcrumb = ({
  items = [
    { label: 'Главная', href: '/admin', icon: Home },
    { label: 'Настройки', current: true, icon: Settings }
  ],
  className,
  isMobile = false
}: SettingsPageBreadcrumbProps) => {
  if (isMobile) return null; // Скрываем на мобильных

  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              
              <div className={cn(
                "flex items-center gap-1.5 transition-colors",
                item.current 
                  ? "text-blue-600 font-medium" 
                  : "text-gray-500 hover:text-gray-700"
              )}>
                {Icon && <Icon className="h-4 w-4" />}
                
                {item.href && !item.current ? (
                  <a href={item.href} className="hover:underline">
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
