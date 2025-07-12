"use client"

import React, { useState, useCallback, useMemo, lazy, Suspense, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Bot, Loader2 } from 'lucide-react';
import { useHealthKit } from './hooks/useHealthKit';
import { useChatLogic } from './hooks/useChatLogic';
import { quickActionsConfig } from './config/quickActions';
import type { Message, AudioConfig, RecoveryData } from './types';
import { ChatInput } from './ChatInput';
import { useAIAgentStore, generateInitialMessage, generateSuggestions } from '@/stores/useAIAgentStore';

// Lazy load heavy components
const MessageList = lazy(() => import('./MessageList').then(m => ({ default: m.MessageList })));
const QuickActionsGrid = lazy(() => import('./QuickActionsGrid').then(m => ({ default: m.QuickActionsGrid })));
const AppleHealthStats = lazy(() => import('./AppleHealthStats'));

// Props interface
interface AIAgentProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialMessage?: string | null;
}

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

// Lightweight typing indicator with smooth animation
const TypingIndicator = () => (
  <motion.div {...fadeIn} className="flex justify-start mb-4">
    <div className="max-w-[80%] sm:max-w-[70%]">
      <div className="flex items-center space-x-3 mb-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
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
              className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
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
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

const AIAgent: React.FC<AIAgentProps> = ({ isOpen: propIsOpen, onClose, initialMessage }) => {
  const {
    isOpen: storeIsOpen,
    pendingAction,
    context,
    closeAgent,
    clearPendingAction,
    setContext,
    addToHistory
  } = useAIAgentStore();

  // Use prop isOpen if provided, otherwise use store isOpen
  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;

  const [isMounted, setIsMounted] = useState(false);
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
  const { generateBotResponse, speak, resetContext } = useChatLogic({
    audioConfig,
    recoveryData,
    setRecoveryData,
    setActivityData,
    connectAppleHealth
  });

   useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle close and reset state
  const handleClose = useCallback(() => {
    // Reset all states
    setMessages([]);
    setInputText('');
    setIsTyping(false);
    setAudioConfig({
      enabled: false,
      voice: 'Mary'
    });
    setRecoveryData({
      lastWorkout: null,
      sleepHours: 7,
      recoveryScore: 75,
      lastMeal: null,
      waterIntake: 0,
      stressLevel: 3
    });

    // Reset context in chat logic
    resetContext();

    // Use prop onClose if provided, otherwise use store closeAgent
    if (onClose) {
      onClose();
    } else {
      closeAgent();
    }
  }, [onClose, closeAgent, resetContext]);

  // Block body scroll when agent is open
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

  // Smooth scroll to bottom with animation
  const scrollToBottom = useCallback(() => {
    if (!scrollContainerRef.current || !messagesEndRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    const targetPosition = messagesEndRef.current.offsetTop;
    const startPosition = scrollContainer.scrollTop;
    const distance = targetPosition - startPosition;
    const duration = 500; // 500ms smooth scroll
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function for smooth animation
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

  // Process initial message when provided
  useEffect(() => {
    if (isOpen && pendingAction && messages.length === 0) {
      // Generate initial message based on action and context
      const initialMessage = generateInitialMessage(pendingAction, context);
      const suggestions = generateSuggestions(pendingAction, context);

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "👋 Добро пожаловать в FitFlow Pro!\n\nЯ ваш персональный AI-помощник. Чем могу помочь?",
        isBot: true,
        timestamp: new Date(),
        suggestions: suggestions
      };

      setMessages([welcomeMessage]);

      // Auto process initial message if it's not just a greeting
      if (initialMessage && initialMessage !== "Привет! Чем могу помочь?") {
        setTimeout(() => {
          processUserMessage(initialMessage);
        }, 800);
      }

      // Clear pending action
      clearPendingAction();
    }
  }, [isOpen, pendingAction, context, messages.length, clearPendingAction]);

  // Handle prop initialMessage
  useEffect(() => {
    if (isOpen && initialMessage && messages.length === 0) {
      processUserMessage(initialMessage);
    }
  }, [isOpen, initialMessage, messages.length]);

  // Debounced welcome message
  const showWelcomeMessage = useCallback(() => {
    if (!isOpen || messages.length > 0) return;

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "👋 Добро пожаловать в FitFlow Pro!\n\nЯ ваш персональный AI-помощник. Чем могу помочь?",
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
  }, [isOpen, messages.length]);

  // Use effect with cleanup
  useEffect(() => {
    const timer = setTimeout(showWelcomeMessage, 300);
    return () => clearTimeout(timer);
  }, [showWelcomeMessage]);

  // Optimized message processing with context awareness
  const processUserMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Add to history
    addToHistory(text, 'user');

    try {
      // Minimal delay for natural feel
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate response considering context
      let contextualText = text;
      if (context.selectedTrainer) {
        contextualText = `Контекст: тренер ${context.selectedTrainer.name} (${context.selectedTrainer.specialty}). Запрос: ${text}`;
      }

      const botResponse = await generateBotResponse(contextualText.toLowerCase());
      setMessages(prev => [...prev, botResponse]);

      // Add bot response to history
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
  }, [generateBotResponse, audioConfig.enabled, speak, context, addToHistory]);

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
    if (transcript.trim()) {
      processUserMessage(transcript.trim());
    }
  }, [processUserMessage]);

  const quickActions = useMemo(() => quickActionsConfig, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            {...scaleIn}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (onClose) {
                // If using props, need to handle opening differently
                // This assumes parent component handles opening
              } else {
                useAIAgentStore.getState().openAgent();
              }
            }}
            className="fixed bottom-6 right-6 z-50 w-12 md:w-14 h-12 md:h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-2xl flex items-center justify-center text-white group"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-6 md:h-[1.7rem] h-6 md:w-[1.7rem]" />
            </motion.div>

            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 opacity-0"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile to prevent background interaction */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 sm:hidden"
              onClick={handleClose}
            />

            <motion.div
              {...scaleIn}
              className="fixed inset-0 sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto z-50 w-full sm:w-[420px] h-full sm:h-[85vh] sm:max-h-[796px] bg-white/95 backdrop-blur-sm sm:rounded-3xl shadow-2xl sm:border border-gray-200/50 overflow-y-auto sm:overflow-clip flex flex-col"
              style={{
                // Prevent touch events from propagating on mobile
                touchAction: 'pan-y',
                overscrollBehavior: 'contain'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">FitFlow AI</h3>
                      <p className="text-sm text-white/80">Персональный помощник</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div className="border-b border-gray-100">
                  <Suspense fallback={<LoadingFallback />}>
                    <QuickActionsGrid
                      actions={quickActions}
                      onActionClick={handleQuickAction}
                    />
                  </Suspense>
                </div>
              )}
              <div className={`${messages.length > 1 ? 'block' : 'hidden'} sm:block flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4 bg-gray-50/50 scroll-smooth`}
                ref={scrollContainerRef}
                style={{
                  // Prevent overscroll on mobile
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch'
                }}
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

              <div className={`${messages.length > 1 ? 'block' : 'hidden'} sm:block border-t border-gray-100 bg-white`}>
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
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAgent;