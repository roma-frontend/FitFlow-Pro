import React, { memo, useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScheduleEvent, CreateEventData } from "./types";

export interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventData) => Promise<{ success: boolean; id?: string }>;
  event?: ScheduleEvent | null; // Changed from editingEvent to event
  trainers: any[];
  clients: any[];
  initialDate?: Date;
  initialHour?: number;
  isApiAvailable: boolean;
}

export const EventForm = memo(function EventForm({
  isOpen,
  onClose,
  onSubmit,
  event = null, // Changed from editingEvent to event
  trainers,
  clients,
  initialDate,
  initialHour,
  isApiAvailable,
}: EventFormProps) {
  const [formData, setFormData] = useState<CreateEventData>({
    title: "",
    type: "training",
    trainerId: "",
    clientId: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    status: "scheduled",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Константы для специальных значений
  const NO_CLIENT_VALUE = "__NO_CLIENT__";
  const NO_TRAINER_VALUE = "__NO_TRAINER__";

  // Инициализация формы
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        type: event.type,
        trainerId: event.trainerId,
        clientId: event.clientId || "",
        startTime: new Date(event.startTime).toISOString().slice(0, 16),
        endTime: new Date(event.endTime).toISOString().slice(0, 16),
        location: event.location || "",
        description: event.description || "",
        status: event.status,
      });
    } else {
      // Новое событие
      const now = initialDate || new Date();
      const hour = initialHour || 10;
      const startTime = new Date(now);
      startTime.setHours(hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(hour + 1, 0, 0, 0);

      setFormData({
        title: "",
        type: "training",
        trainerId: "",
        clientId: "",
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        location: "",
        description: "",
        status: "scheduled",
      });
    }
    setErrors({});
  }, [event, initialDate, initialHour]); // Changed dependency from editingEvent to event

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Название обязательно";
    }
    if (!formData.trainerId) {
      newErrors.trainerId = "Выберите тренера";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Укажите время начала";
    }
    if (!formData.endTime) {
      newErrors.endTime = "Укажите время окончания";
    }
    if (formData.startTime && formData.endTime && new Date(formData.startTime) >= new Date(formData.endTime)) {
      newErrors.endTime = "Время окончания должно быть позже времени начала";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(formData);
      if (result.success) {
        onClose();
      } else {
        setErrors({ submit: "Ошибка сохранения события" });
      }
    } catch (error) {
      console.error("Ошибка отправки формы:", error);
      setErrors({ submit: "Ошибка сохранения события" });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit, onClose]);

  const handleInputChange = useCallback((field: keyof CreateEventData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  const handleTrainerChange = useCallback((value: string) => {
    const trainerId = value === NO_TRAINER_VALUE ? "" : value;
    handleInputChange("trainerId", trainerId);
  }, [handleInputChange]);

  const handleClientChange = useCallback((value: string) => {
    const clientId = value === NO_CLIENT_VALUE ? "" : value;
    handleInputChange("clientId", clientId);
  }, [handleInputChange]);

  const handleStatusChange = useCallback((value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      status: value as CreateEventData['status']
    }));
    if (errors.status) {
      setErrors(prev => ({ ...prev, status: "" }));
    }
  }, [errors]);

  const eventTypes = [
    { value: "training", label: "Тренировка" },
    { value: "consultation", label: "Консультация" },
    { value: "group", label: "Групповое занятие" },
    { value: "meeting", label: "Встреча" },
    { value: "break", label: "Перерыв" },
    { value: "other", label: "Другое" },
  ];

  const statusOptions = [
    { value: "scheduled", label: "Запланировано" },
    { value: "confirmed", label: "Подтверждено" },
    { value: "completed", label: "Завершено" },
    { value: "cancelled", label: "Отменено" },
    { value: "no-show", label: "Не явился" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? "Редактировать событие" : "Создать событие"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Введите название события"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="type">Тип события</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trainer */}
          <div>
            <Label htmlFor="trainer">Тренер *</Label>
            <Select 
              value={formData.trainerId || NO_TRAINER_VALUE} 
              onValueChange={handleTrainerChange}
            >
              <SelectTrigger className={errors.trainerId ? "border-red-500" : ""}>
                <SelectValue placeholder="Выберите тренера" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_TRAINER_VALUE}>Выберите тренера</SelectItem>
                {trainers.map(trainer => (
                  <SelectItem key={trainer.id || trainer.trainerId} value={trainer.id || trainer.trainerId}>
                    {trainer.name || trainer.trainerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.trainerId && <p className="text-red-500 text-sm mt-1">{errors.trainerId}</p>}
          </div>

          {/* Client */}
          <div>
            <Label htmlFor="client">Клиент</Label>
            <Select 
              value={formData.clientId || NO_CLIENT_VALUE} 
              onValueChange={handleClientChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите клиента (необязательно)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CLIENT_VALUE}>Без клиента</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id || client.clientId} value={client.id || client.clientId}>
                    {client.name || client.clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Время начала *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className={errors.startTime ? "border-red-500" : ""}
              />
              {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <Label htmlFor="endTime">Время окончания *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className={errors.endTime ? "border-red-500" : ""}
              />
              {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Место проведения</Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Введите место проведения"
            />
          </div>

          {/* Status */}
          {event && (
            <div>
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Дополнительная информация о событии"
              rows={3}
            />
          </div>

          {/* API Status */}
          {!isApiAvailable && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-orange-800 text-sm">
                ⚠️ API недоступен. Изменения будут сохранены локально.
              </p>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                event ? "Сохранить изменения" : "Создать событие"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
