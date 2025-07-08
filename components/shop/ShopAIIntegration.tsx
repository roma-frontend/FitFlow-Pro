// components/shop/ShopAIIntegration.tsx
import React, { memo } from 'react';
import { Bot, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAIShopAgent } from '@/hooks/useAIShopAgent';
import { Button } from '@/components/ui/button';

interface ShopAIIntegrationProps {
  context?: {
    products?: any[];
    category?: string;
    searchQuery?: string;
  };
}

export const ShopAIIntegration: React.FC<ShopAIIntegrationProps> = memo(({ context }) => {
  const { openShopConsultation, isOpen } = useAIShopAgent();

  const handleOpenAI = () => {
    openShopConsultation({
      mode: 'discovery',
      products: context?.products,
      query: context?.searchQuery,
    });
  };

  if (isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">
              Нужна помощь с выбором?
            </h3>
            <p className="text-sm text-purple-700">
              AI-помощник поможет найти идеальные товары для ваших целей
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleOpenAI}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Получить помощь
        </Button>
      </div>
    </motion.div>
  );
});

ShopAIIntegration.displayName = 'ShopAIIntegration';