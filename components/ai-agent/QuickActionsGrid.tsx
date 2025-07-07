import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { QuickAction } from './types';

interface QuickActionsGridProps {
  actions: QuickAction[];
  onActionClick: (action: string) => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = memo(({ actions, onActionClick }) => {
  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-bold text-gray-900">Быстрые действия</h4>
        </div>
        <p className="text-sm text-gray-500">Выберите действие для быстрого начала</p>
      </div>

      {/* Grid Layout - Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {actions.map((action, index) => (
          <QuickActionButton
            key={action.action}
            action={action}
            index={index}
            onClick={() => onActionClick(action.action)}
          />
        ))}
      </div>
    </div>
  );
});

QuickActionsGrid.displayName = 'QuickActionsGrid';

// Optimized Quick Action Button
const QuickActionButton: React.FC<{
  action: QuickAction;
  index: number;
  onClick: () => void;
}> = memo(({ action, index, onClick }) => {
  // Simplified color mapping
  const getGradient = (color: string) => {
    const colorMap: Record<string, string> = {
      'from-gray-800 to-gray-600': 'from-gray-700 to-gray-600',
      'from-green-500 to-teal-600': 'from-green-500 to-teal-600',
      'from-blue-500 to-indigo-600': 'from-blue-500 to-indigo-600',
      'from-green-500 to-emerald-600': 'from-green-500 to-emerald-600',
      'from-purple-500 to-pink-600': 'from-purple-500 to-pink-600',
      'from-orange-500 to-red-600': 'from-orange-500 to-red-600',
      'from-indigo-500 to-blue-600': 'from-indigo-500 to-blue-600',
      'from-blue-400 to-cyan-500': 'from-blue-400 to-cyan-500',
      'from-purple-400 to-fuchsia-500': 'from-purple-400 to-fuchsia-500'
    };
    return colorMap[color] || color;
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: index * 0.05,
        type: "spring",
        damping: 20,
        stiffness: 200
      }}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative p-4 sm:p-3 rounded-3xl bg-gradient-to-br ${getGradient(action.color)} text-white text-left shadow-lg hover:shadow-xl transition-all min-h-[50px] sm:h-[180px] overflow-hidden group`}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
      
      {/* Hover shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
      
      <div className="relative z-10">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
        >
          <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.div>
        
        <h3 className="font-bold text-sm sm:text-base leading-tight">
          {action.title}
        </h3>
      </div>
      
      {/* Small pulse indicator */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
        className="absolute bottom-3 right-3 w-2 h-2 bg-white/60 rounded-full"
      />
    </motion.button>
  );
});

QuickActionButton.displayName = 'QuickActionButton';