"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroSparklesButtonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gradient' | 'neon' | 'minimal' | '3d';
  className?: string;
  onClick?: () => void;
}

export default function HeroSparklesButton({ 
  size = 'lg', 
  variant = 'gradient',
  className = '',
  onClick
}: HeroSparklesButtonProps) {
  const sizes = {
    sm: { container: 'w-12 h-12', icon: 'w-5 h-5' },
    md: { container: 'w-14 h-14', icon: 'w-6 h-6' },
    lg: { container: 'w-16 h-16', icon: 'w-8 h-8' },
    xl: { container: 'w-20 h-20', icon: 'w-10 h-10' }
  };

  const currentSize = sizes[size];

  const variants = {
    gradient: `
      group relative overflow-hidden 
      bg-gradient-to-r from-blue-500 to-indigo-500
      rounded-2xl shadow-2xl transform transition-all duration-300 
      hover:scale-110 hover:shadow-3xl active:scale-95 hover:rotate-3
    `,
    neon: `
      group relative bg-black rounded-lg shadow-2xl transform 
      transition-all duration-300 hover:scale-110 
      border-2 border-cyan-400 hover:border-pink-400
    `,
    minimal: `
      group bg-white rounded-2xl shadow-lg hover:shadow-2xl 
      transform transition-all duration-300 hover:scale-115 hover:-translate-y-1 
      border border-gray-200 hover:border-blue-300
    `,
    '3d': `
      group relative bg-gradient-to-b from-orange-400 to-orange-600 
      rounded-xl shadow-lg transform transition-all duration-200 
      hover:scale-110 active:scale-95
    `
  };

  const iconColors = {
    gradient: 'text-white group-hover:text-yellow-200',
    neon: 'text-cyan-400 group-hover:text-pink-400',
    rainbow: 'text-white',
    minimal: 'text-gray-600 group-hover:text-blue-500',
    '3d': 'text-white'
  };

  const renderEffects = () => {
    switch (variant) {
      case 'gradient':
        return (
          <>
            {/* Фоновая анимация */}
            <div className="absolute inset-0 hover:from-blue-600 hover:to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            
            {/* Блики */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
            
            {/* Искры по углам */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-200"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-400"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-600"></div>
          </>
        );
      
      case 'neon':
        return (
          <>
            {/* Неоновое свечение */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-400 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 rounded-lg opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300"></div>
          </>
        );
      
      default:
        return null;
    }
  };

  const get3DStyle = () => {
    if (variant === '3d') {
      return {
        boxShadow: '0 8px 0 #ea580c, 0 12px 20px rgba(234, 88, 12, 0.3)'
      };
    }
    return {};
  };

  const handle3DClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === '3d') {
      const target = e.currentTarget;
      target.style.transform = 'translateY(4px) scale(0.98)';
      target.style.boxShadow = '0 4px 0 #ea580c, 0 8px 15px rgba(234, 88, 12, 0.3)';
      
      setTimeout(() => {
        target.style.transform = '';
        target.style.boxShadow = '0 8px 0 #ea580c, 0 12px 20px rgba(234, 88, 12, 0.3)';
      }, 150);
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`${variants[variant]} ${currentSize.container} ${className}`}
      style={get3DStyle()}
      onClick={handle3DClick}
    >
      {renderEffects()}
      
      {/* Иконка */}
      <div className="relative flex items-center justify-center h-full">
        <Sparkles 
          className={`${currentSize.icon} ${iconColors[variant]} group-hover:animate-spin transition-colors duration-300`} 
        />
      </div>
    </button>
  );
}