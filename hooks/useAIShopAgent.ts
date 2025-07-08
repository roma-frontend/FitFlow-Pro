// hooks/useAIShopAgent.ts
import { useCallback } from 'react';
import { useAIAgent } from '@/stores/useAIAgentStore';
import { useAIShopStore } from '@/stores/aiShopStore';
import { useCartStore } from '@/stores/cartStore';
import { ShopProduct } from '@/types/shopAI';

export const useAIShopAgent = () => {
  const aiAgent = useAIAgent();
  const aiShop = useAIShopStore();
  const cart = useCartStore();

  // Открытие AI-агента для магазина
  const openShopConsultation = useCallback((context?: {
    products?: ShopProduct[];
    query?: string;
    goals?: string[];
    mode?: 'discovery' | 'recommendation' | 'comparison' | 'purchase';
  }) => {
    // Обновляем контекст магазина
    if (context?.products) {
      aiShop.setCurrentProducts(context.products);
    }
    if (context?.mode) {
      aiShop.setConversationMode(context.mode);
    }
    if (context?.goals) {
      aiShop.setUserProfile({ goals: context.goals });
    }

    // Обновляем контекст корзины
    aiShop.updateCartContext(cart.items);

    // Открываем единый AI-агент с контекстом магазина
    aiAgent.openAgent('shop_consultation', {
      page: 'shop',
      intent: 'shop_consultation',
      query: context?.query,
      goals: context?.goals,
      mode: context?.mode || 'discovery',
      products: context?.products,
    });
  }, [aiAgent, aiShop, cart]);

  // Помощь с конкретным продуктом
  const openProductConsultation = useCallback((product: ShopProduct) => {
    aiShop.setConversationMode('recommendation');

    aiAgent.openAgent('product_consultation', {
      page: 'shop',
      intent: 'product_consultation',
      selectedProduct: product,
      mode: 'recommendation',
      productId: product._id,
    });
  }, [aiAgent, aiShop]);

  // Возвращаем только методы, не состояние isOpen
  return {
    openShopConsultation,
    openProductConsultation,
    ...aiShop,
  };
};