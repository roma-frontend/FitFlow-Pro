"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Bot, Apple, Sparkles } from 'lucide-react';
import { MessageList } from './MessageList';
import { QuickActionsGrid } from './QuickActionsGrid';
import { useHealthKit } from './hooks/useHealthKit';
import { useChatLogic } from './hooks/useChatLogic';
import { quickActionsConfig } from './config/quickActions';
import type { Message, AudioConfig, RecoveryData, ActivityData } from './types';
import { ChatInput } from './ChatInput';

// Premium glass morphism styles
const premiumStyles = `
  @keyframes aurora {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(0.33);
      opacity: 1;
    }
    80%, 100% {
      transform: scale(2.33);
      opacity: 0;
    }
  }

  .glass-morphism {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  .dark-glass {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .aurora-bg {
    background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
    background-size: 400% 400%;
    animation: aurora 15s ease infinite;
  }

  .shimmer-text {
    background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.8) 50%, transparent 70%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
    -webkit-background-clip: text;
    background-clip: text;
  }

  .floating-element {
    animation: float 3s ease-in-out infinite;
  }

  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
`;

// Enhanced typing indicator
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.8 }}
    className="flex justify-start mb-4"
  >
    <div className="max-w-[80%] sm:max-w-[70%]">
      <div className="flex items-center space-x-3 mb-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
        >
          <Bot className="h-3 w-3 text-white" />
        </motion.div>
        <span className="text-xs font-medium text-gray-500">FitFlow AI печатает...</span>
      </div>
      <div className="glass-morphism p-4 rounded-3xl shadow-lg">
        <div className="flex space-x-2">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// Premium Apple Health Stats Component
const AppleHealthStats: React.FC<{ data: ActivityData }> = ({ data }) => {
  const stats = [
    { value: data.steps.toLocaleString(), label: "Шаги", icon: "👟", color: "from-green-500 to-emerald-600" },
    { value: data.heartRate, label: "Пульс", icon: "❤️", color: "from-red-500 to-pink-600" },
    { value: Math.round(data.activeEnergy), label: "Ккал", icon: "🔥", color: "from-orange-500 to-red-600" },
    { value: data.sleepHours.toFixed(1), label: "Сон", icon: "💤", color: "from-indigo-500 to-purple-600" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="glass-morphism rounded-3xl p-6 mb-6 shadow-xl border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-r from-gray-800 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Apple className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Apple Health</h3>
            <p className="text-sm text-gray-500">Сегодня</p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-400 font-medium bg-gray-100/80 px-3 py-1 rounded-full"
        >
          {new Date(data.lastSync).toLocaleTimeString('ru', { 
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl text-white shadow-lg relative overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-white/80 font-medium">{stat.label}</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Main AI Agent Component
const AIAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    enabled: false,
    voice: 'Mary'
  });
  const [recoveryData, setRecoveryData] = useState<RecoveryData>({
    lastWorkout: null,
    sleepHours: 7,
    recoveryScore: 75,
    lastMeal: null,
    waterIntake: 0,
    stressLevel: 3
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activityData, setActivityData, connectAppleHealth, isHealthKitAvailable } = useHealthKit();
  const { generateBotResponse, speak } = useChatLogic({
    audioConfig,
    recoveryData,
    setRecoveryData,
    setActivityData,
    connectAppleHealth
  });

  // Inject premium styles
  useEffect(() => {
    const styleId = 'premium-ai-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = premiumStyles;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);

  // Auto-scroll to bottom with smooth behavior
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // Enhanced welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const timer = setTimeout(() => {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: "👋 Добро пожаловать в FitFlow Pro!\n\nЯ ваш персональный AI-помощник. Помогу подобрать тренера, выбрать программу тренировок, записаться на занятие и отслеживать прогресс.\n\n✨ Чем могу помочь?",
          isBot: true,
          timestamp: new Date(),
          suggestions: [
            "Подобрать тренера",
            "Выбрать абонемент", 
            "Программы тренировок",
            "Записаться на занятие"
          ]
        };
        setMessages([welcomeMessage]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);

  // Enhanced message processing
  const processUserMessage = useCallback(async (text: string) => {
    const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const userMessage: Message = {
      id: generateId(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const botResponse = await generateBotResponse(text.toLowerCase());
      setMessages(prev => [...prev, botResponse]);

      if (audioConfig.enabled && botResponse.text) {
        speak(botResponse.text);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: generateId(),
        text: "😔 Извините, произошла ошибка. Попробуйте еще раз через несколько секунд.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [generateBotResponse, audioConfig.enabled, speak]);

  // Enhanced quick action handler
  const handleQuickAction = useCallback((action: string) => {
    if (action === 'connect_apple_health') {
      if (!isHealthKitAvailable) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "📱 Apple Health доступен только на iOS устройствах с поддержкой HealthKit",
          isBot: true,
          timestamp: new Date()
        }]);
        return;
      }

      connectAppleHealth().then(success => {
        const message: Message = {
          id: Date.now().toString(),
          text: success
            ? "✅ Apple Health успешно подключен!\n\nТеперь я могу отслеживать вашу активность и давать персонализированные рекомендации."
            : "❌ Не удалось подключить Apple Health.\n\nПроверьте разрешения в настройках iPhone: Настройки → Конфиденциальность → Здоровье",
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
      });
    } else {
      const actionMessages: Record<string, string> = {
        'find_trainer': 'Хочу подобрать персонального тренера',
        'choose_membership': 'Помоги выбрать подходящий абонемент',
        'book_training': 'Хочу записаться на тренировку',
        'visit_shop': 'Покажи спортивное питание',
        'log_sleep': 'Записать данные о сне',
        'log_water': 'Добавить выпитую воду',
        'start_stretching': 'Начать программу растяжки',
        'analyze_nutrition': 'Анализ калорийности продуктов'
      };

      if (actionMessages[action]) {
        processUserMessage(actionMessages[action]);
      }
    }
  }, [isHealthKitAvailable, connectAppleHealth, processUserMessage]);

  // Enhanced send message handler
  const handleSendMessage = useCallback(() => {
    if (inputText.trim() && !isTyping) {
      processUserMessage(inputText.trim());
      setInputText('');
    }
  }, [inputText, isTyping, processUserMessage]);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    // Voice input is handled in ChatInput component
  }, []);

  const quickActions = useMemo(() => quickActionsConfig, []);

  return (
    <>
      {/* Premium Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 aurora-bg rounded-3xl shadow-2xl flex items-center justify-center text-white group floating-element safe-area-bottom"
            style={{
              boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)'
            }}
          >
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-3xl">
              {[0, 0.5, 1].map((delay, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-3xl border-2 border-white/30"
                  animate={{
                    scale: [1, 2],
                    opacity: [0.5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: delay,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative z-10"
            >
              <Brain className="h-8 w-8" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Premium Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto z-50 w-full sm:w-[420px] h-full sm:h-[85vh] sm:max-h-[800px] glass-morphism sm:rounded-3xl shadow-2xl border-none sm:border border-white/20 overflow-clip flex flex-col safe-area-top"
            style={{
              boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)'
            }}
          >
            {/* Premium Header */}
            <div className="aurora-bg p-6 text-white relative overflow-clip">
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                    >
                      <Brain className="h-6 w-6" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-xl shimmer-text">FitFlow AI</h3>
                      <p className="text-sm text-white/80 font-medium">Персональный помощник</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all backdrop-blur-sm"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Quick Actions - Enhanced for mobile */}
            {messages.length <= 1 && (
              <div className="border-b border-gray-100">
                <QuickActionsGrid
                  actions={quickActions}
                  onActionClick={handleQuickAction}
                />
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/80">
              <MessageList
                messages={messages}
                recoveryData={recoveryData}
                onSuggestionClick={processUserMessage}
              />

              {activityData && <AppleHealthStats data={activityData} />}
              
              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Premium Input Area */}
            <div className="border-t border-gray-100 bg-white/95 backdrop-blur-md safe-area-bottom">
              <ChatInput
                value={inputText}
                onChange={setInputText}
                onSend={handleSendMessage}
                onVoiceTranscript={handleVoiceTranscript}
                isTyping={isTyping}
                audioConfig={audioConfig}
                onAudioConfigChange={setAudioConfig}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAgent;