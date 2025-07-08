// components/shop/ShopView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import ProductGrid from './ProductGrid';
import Cart from '../products/Cart';
import CartButton from '@/components/CartButton';
import ProductFilters from './ProductFilters';
import { SmartFiltersAI } from './SmartFiltersAI';
import { ShopRecommendations } from '../ai-agent/ShopRecommendations';
import ShopSkeleton from '@/components/ui/ShopSkeleton';
import { ShoppingBag, Sparkles, Bot, Filter, MessageCircle } from 'lucide-react';
import { useShopProductsAPI, ShopProduct } from '@/hooks/useShopProductsAPI';
import { useAIAgent } from '@/stores/useAIAgentStore';
import { useAIShopStore } from '@/stores/aiShopStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Расширяем базовый интерфейс для AI функциональности
interface ShopProductWithAI extends ShopProduct {
  tags?: string[];
  targetGoals?: string[];
}

export default function ShopView() {
  const { isLoading, products } = useShopProductsAPI();
  const { openWithAction } = useAIAgent();
  const { recommendations, setCurrentProducts } = useAIShopStore();
  
  const [showAIFilters, setShowAIFilters] = useState(false);
  const [aiGoals, setAiGoals] = useState<string[]>([]);
  const [aiBudget, setAiBudget] = useState<{ min: number; max: number } | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<ShopProduct[]>(products);

  // Обновляем продукты в AI store
  useEffect(() => {
    if (products && products.length > 0) {
      setCurrentProducts(products);
      setFilteredProducts(products);
    }
  }, [products, setCurrentProducts]);

  // Применяем AI фильтры
  useEffect(() => {
    let filtered = [...products];

    // Фильтр по AI целям
    if (aiGoals.length > 0) {
      filtered = filtered.filter(product => {
        // Безопасное приведение типа
        const productWithAI = product as ShopProductWithAI;
        
        // Проверяем targetGoals если есть
        if (productWithAI.targetGoals && productWithAI.targetGoals.length > 0) {
          const hasGoalMatch = productWithAI.targetGoals.some((goal: string) =>
            aiGoals.some((aiGoal: string) => 
              goal.toLowerCase().includes(aiGoal.replace('_', ' ').toLowerCase())
            )
          );
          if (hasGoalMatch) return true;
        }
        
        // Проверяем название и описание
        const nameMatch = aiGoals.some(goal => 
          product.name.toLowerCase().includes(goal.replace('_', ' ').toLowerCase())
        );
        const descMatch = aiGoals.some(goal => 
          product.description.toLowerCase().includes(goal.replace('_', ' ').toLowerCase())
        );
        
        if (nameMatch || descMatch) return true;
        
        // Проверяем теги если есть
        if (productWithAI.tags && productWithAI.tags.length > 0) {
          return productWithAI.tags.some((tag: string) => 
            aiGoals.some(goal => 
              tag.toLowerCase().includes(goal.replace('_', ' ').toLowerCase())
            )
          );
        }
        
        // Проверяем категорию для базового маппинга
        const categoryGoalMap: Record<string, string[]> = {
          'похудение': ['drinks', 'supplements'],
          'набор_массы': ['supplements'],
          'выносливость': ['drinks', 'supplements'],
          'восстановление': ['supplements', 'drinks']
        };
        
        return aiGoals.some(goal => {
          const categories = categoryGoalMap[goal];
          return categories && categories.includes(product.category);
        });
      });
    }

    // Фильтр по бюджету
    if (aiBudget) {
      filtered = filtered.filter(product =>
        product.price >= aiBudget.min && product.price <= aiBudget.max
      );
    }

    setFilteredProducts(filtered);
  }, [products, aiGoals, aiBudget]);

  const handleOpenAIAssistant = () => {
    openWithAction('shop_consultation', {
      page: 'shop',
      intent: 'shop_consultation',
      mode: 'discovery',
      products: filteredProducts,
      goals: aiGoals,
    });
  };

  if (isLoading) {
    return <ShopSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Заголовок с градиентом */}
      <div className="relative mb-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex justify-between items-center">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <ShoppingBag className="w-8 h-8" />
              <h1 className="text-xl md:text-3xl font-bold">Магазин спортивного питания</h1>
            </div>
            <p className="text-blue-100 text-base md:text-lg mb-4">
              Качественные добавки для ваших тренировок
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-blue-100">
              <Sparkles className="w-4 h-4" />
              <span>AI-подбор товаров • Гарантия качества • Лучшие цены</span>
            </div>
          </div>
          <div className="hidden lg:block space-y-3">
            <CartButton />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={handleOpenAIAssistant}
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Помощник
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6"
      >
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Нужна помощь с выбором?
              </h3>
              <p className="text-sm text-blue-700">
                AI-помощник поможет найти идеальные товары для ваших целей
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleOpenAIAssistant}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Получить помощь
          </Button>
        </div>
      </motion.div>

      {/* Переключатель фильтров */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setShowAIFilters(false)}
          className={`flex flex-wrap items-center justify-center gap-2 px-4 py-4 rounded-lg transition-colors text-sm md:text-base ${
            !showAIFilters
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="h-4 w-4" />
          Обычные фильтры
        </button>
        <button
          onClick={() => setShowAIFilters(true)}
          className={`flex flex-wrap items-center justify-center gap-2 px-4 py-4 rounded-lg transition-colors text-sm md:text-base ${
            showAIFilters
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Bot className="h-4 w-4" />
          AI-фильтры
        </button>
      </div>

      {/* AI Рекомендации */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <ShopRecommendations recommendations={recommendations} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Мобильные кнопки */}
      <div className="lg:hidden mb-6 flex sm:justify-end gap-3">
        <Button
          onClick={handleOpenAIAssistant}
          variant="outline"
          size="sm"
        >
          <Bot className="w-4 h-4 mr-2" />
          AI
        </Button>
        <CartButton />
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Фильтры */}
        <div className="lg:col-span-1">
          <div className="sticky top-32">
            {showAIFilters ? (
              <SmartFiltersAI
                onGoalSelect={setAiGoals}
                onBudgetSelect={setAiBudget}
                onExperienceSelect={(exp) => console.log('Experience:', exp)}
              />
            ) : (
              <ProductFilters />
            )}
          </div>
        </div>

        {/* Сетка товаров */}
        <div className="lg:col-span-3">
          <ProductGrid 
            products={filteredProducts}
            isAIFiltered={showAIFilters && (aiGoals.length > 0 || aiBudget !== null)}
          />
        </div>
      </div>

      {/* Корзина */}
      <Cart />
    </div>
  );
}