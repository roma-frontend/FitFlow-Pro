// components/manager/trainers/EmptyState.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
  onAddTrainer: () => void;
}

export default function EmptyState({ hasFilters, onAddTrainer }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Тренеры не найдены
        </h3>
        <p className="text-gray-600 mb-6">
          {hasFilters
            ? "Попробуйте изменить критерии поиска или фильтры"
            : "Добавьте первого тренера в систему"}
        </p>
        {!hasFilters && (
          <Button
            onClick={onAddTrainer}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить тренера
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
