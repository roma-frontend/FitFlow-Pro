// components/ai-agent/AIShopAssistant.tsx
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Bot, Sparkles, X, MessageCircle } from 'lucide-react';
import { useAIShopAgent } from '@/hooks/useAIShopAgent';
import { useShopChatLogic } from '@/components/ai-agent/hooks/useShopChatLogic';
import { useShopProductsAPI } from '@/hooks/useShopProductsAPI';
import { ShopRecommendations } from './ShopRecommendations';
import { ProductComparison } from './ProductComparison';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import type { AudioConfig } from './types'; // Import the proper type

interface RecoveryData {
  recoveryScore: number;
  factors: {
    sleep: number;
    stress: number;
    nutrition: number;
    hydration: number;
    activity: number;
  };
  recommendations: any[];
  lastWorkout: Date;
  sleepHours: number;
  lastMeal: Date;
  waterIntake: number;
  stressLevel: number;
}

interface AIShopAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialContext?: {
    mode?: 'discovery' | 'recommendation' | 'comparison' | 'purchase';
    products?: any[];
    query?: string;
    goals?: string[];
  };
}

export const AIShopAssistant: React.FC<AIShopAssistantProps> = memo(({
  isOpen: propIsOpen,
  onClose,
  initialContext
}) => {
  const {
    isOpen: storeIsOpen,
    closeAgent,
    conversationMode,
    recommendations,
    currentProducts,
    setCurrentProducts,
    setConversationMode
  } = useAIShopAgent();

  const { products: allProducts } = useShopProductsAPI();
  const { processShopMessage } = useShopChatLogic();

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');

  // Add audio configuration state with proper type
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    enabled: false,
    voice: 'Mary'
  });

  // Mock recovery data for MessageList component
  const recoveryData: RecoveryData = {
    recoveryScore: 75,
    factors: {
      sleep: 8,
      stress: 3,
      nutrition: 4,
      hydration: 7,
      activity: 6
    },
    recommendations: [],
    lastWorkout: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    sleepHours: 7.5,
    lastMeal: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    waterIntake: 1.8, // liters
    stressLevel: 3 // scale of 1-10
  };

  // Add voice transcript handler
  const handleVoiceTranscript = (transcript: string) => {
    console.log('Voice transcript received:', transcript);
    // You can add additional logic here if needed
    // For example, automatically send the message or process it
  };

  // Add audio config change handler
  const handleAudioConfigChange = (config: AudioConfig) => {
    setAudioConfig(config);
    // You can add additional logic here, such as:
    // - Saving to localStorage
    // - Sending analytics events
    // - Updating user preferences
  };

  // Initialize products
  useEffect(() => {
    if (allProducts.length > 0) {
      setCurrentProducts(allProducts);
    }
  }, [allProducts, setCurrentProducts]);

  // Initialize with context
  useEffect(() => {
    if (isOpen && initialContext) {
      if (initialContext.mode) {
        setConversationMode(initialContext.mode);
      }
      if (initialContext.products) {
        setCurrentProducts(initialContext.products);
      }
      
      // Add welcome message based on context
      const welcomeMessage = generateWelcomeMessage(initialContext);
      setMessages([{
        id: Date.now().toString(),
        text: welcomeMessage,
        isBot: true,
        timestamp: new Date(),
        suggestions: generateInitialSuggestions(initialContext),
      }]);
    }
  }, [isOpen, initialContext, setConversationMode, setCurrentProducts]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const result = await processShopMessage(inputText);
      
      const botMessage = {
        id: `${Date.now()}-bot`,
        text: result.response,
        isBot: true,
        timestamp: new Date(),
        recommendations: result.recommendations,
        products: result.products,
        action: result.action,
        actionData: result.actionData,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing shop message:', error);
      
      const errorMessage = {
        id: `${Date.now()}-error`,
        text: 'Извините, произошла ошибка. Попробуйте еще раз.',
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setInputText('');
    if (onClose) {
      onClose();
    } else {
      closeAgent();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto z-50 w-full sm:w-[480px] h-full sm:h-[90vh] sm:max-h-[796px] bg-white sm:rounded-3xl shadow-2xl sm:border border-gray-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Shop AI Assistant</h3>
                <p className="text-sm text-white/80">
                  {getModeDescription(conversationMode)}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          <MessageList
            messages={messages}
            recoveryData={recoveryData}
            onSuggestionClick={(suggestion) => {
              setInputText(suggestion);
              handleSendMessage();
            }}
          />
          
          {isTyping && <TypingIndicator />}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 bg-white p-4">
          <ChatInput
            value={inputText}
            onChange={setInputText}
            onSend={handleSendMessage}
            onVoiceTranscript={handleVoiceTranscript}
            isTyping={isTyping}
            audioConfig={audioConfig}
            onAudioConfigChange={handleAudioConfigChange}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

const TypingIndicator = memo(() => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex justify-start"
  >
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-200">
      <div className="flex space-x-2">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-purple-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay,
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
));

// Helper functions
const generateWelcomeMessage = (context: any): string => {
  switch (context.mode) {
    case 'recommendation':
      return '🛒 Готов помочь с выбором товаров! Расскажите о ваших целях, и я подберу идеальные продукты.';
    case 'comparison':
      return '⚖️ Помогу сравнить товары и выбрать лучший вариант. Какие продукты вас интересуют?';
    case 'purchase':
      return '🛍️ Помогу оформить заказ и ответить на вопросы о доставке и оплате.';
    default:
      return '👋 Добро пожаловать в магазин! Я помогу найти нужные товары, сравнить продукты и ответить на вопросы.';
  }
};

const generateInitialSuggestions = (context: any): string[] => {
  switch (context.mode) {
    case 'recommendation':
      return [
        'Хочу похудеть',
        'Набрать мышечную массу',
        'Повысить выносливость',
        'Восстановление после тренировок'
      ];
    case 'comparison':
      return [
        'Сравнить протеины',
        'Какой креатин лучше?',
        'Витамины: что выбрать?',
        'Лучший предтреник'
      ];
    case 'purchase':
      return [
        'Как оформить заказ?',
        'Способы доставки',
        'Методы оплаты',
        'Статус заказа'
      ];
    default:
      return [
        'Показать популярные товары',
        'Помощь с выбором',
        'Акции и скидки',
        'Категории товаров'
      ];
  }
};

const getModeDescription = (mode: string): string => {
  switch (mode) {
    case 'recommendation': return 'Персональные рекомендации';
    case 'comparison': return 'Сравнение товаров';
    case 'purchase': return 'Помощь с покупкой';
    default: return 'Умный помощник по покупкам';
  }
};