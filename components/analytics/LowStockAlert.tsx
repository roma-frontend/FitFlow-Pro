"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface LowStockProduct {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  category: string;
}

interface LowStockAlertProps {
  products: LowStockProduct[];
  loading?: boolean;
}

export function LowStockAlert({ products, loading }: LowStockAlertProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Низкие остатки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                                        <div className="w-20 h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="w-12 h-3 bg-gray-200 rounded"></div>
                  </div>
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
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Низкие остатки
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products && products.length > 0 ? (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-medium">
                    {product.currentStock}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Мин: {product.minStock}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">
              Все товары в достаточном количестве
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

