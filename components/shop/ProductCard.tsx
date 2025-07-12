// components/shop/ProductCard.tsx
import React, { memo } from 'react';
import { usePathname } from 'next/navigation';
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
import { ShoppingCart, Star, Bot, FlaskConical } from 'lucide-react';
import SafeImage from '@/components/common/SafeImage';

// Расширяем тип для поддержки ингредиентов
type ShopProductWithIngredients = ShopProduct & {
  ingredient1?: string;
  ingredient2?: string;
  ingredient3?: string;
};

interface ProductCardProps {
  product: ShopProductWithIngredients;
}

const ProductCard = memo(({ product }: ProductCardProps) => {
  const pathname = usePathname();
  const addItem = useCartStore(state => state.addItem);
  const { toast } = useToast();
  const { openWithAction } = useAIAgent();
  const stockStatus = getStockStatus(product);
  
  // Определяем, нужно ли показывать статус товара
  const shouldShowStockStatus: boolean = pathname !== '/shop';
  
  const handleAddToCart = (): void => {
    const cartData = productToAddCartData(product);
    addItem(cartData);
    
    toast({
      title: "Товар добавлен в корзину",
      description: `${product.name} добавлен в корзину`,
    });
  };

  const handleAIConsultation = (): void => {
    openWithAction('product_consultation', {
      page: 'shop',
      intent: 'product_consultation',
      selectedProduct: product,
      mode: 'recommendation',
      productId: product._id,
    });
  };

  // Безопасно получаем список ингредиентов
  const ingredients: string[] = [
    product.ingredient1,
    product.ingredient2,
    product.ingredient3
  ].filter((ingredient): ingredient is string => 
    ingredient !== undefined && ingredient.trim() !== ''
  );

  const imageAlt: string = generateProductImageAlt(product);
  const fallbackText: string = generateFallbackText(product.name);

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group">
      <CardHeader className="p-4">
        <div className="relative w-full h-48 mb-3 bg-gray-100 rounded-lg">
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
            className="w-8 h-8 absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 border-none"
            aria-label={`Получить AI консультацию по ${product.name}`}
          >
            <Bot className="h-4 w-4" />
          </Button>
          
          {product.isPopular && (
            <Badge className={`absolute top-2 ${shouldShowStockStatus ? 'right-12' : 'left-2'} bg-yellow-500 text-white z-20`}>
              <Star className="w-3 h-3 mr-1" aria-hidden="true" />
              <span className="sr-only">Популярный товар</span>
              Популярный
            </Badge>
          )}
          
          {/* Условно отображаем статус товара только если не на странице /shop */}
          {shouldShowStockStatus && (
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
          )}
        </div>

        <CardTitle className="text-lg font-semibold line-clamp-2">
          {product.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
          {product.description}
        </p>

        {/* Секция ингредиентов */}
        {ingredients.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="w-4 h-4 text-green-600" aria-hidden="true" />
              <h4 className="text-xs font-medium text-green-800">Основные ингредиенты</h4>
            </div>
            <div className="flex flex-wrap gap-1" role="list" aria-label="Список ингредиентов">
              {ingredients.map((ingredient: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-white text-green-700 border-green-300 hover:bg-green-50"
                  role="listitem"
                >
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>
        )}

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