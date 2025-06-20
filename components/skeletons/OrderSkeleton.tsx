import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const OrderSkeleton = React.memo(() => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Основная информация */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-7 bg-gray-200 rounded animate-pulse w-40"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-36"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-12 mb-1"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
          </div>

          {/* Товары */}
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
          <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </CardContent>
  </Card>
));

OrderSkeleton.displayName = 'OrderSkeleton';

export default OrderSkeleton;
