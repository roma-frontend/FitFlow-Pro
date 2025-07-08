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

    // Открываем AI-агент
    aiAgent.openWithAction('shop_consultation', {
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
        
    aiAgent.openWithAction('product_consultation', {
      page: 'shop',
      intent: 'product_consultation',
      selectedProduct: product,
      mode: 'recommendation',
      productId: product._id,
    });
  }, [aiAgent, aiShop]);

  // Сравнение товаров
  const openProductComparison = useCallback((products: ShopProduct[]) => {
    aiShop.setConversationMode('comparison');
        
    aiAgent.openWithAction('product_comparison', {
      page: 'shop',
      intent: 'product_comparison',
      compareProducts: products,
      mode: 'comparison',
      productIds: products.map(p => p._id),
    });
  }, [aiAgent, aiShop]);

  // Помощь с оформлением заказа
  const openPurchaseAssistance = useCallback(() => {
    aiShop.setConversationMode('purchase');
    aiShop.updateCartContext(cart.items);
        
    aiAgent.openWithAction('purchase_assistance', {
      page: 'shop',
      intent: 'purchase_assistance',
      cartItems: cart.items,
      mode: 'purchase',
    });
  }, [aiAgent, aiShop, cart]);

  return {
    ...aiAgent,
    ...aiShop,
    openShopConsultation,
    openProductConsultation,
    openProductComparison,
    openPurchaseAssistance,
  };
};