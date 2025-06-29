import React, { JSX } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

// ✅ ИСПРАВЛЕННЫЕ ТИПЫ
interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  _id: string;
  userId?: string;
  memberId?: string;
  items: OrderItem[];
  totalAmount: number;
  pickupType: string;
  notes?: string;
  status: string; // ✅ Явно указываем string
  paymentStatus: string; // ✅ Явно указываем string
  paymentIntentId?: string;
  paymentId?: string;
  paymentMethod?: string;
  orderTime: number;
  estimatedReadyTime?: number;
  completedTime?: number;
  paidAt?: number;
}

interface OrderCardProps {
  order: Order;
  onViewReceipt: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
}

// ✅ ТИПИЗИРОВАННЫЕ ФУНКЦИИ
const getStatusIcon = (status: string): JSX.Element => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'pending':
    case 'processing':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Ожидает';
    case 'confirmed':
      return 'Подтвержден';
    case 'processing':
      return 'Готовится';
    case 'ready':
      return 'Готов';
    case 'completed':
      return 'Завершен';
    case 'cancelled':
      return 'Отменен';
    default:
      return status;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'ready':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const OrderCard = React.memo(({ order, onViewReceipt, onPrintReceipt }: OrderCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Основная информация */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-semibold text-lg">
              Заказ #{order._id.slice(-8)}
            </h3>
            {/* ✅ ИСПРАВЛЕННЫЙ Badge с явным приведением типов */}
            <Badge className={getStatusColor(order.status)}>
              {getStatusIcon(order.status)}
              <span className="ml-1">{getStatusText(order.status)}</span>
            </Badge>
            {order.paymentStatus === 'paid' && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Оплачен
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Дата заказа:</p>
              <p className="font-medium">
                {new Date(order.orderTime).toLocaleString('ru-RU')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Сумма:</p>
              <p className="font-bold text-lg text-green-600">
                {order.totalAmount.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>

          {/* Товары */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Товары:</p>
            <div className="space-y-1">
              {order.items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex justify-between text-sm">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {item.totalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewReceipt(order)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Просмотр чека
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPrintReceipt(order)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Печать чека
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
));

OrderCard.displayName = 'OrderCard';

export default OrderCard;
