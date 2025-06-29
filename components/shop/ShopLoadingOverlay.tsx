import React, { memo } from 'react';
import { useProductsStore } from '@/stores/productsStore';
import { useShopStore } from '@/stores/shopStore';

const ShopLoadingOverlay = memo(() => {
  const { loading: productsLoading } = useProductsStore();
  const { orderStep } = useShopStore();

  // Показываем overlay только при критических операциях
  const shouldShowOverlay = productsLoading && orderStep === 'shop';

  if (!shouldShowOverlay) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Загружаем товары...
        </h3>
        <p className="text-gray-600">
          Пожалуйста, подождите
        </p>
      </div>
    </div>
  );
});

ShopLoadingOverlay.displayName = 'ShopLoadingOverlay';

export default ShopLoadingOverlay;
