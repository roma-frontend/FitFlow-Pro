// hooks/useScheduleEventHandlers.ts
import { useCallback } from "react";
import { ScheduleEvent, CreateEventData } from "@/components/admin/schedule/types";

interface UseScheduleEventHandlersProps {
  createEvent: (data: CreateEventData) => Promise<any>;
  updateEvent: (id: string, data: Partial<ScheduleEvent>) => Promise<any>;
  deleteEvent: (id: string) => Promise<any>;
  updateEventStatus: (id: string, status: ScheduleEvent["status"]) => Promise<any>;
  editingEvent: ScheduleEvent | null;
  onCloseEventForm: () => void;
  onOpenEventDetails: (event: ScheduleEvent) => void;
  onOpenQuickMessage: (recipients: any[], relatedTo: any) => void;
}

export function useScheduleEventHandlers({
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  editingEvent,
  onCloseEventForm,
  onOpenEventDetails,
  onOpenQuickMessage,
}: UseScheduleEventHandlersProps) {
  
  const handleCreateEvent = useCallback(async (data: CreateEventData): Promise<{ success: boolean; id?: string }> => {
    try {
      const result = await createEvent(data);
      
      // Обрабатываем разные типы возвращаемых значений
      if (result === undefined || result === null) {
        onCloseEventForm();
        return { success: true };
      }
      
      if (typeof result === 'object' && 'success' in result) {
        if (result.success) {
          onCloseEventForm();
          return { success: true, id: result.id };
        } else {
          return { success: false };
        }
      }
      
      // Fallback - считаем успехом
      onCloseEventForm();
      return { success: true };
      
    } catch (error) {
      console.error("Ошибка создания события:", error);
      return { success: false };
    }
  }, [createEvent, onCloseEventForm]);

  const handleUpdateEvent = useCallback(async (data: CreateEventData): Promise<{ success: boolean; id?: string }> => {
    if (!editingEvent) {
      return { success: false };
    }

    try {
      const result = await updateEvent(editingEvent._id, data);
      
      // Обрабатываем разные типы возвращаемых значений
      if (result === undefined || result === null) {
        onCloseEventForm();
        return { success: true, id: editingEvent._id };
      }
      
      if (typeof result === 'object' && 'success' in result) {
        if (result.success) {
          onCloseEventForm();
          return { success: true, id: editingEvent._id };
        } else {
          return { success: false };
        }
      }
      
      // Fallback - считаем успехом
      onCloseEventForm();
      return { success: true, id: editingEvent._id };
      
    } catch (error) {
      console.error("Ошибка обновления события:", error);
      return { success: false };
    }
  }, [updateEvent, editingEvent, onCloseEventForm]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    if (!confirm("Вы уверены, что хотите удалить это событие?")) return;

    try {
      const result = await deleteEvent(eventId);
      
      // Обрабатываем разные типы возвращаемых значений
      if (result === undefined || result === null) {
        return;
      }
      
      if (typeof result === 'object' && 'success' in result && !result.success) {
        throw new Error("Не удалось удалить событие");
      }
      
    } catch (error) {
      console.error("Ошибка удаления события:", error);
      alert(`Ошибка удаления события: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
    }
  }, [deleteEvent]);

  const handleStatusChange = useCallback(async (eventId: string, status: ScheduleEvent["status"]) => {
    try {
      const result = await updateEventStatus(eventId, status);
      
      // Обрабатываем разные типы возвращаемых значений
      if (result === undefined || result === null) {
        return;
      }
      
      if (typeof result === 'object' && 'success' in result && !result.success) {
        throw new Error("Не удалось обновить статус");
      }
      
    } catch (error) {
      console.error("Ошибка обновления статуса:", error);
      alert(`Ошибка обновления статуса: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
    }
  }, [updateEventStatus]);

  const handleSendQuickMessage = useCallback((event: ScheduleEvent) => {
    const recipients = [];

    if (event.clientId && event.clientName) {
      recipients.push({
        id: event.clientId,
        name: event.clientName,
        role: "member",
        phone: "+7 (999) 123-45-67",
        email: "client@example.com",
      });
    }

    recipients.push({
      id: event.trainerId,
      name: event.trainerName,
      role: "trainer",
      phone: "+7 (999) 987-65-43",
      email: "trainer@fitaccess.ru",
    });

    onOpenQuickMessage(recipients, {
      type: "event",
      id: event._id,
      title: event.title,
    });
  }, [onOpenQuickMessage]);

  return {
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleStatusChange,
    handleSendQuickMessage,
  };
}
