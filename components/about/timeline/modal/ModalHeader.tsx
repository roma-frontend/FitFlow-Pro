// components/about/timeline/modal/ModalHeader.tsx
"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";

interface ModalHeaderProps {
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  isTransitioning: boolean;
}

export const ModalHeader = memo<ModalHeaderProps>(({
  onClose,
  onNext,
  onPrev,
  isTransitioning
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {/* Close Button с улучшенной контрастностью */}
      <motion.button
        onClick={onClose}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 border border-white/20"
        whileHover={{ 
          scale: shouldReduceMotion ? 1 : 1.1, 
          rotate: shouldReduceMotion ? 0 : 90,
          backgroundColor: "rgba(0,0,0,0.8)"
        }}
        whileTap={{ scale: 0.95 }}
        style={{ willChange: 'transform, background-color' }}
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </motion.button>

      {/* Navigation Buttons с улучшенной контрастностью */}
      <motion.button
        onClick={onPrev}
        disabled={isTransitioning}
        className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hidden xs:flex border border-white/20"
        whileHover={{ 
          scale: shouldReduceMotion ? 1 : 1.05, 
          x: shouldReduceMotion ? 0 : -2,
          backgroundColor: "rgba(0,0,0,0.8)"
        }}
        whileTap={{ scale: 0.95 }}
        style={{ willChange: 'transform, background-color' }}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </motion.button>

      <motion.button
        onClick={onNext}
        disabled={isTransitioning}
        className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hidden xs:flex border border-white/20"
        whileHover={{ 
          scale: shouldReduceMotion ? 1 : 1.05, 
          x: shouldReduceMotion ? 0 : 2,
          backgroundColor: "rgba(0,0,0,0.8)"
        }}
        whileTap={{ scale: 0.95 }}
        style={{ willChange: 'transform, background-color' }}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </motion.button>
    </>
  );
});

ModalHeader.displayName = 'ModalHeader';
