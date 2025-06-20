import React, { memo } from 'react';
import { useCartStoreWithDefaults } from '@/hooks/useStoreWithDefaults';
import { useShopStore } from '@/stores/shopStore';
import { useHydration } from '@/hooks/useHydration';
import { useToast } from '@/hooks/use-toast';
import { formatProductPrice } from '@/hooks/useShopProducts';
import { generateFallbackText } from '@/utils/altTextUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Minus, Plus, ShoppingBag, CreditCard } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import SafeImage from '@/components/common/SafeImage';

const Cart = memo(() => {
  const isHydrated = useHydration();
  const { toast } = useToast();
  const { 
    items, 
    isOpen, 
    toggleCart, 
    removeItem, 
    updateQuantity, 
    clearCart,
    getTotalPrice,
    getTotalItems 
  } = useCartStoreWithDefaults();

  const { setOrderStep, setPickupType, setOrderNotes } = useShopStore();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Корзина пуста",
        description: "Добавьте товары в корзину перед оформлением заказа",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Переход к оплате",
      description: `Оформляем заказ на сумму ${formatProductPrice(getTotalPrice())}`,
      variant: "default",
    });

    setPickupType('pickup');
    setOrderNotes('');
    setOrderStep('payment');
    toggleCart();
  };

  // ✅ Change parameter type from Id<"products"> to string
  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeItem(itemId);
    toast({
      title: "Товар удален",
      description: `${itemName} удален из корзины`,
    });
  };

  // ✅ Change parameter type from Id<"products"> to string
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    
    const itemCount = getTotalItems();
    clearCart();
    toast({
      title: "Корзина очищена",
      description: `${itemCount} товаров удалено из корзины`,
    });
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            Корзина
            {getTotalItems() > 0 && (
              <Badge variant="secondary" aria-label={`Товаров в корзине: ${getTotalItems()}`}>
                {getTotalItems()}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {items.length === 0 
              ? "Ваша корзина пуста. Добавьте товары из каталога."
              : `В корзине ${getTotalItems()} товаров на сумму ${formatProductPrice(getTotalPrice())}`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500" role="status">
              <ShoppingBag className="w-12 h-12 mb-4" aria-hidden="true" />
              <p>Корзина пуста</p>
              <p className="text-sm">Добавьте товары из каталога</p>
            </div>
          ) : (
            <div className="space-y-4" role="list" aria-label="Товары в корзине">
              {items.map((item) => {
                const itemAlt = `${item.name} в корзине`;
                const fallbackText = generateFallbackText(item.name);
                
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg" role="listitem">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <SafeImage
                        src={item.imageUrl}
                        alt={itemAlt}
                        width={64}
                        height={64}
                        className="w-full h-full"
                        fallbackText={fallbackText}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatProductPrice(item.price)}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <p className="font-medium text-sm">
                        {formatProductPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Итого:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatProductPrice(getTotalPrice())}
              </span>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleCheckout}
                className="w-full"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Оформить заказ
              </Button>
              
              <Button 
                onClick={handleClearCart}
                variant="outline"
                className="w-full"
              >
                Очистить корзину
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
});

Cart.displayName = 'Cart';

export default Cart;
