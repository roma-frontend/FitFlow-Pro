// components/member/header/hooks/usePerformanceOptimization.tsx
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Определяем интерфейс Stats
interface Stats {
  upcoming: number;
  completed: number;
  totalHours: number;
  daysLeft: number;
}

// Интерфейс для возвращаемых вычисленных статистик
interface ComputedStats {
  workoutProgress: number;
  subscriptionProgress: number;
  totalProgress: number;
}

// Интерфейс для обработчиков
interface Handlers {
  handleNavigation: (href: string) => void;
  handleLogout: () => void;
}

// Интерфейс для возвращаемого значения хука
interface UsePerformanceOptimizationReturn {
  computedStats: ComputedStats;
  handlers: Handlers;
}

export const usePerformanceOptimization = (
  stats: Stats,
  onLogout?: () => void
): UsePerformanceOptimizationReturn => {
  const router = useRouter();

  // Мемоизация вычислений статистики
  const computedStats = useMemo<ComputedStats>(() => ({
    workoutProgress: Math.min((stats.completed / 20) * 100, 100),
    subscriptionProgress: Math.min((stats.daysLeft / 30) * 100, 100),
    totalProgress: Math.round((stats.completed + stats.totalHours) / 2)
  }), [stats.completed, stats.daysLeft, stats.totalHours]);

  // Мемоизация обработчика навигации
  const handleNavigation = useCallback((href: string) => {
    try {
      router.push(href);
    } catch (error) {
      console.error('Ошибка навигации:', error);
    }
  }, [router]);

  // Мемоизация обработчика выхода
  const handleLogout = useCallback(async () => {
    try {
      if (onLogout) {
        onLogout();
      } else {
        // Дефолтная логика выхода
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        router.push("/");
      }
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  }, [onLogout, router]);

  // Мемоизация объекта обработчиков
  const handlers = useMemo<Handlers>(() => ({
    handleNavigation,
    handleLogout
  }), [handleNavigation, handleLogout]);

  return { computedStats, handlers };
};
