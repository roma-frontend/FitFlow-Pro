// hooks/useTrainerActions.ts
"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useTrainerActions() {
  const router = useRouter();

  const navigateToAdd = useCallback(() => {
    router.push("/manager/trainers/add");
  }, [router]);

  const navigateToImport = useCallback(() => {
    router.push("/manager/trainers/import");
  }, [router]);

  const navigateToView = useCallback((trainerId: string) => {
    router.push(`/manager/trainers/${trainerId}`);
  }, [router]);

  const navigateToEdit = useCallback((trainerId: string) => {
    router.push(`/manager/trainers/${trainerId}/edit`);
  }, [router]);

  const navigateToSchedule = useCallback((trainerId: string) => {
    router.push(`/manager/trainers/${trainerId}/schedule`);
  }, [router]);

  return {
    navigateToAdd,
    navigateToImport,
    navigateToView,
    navigateToEdit,
    navigateToSchedule,
  };
}
