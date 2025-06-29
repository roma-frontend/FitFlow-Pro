// hooks/useScheduleMutations.ts
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback } from "react";
import { ScheduleEvent, CreateEventData } from "@/components/admin/schedule/types";

export function useScheduleMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Мутации с правильной типизацией
  const createEventMutation = useMutation(api.events.create);
  const updateEventMutation = useMutation(api.events.update);
  const deleteEventMutation = useMutation(api.events.delete_);
  const updateEventStatusMutation = useMutation(api.events.updateStatus);

  const createEvent = useCallback(async (data: CreateEventData, trainers: any[], clients: any[]): Promise<{ success: boolean; id?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const trainer = trainers.find((t: any) => t.id === data.trainerId);
      const client = data.clientId ? clients.find((c: any) => c.id === data.clientId) : null;

      const result = await createEventMutation({
        title: data.title,
        type: data.type,
        trainerId: data.trainerId,
        trainerName: trainer?.name || "Неизвестный тренер",
        clientId: data.clientId || undefined,
        clientName: client?.name || undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location || undefined,
        description: data.description || undefined,
        status: data.status,
        createdBy: "admin",
        price: data.price,
      });
      
      return { success: true, id: result };
    } catch (error) {
      console.error("Ошибка создания события:", error);
      setError("Не удалось создать событие");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [createEventMutation]);

  const updateEvent = useCallback(async (id: string, data: Partial<ScheduleEvent>, trainers: any[], clients: any[]): Promise<{ success: boolean }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const trainer = data.trainerId ? trainers.find((t: any) => t.id === data.trainerId) : null;
      const client = data.clientId ? clients.find((c: any) => c.id === data.clientId) : null;

      await updateEventMutation({
        id: id as any,
        title: data.title,
        type: data.type,
        trainerId: data.trainerId,
        trainerName: trainer?.name,
        clientId: data.clientId,
        clientName: client?.name,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        description: data.description,
        status: data.status,
        price: data.price,
      });
      
      return { success: true };
    } catch (error) {
      console.error("Ошибка обновления события:", error);
      setError("Не удалось обновить событие");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [updateEventMutation]);

  const deleteEvent = useCallback(async (id: string): Promise<{ success: boolean }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteEventMutation({ id: id as any });
      return { success: true };
    } catch (error) {
      console.error("Ошибка удаления события:", error);
      setError("Не удалось удалить событие");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [deleteEventMutation]);

  const updateEventStatus = useCallback(async (id: string, status: ScheduleEvent["status"]): Promise<{ success: boolean }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updateEventStatusMutation({ 
        id: id as any, 
        status 
      });
      
      return { success: true };
    } catch (error) {
      console.error("Ошибка обновления статуса:", error);
      setError("Не удалось обновить статус");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [updateEventStatusMutation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    isLoading,
    error,
    clearError,
  };
}
