// components/NavItemWithBadge.tsx (упрощенная версия)
"use client";
import React from 'react';
import Link from 'next/link';
import { NavigationBadge } from './NavigationBadge';

interface NavItemWithBadgeProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function NavItemWithBadge({
  href,
  children,
  className = "",
  activeClassName = "",
  isActive = false,
  onClick,
}: NavItemWithBadgeProps) {
  const linkClassName = `${className} ${isActive ? activeClassName : ''}`.trim();

  return (
    <Link 
      href={href} 
      className={`relative ${linkClassName}`}
      onClick={onClick}
    >
      {children}
      <NavigationBadge
        href={href}
        className="absolute -top-1 -right-1 z-10"
        onBadgeClick={() => {
          // Дополнительная логика при клике на badge
          console.log(`Badge clicked for ${href}`);
        }}
      />
    </Link>
  );
}
