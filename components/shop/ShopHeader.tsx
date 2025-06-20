import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useShopStore } from '@/stores/shopStore';
import { getRoleDisplayName } from '@/utils/productUtils';

interface ShopHeaderProps {
  user: any;
  onBack: () => void;
}

const ShopHeader = memo(({ user, onBack }: ShopHeaderProps) => {
  const { getTotalItems } = useCartStore();
  const { orderStep, setOrderStep } = useShopStore();
  const totalItems = getTotalItems();

  const getStepTitle = () => {
    switch (orderStep) {
      case 'shop': return 'Выберите товары';
      case 'cart': return 'Корзина';
      case 'checkout': return 'Оформление заказа';
      case 'payment': return 'Оплата';
      case 'confirm': return 'Заказ оформлен';
      default: return '';
    }
  };

  const handleBackClick = () => {
    if (orderStep === 'shop') {
      onBack();
    } else {
      setOrderStep('shop');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Магазин FitAccess
              </h1>
              <p className="text-sm text-gray-500">
                {getStepTitle()}
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <UserInfo user={user} />
            
            {/* Cart Button */}
            <CartButton 
              totalItems={totalItems}
              onClick={() => setOrderStep('cart')}
            />
          </div>
        </div>
      </div>
    </header>
  );
});

const UserInfo = memo(({ user }: { user: any }) => (
  <div className="flex items-center space-x-2 text-sm text-gray-600">
    <User className="h-4 w-4" />
    <span>{user?.name}</span>
    <Badge variant="outline" className="text-xs">
      {getRoleDisplayName(user?.role)}
    </Badge>
  </div>
));

const CartButton = memo(({ totalItems, onClick }: { 
  totalItems: number; 
  onClick: () => void; 
}) => (
  <Button variant="outline" onClick={onClick} className="relative">
    <ShoppingCart className="h-4 w-4 mr-2" />
    Корзина
    {totalItems > 0 && (
      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {totalItems}
      </Badge>
    )}
  </Button>
));

ShopHeader.displayName = 'ShopHeader';
UserInfo.displayName = 'UserInfo';
CartButton.displayName = 'CartButton';

export default ShopHeader;
