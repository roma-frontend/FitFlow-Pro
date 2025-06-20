// hooks/useGroupClasses.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { GroupClass } from "@/components/group-classes/types";
import { isSameDay } from "date-fns";

export const useGroupClasses = () => {
  const [classes, setClasses] = useState<GroupClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch("/api/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Ошибка загрузки занятий:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить расписание занятий",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const enrollInClass = useCallback(async (classId: string) => {
    setEnrolling(classId);

    try {
      const response = await fetch("/api/classes/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId }),
      });

      if (response.ok) {
        const data = await response.json();

        setClasses((prevClasses) =>
          prevClasses.map((cls) =>
            cls._id === classId
              ? { ...cls, enrolled: data.enrolled, waitlist: data.waitlist }
              : cls
          )
        );

        toast({
          title: data.waitlisted
            ? "Добавлены в лист ожидания"
            : "Запись успешна!",
          description: data.waitlisted
            ? "Вы добавлены в лист ожидания. Мы уведомим вас, если освободится место."
            : "Вы успешно записались на занятие",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка записи");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось записаться на занятие",
      });
    } finally {
      setEnrolling(null);
    }
  }, [toast]);

  const cancelEnrollment = useCallback(async (classId: string) => {
    try {
      const response = await fetch("/api/classes/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId }),
      });

      if (response.ok) {
        const data = await response.json();

        setClasses((prevClasses) =>
          prevClasses.map((cls) =>
            cls._id === classId
              ? { ...cls, enrolled: data.enrolled, waitlist: data.waitlist }
              : cls
          )
        );

        toast({
          title: "Запись отменена",
          description: "Вы успешно отменили запись на занятие",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отменить запись",
      });
    }
  }, [toast]);

  const getFilteredClasses = useCallback((selectedDate: Date) => {
    const filtered = classes.filter(
      (cls) =>
        isSameDay(new Date(cls.startTime), selectedDate) &&
        cls.status === "scheduled"
    );

    return filtered.sort((a, b) => a.startTime - b.startTime);
  }, [classes]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    classes,
    loading,
    enrolling,
    enrollInClass,
    cancelEnrollment,
    getFilteredClasses,
    refetch: fetchClasses,
  };
};
