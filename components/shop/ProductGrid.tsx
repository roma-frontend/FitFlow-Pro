// Обновленный ProductGrid.tsx
import React, { memo, useEffect } from 'react';
import { useShopProductsAPI } from '@/hooks/useShopProductsAPI';
import { useProductsStore } from '@/stores/productsStore';
import ProductCard from './ProductCard';
import ProductSkeleton from '@/components/ui/ProductSkeleton';
import { Package, AlertCircle } from 'lucide-react';

const ProductGrid = memo(() => {
  // Получаем данные из API
  const { products: apiProducts, isLoading: apiLoading, error: apiError } = useShopProductsAPI();
  
  // Получаем состояние из store
  const { 
    filteredProducts, 
    loading: storeLoading, 
    error: storeError,
    setProducts,
    setLoading,
    setError 
  } = useProductsStore();

  // Синхронизируем API данные со store
  useEffect(() => {
    setLoading(apiLoading);
  }, [apiLoading, setLoading]);

  useEffect(() => {
    setError(apiError);
  }, [apiError, setError]);

  useEffect(() => {
    if (apiProducts && apiProducts.length > 0) {
      console.log('🔄 ProductGrid: Обновляем store с продуктами:', apiProducts.length);
      setProducts(apiProducts);
    }
  }, [apiProducts, setProducts]);

  const loading = apiLoading || storeLoading;
  const error = apiError || storeError;

  // Показываем красивый скелетон вместо лоадера
  if (loading) {
    return <ProductSkeleton count={6} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ошибка загрузки продуктов
          </h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
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
            Попробуйте изменить фильтры или поисковый запрос
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';
export default ProductGrid;
