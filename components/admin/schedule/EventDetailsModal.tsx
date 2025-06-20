import React, { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScheduleEvent } from "./types";
import { Edit, Trash2, MessageCircle, Calendar, Clock, MapPin, User } from "lucide-react";

interface EventDetailsModalProps {
  isOpen: boolean;
  event: ScheduleEvent | null; // Allow null
  onClose: () => void;
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: ScheduleEvent['status']) => void;
  onSendMessage: (event: ScheduleEvent) => void;
  userRole: string;
}

export const EventDetailsModal = memo(function EventDetailsModal({
  isOpen,
  event,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onSendMessage,
  userRole,
}: EventDetailsModalProps) {
  // Add early return if event is null
  if (!event) {
    return null;
  }

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
    "no-show": "bg-gray-100 text-gray-800",
  };

  const statusLabels = {
    scheduled: "Запланировано",
    confirmed: "Подтверждено",
    completed: "Завершено",
    cancelled: "Отменено",
    "no-show": "Не явился",
  };

  const typeLabels = {
    training: "Тренировка",
    consultation: "Консультация",
    group: "Групповое занятие",
    meeting: "Встреча",
    break: "Перерыв",
    other: "Другое",
  };

  const handleEdit = () => {
    onEdit(event);
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Вы уверены, что хотите удалить это событие?")) {
      onDelete(event._id);
      onClose();
    }
  };

  const handleSendMessage = () => {
    onSendMessage(event);
    onClose();
  };

  const handleStatusChange = (newStatus: ScheduleEvent['status']) => {
    onStatusChange(event._id, newStatus);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-black">
            <span>{event.title}</span>
            <Badge className={statusColors[event.status]}>
              {statusLabels[event.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Дата:</span>
                <span className="font-medium text-gray-600">
                  {new Date(event.startTime).toLocaleDateString("ru")}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Время:</span>
                <span className="font-medium text-gray-600">
                  {new Date(event.startTime).toLocaleTimeString("ru", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - {new Date(event.endTime).toLocaleTimeString("ru", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Тренер:</span>
                <span className="font-medium text-gray-600">{event.trainerName}</span>
              </div>

              {event.clientName && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Клиент:</span>
                  <span className="font-medium text-gray-600">{event.clientName}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Тип события:</span>
                <div className="mt-1">
                  <Badge variant="outline" className="text-yellow-700">
                    {typeLabels[event.type]}
                  </Badge>
                </div>
              </div>

              {event.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Место:</span>
                  <span className="font-medium text-blue-700">{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Описание</h4>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                {event.description}
              </p>
            </div>
          )}

          {/* Status Change */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Изменить статус</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusLabels).map(([status, label]) => (
                <Button
                  key={status}
                  variant={event.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(status as ScheduleEvent['status'])}
                  disabled={event.status === status}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                onClick={handleSendMessage}
                variant="outline"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Отправить сообщение
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleEdit}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
              
              {userRole === "super-admin" && (
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
