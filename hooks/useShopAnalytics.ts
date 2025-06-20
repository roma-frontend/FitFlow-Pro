import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  timestamp: number;
}

export const useShopAnalytics = () => {
  const { user } = useAuth();

  const sendAnalytics = useCallback(async (event: AnalyticsEvent) => {
    try {
      // Отправляем аналитику на сервер
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Ошибка отправки аналитики:', error);
    }
  }, []);

  const trackPageView = useCallback((page: string) => {
    const event: AnalyticsEvent = {
      event: 'page_view',
      category: 'navigation',
      action: 'view',
      label: page,
      userId: user?.id,
      timestamp: Date.now(),
    };
    sendAnalytics(event);
  }, [user?.id, sendAnalytics]);

  const trackUserAction = useCallback((category: string, action: string, label?: string, value?: number) => {
    const event: AnalyticsEvent = {
      event: 'user_action',
      category,
      action,
      label,
      value,
      userId: user?.id,
      timestamp: Date.now(),
    };
    sendAnalytics(event);
  }, [user?.id, sendAnalytics]);

  const trackPurchase = useCallback((orderId: string, amount: number, items: any[]) => {
    const event: AnalyticsEvent = {
      event: 'purchase',
      category: 'ecommerce',
      action: 'purchase',
      label: orderId,
      value: amount,
      userId: user?.id,
      timestamp: Date.now(),
    };
    sendAnalytics(event);

    // Дополнительно трекаем каждый товар
    items.forEach(item => {
      const itemEvent: AnalyticsEvent = {
        event: 'purchase_item',
        category: 'ecommerce',
        action: 'item_purchased',
        label: item.productName,
        value: item.totalPrice,
        userId: user?.id,
        timestamp: Date.now(),
      };
      sendAnalytics(itemEvent);
    });
  }, [user?.id, sendAnalytics]);

  const trackProductView = useCallback((productId: string, productName: string) => {
    const event: AnalyticsEvent = {
      event: 'product_view',
      category: 'ecommerce',
      action: 'view_item',
      label: productName,
      userId: user?.id,
      timestamp: Date.now(),
    };
    sendAnalytics(event);
  }, [user?.id, sendAnalytics]);

  const trackAddToCart = useCallback((productId: string, productName: string, price: number) => {
    const event: AnalyticsEvent = {
      event: 'add_to_cart',
      category: 'ecommerce',
      action: 'add_to_cart',
      label: productName,
      value: price,
      userId: user?.id,
      timestamp: Date.now(),
    };
    sendAnalytics(event);
  }, [user?.id, sendAnalytics]);

  return {
    trackPageView,
    trackUserAction,
    trackPurchase,
    trackProductView,
    trackAddToCart,
  };
};
