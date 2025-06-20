// components/admin/MobileNotificationButton.tsx
"use client";

import { useState } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

interface MobileNotificationButtonProps {
  unreadCount?: number;
  onClick?: () => void;
}

const bellVariants = {
  ring: {
    rotate: [0, 15, -15, 15, -15, 0],
    transition: { 
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

const badgeVariants = {
  pulse: {
    scale: [1, 1.2, 1],
    transition: { 
      duration: 1.5, 
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function MobileNotificationButton({ 
  unreadCount = 0, 
  onClick 
}: MobileNotificationButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    onClick?.();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative text-white hover:bg-white/20 p-2 h-10 w-10"
      onClick={handleClick}
    >
      <motion.div
        variants={bellVariants}
        animate={isAnimating ? "ring" : ""}
      >
        <Bell className="h-5 w-5" />
      </motion.div>
      
      {unreadCount > 0 && (
        <motion.div
          variants={badgeVariants}
          animate="pulse"
          className="absolute -top-1 -right-1"
        >
          <Badge 
            variant="destructive" 
            className="h-5 w-5 p-0 flex items-center justify-center text-xs font-bold bg-red-500 border-2 border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        </motion.div>
      )}
    </Button>
  );
}
