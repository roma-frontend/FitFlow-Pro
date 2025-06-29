// components/manager/mobile-menu/sections/ManagerNavigationSection.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ManagerNavigationItem } from "../../types/manager-navigation";

interface ManagerNavigationSectionProps {
  navigationItems: ManagerNavigationItem[];
  onNavigation: (href: string) => void;
  onClose: () => void;
  isLoggingOut: boolean;
}

export default function ManagerNavigationSection({
  navigationItems,
  onNavigation,
  onClose,
  isLoggingOut,
}: ManagerNavigationSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide mb-3">
        Навигация
      </h3>

      <div className="space-y-2">
        {navigationItems.map((item, index) => {
          const IconComponent = item.icon;

          return (
            <div
            key={index}
            >
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-white hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group"
                onClick={() => {
                  onNavigation(item.href);
                  onClose();
                }}
                disabled={isLoggingOut}
              >
                <IconComponent className="mr-3 h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge className="ml-auto bg-white/20 text-white border-white/20 group-hover:bg-white/30 transition-colors duration-200">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
