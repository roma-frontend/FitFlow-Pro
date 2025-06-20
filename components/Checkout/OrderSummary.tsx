import React from 'react';
import { CartItem } from '@/stores/cartStore';
import { formatProductPrice } from '@/hooks/useShopProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SafeImage from '@/components/common/SafeImage';

interface OrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
}

export default function OrderSummary({ items, totalPrice }: OrderSummaryProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Сводка заказа</span>
          <Badge variant="secondary">
            {totalItems} товаров
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Список товаров */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {/* Изображение */}
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <SafeImage
                  src={item.imageUrl}
                  alt={`${item.name} в заказе`}
                  width={48}
                  height={48}
                  className="w-full h-full"
                  fallbackText="Товар"
                />
              </div>

              {/* Информация */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                <p className="text-xs text-gray-600">
                  {item.quantity} × {formatProductPrice(item.price)}
                </p>
              </div>

              {/* Общая стоимость */}
              <div className="text-sm font-medium">
                {formatProductPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Разделитель */}
        <div className="border-t pt-4">
          {/* Подытог */}
          <div className="flex justify-between text-sm mb-2">
            <span>Подытог:</span>
            <span>{formatProductPrice(totalPrice)}</span>
          </div>

          {/* Доставка */}
          <div className="flex justify-between text-sm mb-2">
            <span>Самовывоз:</span>
            <span className="text-green-600">Бесплатно</span>
          </div>

          {/* Итого */}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Итого:</span>
              <span className="text-blue-600">{formatProductPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Информация о доставке */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-sm text-blue-800 mb-1">
            Информация о получении
          </h4>
          <p className="text-xs text-blue-600">
            Самовывоз из фитнес-центра FitAccess
          </p>
          <p className="text-xs text-blue-600">
            Готовность заказа: в течение 30 минут
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
