// hooks/useHeaderBadges.ts (обновленная версия)
"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { HeaderBadgeSetting } from "@/types/badge";

const getDeviceType = (): string => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export function useHeaderBadges() {
  const { user } = useAuth();
  const [activeBadges, setActiveBadges] = useState<HeaderBadgeSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isApiAvailable = true;

  // ✅ Загрузка активных badge
  const fetchActiveBadges = useCallback(async () => {
    console.log('🔍 Загружаем активные badge...', { 
      userRole: user?.role,
      deviceType: getDeviceType()
    });
    
    try {
      setHasError(false);
      
      const params = new URLSearchParams({
        activeOnly: 'true',
        userRole: user?.role || '',
        deviceType: getDeviceType()
      });

      console.log('📡 Запрос к API:', `/api/badge-settings?${params}`);

      const response = await fetch(`/api/badge-settings?${params}`);
      const result = await response.json();

      console.log('📥 Ответ API:', result);

      if (result.success) {
        setActiveBadges(result.data || []);
        console.log('✅ Загружено badge:', result.data?.length || 0);
        
        // Выводим все badge для отладки
        result.data?.forEach((badge: HeaderBadgeSetting, index: number) => {
          console.log(`🏷️ Badge ${index + 1}: ${badge.navigationItemHref} -> ${badge.badgeText} (${badge.badgeVariant})`);
        });
      } else {
        throw new Error(result.error || 'Ошибка загрузки badge');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки активных badge:', error);
      setHasError(true);
      setActiveBadges([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // ✅ Получение badge для конкретного пункта навигации
  const getBadgeForItem = useCallback((href: string): HeaderBadgeSetting | null => {
    console.log(`🔍 Ищем badge для: ${href}`);
    console.log('📋 Доступные badge:', activeBadges?.map(b => `${b.navigationItemHref} (${b.badgeText})`));
    
    if (!activeBadges || !Array.isArray(activeBadges)) {
      console.log('❌ Нет активных badge');
      return null;
    }
    
    const badge = activeBadges.find((badge: HeaderBadgeSetting) => 
      badge?.navigationItemHref === href
    ) || null;
    
    if (badge) {
      console.log(`✅ Найден badge для ${href}:`, badge);
    } else {
      console.log(`❌ Badge не найден для ${href}`);
    }
    
    return badge;
  }, [activeBadges]);

  // ✅ Отслеживание клика по badge
  const handleBadgeClick = useCallback(async (href: string): Promise<void> => {
    try {
      const badge = getBadgeForItem(href);
      if (!badge?._id) return;

      await fetch('/api/badge-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badgeId: badge._id,
          action: 'click',
          userId: user?.id
        }),
      });
    } catch (error) {
      console.error('Ошибка отслеживания клика badge:', error);
    }
  }, [getBadgeForItem, user?.id]);

  // ✅ Отслеживание показа badge
  const handleBadgeImpression = useCallback(async (href: string): Promise<void> => {
    try {
      const badge = getBadgeForItem(href);
      if (!badge?._id) return;

      await fetch('/api/badge-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badgeId: badge._id,
          action: 'impression',
          userId: user?.id
        }),
      });
    } catch (error) {
      console.error('Ошибка отслеживания показа badge:', error);
    }
  }, [getBadgeForItem, user?.id]);

  // ✅ Загрузка badge при монтировании и изменении пользователя
  useEffect(() => {
    fetchActiveBadges();
  }, [fetchActiveBadges]);

  // ✅ Обновление badge
  const refresh = useCallback(() => {
    console.log('🔄 Обновляем badge...');
    fetchActiveBadges();
  }, [fetchActiveBadges]);

  return {
    activeBadges,
    isLoading,
    isApiAvailable,
    hasError,
    getBadgeForItem,
    handleBadgeClick,
    handleBadgeImpression,
    refresh,
  };
}
