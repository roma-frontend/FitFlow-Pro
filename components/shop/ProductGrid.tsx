// components/shop/ProductGrid.tsx
import React, { memo } from 'react';
import { ShopProduct } from '@/hooks/useShopProductsAPI';
import ProductCard from './ProductCard';
import ProductSkeleton from '@/components/ui/ProductSkeleton';
import { Package, AlertCircle, Sparkles } from 'lucide-react';

interface ProductGridProps {
  products?: ShopProduct[];
  isAIFiltered?: boolean;
}

const ProductGrid = memo(({ products, isAIFiltered }: ProductGridProps) => {
  if (!products) {
    return <ProductSkeleton count={6} />;
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Продукты не найдены
          </h3>
          <p className="text-gray-600">
            {isAIFiltered 
              ? "Попробуйте изменить AI-фильтры или цели"
              : "Попробуйте изменить фильтры или поисковый запрос"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAIFiltered && (
        <div className="mb-4 flex items-center gap-2 text-sm text-purple-600">
          <Sparkles className="w-4 h-4" />
          <span>Показаны товары, подобранные AI на основе ваших целей</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </>
  );
});

ProductGrid.displayName = 'ProductGrid';
export default ProductGrid;