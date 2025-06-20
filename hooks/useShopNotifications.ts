import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

export const useShopNotifications = () => {
  const { toast } = useToast();

  const showNotification = useCallback((
    type: NotificationType, 
    message: string, 
    description?: string,
    duration?: number
  ) => {
    const config = {
      title: message,
      description,
      duration: duration || 5000,
    };

    switch (type) {
      case 'error':
        toast({ ...config, variant: 'destructive' });
        break;
      case 'success':
        toast({ ...config });
        break;
      case 'warning':
        toast({ ...config, variant: 'default' });
        break;
      case 'info':
        toast({ ...config, variant: 'default' });
        break;
    }
  }, [toast]);

  const showOrderNotification = useCallback((orderId: string, status: string) => {
    const messages = {
      'pending': 'Заказ принят в обработку',
      'confirmed': 'Заказ подтвержден',
      'preparing': 'Заказ готовится',
      'ready': 'Заказ готов к получению!',
      'completed': 'Заказ выдан',
      'cancelled': 'Заказ отменен'
    };

    const message = messages[status as keyof typeof messages] || 'Статус заказа изменен';
    
    showNotification(
      status === 'ready' ? 'success' : 'info',
      message,
      `Заказ №${orderId}`
    );
  }, [showNotification]);

  const showProductNotification = useCallback((action: string, productName: string) => {
    const messages = {
      'added': `${productName} добавлен в корзину`,
      'removed': `${productName} удален из корзины`,
      'updated': `Количество ${productName} обновлено`,
      'out_of_stock': `${productName} закончился`
    };

    const message = messages[action as keyof typeof messages] || 'Действие выполнено';
    
    showNotification(
      action === 'out_of_stock' ? 'warning' : 'success',
      message
    );
  }, [showNotification]);

  return {
    showNotification,
    showOrderNotification,
    showProductNotification,
  };
};
