import React, { memo } from 'react';
import { motion } from 'framer-motion';
import type { QuickAction } from './types';

interface QuickActionsGridProps {
  actions: QuickAction[];
  onActionClick: (action: string) => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = memo(({ actions, onActionClick }) => {
  return (
    <div className="h-[280px] overflow-y-auto p-4 border-b bg-gray-50">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Быстрые действия:</h4>
      <div className="grid grid-cols-2 gap-2">
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

interface QuickActionButtonProps {
  action: QuickAction;
  index: number;
  onClick: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = memo(({ action, index, onClick }) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-3 rounded-lg bg-gradient-to-r ${action.color} text-white text-left hover:shadow-lg transition-all`}
    >
      <action.icon className="h-5 w-5 mb-1" />
      <p className="text-xs font-medium">{action.title}</p>
    </motion.button>
  );
});

QuickActionButton.displayName = 'QuickActionButton';