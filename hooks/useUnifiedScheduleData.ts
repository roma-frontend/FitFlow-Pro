// hooks/useUnifiedScheduleData.ts
import { useMemo } from "react";
import { useSchedule } from "@/contexts/ScheduleContext";
import { 
  useScheduleWithFallback, 
  useTrainersWithFallback, 
  useClientsWithFallback,
  useScheduleStatsWithFallback,
  useScheduleMutations,
  useScheduleApiAvailability 
} from "@/hooks/useSchedule";

export function useUnifiedScheduleData() {
  const { isAvailable: isApiAvailable } = useScheduleApiAvailability();
  
  // Используем Context если доступен, иначе fallback хуки
  const contextData = useSchedule();
  const fallbackEvents = useScheduleWithFallback();
  const fallbackTrainers = useTrainersWithFallback();
  const fallbackClients = useClientsWithFallback();
  const fallbackStats = useScheduleStatsWithFallback("month");
  const mutations = useScheduleMutations();

  const data = useMemo(() => {
    // Если Context работает, используем его
    if (contextData && !contextData.loading && contextData.events.length > 0) {
      return {
        events: contextData.events,
        trainers: contextData.trainers,
        clients: fallbackClients, // Клиенты всегда из API
        stats: fallbackStats,
        isFromContext: true,
        isApiAvailable,
        ...mutations,
        // Context методы
        createEvent: contextData.createEvent,
        updateEvent: contextData.updateEvent,
        deleteEvent: contextData.deleteEvent,
        updateEventStatus: contextData.updateEventStatus,
      };
    }
    
    // Иначе используем fallback хуки
    return {
      events: fallbackEvents,
      trainers: fallbackTrainers.map(trainer => ({
        trainerId: trainer.id,
        trainerName: trainer.name,
        trainerRole: trainer.role,
        events: fallbackEvents.filter(e => e.trainerId === trainer.id),
        workingHours: {
          start: "09:00",
          end: "18:00",
          days: [1, 2, 3, 4, 5],
        },
      })),
      clients: fallbackClients,
      stats: fallbackStats,
      isFromContext: false,
      isApiAvailable,
      ...mutations,
    };
  }, [
    contextData, 
    fallbackEvents, 
    fallbackTrainers, 
    fallbackClients, 
    fallbackStats, 
    mutations, 
    isApiAvailable
  ]);

  return data;
}
