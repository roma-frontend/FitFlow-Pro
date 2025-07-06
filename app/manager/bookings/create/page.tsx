// app/manager/bookings/create/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ManagerHeader from '@/components/manager/ManagerHeader';
import { ManagerProvider, useManager } from '@/contexts/ManagerContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User,
  Users,
  DollarSign,
  ArrowLeft,
  Save,
  Phone,
  Mail
} from "lucide-react";

function CreateBookingContent() {
  const router = useRouter();
  const { trainers, createBooking } = useManager();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    trainerId: '',
    date: '',
    time: '',
    duration: 60,
    type: 'personal',
    service: '',
    price: 2500,
    notes: ''
  });

  // Доступные услуги
  const services = [
    { id: 'personal-training', name: 'Персональная тренировка', price: 2500, duration: 60 },
    { id: 'group-training', name: 'Групповая тренировка', price: 1500, duration: 60 },
    { id: 'yoga', name: 'Йога', price: 2000, duration: 90 },
    { id: 'pilates', name: 'Пилатес', price: 2200, duration: 60 },
    { id: 'crossfit', name: 'Кроссфит', price: 1800, duration: 60 },
    { id: 'boxing', name: 'Бокс', price: 2800, duration: 60 },
    { id: 'stretching', name: 'Стретчинг', price: 1800, duration: 45 },
    { id: 'nutrition', name: 'Консультация по питанию', price: 3000, duration: 90 }
  ];

  // Временные слоты
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setFormData(prev => ({
        ...prev,
        service: service.name,
        price: service.price,
        duration: service.duration
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createBooking(formData);
      router.push('/manager/bookings');
    } catch (error) {
      console.error('Ошибка создания записи:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.clientName && formData.clientPhone && 
                     formData.trainerId && formData.date && formData.time && 
                     formData.service;

  return (
    <div className="min-h-[100lvh] bg-gray-50">
      <ManagerHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Создать новую запись
            </h1>
            <p className="text-gray-600">
              Заполните форму для создания записи клиента к тренеру
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Основная информация */}
            <div className="lg:col-span-2 space-y-6">
              {/* Информация о клиенте */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Информация о клиенте
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Имя клиента *</Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Введите имя клиента"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="clientPhone">Телефон *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="clientPhone"
                          value={formData.clientPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                          placeholder="+7 (999) 123-45-67"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="clientEmail">Email (необязательно)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="clientEmail"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="client@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Детали записи */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Детали записи
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="trainerId">Тренер *</Label>
                      <Select 
                        value={formData.trainerId} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, trainerId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тренера" />
                        </SelectTrigger>
                        <SelectContent>
                          {trainers.map((trainer) => (
                            <SelectItem key={trainer.id} value={trainer.id}>
                              <div className="flex items-center gap-2">
                                <span>{trainer.name}</span>
                                <span className="text-sm text-gray-500">
                                  ({trainer.specialization.slice(0, 2).join(', ')})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="service">Услуга *</Label>
                      <Select 
                        value={services.find(s => s.name === formData.service)?.id || ''} 
                        onValueChange={handleServiceChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите услугу" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              <div className="flex justify-between items-center w-full">
                                <span>{service.name}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  {service.price}₽ • {service.duration}мин
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date">Дата *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="time">Время *</Label>
                      <Select 
                        value={formData.time} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите время" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Длительность (мин)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        min="30"
                        max="180"
                        step="15"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Тип тренировки</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Персональная
                            </div>
                          </SelectItem>
                          <SelectItem value="group">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Групповая
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="price">Цена (₽)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                          min="0"
                          step="100"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                                        <Label htmlFor="notes">Заметки</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Дополнительная информация о записи..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Боковая панель с превью */}
            <div className="space-y-6">
              {/* Превью записи */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Превью записи</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.clientName && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{formData.clientName}</div>
                        {formData.clientPhone && (
                          <div className="text-sm text-gray-500">{formData.clientPhone}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.trainerId && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {trainers.find(t => t.id === formData.trainerId)?.name || 'Тренер не выбран'}
                        </div>
                        <div className="text-sm text-gray-500">Тренер</div>
                      </div>
                    </div>
                  )}

                  {formData.date && formData.time && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(formData.date).toLocaleDateString('ru-RU', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formData.time} • {formData.duration} минут
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.service && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{formData.service}</div>
                        <div className="text-sm text-gray-500">
                          {formData.type === 'personal' ? 'Персональная' : 'Групповая'} тренировка
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.price > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">Стоимость:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formData.price.toLocaleString()} ₽
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Рекомендации */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Рекомендации</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900 mb-1">
                      💡 Совет
                    </div>
                    <div className="text-sm text-blue-800">
                      Убедитесь, что у тренера нет других записей в это время
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-900 mb-1">
                      ✅ Проверьте
                    </div>
                    <div className="text-sm text-green-800">
                      Контактные данные клиента для подтверждения записи
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-900 mb-1">
                      ⏰ Напоминание
                    </div>
                    <div className="text-sm text-yellow-800">
                      Отправьте SMS-уведомление клиенту за день до тренировки
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Действия */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="w-full flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Создание...' : 'Создать запись'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full"
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateBooking() {
  return (
      <ManagerProvider>
        <CreateBookingContent />
      </ManagerProvider>
  );
}

