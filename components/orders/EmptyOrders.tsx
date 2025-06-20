import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Router } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmptyOrdersProps {
  hasFilters: boolean;
}

const EmptyOrders = React.memo(({ hasFilters }: EmptyOrdersProps) => {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {hasFilters ? 'Заказы не найдены' : 'У вас пока нет заказов'}
        </h3>
        <p className="text-gray-600 mb-6">
          {hasFilters
            ? 'Попробуйте изменить параметры поиска'
            : 'Сделайте первую покупку в нашем магазине'
          }
        </p>
        {!hasFilters && (
          <Button onClick={() => router.push('/shop')}>
            Перейти в магазин
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

EmptyOrders.displayName = 'EmptyOrders';

export default EmptyOrders;
