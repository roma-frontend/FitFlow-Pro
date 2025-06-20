// components/trainer/modals/AddWorkoutModal.tsx
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTrainer } from '@/contexts/TrainerContext';
import type { Workout } from '@/types/trainer'; // Import the type properly

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

// Define the workout type union
type WorkoutType = 'personal' | 'group' | 'cardio' | 'strength' | 'yoga' | 'pilates' | 'crossfit';

export default function AddWorkoutModal({ isOpen, onClose, selectedDate }: AddWorkoutModalProps) {
  const { addWorkout } = useTrainer();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    type: '' as WorkoutType | '',
    date: selectedDate || new Date().toISOString().split('T')[0],
    time: '',
    duration: 60,
    location: '',
    notes: '',
    price: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that type is selected
    if (!formData.type) {
      alert('Пожалуйста, выберите тип тренировки');
      return;
    }

    setIsLoading(true);

    try {
      const workoutData: Partial<Workout> = {
        clientName: formData.clientName,
        type: formData.type as WorkoutType,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        location: formData.location,
        notes: formData.notes,
        price: formData.price,
        status: 'scheduled'
      };

      const success = await addWorkout(workoutData);

      if (success) {
        onClose();
        // Сброс формы
        setFormData({
          clientName: '',
          type: '',
          date: selectedDate || new Date().toISOString().split('T')[0],
          time: '',
          duration: 60,
          location: '',
          notes: '',
          price: 0
        });
      }
    } catch (error) {
      console.error('Ошибка добавления тренировки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить тренировку</DialogTitle>
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
            <Button type="submit" disabled={isLoading || !formData.type}>
              {isLoading ? 'Добавление...' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
