// components/admin/products/ProductCard.tsx
import React, { memo, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Star, Package } from "lucide-react";
import { LazyImage } from "@/components/ui/LazyImage";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string, deleteType: 'soft' | 'hard') => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onDelete
}: ProductCardProps) {
  const handleEdit = useCallback(() => {
    onEdit(product);
  }, [product, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(product._id, product.name, 'soft');
  }, [product._id, product.name, onDelete]);

  const getStockStatus = useCallback(() => {
    if (product.inStock === 0) {
      return { 
        label: 'Нет в наличии', 
        variant: 'destructive' as const,
        bgColor: 'bg-red-100 text-red-800'
      };
    }
    if (product.inStock <= 10) {
      return { 
        label: 'Заканчивается', 
        variant: 'secondary' as const,
        bgColor: 'bg-yellow-100 text-yellow-800'
      };
    }
    return { 
      label: 'В наличии', 
      variant: 'default' as const,
      bgColor: 'bg-green-100 text-green-800'
    };
  }, [product.inStock]);

  const getCategoryLabel = (category: string) => {
    const categoryMap = {
      'supplements': 'Добавки',
      'drinks': 'Напитки',
      'snacks': 'Снеки',
      'merchandise': 'Мерч'
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  const stockStatus = getStockStatus();

  // Добавляем key для принудительного ререндера при изменении данных
  const cardKey = `${product._id}-${product.updatedAt || product.createdAt}`;

  return (
    <Card 
      key={cardKey}
      className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative">
        {/* Изображение */}
        <div className="h-48 w-full overflow-hidden rounded-t-lg bg-gray-100">
          {product.imageUrl ? (
            <LazyImage
              key={`${product._id}-image-${product.updatedAt || product.createdAt}`}
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              fallback="/images/default-product.jpg"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Overlay с действиями */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleEdit}
            className="transform scale-90 group-hover:scale-100 transition-transform"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            className="transform scale-90 group-hover:scale-100 transition-transform"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Популярный товар бейдж */}
        {product.isPopular && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Популярный
            </Badge>
          </div>
        )}

        {/* Количество в наличии */}
        <div className="absolute top-2 right-2">
          <Badge className={`${stockStatus.bgColor} border-0 font-medium`}>
            <Package className="h-3 w-3 mr-1" />
            {product.inStock} шт
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Название */}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
            {product.name}
          </h3>
          
          {/* Описание */}
          <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>

          {/* Цена и категория */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-gray-900">
                ₽{product.price.toLocaleString()}
              </span>
              <Badge variant="outline" className="w-fit text-xs">
                {getCategoryLabel(product.category)}
              </Badge>
            </div>
            
            {/* Статус наличия */}
            <div className="text-right">
              <Badge variant={stockStatus.variant} className={stockStatus.bgColor}>
                {stockStatus.label}
              </Badge>
              <div className="text-xs text-gray-500 mt-1">
                {product.inStock} в наличии
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
