// components/BadgeAnalyticsCard.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BadgeAnalyticsCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function BadgeAnalyticsCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: BadgeAnalyticsCardProps) {
  const formattedValue = value >= 1000 
    ? `${(value / 1000).toFixed(1)}k` 
    : value.toString();

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="flex items-baseline mt-1">
              <h3 className="text-2xl font-bold">{formattedValue}</h3>
              {trend && (
                <span className={cn(
                  "ml-2 text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.isPositive ? "+" : "-"}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            )}
          </div>
          {icon && (
            <div className="p-2 bg-gray-50 rounded-full">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
