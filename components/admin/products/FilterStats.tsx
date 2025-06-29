// components/admin/products/FilterStats.tsx
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Package, TrendingUp, AlertTriangle } from 'lucide-react';

interface FilterStatsProps {
  stats: {
    total: number;
    filtered: number;
    categories: Record<string, number>;
    stockLevels: {
      inStock: number;
      lowStock: number;
      outOfStock: number;
    };
    popularity: {
      popular: number;
      regular: number;
    };
  };
}

export const FilterStats = memo(function FilterStats({ stats }: FilterStatsProps) {
  const categoryLabels: Record<string, string> = {
    supplements: 'Добавки',
    drinks: 'Напитки',
    snacks: 'Снеки',
    merchandise: 'Мерч',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Общая статистика */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Продукты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.filtered}
            <span className="text-sm font-normal text-gray-500 ml-1">
              из {stats.total}
            </span>
          </div>
          {stats.filtered !== stats.total && (
            <Badge variant="secondary" className="mt-1">
              Отфильтровано {Math.round((stats.filtered / stats.total) * 100)}%
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Статистика по категориям */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Категории
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category} className="flex justify-between text-sm">
                <span>{categoryLabels[category] || category}</span>
                <Badge variant="outline" className="text-xs text-black">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Статистика по складу */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Склад
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>В наличии</span>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                {stats.stockLevels.inStock}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Заканчивается</span>
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                {stats.stockLevels.lowStock}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Нет в наличии</span>
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                {stats.stockLevels.outOfStock}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика по популярности */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Популярность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Популярные</span>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                {stats.popularity.popular}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Обычные</span>
              <Badge variant="outline" className="text-xs text-yellow-700">
                {stats.popularity.regular}
              </Badge>
            </div>
          </div>
          {stats.popularity.popular > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {Math.round((stats.popularity.popular / stats.total) * 100)}% популярных
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

