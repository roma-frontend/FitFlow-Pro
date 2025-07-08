import { useCallback } from 'react';
import { useAIShopStore } from '@/stores/aiShopStore';
import { useCartStore } from '@/stores/cartStore';
import { ShopProduct, ShopRecommendation } from '@/types/shopAI';

export const useShopChatLogic = () => {
  const aiShop = useAIShopStore();
  const cart = useCartStore();

  const processShopMessage = useCallback(async (message: string): Promise<{
    response: string;
    recommendations?: ShopRecommendation[];
    products?: ShopProduct[];
    action?: 'add_to_cart' | 'compare' | 'show_details' | 'checkout';
    actionData?: any;
  }> => {
    const normalizedMessage = message.toLowerCase().trim();

    // Определяем тип запроса
    if (normalizedMessage.includes('помо') && normalizedMessage.includes('выбр')) {
      // Помощь с выбором
      return await handleProductSelection(message);
    }
    
    if (normalizedMessage.includes('сравн')) {
      // Сравнение товаров
      return await handleProductComparison(message);
    }
    
    if (normalizedMessage.includes('добав') && normalizedMessage.includes('корзин')) {
      // Добавление в корзину
      return await handleAddToCart(message);
    }
    
    if (normalizedMessage.includes('корзин') || normalizedMessage.includes('заказ')) {
      // Работа с корзиной
      return await handleCartOperations(message, normalizedMessage);
    }
    
    if (normalizedMessage.includes('цен') || normalizedMessage.includes('стоимост')) {
      // Вопросы о цене
      return await handlePriceQuestions(message);
    }
    
    if (normalizedMessage.includes('состав') || normalizedMessage.includes('ингредиент')) {
      // Вопросы о составе
      return await handleCompositionQuestions(message);
    }

    // Базовый поиск и рекомендации
    return await handleGeneralShopQuery(message);
  }, [aiShop, cart]);

  const handleProductSelection = async (message: string) => {
    // Извлекаем цели из сообщения
    const goals = extractGoalsFromMessage(message);
    
    if (goals.length > 0) {
      aiShop.setUserProfile({ goals });
      const recommendations = await aiShop.analyzeUserGoals(goals);
      
      return {
        response: `Нашел ${recommendations.length} подходящих товаров для ваших целей: ${goals.join(', ')}. Вот мои рекомендации:`,
        recommendations,
      };
    }

    return {
      response: 'Расскажите подробнее о ваших целях - похудение, набор массы, улучшение выносливости? Это поможет мне подобрать идеальные товары.',
    };
  };

  const handleProductComparison = async (message: string) => {
    // Извлекаем названия товаров для сравнения
    const productNames = extractProductNamesFromMessage(message);
    
    if (productNames.length >= 2) {
      const products = await findProductsByNames(productNames);
      const comparison = await aiShop.compareProducts(products.map(p => p._id));
      
      return {
        response: `Сравнил ${products.length} товаров. ${comparison.recommendation}`,
        products,
        action: 'compare' as const,
        actionData: comparison,
      };
    }

    return {
      response: 'Укажите названия товаров, которые хотите сравнить. Например: "Сравни протеин XYZ и протеин ABC"',
    };
  };

  const handleAddToCart = async (message: string) => {
    const productName = extractProductNameFromMessage(message);
    
    if (productName) {
      const products = await aiShop.findProductsByQuery(productName);
      
      if (products.length > 0) {
        const product = products[0];
        return {
          response: `Добавляю "${product.name}" в корзину. Цена: ${product.price}₽. Хотите добавить что-то еще?`,
          action: 'add_to_cart' as const,
          actionData: { product },
        };
      }
    }

    return {
      response: 'Укажите название товара, который хотите добавить в корзину.',
    };
  };

  const handleCartOperations = async (message: string, normalizedMessage: string) => {
    const cartTotal = cart.getTotalPrice();
    const cartCount = cart.getTotalItems();

    if (normalizedMessage.includes('оформ') || normalizedMessage.includes('заказ')) {
      return {
        response: `В корзине ${cartCount} товаров на сумму ${cartTotal}₽. Готов помочь с оформлением заказа!`,
        action: 'checkout' as const,
      };
    }

    return {
      response: `В корзине ${cartCount} товаров на сумму ${cartTotal}₽. Могу помочь добавить товары, оформить заказ или ответить на вопросы.`,
    };
  };

  const handlePriceQuestions = async (message: string) => {
    const productName = extractProductNameFromMessage(message);
    
    if (productName) {
      const products = await aiShop.findProductsByQuery(productName);
      
      if (products.length > 0) {
        const product = products[0];
        return {
          response: `${product.name} стоит ${product.price}₽. ${product.inStock > 0 ? 'В наличии' : 'Нет в наличии'}.`,
          products: [product],
        };
      }
    }

    const { currentProducts } = aiShop;
    const priceRanges = calculatePriceRanges(currentProducts);
    
    return {
      response: `Цены в нашем магазине:\n• Протеины: ${priceRanges.supplements}₽\n• Напитки: ${priceRanges.drinks}₽\n• Снеки: ${priceRanges.snacks}₽\n\nУкажите конкретный товар для точной цены.`,
    };
  };

  const handleCompositionQuestions = async (message: string) => {
    const productName = extractProductNameFromMessage(message);
    
    if (productName) {
      const products = await aiShop.findProductsByQuery(productName);
      
      if (products.length > 0) {
        const product = products[0];
        let response = `Состав "${product.name}":\n`;
        
        if (product.nutrition) {
          response += `• Калории: ${product.nutrition.calories || 'н/д'}\n`;
          response += `• Белки: ${product.nutrition.protein || 'н/д'}г\n`;
          response += `• Углеводы: ${product.nutrition.carbs || 'н/д'}г\n`;
          response += `• Жиры: ${product.nutrition.fat || 'н/д'}г\n`;
        }
        
        if (product.usage) {
          response += `\nПрименение: ${product.usage.instructions || 'См. инструкцию на упаковке'}`;
        }
        
        return {
          response,
          products: [product],
          action: 'show_details' as const,
        };
      }
    }

    return {
      response: 'Укажите название товара, и я расскажу про его состав и применение.',
    };
  };

  const handleGeneralShopQuery = async (message: string) => {
    const products = await aiShop.findProductsByQuery(message);
    
    if (products.length > 0) {
      return {
        response: `Нашел ${products.length} товаров по вашему запросу. Вот что могу предложить:`,
        products: products.slice(0, 5),
      };
    }

    // Получаем персонализированные рекомендации
    const recommendations = await aiShop.getPersonalizedRecommendations();
    
    return {
      response: 'Не нашел точных совпадений, но вот что может вас заинтересовать:',
      recommendations: recommendations.slice(0, 3),
    };
  };

  return {
    processShopMessage,
  };
};

// Вспомогательные функции для извлечения данных из сообщений
const extractGoalsFromMessage = (message: string): string[] => {
  const goals: string[] = [];
  const goalKeywords = {
    'похудение': ['похуд', 'сбросить вес', 'снизить вес', 'жир'],
    'набор_массы': ['набрать', 'масса', 'мышцы', 'объем'],
    'выносливость': ['выносливость', 'выдержка', 'стамина', 'энергия'],
    'восстановление': ['восстанов', 'регенерац', 'отдых', 'релакс'],
    'здоровье': ['здоровье', 'иммунитет', 'витамины', 'минералы'],
  };

  const normalizedMessage = message.toLowerCase();
  
  Object.entries(goalKeywords).forEach(([goal, keywords]) => {
    if (keywords.some(keyword => normalizedMessage.includes(keyword))) {
      goals.push(goal);
    }
  });

  return goals;
};

const extractProductNameFromMessage = (message: string): string => {
  // Простая логика извлечения названия товара
  // В реальном приложении можно использовать NLP или более сложные алгоритмы
  const words = message.toLowerCase().split(' ');
  const productKeywords = ['протеин', 'креатин', 'bcaa', 'гейнер', 'витамины', 'омега'];
  
  for (const keyword of productKeywords) {
    if (words.includes(keyword)) {
      return keyword;
    }
  }
  
  return '';
};

const extractProductNamesFromMessage = (message: string): string[] => {
  // Извлечение нескольких названий товаров для сравнения
  const names: string[] = [];
  const productPatterns = [
    /протеин\s+\w+/gi,
    /креатин\s+\w+/gi,
    /bcaa\s+\w+/gi,
    /гейнер\s+\w+/gi,
  ];

  productPatterns.forEach(pattern => {
    const matches = message.match(pattern);
    if (matches) {
      names.push(...matches);
    }
  });

  return names;
};

const findProductsByNames = async (names: string[]): Promise<ShopProduct[]> => {
  // Заглушка - в реальном приложении поиск по названиям
  return [];
};

const calculatePriceRanges = (products: ShopProduct[]) => {
  const byCategory = {
    supplements: products.filter(p => p.category === 'supplements'),
    drinks: products.filter(p => p.category === 'drinks'),
    snacks: products.filter(p => p.category === 'snacks'),
  };

  return {
    supplements: byCategory.supplements.length > 0 
      ? `${Math.min(...byCategory.supplements.map(p => p.price))}-${Math.max(...byCategory.supplements.map(p => p.price))}`
      : 'н/д',
    drinks: byCategory.drinks.length > 0
      ? `${Math.min(...byCategory.drinks.map(p => p.price))}-${Math.max(...byCategory.drinks.map(p => p.price))}`
      : 'н/д',
    snacks: byCategory.snacks.length > 0
      ? `${Math.min(...byCategory.snacks.map(p => p.price))}-${Math.max(...byCategory.snacks.map(p => p.price))}`
      : 'н/д',
  };
};