"use client";

import { cn } from "@/lib/utils";
import { useClientOnly } from "@/hooks/useClientOnly";

interface HeaderAuthLoaderProps {
  className?: string;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
  canInstall?: boolean;
}

export default function HeaderAuthLoader({ 
  className,
  showMobileMenu = false,
  onMobileMenuToggle,
  canInstall = false
}: HeaderAuthLoaderProps) {
  const mounted = useClientOnly();

  return (
    <div className={cn("min-w-[109.1px] md:min-w-[132px] lg:min-w-[203.84px] flex items-center gap-2 sm:gap-3 lg:gap-4", className)}>
      {/* PWA Install Button Skeleton - только на больших экранах */}
      {canInstall && (
        <div className="hidden lg:block">
          <div className="h-8 w-20 xl:w-28 bg-white/10 rounded-lg animate-pulse backdrop-blur-sm" />
        </div>
      )}

      {/* Auth Section Skeleton */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Desktop Auth Skeleton */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {/* Login Button Skeleton */}
          <div className="h-8 sm:w-[78px] bg-white/10 rounded-lg animate-pulse backdrop-blur-sm" />
          
          {/* Register Button Skeleton */}
          <div className="h-8 w-[114px] bg-white/20 rounded-lg animate-pulse backdrop-blur-sm" />
        </div>

        {/* Mobile Auth Skeleton */}
        <div className="min-w-[65.1px] md:hidden">
          <div className="h-8 md:w-[78px] bg-white/10 rounded-lg animate-pulse backdrop-blur-sm" />
        </div>
      </div>

      {/* Mobile Menu Button - всегда видимый */}
      <button
        className="w-[36px] sm:w-[40px] md:hidden text-white hover:bg-white/10 p-2 animate-pulse backdrop-blur-3xl hover:text-white rounded-lg transition-colors flex items-center justify-center"
        onClick={onMobileMenuToggle}
        aria-label="Меню"
      >
        {showMobileMenu ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
      </button>
    </div>
  );
}

// Иконки для мобильного меню
function Menu({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}