// components/trainer/TrainerSchedule.tsx (исправленная версия)
"use client";

import { useState } from 'react';
import { useTrainerSchedule } from '@/hooks/useTrainerSchedule';
import CalendarView from '@/components/admin/schedule/CalendarView'; // Default import
import EventsList from '@/components/admin/schedule/EventsList'; // Default import
import { EventForm } from '@/components/admin/schedule/EventForm';
import { EventDetailsModal } from '@/components/admin/schedule/EventDetailsModal';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Plus, RefreshCw } from "lucide-react";
import { ScheduleEvent, CreateEventData } from '@/components/admin/schedule/types';

interface TrainerScheduleProps {
  trainerId: string;
  trainerName: string;
}

export default function TrainerSchedule({ trainerId, trainerName }: TrainerScheduleProps) {
  const { 
    events, 
    stats, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    updateEventStatus, 
    loading 
  } = useTrainerSchedule(trainerId);

  const [activeView, setActiveView] = useState("calendar");
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Вы уверены, что хотите удалить это событие?")) {
      await deleteEvent(eventId);
    }
  };

  const handleStatusChange = async (eventId: string, status: ScheduleEvent["status"]) => {
    await updateEventStatus(eventId, status);
  };

  // Placeholder function for sending messages
  const handleSendMessage = (event: ScheduleEvent) => {
    console.log('Sending message for event:', event);
    // TODO: Implement message sending functionality
  };

  const handleSubmitEvent = async (data: CreateEventData): Promise<{ success: boolean; id?: string }> => {
    try {
      const eventData = {
        ...data,
        trainerId,
        trainerName
      };

      if (editingEvent) {
        await updateEvent(editingEvent._id, eventData);
        setShowEventForm(false);
        setEditingEvent(null);
        
        return {
          success: true,
          id: editingEvent._id
        };
      } else {
        const newEvent = await createEvent(eventData);
        setShowEventForm(false);
        setEditingEvent(null);
        
        return {
          success: true,
          id: typeof newEvent === 'string' ? newEvent : undefined
        };
      }
    } catch (error) {
      console.error("Ошибка сохранения события:", error);
      return {
        success: false
      };
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Загрузка расписания...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
              <p className="text-sm text-gray-600">Сегодня</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.thisWeek}</p>
              <p className="text-sm text-gray-600">На неделе</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
              <p className="text-sm text-gray-600">Завершено</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.completionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Успешность</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Мое расписание</h2>
        <Button onClick={handleCreateEvent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Создать событие
        </Button>
      </div>

      {/* Schedule Views */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Календарь
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Список
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <CalendarView
            events={events}
            onEventClick={handleEventClick}
            onCreateEvent={handleCreateEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onViewEventDetails={handleEventClick}
            userRole="trainer"
          />
        </TabsContent>

        <TabsContent value="list">
          <EventsList
            events={events}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={showEventDetails}
        onClose={() => {
          setShowEventDetails(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onStatusChange={handleStatusChange}
        onSendMessage={handleSendMessage} // Added missing prop
        userRole="trainer"
      />

      <EventForm
        event={editingEvent}
        isOpen={showEventForm}
        onClose={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
        onSubmit={handleSubmitEvent}
        trainers={[{ id: trainerId, name: trainerName, role: 'trainer' }]}
        clients={[]} // Здесь должны быть клиенты тренера
        isApiAvailable={true} // Added missing prop
      />
    </div>
  );
}
