// hooks/useSchedulePageState.ts
import { useState, useCallback } from "react";
import { ScheduleEvent } from "@/components/admin/schedule/types";

export function useSchedulePageState() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [formInitialDate, setFormInitialDate] = useState<Date | undefined>();
  const [formInitialHour, setFormInitialHour] = useState<number | undefined>();
  const [messageRecipients, setMessageRecipients] = useState<any[]>([]);
  const [messageRelatedTo, setMessageRelatedTo] = useState<any>(null);

  const openEventForm = useCallback((event?: ScheduleEvent, date?: Date, hour?: number) => {
    setEditingEvent(event || null);
    setFormInitialDate(date);
    setFormInitialHour(hour);
    setShowEventForm(true);
  }, []);

  const closeEventForm = useCallback(() => {
    setShowEventForm(false);
    setEditingEvent(null);
    setFormInitialDate(undefined);
    setFormInitialHour(undefined);
  }, []);

  const openEventDetails = useCallback((event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  }, []);

  const closeEventDetails = useCallback(() => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  }, []);

  const openQuickMessage = useCallback((recipients: any[], relatedTo: any) => {
    setMessageRecipients(recipients);
    setMessageRelatedTo(relatedTo);
    setShowQuickMessage(true);
  }, []);

  const closeQuickMessage = useCallback(() => {
    setShowQuickMessage(false);
    setMessageRecipients([]);
    setMessageRelatedTo(null);
  }, []);

  return {
    // State
    showEventForm,
    showEventDetails,
    showQuickMessage,
    editingEvent,
    selectedEvent,
    formInitialDate,
    formInitialHour,
    messageRecipients,
    messageRelatedTo,
    
    // Actions
    openEventForm,
    closeEventForm,
    openEventDetails,
    closeEventDetails,
    openQuickMessage,
    closeQuickMessage,
  };
}
