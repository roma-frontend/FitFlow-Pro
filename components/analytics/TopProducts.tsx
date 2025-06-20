"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

interface TopProductsProps {
  products: Array<{ name: string; revenue: number }>;
  loading?: boolean;
}

export function TopProducts({ products, loading }: TopProductsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Топ продукты по выручке
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Топ продукты по выручке
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products && products.length > 0 ? (
            products.map((product, index) => (
              <div
                key={`${product.name}-${index}`}
                className="flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="truncate">{product.name}</span>
                </div>
                <span className="font-medium">
                  ₽{product.revenue.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Нет данных о продажах продуктов
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
