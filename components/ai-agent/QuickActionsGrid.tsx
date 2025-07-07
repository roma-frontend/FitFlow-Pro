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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center space-x-2 mb-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-5 w-5 text-purple-600" />
          </motion.div>
          <h4 className="text-lg font-bold text-gray-900">Быстрые действия</h4>
        </div>
        <p className="text-sm text-gray-500">Выберите действие для быстрого начала</p>
      </motion.div>

      {/* Premium Grid Layout */}
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

      {/* Premium Bottom Gradient */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
});

QuickActionsGrid.displayName = 'QuickActionsGrid';

interface QuickActionButtonProps {
  action: QuickAction;
  index: number;
  onClick: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = memo(({ action, index, onClick }) => {
  // Enhanced color schemes for premium look
  const enhancedColors: Record<string, { gradient: string; shadow: string; border: string }> = {
    'from-gray-800 to-gray-600': {
      gradient: 'from-gray-800 via-gray-700 to-gray-600',
      shadow: 'shadow-gray-500/25',
      border: 'border-gray-600/20'
    },
    'from-green-500 to-teal-600': {
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
      shadow: 'shadow-green-500/25',
      border: 'border-green-400/20'
    },
    'from-blue-500 to-indigo-600': {
      gradient: 'from-blue-500 via-indigo-500 to-indigo-600',
      shadow: 'shadow-blue-500/25',
      border: 'border-blue-400/20'
    },
    'from-green-500 to-emerald-600': {
      gradient: 'from-green-500 via-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/25',
      border: 'border-emerald-400/20'
    },
    'from-purple-500 to-pink-600': {
      gradient: 'from-purple-500 via-fuchsia-500 to-pink-600',
      shadow: 'shadow-purple-500/25',
      border: 'border-purple-400/20'
    },
    'from-orange-500 to-red-600': {
      gradient: 'from-orange-500 via-red-500 to-red-600',
      shadow: 'shadow-orange-500/25',
      border: 'border-orange-400/20'
    },
    'from-indigo-500 to-blue-600': {
      gradient: 'from-indigo-500 via-blue-500 to-blue-600',
      shadow: 'shadow-indigo-500/25',
      border: 'border-indigo-400/20'
    },
    'from-blue-400 to-cyan-500': {
      gradient: 'from-blue-400 via-cyan-400 to-cyan-500',
      shadow: 'shadow-cyan-500/25',
      border: 'border-cyan-400/20'
    },
    'from-purple-400 to-fuchsia-500': {
      gradient: 'from-purple-400 via-fuchsia-400 to-fuchsia-500',
      shadow: 'shadow-fuchsia-500/25',
      border: 'border-fuchsia-400/20'
    }
  };

  const colorScheme = enhancedColors[action.color] || {
    gradient: action.color,
    shadow: 'shadow-gray-500/25',
    border: 'border-gray-400/20'
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.3,
        type: "spring",
        damping: 25,
        stiffness: 200
      }}
      whileHover={{ 
        scale: 1.03,
        y: -2,
        boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`group relative p-4 sm:p-3 rounded-3xl bg-gradient-to-br ${colorScheme.gradient} text-white text-left shadow-lg ${colorScheme.shadow} hover:shadow-xl transition-all duration-300 border ${colorScheme.border} overflow-clip min-h-[50px] sm:h-[180px]`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full transform translate-x-6 -translate-y-6" />
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      
      {/* Content */}
      <div className="relative z-10">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
        >
          <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.div>
        
        <div>
          <h3 className="font-bold text-sm sm:text-base mb-1 leading-tight">
            {action.title}
          </h3>
        </div>

        {/* Pulse indicator for interactive elements */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
          className="absolute bottom-3 right-3 w-2 h-2 bg-white/60 rounded-full"
        />
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
});

QuickActionButton.displayName = 'QuickActionButton';