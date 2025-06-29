import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Receipt as ReceiptIcon } from 'lucide-react';
import Receipt from '@/components/Receipt';
import { Order } from '@/types/order';

interface ReceiptModalProps {
  order: Order;
  user: any;
  onClose: () => void;
  onPrint: (order: Order) => void;
}

const convertOrderToReceipt = (order: Order, user: any) => {
  return {
    receiptId: order._id.slice(-8),
    orderId: order._id,
    paymentId: order.paymentId || order.paymentIntentId || 'unknown',
    amount: order.totalAmount,
    currency: 'RUB',
    paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : new Date(order.orderTime).toISOString(),
    customer: {
      email: user?.email || 'customer@FitFlow-Pro.ru',
      name: user?.name || 'Покупатель',
    },
    items: order.items.map(item => ({
      name: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: item.totalPrice,
    })),
    company: {
      name: 'FitFlow-Pro',
      address: 'г. Москва, ул. Примерная, д. 1',
      inn: '1234567890',
      phone: '+7 (495) 123-45-67',
    },
  };
};

const ReceiptModal = React.memo(({ order, user, onClose, onPrint }: ReceiptModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ReceiptIcon className="h-5 w-5" />
          Чек заказа
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          ✕
        </Button>
      </div>
      <div className="p-4">
        <Receipt receipt={convertOrderToReceipt(order, user)} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <Button
          onClick={() => {
            onClose();
            onPrint(order);
          }}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Печать
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Закрыть
        </Button>
      </div>
    </div>
  </div>
));

ReceiptModal.displayName = 'ReceiptModal';

export default ReceiptModal;
