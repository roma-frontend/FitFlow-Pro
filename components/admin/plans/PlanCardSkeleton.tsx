// components/PlanCardSkeleton.tsx
import React, { memo } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export const PlanCardSkeleton = memo(() => {
  return (
    <div className="h-full flex flex-col min-h-[320px]">
      <Card className="relative z-0 flex-1 flex flex-col border-0 shadow-lg">
        <CardHeader className="pb-3 pt-10">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full mt-2"></div>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="mb-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>

          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse mt-0.5"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PlanCardSkeleton.displayName = 'PlanCardSkeleton';