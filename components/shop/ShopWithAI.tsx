// components/shop/ShopWithAI.tsx
import React, { memo, useState, useEffect } from 'react';
import { useShopProductsAPI } from '@/hooks/useShopProductsAPI';
import { useAIShopAgent } from '@/hooks/useAIShopAgent';
import { ProductCardAI } from './ProductCardAI';
import { SmartFiltersAI } from './SmartFiltersAI';
import { ShopAIIntegration } from './ShopAIIntegration';
import { AIShopAssistant } from '../ai-agent/AIShopAssistant';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import ProductFilters from './ProductFilters';
import { ShoppingBag, Bot, Filter } from 'lucide-react';

export const ShopWithAI: React.FC = memo(() => {
  const { products, isLoading, error } = useShopProductsAPI();
  const { isOpen: aiAssistantOpen, setCurrentProducts, recommendations } = useAIShopAgent();
  const { addItem } = useCartStore();
  const { toast } = useToast();
  
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [showAIFilters, setShowAIFilters] = useState(false);
  const [aiGoals, setAiGoals] = useState<string[]>([]);
  const [aiBudget, setAiBudget] = useState<{ min: number; max: number } | null>(null);

  // Update AI context when products change
  useEffect(() => {
    if (products.length > 0) {
      setCurrentProducts(products);
      setFilteredProducts(products);
    }
  }, [products, setCurrentProducts]);

  // Apply AI filters
  useEffect(() => {
    let filtered = [...products];

    // Filter by AI goals
    if (aiGoals.length > 0) {
      filtered = filtered.filter(product => {
        return product.targetGoals?.some(goal =>
          aiGoals.some(aiGoal => goal.toLowerCase().includes(aiGoal.replace('_', ' ')))
        );
      });
    }

    // Filter by budget
    if (aiBudget) {
      filtered = filtered.filter(product =>
        product.price >= aiBudget.min && product.price <= aiBudget.max
      );
    }

    setFilteredProducts(filtered);
  }, [products, aiGoals, aiBudget]);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      category: product.category,
      inStock: product.inStock,
      nutrition: product.nutrition,
    });

    toast({
      title: "Товар добавлен в корзину",
      description: `${product.name} успешно добавлен`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем товары...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Магазин спортивного питания
        </h1>
        <p className="text-gray-600 mb-6">
          Умный помощник поможет найти идеальные товары для ваших целей
        </p>
        
        {/* Toggle Filters */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setShowAIFilters(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              !showAIFilters
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            Обычные фильтры
          </button>
          <button
            onClick={() => setShowAIFilters(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAIFilters
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bot className="h-4 w-4" />
            AI-фильтры
          </button>
        </div>
      </div>

      {/* AI Integration Banner */}
      <ShopAIIntegration
        context={{
          products: filteredProducts,
          searchQuery: '',
        }}
      />

      {/* Filters */}
      <div className="mb-8">
        {showAIFilters ? (
          <SmartFiltersAI
            onGoalSelect={setAiGoals}
            onBudgetSelect={setAiBudget}
          />
        ) : (
          <ProductFilters />
        )}
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-purple-900 mb-4">
              🤖 Персональные рекомендации AI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.product._id} className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {rec.product.imageUrl ? (
                        <img
                          src={rec.product.imageUrl}
                          alt={rec.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {rec.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {rec.reason}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-600">
                          {rec.product.price.toLocaleString()}₽
                        </span>
                        <button
                          onClick={() => handleAddToCart(rec.product)}
                          className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
                        >
                          В корзину
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCardAI
            key={product._id}
            product={product}
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Товары не найдены
          </h3>
          <p className="text-gray-600 mb-6">
            Попробуйте изменить фильтры или обратиться к AI-помощнику
          </p>
          <button
            onClick={() => setShowAIFilters(true)}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600"
          >
            Использовать AI-поиск
          </button>
        </div>
      )}

      {/* AI Assistant */}
      {aiAssistantOpen && <AIShopAssistant />}
    </div>
  );
});

ShopWithAI.displayName = 'ShopWithAI';