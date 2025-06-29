"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, BarChart3, AlertTriangle, CheckCircle } from "lucide-react";

interface ProductsTabProps {
  productStats: any;
  loading?: boolean; // Добавляем параметр loading
}

export function ProductsTab({ productStats, loading }: ProductsTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Товары по категориям
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Статистика склада
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse text-center p-4 bg-gray-100 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getProductCategoryEntries = () => {
    if (!productStats?.byCategory) return [];
    return Object.entries(productStats.byCategory);
  };

  const getLowStockProducts = () => {
    if (!productStats?.lowStockProducts || !Array.isArray(productStats.lowStockProducts))
      return [];
    return productStats.lowStockProducts.slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Товары по категориям */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Товары по категориям
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getProductCategoryEntries().map(([category, data]: [string, any]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">
                      {data.count} товаров
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex justify-between">
                      <span>В наличии:</span>
                      <span className="font-medium text-green-600">
                        {data.inStock}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Стоимость:</span>
                      <span className="font-medium">
                        ₽{data.totalValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${data.count > 0 ? (data.inStock / data.count) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {getProductCategoryEntries().length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Нет данных о категориях товаров
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Статистика склада */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Статистика склада
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {productStats?.inStock || 0}
                  </div>
                  <div className="text-sm text-green-700">В наличии</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {productStats?.lowStock || 0}
                  </div>
                  <div className="text-sm text-yellow-700">Заканчивается</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {productStats?.outOfStock || 0}
                  </div>
                  <div className="text-sm text-red-700">Нет в наличии</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {productStats?.total || 0}
                  </div>
                  <div className="text-sm text-blue-700">Всего товаров</div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Общая стоимость склада</span>
                  <span className="text-xl font-bold">
                    ₽{(productStats?.totalValue || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Детальный список товаров с низкими остатками */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Требуют пополнения
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getLowStockProducts().length > 0 ? (
            <div className="space-y-3">
              {getLowStockProducts().map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Текущий остаток
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {product.currentStock}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Минимум
                      </div>
                      <div className="text-lg font-bold">
                        {product.minStock}
                      </div>
                    </div>
                    <Badge variant="destructive">Критично</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Все товары в достатке</h3>
              <p className="text-muted-foreground">
                На складе достаточно товаров. Пополнение не требуется.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
