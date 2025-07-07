// components/ai-agent/AIAgent.tsx - Обновленная версия
"use client"

import React, { useState, useCallback, useMemo, lazy, Suspense, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Bot, Loader2, MessageCircle, Users, Award, Star } from 'lucide-react';
import { useAIAgent, generateInitialMessage, generateSuggestions, AI_ACTIONS } from '@/stores/useAIAgentStore';
import { useHealthKit } from './hooks/useHealthKit';
import { useChatLogic } from './hooks/useChatLogic';
import { quickActionsConfig } from './config/quickActions';
import type { Message, AudioConfig, RecoveryData } from './types';
import { ChatInput } from './ChatInput';

// Lazy load heavy components
const MessageList = lazy(() => import('./MessageList').then(m => ({ default: m.MessageList })));
const QuickActionsGrid = lazy(() => import('./QuickActionsGrid').then(m => ({ default: m.QuickActionsGrid })));
const AppleHealthStats = lazy(() => import('./AppleHealthStats'));

// Simplified animations for performance
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { type: "spring", damping: 30, stiffness: 300 }
};

// Компонент для отображения контекста тренера
const TrainerContext: React.FC<{ trainer: any }> = ({ trainer }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-4 border border-blue-200"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <Users className="h-5 w-5 text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{trainer.name}</h4>
        <p className="text-sm text-gray-600">{trainer.specialty}</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-blue-500" />
        <span className="text-gray-600">{trainer.experience}</span>
      </div>
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-yellow-500" />
        <span className="text-gray-600">{trainer.rating}/5</span>
      </div>
    </div>
    
    <div className="flex flex-wrap gap-2 mt-3">
      {trainer.badges?.slice(0, 3).map((badge: string, index: number) => (
        <span
          key={index}
          className="px-2 py-1 bg-white/80 text-xs rounded-full text-gray-700 border border-gray-200"
        >
          {badge}
        </span>
      ))}
    </div>
  </motion.div>
);

const TypingIndicator = () => (
  <motion.div {...fadeIn} className="flex justify-start mb-4">
    <div className="max-w-[80%] sm:max-w-[70%]">
      <div className="flex items-center space-x-3 mb-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
        >
          <Bot className="h-3 w-3 text-white" />
        </motion.div>
        <span className="text-xs font-medium text-gray-500">FitFlow AI печатает...</span>
      </div>
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-200/50"
      >
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
                duration: 1.4,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  </motion.div>
);

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
  </div>
);

const AIAgent: React.FC = () => {
  const {
    isOpen,
    pendingAction,
    context,
    openAgent,
    closeAgent,
    clearPendingAction,
    setContext,
    addToHistory
  } = useAIAgent();

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { activityData, setActivityData, connectAppleHealth, isHealthKitAvailable } = useHealthKit();
  const { generateBotResponse, speak } = useChatLogic({
    audioConfig,
    recoveryData,
    setRecoveryData,
    setActivityData,
    connectAppleHealth
  });

  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Add styles to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      // Add touch-action to prevent mobile scroll
      document.documentElement.style.touchAction = 'none';

      return () => {
        // Restore scroll position and remove styles
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.touchAction = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Обработка открытия агента с pending action
  useEffect(() => {
    if (isOpen && pendingAction && messages.length === 0) {
      console.log('🤖 Processing pending action:', pendingAction, context);
      
      // Генерируем начальное сообщение на основе действия
      const initialMessage = generateInitialMessage(pendingAction, context);
      const suggestions = generateSuggestions(pendingAction, context);
      
      let welcomeText = "👋 Привет! Я ваш персональный AI-помощник FitFlow.\n\n";
      
      // Персонализируем приветствие на основе контекста
      if (pendingAction === AI_ACTIONS.TRAINER_CONSULTATION && context.selectedTrainer) {
        welcomeText += `Вижу, вас интересует тренер ${context.selectedTrainer.name}. Расскажу всё, что нужно знать!`;
      } else if (pendingAction === AI_ACTIONS.FIND_TRAINER) {
        welcomeText += "Помогу подобрать идеального тренера под ваши цели и предпочтения.";
      } else if (pendingAction === AI_ACTIONS.GENERAL_CONSULTATION) {
        welcomeText += "Готов ответить на любые вопросы о наших тренерах и услугах.";
      } else if (pendingAction === AI_ACTIONS.CONSULTATION) {
        welcomeText += "Готов помочь с фитнес-консультацией!";
      } else {
        welcomeText += "Чем могу помочь?";
      }

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: welcomeText,
        isBot: true,
        timestamp: new Date(),
        suggestions: suggestions
      };

      setMessages([welcomeMessage]);
      
      // Автоматически отправляем начальное сообщение через 1 секунду
      if (initialMessage && initialMessage !== "Привет! Чем могу помочь?") {
        setTimeout(() => {
          processUserMessage(initialMessage);
        }, 1000);
      }
      
      // Очищаем pending action
      clearPendingAction();
    }
  }, [isOpen, pendingAction, context, messages.length]);

  // Smooth scroll to bottom with animation
  const scrollToBottom = useCallback(() => {
    if (!scrollContainerRef.current || !messagesEndRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    const targetPosition = messagesEndRef.current.offsetTop;
    const startPosition = scrollContainer.scrollTop;
    const distance = targetPosition - startPosition;
    const duration = 500;
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      };

      scrollContainer.scrollTop = startPosition + distance * easeInOutCubic(progress);

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }, []);

  // Auto scroll when messages change
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // Обработка сообщения пользователя с учетом контекста
  const processUserMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Добавляем в историю
    addToHistory(text, 'user');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Генерируем ответ с учетом контекста
      const botResponse = await generateBotResponseWithContext(text.toLowerCase());
      setMessages(prev => [...prev, botResponse]);

      // Добавляем в историю
      addToHistory(botResponse.text, 'system');

      if (audioConfig.enabled && botResponse.text) {
        speak(botResponse.text);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        text: "😔 Произошла ошибка. Попробуйте еще раз.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [generateBotResponse, audioConfig.enabled, speak, addToHistory, context]);

  // Генерация ответа с учетом контекста
  const generateBotResponseWithContext = useCallback(async (text: string) => {
    // Используем контекст для более точных ответов
    const contextualText = `
      Контекст: ${context.page || 'общий'}
      ${context.selectedTrainer ? `Тренер: ${context.selectedTrainer.name} (${context.selectedTrainer.specialty})` : ''}
      ${context.selectedCategory ? `Категория: ${context.selectedCategory}` : ''}
      ${context.intent ? `Цель: ${context.intent}` : ''}
      Запрос: ${text}
    `;

    return await generateBotResponse(contextualText);
  }, [generateBotResponse, context]);

  // Memoized quick action handler
  const handleQuickAction = useCallback((action: string) => {
    if (action === 'connect_apple_health') {
      if (!isHealthKitAvailable) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "📱 Apple Health доступен только на iOS устройствах",
          isBot: true,
          timestamp: new Date()
        }]);
        return;
      }

      connectAppleHealth().then(success => {
        const message: Message = {
          id: Date.now().toString(),
          text: success
            ? "✅ Apple Health успешно подключен!"
            : "❌ Не удалось подключить Apple Health",
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

  const handleSendMessage = useCallback(() => {
    if (inputText.trim() && !isTyping) {
      processUserMessage(inputText.trim());
      setInputText('');
    }
  }, [inputText, isTyping, processUserMessage]);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    // Voice input handled in ChatInput
  }, []);

  const quickActions = useMemo(() => quickActionsConfig, []);

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            {...scaleIn}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => openAgent()}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl shadow-2xl flex items-center justify-center text-white group"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-8 w-8" />
            </motion.div>

            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...scaleIn}
            className="fixed inset-0 sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto z-50 w-full sm:w-[420px] h-full sm:h-[85vh] sm:max-h-[800px] bg-white/95 backdrop-blur-sm sm:rounded-3xl shadow-2xl sm:border border-gray-200/50 overflow-hidden flex flex-col"
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              touchAction: 'pan-y',
              overscrollBehavior: 'contain'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Brain className="w-4 sm:h-6 h-4 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-xl">FitFlow AI</h3>
                    <p className="text-xs md:text-sm text-white/80">
                      {context.selectedTrainer 
                        ? `Консультация по тренеру ${context.selectedTrainer.name}` 
                        : 'Персональный помощник'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeAgent}
                  className="w-8 sm:w-10 h-8 sm:h-10 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 sm:h-5 h-4 sm:w-5" />
                </motion.button>
              </div>
            </div>

            {/* Context Display */}
            {context.selectedTrainer && (
              <div className="p-4 bg-gray-50 shrink-0">
                <TrainerContext trainer={context.selectedTrainer} />
              </div>
            )}

            {/* Quick Actions */}
            {messages.length <= 1 && !context.selectedTrainer && (
              <div className="border-b border-gray-100 shrink-0">
                <Suspense fallback={<LoadingFallback />}>
                  <QuickActionsGrid
                    actions={quickActions}
                    onActionClick={handleQuickAction}
                  />
                </Suspense>
              </div>
            )}

            {/* Messages Area */}
            <div
              ref={scrollContainerRef}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4 bg-gray-50/50"
            >
              <Suspense fallback={<LoadingFallback />}>
                <MessageList
                  messages={messages}
                  recoveryData={recoveryData}
                  onSuggestionClick={processUserMessage}
                />
              </Suspense>

              {activityData && (
                <Suspense fallback={<LoadingFallback />}>
                  <AppleHealthStats data={activityData} />
                </Suspense>
              )}

              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 bg-white shrink-0 pb-safe">
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