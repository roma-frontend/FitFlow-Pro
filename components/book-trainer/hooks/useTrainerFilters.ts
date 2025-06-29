// components/book-trainer/hooks/useTrainerFilters.ts
import { useState, useMemo } from "react";
import { Trainer } from "../types";

export function useTrainerFilters(trainers: Trainer[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  const filteredTrainers = useMemo(() => {
    let filtered = trainers;

    // Поиск по имени
    if (searchQuery) {
      filtered = filtered.filter(
        (trainer) =>
          trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trainer.specializations.some((spec) =>
            spec.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Фильтр по специализации
    if (specializationFilter !== "all") {
      filtered = filtered.filter((trainer) =>
        trainer.specializations.includes(specializationFilter)
      );
    }

    // Фильтр по цене
    if (priceFilter !== "all") {
      switch (priceFilter) {
        case "budget":
          filtered = filtered.filter((trainer) => trainer.hourlyRate <= 2000);
          break;
        case "medium":
          filtered = filtered.filter(
            (trainer) => trainer.hourlyRate > 2000 && trainer.hourlyRate <= 3500
          );
          break;
        case "premium":
          filtered = filtered.filter((trainer) => trainer.hourlyRate > 3500);
          break;
      }
    }

    // Сортировка по рейтингу
    return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [trainers, searchQuery, specializationFilter, priceFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setSpecializationFilter("all");
    setPriceFilter("all");
  };

  return {
    filteredTrainers,
    searchQuery,
    setSearchQuery,
    specializationFilter,
    setSpecializationFilter,
    priceFilter,
    setPriceFilter,
    resetFilters,
  };
}
