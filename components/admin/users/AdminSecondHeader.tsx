// components/admin/AdminSecondHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSecondHeaderProps {
  title: string | ReactNode;
  description?: string;
  icon: LucideIcon;
  actions?: ReactNode;
  backUrl?: string;
  onBack?: () => void;
  className?: string;
}

export function AdminSecondHeader({
  title,
  description,
  icon: Icon,
  actions,
  backUrl = "/admin",
  onBack,
  className
}: AdminSecondHeaderProps) {
  const router = useRouter();
  const [showMobileActions, setShowMobileActions] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push(backUrl);
    }
  };

  return (
    <header className={cn("bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40 mb-8", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop & Tablet Layout */}
        <div className="hidden sm:flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">Назад</span>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                  {title}
                </h1>
                {description && (
                  <p className="text-xs md:text-sm text-gray-600 truncate">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          {/* Main mobile header */}
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-1 hover:bg-blue-50 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex-shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-bold text-gray-900 truncate">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-xs text-gray-600 truncate">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {actions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileActions(!showMobileActions)}
                className="flex-shrink-0 ml-2"
              >
                {showMobileActions ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {/* Mobile actions dropdown */}
          {actions && showMobileActions && (
            <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm">
              <div className="px-4 py-3 space-y-2">
                <div className="flex flex-col space-y-2">
                  {actions}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Дополнительный компонент для мобильных действий
export function MobileActionGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2", className)}>
      {children}
    </div>
  );
}

// Компонент для адаптивных кнопок
export function ResponsiveButton({ 
  children, 
  className, 
  hideTextOnMobile = false,
  ...props 
}: any) {
  return (
    <Button 
      className={cn(
        "flex items-center gap- 2 w-full sm:w-auto",
        hideTextOnMobile && "sm:inline-flex",
        className
      )}
      {...props}
    >
      <span className={hideTextOnMobile ? "inline-flex items-center gap-2 sm:ml-2" : ""}>
        {children}
      </span>
    </Button>
  );
}
