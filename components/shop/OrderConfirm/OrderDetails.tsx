import React, { memo } from 'react';

interface OrderDetailsProps {
  orderId: string;
  paymentMethod: string;
  pickupType: string;
}

const OrderDetails = memo(({ orderId, paymentMethod, pickupType }: OrderDetailsProps) => {
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card': return 'Банковская карта';
      case 'cash': return 'Наличные';
      case 'membership': return 'Списание с абонемента';
      default: return method;
    }
  };

  const getPickupTypeText = (type: string) => {
    switch (type) {
      case 'counter': return 'На стойке ресепшн';
      case 'locker': return 'В автомате';
      case 'table': return 'За столиком';
      default: return type;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
      <h4 className="font-medium mb-2">Детали заказа:</h4>
      <div className="text-sm space-y-1">
        <p><strong>Номер заказа:</strong> {orderId}</p>
        <p><strong>Способ оплаты:</strong> {getPaymentMethodText(paymentMethod)}</p>
        <p><strong>Получение:</strong> {getPickupTypeText(pickupType)}</p>
        <p><strong>Время заказа:</strong> {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
});

OrderDetails.displayName = 'OrderDetails';

export default OrderDetails;
