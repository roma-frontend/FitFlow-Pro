// components/admin/settings/components/SettingsPageSkeleton.tsx
"use client";

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SettingsPageSkeletonProps {
  isMobile?: boolean;
  useProgressiveLoading?: boolean;
  loadingSteps?: string[];
  currentStep?: number;
}

export const SettingsPageSkeleton = ({
  isMobile = false,
  useProgressiveLoading = false,
  loadingSteps = [],
  currentStep = 0
}: SettingsPageSkeletonProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200/80 backdrop-blur-sm">
        <div className={cn(
          "flex items-center justify-between",
          isMobile ? "px-4 py-3" : "px-6 py-4 lg:px-8"
        )}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className={cn(
                "w-48",
                isMobile ? "h-5" : "h-6"
              )} />
              {!isMobile && <Skeleton className="h-4 w-64" />}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className={cn(
        "max-w-7xl mx-auto",
        isMobile ? "px-4 py-4" : "px-6 py-6 lg:px-8"
      )}>
        
        {/* Progress Loading для мобильных */}
        {useProgressiveLoading && loadingSteps.length > 0 && (
          <Card className="mb-6">
            <CardContent className={cn(
              "space-y-4",
              isMobile ? "p-4" : "p-6"
            )}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-48" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Skeleton */}
        <Card className="mb-6">
          <CardContent className={cn(
            "space-y-4",
            isMobile ? "p-4" : "p-6"
          )}>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className={cn(
              "grid gap-3",
              isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"
            )}>
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className={cn(
                  "rounded-lg",
                  isMobile ? "h-16" : "h-20"
                )} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          {isMobile ? (
            // Mobile tab header
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <div>
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ) : (
            // Desktop tabs
            <div className={cn(
              "grid gap-2 p-1 bg-gray-50/80 rounded-lg",
              "grid-cols-4 lg:grid-cols-8"
            )}>
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
          )}

          {/* Tab Content */}
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
          )}>
            {Array.from({ length: isMobile ? 3 : 6 }, (_, i) => (
              <Card key={i}>
                <CardHeader className={cn(
                  isMobile ? "p-4 pb-3" : "p-6 pb-4"
                )}>
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className={cn(
                  "space-y-4",
                  isMobile ? "p-4 pt-0" : "p-6 pt-0"
                )}>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className={cn(
                      "w-full",
                      isMobile ? "h-10" : "h-11"
                    )} />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className={cn(
                      "w-full",
                      isMobile ? "h-10" : "h-11"
                    )} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile floating button skeleton */}
      {isMobile && (
        <div className="fixed bottom-4 left-4 right-4">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      )}
    </div>
  );
};
