// components/trainer/modals/EditWorkoutModal.tsx (исправленная версия)
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTrainer } from '@/contexts/TrainerContext';
import type { Workout } from '@/types/trainer';

interface EditWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
}

// Типизированные статусы и типы тренировок
type WorkoutStatus = "scheduled" | "in-progress" | "completed" | "cancelled" | "missed";
type WorkoutType = "personal" | "group" | "cardio" | "strength" | "yoga" | "pilates" | "crossfit";

interface WorkoutFormData {
  clientName: string;
  type: WorkoutType | '';
  date: string;
  time: string;
  duration: number;
  location: string;
  notes: string;
  price: number;
  status: WorkoutStatus;
}

export default function EditWorkoutModal({ isOpen, onClose, workoutId }: EditWorkoutModalProps) {
  const { workouts, updateWorkout } = useTrainer();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<WorkoutFormData>({
    clientName: '',
    type: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    notes: '',
    price: 0,
    status: 'scheduled'
  });

  // Загружаем данные тренировки
  useEffect(() => {
    const workout = workouts.find(w => (w.id || w._id) === workoutId);
    if (workout) {
      setFormData({
        clientName: workout.clientName || workout.userName || '',
        type: (workout.type as WorkoutType) || '',
        date: workout.date || workout.scheduledDate?.split('T')[0] || '',
        time: workout.time || workout.scheduledTime || '',
        duration: workout.duration || 60,
        location: workout.location || '',
        notes: workout.notes || '',
        price: workout.price || 0,
        status: (workout.status as WorkoutStatus) || 'scheduled'
      });
    }
  }, [workoutId, workouts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Создаем объект для обновления с правильными типами
      const updateData: Partial<Workout> = {
        clientName: formData.clientName,
        type: formData.type || undefined,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        location: formData.location,
        notes: formData.notes,
        price: formData.price,
        status: formData.status
      };

      const success = await updateWorkout(workoutId, updateData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Ошибка обновления тренировки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof WorkoutFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as WorkoutStatus
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value as WorkoutType
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать тренировку</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Клиент</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              placeholder="Имя клиента"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Тип тренировки</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип тренировки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Персональная</SelectItem>
                <SelectItem value="group">Групповая</SelectItem>
                <SelectItem value="cardio">Кардио</SelectItem>
                <SelectItem value="strength">Силовая</SelectItem>
                <SelectItem value="yoga">Йога</SelectItem>
                <SelectItem value="pilates">Пилатес</SelectItem>
                <SelectItem value="crossfit">Кроссфит</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Запланировано</SelectItem>
                <SelectItem value="in-progress">В процессе</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
                <SelectItem value="cancelled">Отменено</SelectItem>
                <SelectItem value="missed">Пропущено</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Время</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Длительность (мин)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                min="15"
                max="300"
                step="15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Стоимость (₽)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                min="0"
                step="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Место проведения</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Зал, студия, онлайн..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
