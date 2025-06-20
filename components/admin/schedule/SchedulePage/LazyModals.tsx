// components/admin/schedule/SchedulePage/LazyModals.tsx
import React, { memo } from "react";
import { EventForm } from "../EventForm";
import { EventDetailsModal } from "../EventDetailsModal";
import { QuickMessageModal } from "../QuickMessageModal";
import { ScheduleEvent, CreateEventData } from "../types";

interface LazyModalsProps {
    // EventForm props
    showEventForm: boolean;
    editingEvent: ScheduleEvent | null;
    formInitialDate?: Date;
    formInitialHour?: number;
    trainers: any[];
    clients: any[];
    isApiAvailable: boolean;
    onCloseEventForm: () => void;
    onSubmitEvent: (data: CreateEventData) => Promise<{ success: boolean; id?: string }>;

    // EventDetailsModal props
    showEventDetails: boolean;
    selectedEvent: ScheduleEvent | null;
    onCloseEventDetails: () => void;
    onEditEvent: (event: ScheduleEvent) => void;
    onDeleteEvent: (eventId: string) => void;
    onStatusChange: (eventId: string, status: ScheduleEvent['status']) => void;
    onSendMessage: (event: ScheduleEvent) => void;
    userRole: string;

    // QuickMessageModal props
    showQuickMessage: boolean;
    messageRecipients: any[];
    messageRelatedTo: any;
    onCloseQuickMessage: () => void;
}

const LazyModals = memo(function LazyModals({
    // EventForm props
    showEventForm,
    editingEvent,
    formInitialDate,
    formInitialHour,
    trainers,
    clients,
    isApiAvailable,
    onCloseEventForm,
    onSubmitEvent,

    // EventDetailsModal props
    showEventDetails,
    selectedEvent,
    onCloseEventDetails,
    onEditEvent,
    onDeleteEvent,
    onStatusChange,
    onSendMessage,
    userRole,

    // QuickMessageModal props
    showQuickMessage,
    messageRecipients,
    messageRelatedTo,
    onCloseQuickMessage,
}: LazyModalsProps) {
    return (
        <>
            {/* Event Form Modal */}
            {showEventForm && (
                <EventForm
                    isOpen={showEventForm}
                    onClose={onCloseEventForm}
                    onSubmit={onSubmitEvent}
                    trainers={trainers}
                    clients={clients}
                    initialDate={formInitialDate}
                    initialHour={formInitialHour}
                    isApiAvailable={isApiAvailable}
                />
            )}

            {/* Event Details Modal */}
            {showEventDetails && selectedEvent && (
                <EventDetailsModal
                    isOpen={showEventDetails}
                    event={selectedEvent}
                    onClose={onCloseEventDetails}
                    onEdit={onEditEvent}
                    onDelete={onDeleteEvent}
                    onStatusChange={onStatusChange}
                    onSendMessage={onSendMessage}
                    userRole={userRole}
                />
            )}

            {/* Quick Message Modal */}
            {showQuickMessage && (
                <QuickMessageModal
                    isOpen={showQuickMessage}
                    recipients={messageRecipients}
                    relatedTo={messageRelatedTo}
                    onClose={onCloseQuickMessage}
                />
            )}
        </>
    );
});

export default LazyModals;

