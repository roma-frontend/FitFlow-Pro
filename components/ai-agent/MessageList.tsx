import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot, ChevronRight } from 'lucide-react';
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

// Memoized message item for better performance
const MessageItem = memo<MessageItemProps>(({ 
  message, 
  index, 
  recoveryData, 
  onSuggestionClick,
  onLinkClick 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`max-w-full ${message.isBot ? 'order-1' : 'order-2'}`}>
        {message.isBot && (
          <div className="flex items-center space-x-2 mb-1">
            <Bot className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-gray-500">FitFlow AI</span>
          </div>
        )}
        
        <div
          className={`max-w-[80%] p-3 rounded-2xl ${
            message.isBot
              ? 'bg-gray-100 text-gray-800'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
          }`}
        >
          <p className="text-sm whitespace-pre-line">{message.text}</p>

          {message.text.includes('уровень восстановления') && (
            <RecoveryProgress score={recoveryData.recoveryScore} />
          )}
        </div>

        {message.links && message.links.length > 0 && (
          <MessageLinks links={message.links} onLinkClick={onLinkClick} />
        )}

        {message.suggestions && message.suggestions.length > 0 && (
          <MessageSuggestions 
            suggestions={message.suggestions} 
            onSuggestionClick={onSuggestionClick} 
          />
        )}
      </div>
    </motion.div>
  );
});

MessageItem.displayName = 'MessageItem';

// Recovery progress component
const RecoveryProgress: React.FC<{ score: number }> = ({ score }) => {
  const getColor = () => {
    if (score < 30) return 'bg-red-500';
    if (score < 50) return 'bg-yellow-500';
    if (score < 70) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getLabel = () => {
    if (score < 30) return "Критический уровень";
    if (score < 50) return "Низкий уровень";
    if (score < 70) return "Средний уровень";
    return "Отличное восстановление";
  };

  return (
    <div className="mt-3 w-full bg-gray-200 rounded-full h-4">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`h-4 rounded-full ${getColor()}`}
      />
      <div className="text-xs text-center mt-1 text-gray-600">
        {getLabel()}
      </div>
    </div>
  );
};

// Message links component
const MessageLinks: React.FC<{ 
  links: Link[]; 
  onLinkClick?: (link: Link) => void;
}> = memo(({ links, onLinkClick }) => {
  return (
    <div className="mt-2 space-y-2">
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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: linkIndex * 0.1 }}
          className="block p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <link.icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">{link.title}</p>
              <p className="text-xs text-gray-500">{link.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
          </div>
        </motion.a>
      ))}
    </div>
  );
});

MessageLinks.displayName = 'MessageLinks';

// Message suggestions component
const MessageSuggestions: React.FC<{ 
  suggestions: string[]; 
  onSuggestionClick: (suggestion: string) => void;
}> = memo(({ suggestions, onSuggestionClick }) => {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {suggestions.map((suggestion, suggIndex) => (
        <motion.button
          key={suggIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: suggIndex * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
        >
          {suggestion}
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
    <div className="space-y-4">
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
    </div>
  );
});

MessageList.displayName = 'MessageList';