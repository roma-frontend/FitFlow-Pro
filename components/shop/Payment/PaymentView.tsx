import React, { memo } from 'react';
import { useCartStoreWithDefaults } from '@/hooks/useStoreWithDefaults';
import { useShopStore } from '@/stores/shopStore';
import OrderSummary from '../Checkout/OrderSummary';
import { cartItemToPaymentItem } from '@/utils/cartUtils';
import { ShopPaymentItem } from '@/types/payment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, Package } from 'lucide-react';
import PaymentForm from '../PaymentForm';

const PaymentView = memo(() => {
  const { items, getTotalPrice, clearCart } = useCartStoreWithDefaults();
  const { pickupType, orderNotes, setOrderStep, setReceipt } = useShopStore();

  const handlePaymentSuccess = (paymentReceipt: any) => {
    console.log('✅ Платеж успешен:', paymentReceipt);
    setReceipt(paymentReceipt);
    setOrderStep("confirm");
    clearCart();
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Ошибка платежа:', error);
  };

  if (items.length === 0) {
    setOrderStep('shop');
    return null;
  }

  // Преобразуем CartItem в PaymentItem с типизацией
  const paymentItems: ShopPaymentItem[] = items.map(cartItemToPaymentItem);

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Индикатор прогресса */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Оформление заказа</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-0 space-x-8">
            {/* Шаг 1 - Корзина */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Корзина</span>
            </div>

            <div className="h-px bg-gray-300 flex-1"></div>

            {/* Шаг 2 - Оплата */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-600">Оплата</span>
            </div>

            <div className="h-px bg-gray-300 flex-1"></div>

            {/* Шаг 3 - Подтверждение */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Подтверждение</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Форма оплаты */}
        <PaymentForm
          items={paymentItems}
          totalAmount={getTotalPrice()}
          pickupType={pickupType}
          notes={orderNotes}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        {/* Сводка заказа */}
        <OrderSummary items={items} totalPrice={getTotalPrice()} />
      </div>
    </div>
  );
});

PaymentView.displayName = 'PaymentView';

export default PaymentView;
