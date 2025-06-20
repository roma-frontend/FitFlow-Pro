import React, { memo } from 'react';
import { useCartStoreWithDefaults } from '@/hooks/useStoreWithDefaults';
import { useShopStore } from '@/stores/shopStore';
import { useHydration } from '@/hooks/useHydration';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

const CartButton = memo(() => {
  const isHydrated = useHydration();
  const { toggleCart, getTotalItems } = useCartStoreWithDefaults();
  const { orderStep } = useShopStore();
  
  // Показываем базовую версию до гидратации
  if (!isHydrated) {
    return (
      <Button 
        variant="outline" 
        className="relative bg-white/90 backdrop-blur-sm border-white/20 text-gray-700 hover:bg-white"
        aria-label="Корзина (загрузка...)"
        disabled
      >
        <ShoppingCart className="w-5 h-5" aria-hidden="true" />
        <span className="ml-2 hidden sm:inline">Корзина</span>
      </Button>
    );
  }

  const totalItems = getTotalItems();
  const hasItems = totalItems > 0;

  // Не показываем кнопку корзины на шагах оплаты и подтверждения
  if (orderStep !== 'shop') {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={toggleCart}
      className={`relative transition-all duration-200 ${
        hasItems 
          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-lg' 
          : 'bg-white/90 backdrop-blur-sm border-white/20 text-gray-700 hover:bg-white'
      }`}
      aria-label={
        hasItems 
          ? `Открыть корзину с ${totalItems} товарами`
          : "Открыть пустую корзину"
      }
    >
      <ShoppingCart className="w-5 h-5" aria-hidden="true" />
      
      {hasItems && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 border-2 border-white animate-pulse"
          aria-label={`Количество товаров в корзине: ${totalItems}`}
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
      
      <span className="ml-2 hidden sm:inline">
        Корзина
        {hasItems && (
          <span className="sr-only"> ({totalItems} товаров)</span>
        )}
      </span>
    </Button>
  );
});

CartButton.displayName = 'CartButton';

export default CartButton;
