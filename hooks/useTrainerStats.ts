// hooks/useTrainerStats.ts (исправленная версия)
"use client";

import { useMemo } from "react";
import { Trainer, TrainerPageStats } from "@/types/trainer";
import { safeNumber, normalizeTrainer } from "@/utils/trainerHelpers";

export function useTrainerStats(rawTrainers: any[]): TrainerPageStats {
  return useMemo(() => {
    // Нормализуем данные тренеров
    const trainers = rawTrainers.map(normalizeTrainer);
    
    const totalTrainers = trainers.length;
    const activeTrainers = trainers.filter((t: Trainer) => t.status === "active").length;
    const busyTrainers = trainers.filter((t: Trainer) => t.status === "busy").length;
    
    // Безопасное вычисление среднего рейтинга
    const ratingsSum = trainers.reduce((sum: number, t: Trainer) => {
      return sum + safeNumber(t.rating, 0);
    }, 0);
    
    const averageRating = trainers.length > 0 ? ratingsSum / trainers.length : 0;

    return {
      totalTrainers,
      activeTrainers,
      busyTrainers,
      averageRating,
    };
  }, [rawTrainers]);
}
