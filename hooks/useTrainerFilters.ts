// hooks/useTrainerFilters.ts (исправленная версия)
"use client";

import { useState, useMemo } from "react";
import { Trainer } from "@/types/trainer";
import { safeString, normalizeTrainer } from "@/utils/trainerHelpers";

export function useTrainerFilters(rawTrainers: any[]) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");

  // Нормализуем данные тренеров
  const trainers = useMemo(() => {
    return rawTrainers.map(normalizeTrainer);
  }, [rawTrainers]);

  // Получение уникальных специализаций
  const allSpecializations = useMemo(
    () => Array.from(new Set(trainers.flatMap((trainer: Trainer) => trainer.specialization || []))),
    [trainers]
  );

  // Фильтрация тренеров
  const filteredTrainers = useMemo(() => {
    return trainers.filter((trainer: Trainer) => {
      const trainerName = safeString(trainer.name, "").toLowerCase();
      const trainerEmail = safeString(trainer.email, "").toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch =
        trainerName.includes(searchLower) ||
        trainerEmail.includes(searchLower);
        
      const trainerStatus = safeString(trainer.status, "inactive");
      const matchesStatus = statusFilter === "all" || trainerStatus === statusFilter;
      
      const trainerSpecs = trainer.specialization || [];
      const matchesSpecialization =
        specializationFilter === "all" ||
        trainerSpecs.some((spec: string) =>
          spec.includes(specializationFilter)
        );

      return matchesSearch && matchesStatus && matchesSpecialization;
    });
  }, [trainers, searchTerm, statusFilter, specializationFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSpecializationFilter("all");
  };

  // Исправляем типизацию hasActiveFilters - явно возвращаем boolean
  const hasActiveFilters: boolean = Boolean(
    searchTerm.trim() || 
    statusFilter !== "all" || 
    specializationFilter !== "all"
  );

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    specializationFilter,
    setSpecializationFilter,
    allSpecializations,
    filteredTrainers,
    resetFilters,
    hasActiveFilters,
  };
}
