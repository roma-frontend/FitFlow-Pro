"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case "admin":
      return "Администратор";
    case "super-admin":
      return "Супер Администратор";
    case "manager":
      return "Менеджер";
    case "trainer":
      return "Тренер";
    case "member":
      return "Участник";
    default:
      return "Персонал";
  }
};

export function useWelcomeToast() {
  const { toast } = useToast();
  const shownRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (shownRef.current) return;
      const shouldShowWelcome = sessionStorage.getItem('show_welcome_toast');
      const userRole = sessionStorage.getItem('welcome_user_role');

      if (shouldShowWelcome === 'true' && userRole) {
        sessionStorage.removeItem('show_welcome_toast');
        sessionStorage.removeItem('welcome_user_role');
        shownRef.current = true; // ставим флаг

        toast({
          title: "Добро пожаловать!",
          description: `Вы вошли как ${getRoleDisplayName(userRole)}`,
          duration: 2000,
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [toast]);
}