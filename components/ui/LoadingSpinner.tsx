"use client";

import { cn } from "@/lib/utils";
import { useClientOnly } from "@/hooks/useClientOnly";

type SpinnerSize = "sm" | "md" | "lg" | "xl";
type SpinnerVariant = "default" | "fitness" | "minimal";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  text?: string;
  variant?: SpinnerVariant;
  className?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  text, 
  variant = "default",
  className 
}: LoadingSpinnerProps) {
  const mounted = useClientOnly();

  const sizeClasses: Record<SpinnerSize, string> = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  if (variant === "fitness") {
    // Импортируем динамически для избежания циклических зависимостей
    const FitnessLoader = require('./FitnessLoader').default;
    return <FitnessLoader size={size} text={text} className={className} />;
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size]
        )} />
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn(
        "animate-spin rounded-full border-4 border-gray-200 border-t-blue-600",
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
}
