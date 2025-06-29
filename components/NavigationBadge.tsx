// components/NavigationBadge.tsx (обновленная версия)
"use client";
import React, { useEffect, useRef } from 'react';
import BadgeIcon from '@/components/ui/BadgeIcon';
import { useHeaderBadges } from '@/hooks/useHeaderBadges';
import type { BadgeVariant } from '@/types/badge';

interface NavigationBadgeProps {
  href: string;
  className?: string;
  onBadgeClick?: () => void;
}

export function NavigationBadge({ 
  href, 
  className,
  onBadgeClick
}: NavigationBadgeProps) {
  const { getBadgeForItem, handleBadgeClick, handleBadgeImpression } = useHeaderBadges();
  const impressionTracked = useRef(false);
  
  // ✅ Получаем badge для данного URL
  const badge = getBadgeForItem(href);
  
  // ✅ Отслеживаем показ badge (только один раз)
  useEffect(() => {
    if (badge && !impressionTracked.current) {
      handleBadgeImpression(href);
      impressionTracked.current = true;
    }
  }, [badge, href, handleBadgeImpression]);

  // ✅ Сброс флага при изменении badge
  useEffect(() => {
    impressionTracked.current = false;
  }, [badge?._id]);

  // ✅ Обработчик клика
  const handleClick = async () => {
    if (badge) {
      await handleBadgeClick(href);
      onBadgeClick?.();
    }
  };

  // ✅ Если нет badge для этого URL, ничего не показываем
  if (!badge) {
    return null;
  }

  return (
    <div 
      className={`cursor-pointer ${className || ''}`} 
      onClick={handleClick}
      title={`${badge.badgeText} - нажмите для подробностей`}
    >
      <BadgeIcon
        variant={badge.badgeVariant as BadgeVariant}
        text={badge.badgeText}
        size="sm"
        animated={true}
        className={badge.customClassName}
      />
    </div>
  );
}
