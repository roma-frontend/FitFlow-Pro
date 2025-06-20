import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import OrderSkeleton from './OrderSkeleton';

const OrdersPageSkeleton = React.memo(() => (
  <div className="max-w-6xl mx-auto p-6">
    {/* Заголовок скелетон */}
    <div className="mb-8">
      <div className="h-9 bg-gray-200 rounded animate-pulse w-64 mb-2"></div>
      <div className="h-5 bg-gray-200 rounded animate-pulse w-96"></div>
    </div>

    {/* Фильтры и поиск скелетон */}
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="sm:w-48">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Список заказов скелетон */}
    <div className="space-y-4">
      {Array.from({ length: 5 }, (_, i) => (
        <OrderSkeleton key={i} />
      ))}
    </div>
  </div>
));

OrdersPageSkeleton.displayName = 'OrdersPageSkeleton';

export default OrdersPageSkeleton;
