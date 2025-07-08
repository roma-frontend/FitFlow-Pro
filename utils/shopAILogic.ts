// utils/shopAILogic.ts

import { ShopProduct, ShopRecommendation, UserShopProfile } from "@/types/shopAI";

// Анализ целей пользователя и генерация рекомендаций
export const generateRecommendationsByGoals = async (
    goals: string[],
    products: ShopProduct[],
    userProfile: UserShopProfile
  ): Promise<ShopRecommendation[]> => {
    const recommendations: ShopRecommendation[] = [];
  
    // Маппинг целей на категории товаров
    const goalCategoryMap: Record<string, string[]> = {
      'похудение': ['supplements', 'drinks'],
      'набор_массы': ['supplements', 'drinks'],
      'выносливость': ['supplements', 'drinks', 'snacks'],
      'восстановление': ['supplements', 'drinks'],
      'энергия': ['supplements', 'drinks', 'snacks'],
      'здоровье': ['supplements', 'snacks'],
    };
  
    // Маппинг целей на типы продуктов
    const goalProductMap: Record<string, string[]> = {
      'похудение': ['протеин', 'жиросжигатель', 'l-карнитин', 'bcaa'],
      'набор_массы': ['протеин', 'гейнер', 'креатин', 'аминокислоты'],
      'выносливость': ['bcaa', 'изотоник', 'энергетик', 'витамины'],
      'восстановление': ['bcaa', 'глютамин', 'омега-3', 'магний'],
      'энергия': ['предтреник', 'кофеин', 'энергетик', 'витамины'],
    };
  
    for (const goal of goals) {
      const normalizedGoal = goal.toLowerCase().trim();
      const relevantCategories = goalCategoryMap[normalizedGoal] || [];
      const relevantProductTypes = goalProductMap[normalizedGoal] || [];
  
      // Фильтруем продукты по категориям и типам
      const candidateProducts = products.filter(product => {
        const matchesCategory = relevantCategories.includes(product.category);
        const matchesType = relevantProductTypes.some(type =>
          product.name.toLowerCase().includes(type) ||
          product.description.toLowerCase().includes(type) ||
          product.tags?.some(tag => tag.toLowerCase().includes(type))
        );
        const matchesGoals = product.targetGoals?.some(targetGoal =>
          targetGoal.toLowerCase().includes(normalizedGoal) ||
          normalizedGoal.includes(targetGoal.toLowerCase())
        );
  
        return matchesCategory || matchesType || matchesGoals;
      });
  
      // Сортируем по релевантности
      const sortedProducts = candidateProducts
        .map(product => ({
          product,
          relevanceScore: calculateRelevanceScore(product, goal, userProfile),
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3); // Топ-3 для каждой цели
  
      // Создаем рекомендации
      for (const { product, relevanceScore } of sortedProducts) {
        const existingRec = recommendations.find(r => r.product._id === product._id);
        
        if (existingRec) {
          // Обновляем существующую рекомендацию
          existingRec.userGoals.push(goal);
          existingRec.relevanceScore = Math.max(existingRec.relevanceScore, relevanceScore);
          existingRec.confidence = Math.min(100, existingRec.confidence + 15);
        } else {
          // Создаем новую рекомендацию
          recommendations.push({
            product,
            reason: generateRecommendationReason(product, goal),
            confidence: calculateConfidence(product, goal, userProfile),
            relevanceScore,
            userGoals: [goal],
            alternativeOptions: findAlternativeProducts(product, candidateProducts),
          });
        }
      }
    }
  
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  };
  
  // Расчет релевантности продукта
  const calculateRelevanceScore = (
    product: ShopProduct,
    goal: string,
    userProfile: UserShopProfile
  ): number => {
    let score = 0;
    const normalizedGoal = goal.toLowerCase();
  
    // Базовая релевантность по названию и описанию
    if (product.name.toLowerCase().includes(normalizedGoal)) score += 30;
    if (product.description.toLowerCase().includes(normalizedGoal)) score += 20;
  
    // Релевантность по тегам
    product.tags?.forEach(tag => {
      if (tag.toLowerCase().includes(normalizedGoal)) score += 15;
    });
  
    // Релевантность по целевым задачам
    product.targetGoals?.forEach(targetGoal => {
      if (targetGoal.toLowerCase().includes(normalizedGoal)) score += 25;
    });
  
    // Популярность продукта
    if (product.isPopular) score += 10;
    if (product.rating && product.rating > 4.5) score += 10;
  
    // Соответствие пользовательским предпочтениям
    if (userProfile.preferences.categories.includes(product.category)) score += 15;
    if (userProfile.preferences.brands.includes(product.brand || '')) score += 10;
  
    // Наличие на складе
    if (product.inStock > 0) score += 5;
    if (product.inStock > 10) score += 5;
  
    return Math.min(100, score);
  };
  
  // Генерация причины рекомендации
  const generateRecommendationReason = (product: ShopProduct, goal: string): string => {
    const goalReasons: Record<string, string> = {
      'похудение': `Поможет ускорить метаболизм и сжигание жира. Подходит для тренировок на снижение веса.`,
      'набор_массы': `Обеспечивает необходимыми белками и питательными веществами для роста мышц.`,
      'выносливость': `Повышает энергию и помогает дольше поддерживать интенсивность тренировок.`,
      'восстановление': `Ускоряет восстановление мышц после интенсивных тренировок.`,
      'энергия': `Обеспечивает энергией для эффективных тренировок и активного дня.`,
      'здоровье': `Поддерживает общее здоровье и восполняет важные микроэлементы.`,
    };
  
    const baseReason = goalReasons[goal.toLowerCase()] || `Подходит для достижения ваших целей: ${goal}.`;
    
    // Добавляем специфические преимущества продукта
    let additionalInfo = '';
    if (product.benefits && product.benefits.length > 0) {
      additionalInfo = ` ${product.benefits.slice(0, 2).join(', ')}.`;
    }
  
    return baseReason + additionalInfo;
  };
  
  // Расчет уверенности в рекомендации
  const calculateConfidence = (
    product: ShopProduct,
    goal: string,
    userProfile: UserShopProfile
  ): number => {
    let confidence = 60; // Базовая уверенность
  
    // Увеличиваем уверенность по различным факторам
    if (product.isPopular) confidence += 15;
    if (product.rating && product.rating >= 4.5) confidence += 10;
    if (product.rating && product.rating >= 4.8) confidence += 5;
    
    // Соответствие опыту пользователя
    if (userProfile.experience === 'beginner' && product.name.toLowerCase().includes('для начинающих')) {
      confidence += 15;
    }
    if (userProfile.experience === 'advanced' && product.name.toLowerCase().includes('про')) {
      confidence += 10;
    }
  
    // Наличие на складе
    if (product.inStock > 5) confidence += 5;
    if (product.inStock < 3) confidence -= 10;
  
    return Math.min(100, Math.max(0, confidence));
  };
  
  // Поиск альтернативных продуктов
  const findAlternativeProducts = (
    mainProduct: ShopProduct,
    allProducts: ShopProduct[]
  ): ShopProduct[] => {
    return allProducts
      .filter(p => 
        p._id !== mainProduct._id &&
        p.category === mainProduct.category &&
        Math.abs(p.price - mainProduct.price) <= mainProduct.price * 0.3 // ±30% по цене
      )
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 2);
  };
  
  // Интеллектуальный поиск товаров
  export const searchProductsIntelligently = (
    query: string,
    products: ShopProduct[]
  ): ShopProduct[] => {
    const normalizedQuery = query.toLowerCase().trim();
    const terms = normalizedQuery.split(' ');
  
    return products
      .map(product => ({
        product,
        score: calculateSearchScore(product, terms),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .slice(0, 10);
  };
  
  const calculateSearchScore = (product: ShopProduct, terms: string[]): number => {
    let score = 0;
  
    terms.forEach(term => {
      // Поиск в названии (высший приоритет)
      if (product.name.toLowerCase().includes(term)) score += 50;
      
      // Поиск в описании
      if (product.description.toLowerCase().includes(term)) score += 30;
      
      // Поиск в тегах
      product.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(term)) score += 20;
      });
      
      // Поиск в бренде
      if (product.brand?.toLowerCase().includes(term)) score += 15;
      
      // Поиск в категории
      if (product.category.toLowerCase().includes(term)) score += 10;
    });
  
    return score;
  };
  
  // Детальное сравнение продуктов
  export const compareProductsDetailed = (
    productIds: string[],
    allProducts: ShopProduct[]
  ): any => {
    const products = productIds
      .map(id => allProducts.find(p => p._id === id))
      .filter(Boolean) as ShopProduct[];
  
    if (products.length < 2) {
      return { error: 'Недостаточно продуктов для сравнения' };
    }
  
    return {
      products: products.map(product => ({
        ...product,
        advantages: [],
        disadvantages: [],
      })),
      comparison: {
        price: {
          cheapest: products.reduce((min, p) => p.price < min.price ? p : min),
          mostExpensive: products.reduce((max, p) => p.price > max.price ? p : max),
        },
        rating: {
          highest: products.reduce((max, p) => (p.rating || 0) > (max.rating || 0) ? p : max),
          lowest: products.reduce((min, p) => (p.rating || 0) < (min.rating || 0) ? p : min),
        },
        stock: {
          mostAvailable: products.reduce((max, p) => p.inStock > max.inStock ? p : max),
          leastAvailable: products.reduce((min, p) => p.inStock < min.inStock ? p : min),
        },
      },
      recommendation: generateComparisonRecommendation(products),
    };
  };
  
  const generateComparisonRecommendation = (products: ShopProduct[]): string => {
    const sorted = products.sort((a, b) => {
      const scoreA = (a.rating || 0) * 0.4 + (a.isPopular ? 10 : 0) + (a.inStock > 5 ? 5 : 0);
      const scoreB = (b.rating || 0) * 0.4 + (b.isPopular ? 10 : 0) + (b.inStock > 5 ? 5 : 0);
      return scoreB - scoreA;
    });
  
    const best = sorted[0];
    return `Рекомендую "${best.name}" - лучшее соотношение качества, рейтинга и доступности.`;
  };
  
  // Генерация персонализированных рекомендаций
  export const generatePersonalizedRecommendations = async (
    userProfile: UserShopProfile,
    products: ShopProduct[],
    cartItems: any[]
  ): Promise<ShopRecommendation[]> => {
    const recommendations: ShopRecommendation[] = [];
  
    // Анализируем, что уже в корзине
    const cartProductIds = cartItems.map(item => item.id);
    const availableProducts = products.filter(p => !cartProductIds.includes(p._id));
  
    // Рекомендации на основе целей
    if (userProfile.goals.length > 0) {
      const goalRecommendations = await generateRecommendationsByGoals(
        userProfile.goals,
        availableProducts,
        userProfile
      );
      recommendations.push(...goalRecommendations);
    }
  
    // Рекомендации на основе предпочтений по категориям
    if (userProfile.preferences.categories.length > 0) {
      const categoryProducts = availableProducts.filter(p =>
        userProfile.preferences.categories.includes(p.category)
      );
      
      const topCategoryProducts = categoryProducts
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);
  
      topCategoryProducts.forEach(product => {
        if (!recommendations.find(r => r.product._id === product._id)) {
          recommendations.push({
            product,
            reason: `Соответствует вашим предпочтениям по категории "${product.category}"`,
            confidence: 75,
            relevanceScore: 80,
            userGoals: ['предпочтения'],
          });
        }
      });
    }
  
    // Популярные товары для новичков
    if (userProfile.experience === 'beginner') {
      const beginnerFriendly = availableProducts.filter(p => 
        p.isPopular && 
        (p.name.toLowerCase().includes('для начинающих') ||
         p.description.toLowerCase().includes('новичок'))
      ).slice(0, 2);
  
      beginnerFriendly.forEach(product => {
        if (!recommendations.find(r => r.product._id === product._id)) {
          recommendations.push({
            product,
            reason: 'Отличный выбор для начинающих спортсменов',
            confidence: 85,
            relevanceScore: 85,
            userGoals: ['для новичков'],
          });
        }
      });
    }
  
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6); // Максимум 6 рекомендаций
  };