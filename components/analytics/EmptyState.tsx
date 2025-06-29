"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title = "Нет данных", 
  description = "Данные для отображения отсутствуют",
  icon 
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          {icon || <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />}
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
