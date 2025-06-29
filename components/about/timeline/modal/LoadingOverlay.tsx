// components/about/timeline/modal/LoadingOverlay.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay = memo<LoadingOverlayProps>(({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/10 backdrop-blur-[2px] flex items-center justify-center z-40"
          style={{ willChange: 'opacity' }}
        >
          {/* Элегантный спиннер без белого фона */}
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Внешнее кольцо */}
            <motion.div
              className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-gray-300/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{ willChange: 'transform' }}
            />
            
            {/* Внутреннее активное кольцо */}
            <motion.div
              className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 border-2 border-transparent border-t-blue-500/80 border-r-blue-400/60 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{ willChange: 'transform' }}
            />
            
            {/* Центральная точка */}
            <motion.div
              className="absolute inset-0 m-auto w-2 h-2 bg-blue-500/60 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              style={{ willChange: 'transform, opacity' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';
