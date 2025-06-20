// components/admin/settings/components/AdaptiveSettingsGrid.tsx
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useAdaptiveSettings } from '@/hooks/useAdaptiveSettings';

interface AdaptiveSettingsGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AdaptiveSettingsGrid = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className
}: AdaptiveSettingsGridProps) => {
  const { isMobile, isTablet, isDesktop } = useAdaptiveSettings();

  const getGridColumns = () => {
    if (isMobile) return `grid-cols-${columns.mobile || 1}`;
    if (isTablet) return `grid-cols-${columns.tablet || 2}`;
    return `grid-cols-${columns.desktop || 3}`;
  };

  const getGapSize = () => {
    const gapSizes = {
      sm: isMobile ? 'gap-2' : 'gap-3',
      md: isMobile ? 'gap-3' : isTablet ? 'gap-4' : 'gap-6',
      lg: isMobile ? 'gap-4' : isTablet ? 'gap-6' : 'gap-8'
    };
    return gapSizes[gap];
  };

  return (
    <div className={cn(
      'grid w-full',
      getGridColumns(),
      getGapSize(),
      'transition-all duration-300',
      className
    )}>
      {children}
    </div>
  );
};
