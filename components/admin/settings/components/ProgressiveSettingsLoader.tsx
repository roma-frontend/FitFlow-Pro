// components/admin/settings/components/ProgressiveSettingsLoader.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProgressiveSettingsLoaderProps {
  isLoading: boolean;
  loadingSteps: string[];
  currentStep: number;
  isMobile: boolean;
  children: React.ReactNode;
}

export const ProgressiveSettingsLoader = ({
  isLoading,
  loadingSteps,
  currentStep,
  isMobile,
  children
}: ProgressiveSettingsLoaderProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading && loadingSteps.length > 0) {
      const progressValue = ((currentStep + 1) / loadingSteps.length) * 100;
      setProgress(progressValue);
    }
  }, [currentStep, loadingSteps.length, isLoading]);

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn(
      "space-y-4",
      isMobile ? "p-4" : "p-6"
    )}>
      {/* Прогресс загрузки */}
      <Card>
        <CardContent className={cn(
          "space-y-4",
          isMobile ? "p-4" : "p-6"
        )}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "font-medium text-gray-900",
                isMobile ? "text-sm" : "text-base"
              )}>
                Загрузка настроек...
              </h3>
              <span className={cn(
                "text-gray-500",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {Math.round(progress)}%
              </span>
            </div>
            
            <Progress 
              value={progress} 
              className={cn(
                "transition-all duration-300",
                isMobile ? "h-2" : "h-3"
              )}
            />
            
            {loadingSteps[currentStep] && (
              <p className={cn(
                "text-gray-600",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {loadingSteps[currentStep]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Скелетоны настроек */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
      )}>
        {Array.from({ length: isMobile ? 3 : 6 }, (_, i) => (
          <Card key={i}>
            <CardContent className={cn(
              "space-y-3",
              isMobile ? "p-4" : "p-6"
            )}>
              <Skeleton className={cn(
                "w-3/4",
                isMobile ? "h-4" : "h-5"
              )} />
              <Skeleton className={cn(
                "w-full",
                isMobile ? "h-8" : "h-10"
              )} />
              <Skeleton className={cn(
                "w-1/2",
                isMobile ? "h-3" : "h-4"
              )} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
