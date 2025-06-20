// components/mobile-menu/MobileMenuButton.tsx
"use client";

import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileMenuButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: "primary" | "outline" | "ghost";
}

const MobileMenuButton = forwardRef<HTMLButtonElement, MobileMenuButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0",
      outline: "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm",
      ghost: "text-white hover:bg-white/10 hover:text-white"
    };

    return (
      <Button
        className={cn(
          "w-full h-12 transition-all duration-200",
          variants[variant],
          className
        )}
        ref={ref}
        variant="outline" // Используем базовый variant для структуры
        {...props}
      >
        {children}
      </Button>
    );
  }
);

MobileMenuButton.displayName = "MobileMenuButton";

export { MobileMenuButton };
