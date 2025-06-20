// components/book-trainer/steps/TrainerSelection.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { TrainerCard } from "../cards/TrainerCard";
import { TrainerFilters } from "../filters/TrainerFilters";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { useTrainers } from "../hooks/useTrainers";
import { useTrainerFilters } from "../hooks/useTrainerFilters";
import { useBookingStore } from "../hooks/useBookingStore";
import { Trainer } from "../types";

export function TrainerSelection() {
  const { trainers, loading, error } = useTrainers();
  const { filteredTrainers, ...filterProps } = useTrainerFilters(trainers);
  const { setSelectedTrainer, setBookingStep } = useBookingStore();

  const handleTrainerSelect = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setBookingStep("schedule");
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Ошибка загрузки тренеров</div>;

  return (
    <div className="space-y-6">
      <TrainerFilters {...filterProps} />
      
      {filteredTrainers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((trainer) => (
            <TrainerCard
              key={trainer._id}
              trainer={trainer}
              onSelect={() => handleTrainerSelect(trainer)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Тренеры не найдены"
          description="Попробуйте изменить параметры поиска"
          onReset={filterProps.resetFilters}
        />
      )}
    </div>
  );
}
