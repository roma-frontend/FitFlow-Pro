import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot, ChevronRight, Sparkles, User } from 'lucide-react';
import type { Message, Link, RecoveryData } from './types';

interface MessageListProps {
  messages: Message[];
  recoveryData: RecoveryData;
  onSuggestionClick: (suggestion: string) => void;
  onLinkClick?: (link: Link) => void;
}

// Simplified animations with smooth transitions
const messageAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: 0.3,
    type: "spring",
    damping: 25,
    stiffness: 200
  }
};

// Optimized message item
const MessageItem = memo<{
  message: Message;
  recoveryData: RecoveryData;
  onSuggestionClick: (suggestion: string) => void;
  onLinkClick?: (link: Link) => void;
}>(({ message, recoveryData, onSuggestionClick, onLinkClick }) => {
  return (
    <motion.div
      {...messageAnimation}
      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-6`}
    >
      <div className={`max-w-[85%] sm:max-w-[75%]`}>
        {/* Message Header - Simplified with subtle animation */}
        {message.isBot && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center space-x-3 mb-3"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow"
            >
              <Bot className="h-4 w-4 text-white" />
            </motion.div>
            <span className="text-sm font-bold text-gray-900">FitFlow AI</span>
          </motion.div>
        )}
        
        {!message.isBot && (
          <div className="flex items-center justify-end space-x-3 mb-3">
            <span className="text-sm font-medium text-gray-700">Вы</span>
            <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
        
        {/* Message Bubble - Simplified */}
        <div
          className={`p-4 sm:p-5 rounded-3xl shadow-lg ${
            message.isBot
              ? 'bg-white border border-gray-200 text-gray-800'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
          }`}
        >
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {message.text}
          </p>

          {/* Recovery Progress - Simplified */}
          {message.text.includes('уровень восстановления') && (
            <div className="mt-4">
              <RecoveryProgress score={recoveryData.recoveryScore} />
            </div>
          )}
        </div>

        {/* Links - Simplified */}
        {message.links && message.links.length > 0 && (
          <div className="mt-4 space-y-3">
            {message.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  } else if (onLinkClick) {
                    e.preventDefault();
                    onLinkClick(link);
                  }
                }}
                className="block p-4 bg-white border border-gray-200 rounded-3xl hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow">
                    <link.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base text-gray-900 mb-1">{link.title}</p>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Suggestions - Simplified with hover animation */}
        {message.suggestions && message.suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {message.suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl text-sm font-medium hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

MessageItem.displayName = 'MessageItem';

// Simplified recovery progress with smooth animation
const RecoveryProgress: React.FC<{ score: number }> = ({ score }) => {
  const getColor = () => {
    if (score < 30) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (score < 50) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (score < 70) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    return 'bg-gradient-to-r from-green-500 to-emerald-500';
  };

  const getLabel = () => {
    if (score < 30) return "Критический уровень";
    if (score < 50) return "Низкий уровень";
    if (score < 70) return "Средний уровень";
    return "Отличное восстановление";
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2"
    >
      <div className="w-full bg-gray-200 rounded-2xl h-6 relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-6 rounded-2xl ${getColor()} relative overflow-hidden`}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: [-100, 100] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700 mix-blend-overlay">
            {score}%
          </span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-center text-gray-600 font-medium"
      >
        {getLabel()}
      </motion.div>
    </motion.div>
  );
};

// Main component
export const MessageList: React.FC<MessageListProps> = memo(({ 
  messages, 
  recoveryData, 
  onSuggestionClick,
  onLinkClick 
}) => {
  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          recoveryData={recoveryData}
          onSuggestionClick={onSuggestionClick}
          onLinkClick={onLinkClick}
        />
      ))}
    </div>
  );
});

MessageList.displayName = 'MessageList';