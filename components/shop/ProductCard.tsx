// components/shop/ProductCard.tsx
import React, { memo } from 'react';
import { ShopProduct } from '@/hooks/useShopProductsAPI';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import { useAIAgent } from '@/stores/useAIAgentStore';
import { formatProductPrice, getStockStatus, getStockStatusText } from '@/hooks/useShopProducts';
import { generateProductImageAlt, generateFallbackText } from '@/utils/altTextUtils';
import { productToAddCartData } from '@/utils/cartUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Bot } from 'lucide-react';
import SafeImage from '@/components/common/SafeImage';

interface ProductCardProps {
  product: ShopProduct;
}

const ProductCard = memo(({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { toast } = useToast();
  const { openWithAction } = useAIAgent();
  const stockStatus = getStockStatus(product);
  
  const handleAddToCart = () => {
    const cartData = productToAddCartData(product);
    addItem(cartData);
    
    toast({
      title: "Товар добавлен в корзину",
      description: `${product.name} добавлен в корзину`,
    });
  };

  const handleAIConsultation = () => {
    openWithAction('product_consultation', {
      page: 'shop',
      intent: 'product_consultation',
      selectedProduct: product,
      mode: 'recommendation',
      productId: product._id,
    });
  };

  const imageAlt = generateProductImageAlt(product);
  const fallbackText = generateFallbackText(product.name);

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group">
      <CardHeader className="p-4">
        <div className="relative w-full h-48 mb-3 bg-gray-100 rounded-lg overflow-hidden">
          <SafeImage
            src={product.imageUrl}
            alt={imageAlt}
            fill
            className="rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fallbackText={fallbackText}
          />
          
          {/* AI Button */}
          <Button
            onClick={handleAIConsultation}
            size="sm"
            className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
            aria-label={`Получить AI консультацию по ${product.name}`}
          >
            <Bot className="h-4 w-4" />
          </Button>
          
          {product.isPopular && (
            <Badge className="absolute top-2 right-12 bg-yellow-500 text-white z-20">
              <Star className="w-3 h-3 mr-1" aria-hidden="true" />
              <span className="sr-only">Популярный товар</span>
              Популярный
            </Badge>
          )}
          
          <Badge 
            className={`absolute top-2 left-2 z-20 ${
              stockStatus === 'in_stock' ? 'bg-green-500' :
              stockStatus === 'low_stock' ? 'bg-yellow-500' :
              'bg-red-500'
            } text-white`}
            aria-label={`Статус товара: ${getStockStatusText(stockStatus)}`}
          >
            {getStockStatusText(stockStatus)}
          </Badge>
        </div>

        <CardTitle className="text-lg font-semibold line-clamp-2">
          {product.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
          {product.description}
        </p>

        {product.nutrition && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-medium text-gray-700 mb-2">На порцию:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs" role="table" aria-label="Пищевая ценность продукта">
              {product.nutrition.calories && (
                <div role="row">Калории: {product.nutrition.calories}</div>
              )}
              {product.nutrition.protein && (
                <div role="row">Белки: {product.nutrition.protein}г</div>
              )}
              {product.nutrition.carbs && (
                <div role="row">Углеводы: {product.nutrition.carbs}г</div>
              )}
              {product.nutrition.fat && (
                <div role="row">Жиры: {product.nutrition.fat}г</div>
              )}
            </div>
          </div>
        )}

        <div className="mb-4 text-sm text-gray-600" aria-label={`Остаток на складе: ${product.inStock} штук`}>
          Остаток: {product.inStock} шт.
        </div>

        <div className="flex items-center justify-between">
          <div 
            className="text-xl font-bold text-blue-600"
            aria-label={`Цена товара: ${formatProductPrice(product.price)}`}
          >
            {formatProductPrice(product.price)}
          </div>
          
          <Button
            onClick={handleAddToCart}
            disabled={stockStatus === 'out_of_stock'}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 flex items-center gap-2"
            size="sm"
            aria-label={`Добавить ${product.name} в корзину за ${formatProductPrice(product.price)}`}
          >
            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
            {stockStatus === 'out_of_stock' ? 'Нет в наличии' : 'В корзину'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;