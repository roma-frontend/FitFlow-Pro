// components/about/timeline/modal/ModalBackdrop.tsx
"use client";

import { motion } from "framer-motion";
import { memo, ReactNode } from "react";

interface ModalBackdropProps {
  children: ReactNode;
  onClose: () => void;
}

export const ModalBackdrop = memo<ModalBackdropProps>(({ children, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm modal-backdrop"
      onClick={onClose}
      style={{ 
        willChange: 'opacity',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {children}
    </motion.div>
  );
});

ModalBackdrop.displayName = 'ModalBackdrop';
