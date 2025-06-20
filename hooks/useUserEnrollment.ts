// hooks/useUserEnrollment.ts
"use client";

import { useMemo } from "react";
import { GroupClass } from "@/components/group-classes/types";

// Этот хук будет содержать логику проверки записи пользователя
export const useUserEnrollment = (userId?: string) => {
  const isUserEnrolled = useMemo(() => {
    return (classItem: GroupClass) => {
      if (!userId) return false;
      return classItem.enrolled.includes(userId);
    };
  }, [userId]);

  const isUserOnWaitlist = useMemo(() => {
    return (classItem: GroupClass) => {
      if (!userId || !classItem.waitlist) return false;
      return classItem.waitlist.includes(userId);
    };
  }, [userId]);

  return {
    isUserEnrolled,
    isUserOnWaitlist,
  };
};
