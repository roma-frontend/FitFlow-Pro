// hooks/useSystemStats.ts (новый хук для системной статистики)
"use client";

import { useMemo } from "react";
import { useTrainerDataQuery } from "./useTrainerDataQuery";
import { SystemStats } from "@/types/trainer";

export function useSystemStats(): SystemStats & { isLoading: boolean } {
  const { stats, isLoading } = useTrainerDataQuery();
  
  return useMemo(() => {
    if (isLoading || !stats) {
      return {
        activeClients: 0,
        totalClients: 0,
        activeMembers: 0,
        totalMembers: 0,
        completedWorkouts: 0,
        avgRating: 0,
        totalTrainers: 0,
        totalUsers: 0,
        isLoading: true
      };
    }

    return {
      ...stats,
      isLoading: false
    };
  }, [stats, isLoading]);
}
