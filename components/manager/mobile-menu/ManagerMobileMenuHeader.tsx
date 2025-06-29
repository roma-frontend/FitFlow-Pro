// components/manager/mobile-menu/ManagerMobileMenuHeader.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dumbbell, X } from "lucide-react";

interface ManagerMobileMenuHeaderProps {
  onClose: () => void;
}

export default function ManagerMobileMenuHeader({ onClose }: ManagerMobileMenuHeaderProps) {
  return (
    <div 
      className="flex items-center justify-between p-4 border-b border-white/20"
    >
      <div 
        className="flex items-center gap-3"
      >
        <div 
          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center"
        >
          <Dumbbell className="h-5 w-5 text-white" />
        </div>
        <div className="text-white">
          <div className="font-bold text-lg">FitFlow-Pro</div>
          <div className="text-xs text-blue-100">Панель менеджера</div>
        </div>
      </div>
      
      <div
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2 h-9 w-9"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
