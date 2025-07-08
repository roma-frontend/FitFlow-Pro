// components/shop/ProductCardAI.tsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, Star, ShoppingCart, Eye, MessageCircle } from 'lucide-react';
import { useAIShopAgent } from '@/hooks/useAIShopAgent';
import { ShopProduct } from '@/types/shopAI';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardAIProps {
  product: ShopProduct;
  onAddToCart?: () => void;
}

export const ProductCardAI: React.FC<ProductCardAIProps> = memo(({ product, onAddToCart }) => {
  const { openProductConsultation } = useAIShopAgent();

  const handleAIConsultation = () => {
    openProductConsultation(product);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}
        
        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-3 right-3"
        >
          <Button
            onClick={handleAIConsultation}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white p-2 rounded-full shadow-lg"
          >
            <Bot className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Popular Badge */}
        {product.isPopular && (
          <Badge className="absolute top-3 left-3 bg-yellow-500 text-white">
            <Star className="w-3 h-3 mr-1" />
            Популярный
          </Badge>
        )}

        {/* Stock Badge */}
        <Badge 
          className={`absolute bottom-3 left-3 ${
            product.inStock > 10 ? 'bg-green-500' :
            product.inStock > 0 ? 'bg-yellow-500' :
            'bg-red-500'
          } text-white`}
        >
          {product.inStock > 0 ? `${product.inStock} шт.` : 'Нет в наличии'}
        </Badge>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3">
            {product.description}
          </p>
        </div>

        {/* Nutrition Info */}
        {product.nutrition && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Пищевая ценность:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {product.nutrition.calories && (
                <div>Калории: {product.nutrition.calories}</div>
              )}
              {product.nutrition.protein && (
                <div>Белки: {product.nutrition.protein}г</div>
              )}
              {product.nutrition.carbs && (
                <div>Углеводы: {product.nutrition.carbs}г</div>
              )}
              {product.nutrition.fat && (
                <div>Жиры: {product.nutrition.fat}г</div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-purple-600">
            {product.price.toLocaleString()}₽
          </div>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onAddToCart}
            disabled={product.inStock === 0}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inStock === 0 ? 'Нет в наличии' : 'В корзину'}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleAIConsultation}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              AI Помощь
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              Подробнее
            </Button>
          </div>
        </div>

        {/* AI Recommendations Preview */}
        {product.targetGoals && product.targetGoals.length > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Подходит для:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {product.targetGoals.slice(0, 2).map((goal, index) => (
                <span
                  key={index}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ProductCardAI.displayName = 'ProductCardAI';