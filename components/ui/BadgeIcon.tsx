// components/ui/BadgeIcon.tsx (исправленная версия)
import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 
  | "quantum-ai" 
  | "neural-new" 
  | "holographic" 
  | "minimal" 
  | "cosmic" 
  | "matrix" 
  | "standard";

export type BadgePosition = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

interface BadgeIconProps {
  variant: BadgeVariant;
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  position?: BadgePosition | 'default';
  showEmpty?: boolean;
  pulse?: boolean;
  glow?: boolean;
  // Новый проп для контроля позиционирования
  positioning?: 'absolute' | 'relative' | 'inline';
}

const BadgeIcon: React.FC<BadgeIconProps> = ({ 
  variant, 
  text = "", 
  className,
  size = 'sm',
  animated = true,
  position = 'default',
  showEmpty = false,
  pulse = false,
  glow = false,
  positioning = 'absolute'
}) => {
  
  // Проверка на отображение badge
  const shouldRender = text || showEmpty || variant === "neural-new";
  if (!shouldRender) return null;

  const getPositionStyles = () => {
    // Если используется inline позиционирование, не применяем позиционные стили
    if (positioning === 'inline') {
      return "";
    }

    if (position === 'default') {
      return "top-0 right-0 transform translate-x-1/2 -translate-y-1/2";
    }
    
    if (typeof position === 'object') {
      const styles: string[] = [];
      if (position.top !== undefined) styles.push(`top-[${position.top}px]`);
      if (position.right !== undefined) styles.push(`right-[${position.right}px]`);
      if (position.bottom !== undefined) styles.push(`bottom-[${position.bottom}px]`);
      if (position.left !== undefined) styles.push(`left-[${position.left}px]`);
      return styles.join(' ');
    }
    
    return "top-0 right-0 transform translate-x-1/2 -translate-y-1/2";
  };

  const getBasePositioning = () => {
    switch (positioning) {
      case 'absolute':
        return "absolute";
      case 'relative':
        return "relative";
      case 'inline':
        return "inline-flex";
      default:
        return "absolute";
    }
  };

  const getVariantStyles = () => {
    const baseStyles = cn(
      getBasePositioning(),
      "inline-flex items-center justify-center font-bold text-white rounded-full text-xs leading-none z-10"
    );
    
    const positionStyles = getPositionStyles();
    
    const sizeStyles = {
      sm: "min-w-[18px] h-[18px] px-1.5 text-[10px]",
      md: "min-w-[20px] h-[20px] px-2 text-xs",
      lg: "min-w-[24px] h-[24px] px-2.5 text-sm"
    };

    const variantStyles = {
      "quantum-ai": cn(
        "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 shadow-lg",
        animated && "quantum-pulse badge-quantum",
        glow && "badge-glow"
      ),
      "neural-new": cn(
        "bg-gradient-to-r from-green-500 to-emerald-600 shadow-md",
        animated && "neural-particle-1",
        glow && "badge-glow"
      ),
      "holographic": cn(
        "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg",
        animated && "holo-glint-1 badge-glow",
        glow && "badge-glow-intense"
      ),
      "minimal": cn(
        "bg-gray-600 shadow-sm",
        glow && "badge-glow"
      ),
      "cosmic": cn(
        "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg",
        animated && "cosmic-star-1",
        glow && "badge-glow"
      ),
      "matrix": cn(
        "bg-gradient-to-r from-green-400 to-green-600 shadow-md font-mono",
        animated && "matrix-digit-1",
        glow && "badge-glow"
      ),
      "standard": cn(
        "bg-red-500 shadow-sm",
        glow && "badge-glow"
      )
    };

    const pulseEffect = pulse ? "animate-pulse" : "";

    return cn(
      baseStyles,
      positionStyles,
      sizeStyles[size],
      variantStyles[variant],
      pulseEffect
    );
  };

  // Остальные функции рендера остаются без изменений...
  const renderQuantumElements = () => {
    if (variant !== "quantum-ai" || !animated) return null;
    
    return (
      <>
        <div className="absolute inset-0 quantum-particle-1 opacity-30 pointer-events-none">
          <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 left-0.5"></div>
        </div>
        <div className="absolute inset-0 quantum-particle-2 opacity-30 pointer-events-none">
          <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5"></div>
        </div>
        <div className="absolute inset-0 quantum-particle-3 opacity-30 pointer-events-none">
          <div className="w-1 h-1 bg-white rounded-full absolute bottom-0.5 left-0.5"></div>
        </div>
        <div className="absolute inset-0 quantum-particle-4 opacity-30 pointer-events-none">
          <div className="w-1 h-1 bg-white rounded-full absolute bottom-0.5 right-0.5"></div>
        </div>
      </>
    );
  };

  const renderHolographicElements = () => {
    if (variant !== "holographic" || !animated) return null;
    
    return (
      <>
        <div className="absolute inset-0 holo-line-1 opacity-20 pointer-events-none">
          <div className="w-full h-0.5 bg-white absolute top-1/4"></div>
        </div>
        <div className="absolute inset-0 holo-line-2 opacity-20 pointer-events-none">
          <div className="w-full h-0.5 bg-white absolute bottom-1/4"></div>
        </div>
      </>
    );
  };

  const renderNeuralElements = () => {
    if (variant !== "neural-new" || !animated) return null;
    
    return (
      <>
        <div className="absolute inset-0 neural-particle-1 opacity-40 pointer-events-none">
          <div className="w-0.5 h-0.5 bg-white rounded-full absolute top-1 left-1"></div>
        </div>
        <div className="absolute inset-0 neural-particle-2 opacity-40 pointer-events-none">
          <div className="w-0.5 h-0.5 bg-white rounded-full absolute top-1 right-1"></div>
        </div>
        <div className="absolute inset-0 neural-particle-3 opacity-40 pointer-events-none">
          <div className="w-0.5 h-0.5 bg-white rounded-full absolute bottom-1 left-1"></div>
        </div>
        <div className="absolute inset-0 neural-particle-4 opacity-40 pointer-events-none">
          <div className="w-0.5 h-0.5 bg-white rounded-full absolute bottom-1 right-1"></div>
        </div>
      </>
    );
  };

  const renderCosmicElements = () => {
    if (variant !== "cosmic" || !animated) return null;
    
    return (
      <>
        <div className="absolute inset-0 cosmic-star-1 opacity-50 pointer-events-none">
          <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 left-1/2 transform -translate-x-1/2"></div>
        </div>
        <div className="absolute inset-0 cosmic-star-2 opacity-50 pointer-events-none">
          <div className="w-1 h-1 bg-white rounded-full absolute bottom-0.5 left-1/2 transform -translate-x-1/2"></div>
        </div>
        <div className="absolute inset-0 cosmic-star-3 opacity-50 pointer-events-none">
          <div className="w-1 h-1 bg-white rounded-full absolute top-1/2 left-0.5 transform -translate-y-1/2"></div>
        </div>
        <div className="absolute inset-0 cosmic-star-4 opacity-50 pointer-events-none">
          <div className="w-1 h-1 bg-white rounded-full absolute top-1/2 right-0.5 transform -translate-y-1/2"></div>
        </div>
      </>
    );
  };

  const renderMatrixElements = () => {
    if (variant !== "matrix" || !animated) return null;
    
    return (
      <>
        <div className="absolute inset-0 matrix-digit-1 opacity-30 pointer-events-none font-mono text-[6px]">
          <span className="absolute top-0 left-0.5 text-green-200">1</span>
        </div>
        <div className="absolute inset-0 matrix-digit-2 opacity-30 pointer-events-none font-mono text-[6px]">
          <span className="absolute top-0 right-0.5 text-green-200">0</span>
        </div>
        <div className="absolute inset-0 matrix-digit-3 opacity-30 pointer-events-none font-mono text-[6px]">
          <span className="absolute bottom-0 left-0.5 text-green-200">1</span>
        </div>
        <div className="absolute inset-0 matrix-digit-4 opacity-30 pointer-events-none font-mono text-[6px]">
          <span className="absolute bottom-0 right-0.5 text-green-200">0</span>
        </div>
      </>
    );
  };

  return (
    <span className={cn(getVariantStyles(), className)}>
      {renderQuantumElements()}
      {renderHolographicElements()}
      {renderNeuralElements()}
      {renderCosmicElements()}
      {renderMatrixElements()}
      
      <span className="relative z-20">{text}</span>
    </span>
  );
};

export default BadgeIcon;
