"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Bot, Apple } from 'lucide-react';
import { MessageList } from './MessageList';
import { QuickActionsGrid } from './QuickActionsGrid';
import { useHealthKit } from './hooks/useHealthKit';
import { useChatLogic } from './hooks/useChatLogic';
import { quickActionsConfig } from './config/quickActions';
import type { Message, AudioConfig, RecoveryData, ActivityData } from './types';
import { ChatInput } from './ChatInput';

// CSS for pulse animation
const pulseStyles = `
  @keyframes pulse-glow {
    0% {
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 0 rgba(59, 130, 246, 0.4);
    }
    70% {
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 10px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }
`;

// Typing indicator component
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-start"
  >
    <div className="max-w-[80%]">
      <div className="flex items-center space-x-2 mb-1">
        <Bot className="h-4 w-4 text-blue-500" />
        <span className="text-xs text-gray-500">FitFlow AI печатает...</span>
      </div>
      <div className="bg-gray-100 p-3 rounded-2xl">
        <div className="flex space-x-1">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay }}
            />
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// Apple Health Stats Component
const AppleHealthStats: React.FC<{ data: ActivityData }> = ({ data }) => {
  const stats = [
    { value: data.steps.toLocaleString(), label: "Шаги", icon: "👟" },
    { value: data.heartRate, label: "Пульс (уд/мин)", icon: "❤️" },
    { value: Math.round(data.activeEnergy), label: "Активные ккал", icon: "🔥" },
    { value: data.sleepHours.toFixed(1), label: "Часы сна", icon: "💤" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Apple className="h-5 w-5 text-gray-800" />
          <h3 className="font-medium">Apple Health Data</h3>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(data.lastSync).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">{stat.icon}</span>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
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

  // Inject styles
  useEffect(() => {
    const styleId = 'pulse-glow-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = pulseStyles;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const timer = setTimeout(() => {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: "👋 Привет! Я ваш персональный фитнес-помощник FitFlow Pro! Помогу подобрать тренера, выбрать программу тренировок, записаться на занятие. Чем могу помочь?",
          isBot: true,
          timestamp: new Date(),
          suggestions: [
            "Подобрать тренера",
            "Выбрать абонемент",
            "Программы тренировок",
            "Записаться на занятие",
            "Записать сон",
            "Добавить воду",
            "Оценить стресс"
          ]
        };
        setMessages([welcomeMessage]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);

  // Process user message
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
      const botResponse = await generateBotResponse(text.toLowerCase());
      setMessages(prev => [...prev, botResponse]);

      if (audioConfig.enabled && botResponse.text) {
        speak(botResponse.text);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: generateId(),
        text: "Извините, произошла ошибка. Попробуйте еще раз.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [generateBotResponse, audioConfig.enabled, speak]);

  // Handle quick action
  const handleQuickAction = useCallback((action: string) => {
    if (action === 'connect_apple_health') {
      if (!isHealthKitAvailable) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "❌ Apple Health доступен только на iOS устройствах",
          isBot: true,
          timestamp: new Date()
        }]);
        return;
      }

      connectAppleHealth().then(success => {
        const message: Message = {
          id: Date.now().toString(),
          text: success
            ? "✅ Apple Health успешно подключен! Теперь я могу отслеживать вашу активность."
            : "❌ Не удалось подключить Apple Health. Проверьте разрешения в настройках.",
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
      });
    } else if (action === 'analyze_nutrition') {
      setInputText('Сколько калорий в ');
    } else {
      const actionMessages: Record<string, string> = {
        'find_trainer': 'Подобрать тренера',
        'choose_membership': 'Выбрать абонемент',
        'book_training': 'Записаться на тренировку',
        'visit_shop': 'Посетить магазин',
        'log_sleep': 'Записать сон',
        'log_water': 'Добавить воду',
        'start_stretching': 'Программа растяжки'
      };

      if (actionMessages[action]) {
        processUserMessage(actionMessages[action]);
      }
    }
  }, [isHealthKitAvailable, connectAppleHealth, processUserMessage]);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (inputText.trim() && !isTyping) {
      processUserMessage(inputText.trim());
      setInputText('');
    }
  }, [inputText, isTyping, processUserMessage]);

  // Handle voice transcript
  const handleVoiceTranscript = useCallback((transcript: string) => {
    // Voice input is already handled in ChatInput component
  }, []);

  // Memoized quick actions
  const quickActions = useMemo(() => quickActionsConfig, []);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition-all duration-300"
            style={{ animation: 'pulse-glow 2s infinite' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-7 w-7" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 z-50 w-full sm:w-96 h-full sm:h-[760px] bg-white rounded-0 sm:rounded-2xl shadow-2xl border-none sm:border border-gray-200 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <Brain className="h-6 w-6" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">FitFlow AI</h3>
                    <p className="text-sm text-white/80">Ваш фитнес-помощник</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Quick Actions - Show only when no messages */}
            {messages.length <= 1 && (
              <QuickActionsGrid
                actions={quickActions}
                onActionClick={handleQuickAction}
              />
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <MessageList
                messages={messages}
                recoveryData={recoveryData}
                onSuggestionClick={processUserMessage}
              />

              {activityData && <AppleHealthStats data={activityData} />}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <ChatInput
              value={inputText}
              onChange={setInputText}
              onSend={handleSendMessage}
              onVoiceTranscript={handleVoiceTranscript}
              isTyping={isTyping}
              audioConfig={audioConfig}
              onAudioConfigChange={setAudioConfig}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAgent;