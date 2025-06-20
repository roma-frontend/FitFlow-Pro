// hooks/useScheduleDataWithFallback.ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Хук для получения тренеров с fallback
export function useTrainersWithFallback() {
  const data = useQuery(api.users.getTrainers);
  return data;
}

// Хук для получения событий с fallback
export function useEventsWithFallback() {
  const data = useQuery(api.events.getAll);
  return data;
}

// Хук для получения клиентов с fallback
export function useClientsWithFallback() {
  const data = useQuery(api.users.getClients);
  return data;
}

// Хук для проверки доступности API
export function useScheduleApiAvailability() {
  const trainersData = useTrainersWithFallback();
  
  return {
    isAvailable: trainersData !== undefined,
    hasTrainers: Array.isArray(trainersData) && trainersData.length > 0,
  };
}
