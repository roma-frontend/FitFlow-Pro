// components/ai-agent/ShopRecommendations.tsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Zap, Award, Plus, Eye } from 'lucide-react';
import { ShopRecommendation } from '@/types/shopAI';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';

interface ShopRecommendationsProps {
  recommendations: ShopRecommendation[];
  onProductSelect?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

export const ShopRecommendations: React.FC<ShopRecommendationsProps> = memo(({
  recommendations,
  onProductSelect,
  onAddToCart
}) => {
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = (recommendation: ShopRecommendation) => {
    const { product } = recommendation;
    
    // Remove the quantity property from the object passed to addItem
    // The quantity is handled by the second parameter
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      inStock: product.inStock,
      nutrition: product.nutrition,
    }, 1); // Pass quantity as the second parameter

    toast({
      title: "Товар добавлен в корзину",
      description: `${product.name} успешно добавлен`,
    });

    onAddToCart?.(product._id);
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-purple-900">AI Рекомендации</h3>
        <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          {recommendations.length} товаров
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.product._id}
            recommendation={recommendation}
            index={index}
            onAddToCart={() => handleAddToCart(recommendation)}
            onViewDetails={() => onProductSelect?.(recommendation.product._id)}
          />
        ))}
      </div>
    </div>
  );
});

const RecommendationCard: React.FC<{
  recommendation: ShopRecommendation;
  index: number;
  onAddToCart: () => void;
  onViewDetails: () => void;
}> = memo(({ recommendation, index, onAddToCart, onViewDetails }) => {
  const { product, reason, confidence, userGoals } = recommendation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-purple-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 line-clamp-2">
              {product.name}
            </h4>
            <div className="flex items-center gap-1 ml-2">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">
                {confidence}%
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {reason}
          </p>

          {/* Goals Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {userGoals.map((goal, idx) => (
              <span
                key={idx}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
              >
                {goal}
              </span>
            ))}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-purple-600">
                {product.price.toLocaleString()}₽
              </span>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onViewDetails}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Подробнее"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={onAddToCart}
                disabled={product.inStock === 0}
                className="flex items-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">В корзину</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});