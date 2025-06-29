// components/trainer/mobile-menu/TrainerMobileMenuHeader.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dumbbell, X } from "lucide-react";

interface TrainerMobileMenuHeaderProps {
  onClose: () => void;
}

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      delay: 0.1,
      ease: "easeOut"
    }
  }
};

export default function TrainerMobileMenuHeader({ onClose }: TrainerMobileMenuHeaderProps) {
  return (
    <motion.div 
      className="flex items-center justify-between p-4 border-b border-white/20"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center gap-3"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Dumbbell className="h-5 w-5 text-white" />
        </motion.div>
        <div className="text-white">
          <div className="font-bold text-lg">FitnessPro</div>
          <div className="text-xs text-green-100">Панель тренера</div>
        </div>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2 h-9 w-9"
        >
          <X className="h-5 w-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
