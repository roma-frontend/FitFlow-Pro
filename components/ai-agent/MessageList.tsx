import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronRight, Sparkles, User } from 'lucide-react';
import type { Message, Link, RecoveryData } from './types';

interface MessageListProps {
  messages: Message[];
  recoveryData: RecoveryData;
  onSuggestionClick: (suggestion: string) => void;
  onLinkClick?: (link: Link) => void;
}

interface MessageItemProps {
  message: Message;
  index: number;
  recoveryData: RecoveryData;
  onSuggestionClick: (suggestion: string) => void;
  onLinkClick?: (link: Link) => void;
}

// Premium message item with enhanced animations
const MessageItem = memo<MessageItemProps>(({ 
  message, 
  index, 
  recoveryData, 
  onSuggestionClick,
  onLinkClick 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.4,
        type: "spring",
        damping: 25,
        stiffness: 200
      }}
      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-6`}
    >
      <div className={`max-w-[85%] sm:max-w-[75%] ${message.isBot ? 'order-1' : 'order-2'}`}>
        {/* Message Header */}
        {message.isBot && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="flex items-center space-x-3 mb-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Bot className="h-4 w-4 text-white" />
            </motion.div>
            <div>
              <span className="text-sm font-bold text-gray-900">FitFlow AI</span>
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
                <span className="text-xs text-gray-500">Онлайн</span>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* User Header */}
        {!message.isBot && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="flex items-center justify-end space-x-3 mb-3"
          >
            <span className="text-sm font-medium text-gray-700">Вы</span>
            <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="h-4 w-4 text-white" />
            </div>
          </motion.div>
        )}
        
        {/* Message Bubble */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className={`relative p-4 sm:p-5 rounded-3xl shadow-lg backdrop-blur-sm ${
            message.isBot
              ? 'bg-white/90 border border-gray-200/50 text-gray-800'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white shadow-purple-500/25'
          }`}
        >
          {/* Message tail */}
          <div
            className={`absolute w-4 h-4 transform rotate-45 ${
              message.isBot
                ? 'bg-white/90 border-l border-b border-gray-200/50 -left-2 top-6'
                : 'bg-gradient-to-br from-purple-600 to-pink-600 -right-2 top-6'
            }`}
          />
          
          {/* Shimmer effect for user messages */}
          {!message.isBot && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-pulse rounded-3xl" />
          )}
          
          <div className="relative z-10">
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {message.text}
            </p>

            {/* Recovery Progress */}
            {message.text.includes('уровень восстановления') && (
              <div className="mt-4">
                <RecoveryProgress score={recoveryData.recoveryScore} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Message Links */}
        {message.links && message.links.length > 0 && (
          <div className="mt-4">
            <MessageLinks links={message.links} onLinkClick={onLinkClick} />
          </div>
        )}

        {/* Message Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-4">
            <MessageSuggestions 
              suggestions={message.suggestions} 
              onSuggestionClick={onSuggestionClick} 
            />
          </div>
        )}
      </div>
    </motion.div>
  );
});

MessageItem.displayName = 'MessageItem';

// Enhanced recovery progress component
const RecoveryProgress: React.FC<{ score: number }> = ({ score }) => {
  const getColor = () => {
    if (score < 30) return { bg: 'bg-red-500', from: 'from-red-500', to: 'to-red-600' };
    if (score < 50) return { bg: 'bg-yellow-500', from: 'from-yellow-500', to: 'to-orange-500' };
    if (score < 70) return { bg: 'bg-blue-500', from: 'from-blue-500', to: 'to-indigo-500' };
    return { bg: 'bg-green-500', from: 'from-green-500', to: 'to-emerald-500' };
  };

  const getLabel = () => {
    if (score < 30) return "Критический уровень";
    if (score < 50) return "Низкий уровень";
    if (score < 70) return "Средний уровень";
    return "Отличное восстановление";
  };

  const colors = getColor();

  return (
    <div className="w-full bg-gray-200/80 rounded-2xl h-6 relative overflow-hidden backdrop-blur-sm">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
        className={`h-6 rounded-2xl bg-gradient-to-r ${colors.from} ${colors.to} relative overflow-hidden`}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full animate-pulse" />
      </motion.div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-700 mix-blend-overlay">
          {score}%
        </span>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-xs text-center mt-2 text-gray-600 font-medium"
      >
        {getLabel()}
      </motion.div>
    </div>
  );
};

// Enhanced message links component
const MessageLinks: React.FC<{ 
  links: Link[]; 
  onLinkClick?: (link: Link) => void;
}> = memo(({ links, onLinkClick }) => {
  return (
    <div className="space-y-3">
      {links.map((link, linkIndex) => (
        <motion.a
          key={linkIndex}
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
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: linkIndex * 0.1 }}
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          className="block p-4 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden"
        >
          {/* Hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/0 via-purple-50/50 to-pink-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
          
          <div className="relative z-10 flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <link.icon className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex-1">
              <p className="font-bold text-base text-gray-900 mb-1">{link.title}</p>
              <p className="text-sm text-gray-600">{link.description}</p>
            </div>
            <motion.div
              whileHover={{ x: 5 }}
              className="text-gray-400 group-hover:text-purple-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.div>
          </div>
        </motion.a>
      ))}
    </div>
  );
});

MessageLinks.displayName = 'MessageLinks';

// Enhanced message suggestions component
const MessageSuggestions: React.FC<{ 
  suggestions: string[]; 
  onSuggestionClick: (suggestion: string) => void;
}> = memo(({ suggestions, onSuggestionClick }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, suggIndex) => (
        <motion.button
          key={suggIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: suggIndex * 0.05 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSuggestionClick(suggestion)}
          className="group px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 text-purple-700 rounded-2xl text-sm font-medium hover:from-purple-100 hover:to-pink-100 hover:border-purple-300/50 transition-all shadow-sm hover:shadow-md relative overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          
          <span className="relative z-10 flex items-center space-x-1">
            <span>{suggestion}</span>
            <Sparkles className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
          </span>
        </motion.button>
      ))}
    </div>
  );
});

MessageSuggestions.displayName = 'MessageSuggestions';

// Main message list component
export const MessageList: React.FC<MessageListProps> = memo(({ 
  messages, 
  recoveryData, 
  onSuggestionClick,
  onLinkClick 
}) => {
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            index={index}
            recoveryData={recoveryData}
            onSuggestionClick={onSuggestionClick}
            onLinkClick={onLinkClick}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

MessageList.displayName = 'MessageList';