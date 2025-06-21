// app/admin/users/components/CreateUserDialog.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Lock, Phone, DollarSign, Calendar } from "lucide-react";
import { CreateUserData, UserRole } from "@/types/user";
import { useUsersPage } from '../providers/UsersPageProvider';
import { canManageRole } from "@/lib/permissions";
import { AvatarUpload } from '@/components/ui/avatar-upload';

interface FormErrors {
  [key: string]: string;
}

export const CreateUserDialog = React.memo(() => {
  const { state, actions } = useUsersPage();
  
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'member',
    isActive: true,
    photoUrl: '',
    phone: '',
    bio: '',
    specializations: [],
    experience: 0,
    hourlyRate: 0
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Определяем режим работы более точно
  const isEditing = Boolean(state.editingUser && state.editingUser.id);
  const isTrainerRole = formData.role === 'trainer';

  // Заполнение формы при редактировании
  useEffect(() => {
    console.log('🔄 Dialog state changed:', {
      showCreateDialog: state.showCreateDialog,
      editingUser: state.editingUser,
      isEditing
    });

    if (state.editingUser && state.editingUser.id) {
      // Режим редактирования
      console.log('✏️ Режим редактирования пользователя:', state.editingUser.id);
      setFormData({
        name: state.editingUser.name || '',
        email: state.editingUser.email || '',
        password: '', // Пароль не заполняем при редактировании
        role: state.editingUser.role || 'member',
        isActive: state.editingUser.isActive ?? true,
        photoUrl: state.editingUser.photoUrl || '',
        phone: state.editingUser.phone || '',
        bio: state.editingUser.bio || '',
        specializations: state.editingUser.specializations || [],
        experience: state.editingUser.experience || 0,
        hourlyRate: state.editingUser.hourlyRate || 0
      });
    } else if (state.showCreateDialog) {
      // Режим создания
      console.log('➕ Режим создания нового пользователя');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'member',
        isActive: true,
        photoUrl: '',
        phone: '',
        bio: '',
        specializations: [],
        experience: 0,
        hourlyRate: 0
      });
    }
    setErrors({});
  }, [state.editingUser, state.showCreateDialog, isEditing]);

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    // Пароль обязателен только при создании нового пользователя
    if (!isEditing && !formData.password) {
      newErrors.password = 'Пароль обязателен при создании';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    // Валидация для тренеров
    if (isTrainerRole) {
      if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
        newErrors.phone = 'Некорректный номер телефона';
      }
      
      if (formData.hourlyRate && (formData.hourlyRate < 0 || formData.hourlyRate > 10000)) {
        newErrors.hourlyRate = 'Ставка должна быть от 0 до 10000';
      }
      
      if (formData.experience && (formData.experience < 0 || formData.experience > 50)) {
        newErrors.experience = 'Опыт должен быть от 0 до 50 лет';
      }
    }

    if (!canManageRole(state.userRole, formData.role)) {
      newErrors.role = 'У вас нет прав для назначения этой роли';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log('📝 Отправка формы:', { isEditing, formData: { ...formData, password: '***' } });
    
    if (!validateForm()) {
      console.log('❌ Валидация не прошла:', errors);
      return;
    }

    setLoading(true);
    
    try {
      let result: { success: boolean; error?: string };
      
      if (isEditing && state.editingUser?.id) {
        // Режим редактирования - используем updateUser с ID
        console.log('🔄 Обновление пользователя:', state.editingUser.id);
        
        // Подготавливаем данные для обновления (исключаем пустой пароль)
        const updateData = { ...formData };
        if (!updateData.password) {
          delete (updateData as any).password;
        }
        
        result = await actions.updateUser({
          id: state.editingUser.id,
          ...updateData
        });
      } else {
        // Режим создания - используем createUser
        console.log('➕ Создание нового пользователя');
        result = await actions.createUser(formData);
      }

      console.log('✅ Результат операции:', result);

      if (result.success) {
        actions.setShowCreateDialog(false);
        actions.setEditingUser(null);
        // Сбрасываем форму
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'member',
          isActive: true,
          photoUrl: '',
          phone: '',
          bio: '',
          specializations: [],
          experience: 0,
          hourlyRate: 0
        });
      } else {
        console.error('❌ Ошибка операции:', result.error);
        setErrors({ submit: result.error || 'Произошла ошибка' });
      }
    } catch (error) {
      console.error('💥 Исключение при сохранении:', error);
      setErrors({ submit: 'Произошла ошибка при сохранении' });
    } finally {
      setLoading(false);
    }
  };

  // Обработка изменения полей
  const handleInputChange = (field: keyof CreateUserData, value: string | boolean | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Обработка закрытия диалога
  const handleClose = () => {
    console.log('🚪 Закрытие диалога');
    actions.setShowCreateDialog(false);
    actions.setEditingUser(null);
    setErrors({});
    // Сбрасываем форму при закрытии
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'member',
      isActive: true,
      photoUrl: '',
      phone: '',
      bio: '',
      specializations: [],
      experience: 0,
      hourlyRate: 0
    });
  };

  // Обработка загрузки аватара
  const handleAvatarUpload = (url: string) => {
    handleInputChange('photoUrl', url);
  };

  // Обработка удаления аватара
  const handleAvatarRemove = () => {
    handleInputChange('photoUrl', '');
  };

  // Обработка специализаций
  const handleSpecializationsChange = (value: string) => {
    const specializations = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    handleInputChange('specializations', specializations);
  };

  // Доступные роли для текущего пользователя
  const availableRoles: Array<{ value: UserRole; label: string }> = [
    { value: 'member', label: 'Участник' },
    { value: 'client', label: 'Клиент' },
    { value: 'trainer', label: 'Тренер' },
    ...(canManageRole(state.userRole, 'manager') ? [{ value: 'manager' as UserRole, label: 'Менеджер' }] : []),
    ...(canManageRole(state.userRole, 'admin') ? [{ value: 'admin' as UserRole, label: 'Администратор' }] : []),
    ...(canManageRole(state.userRole, 'super-admin') ? [{ value: 'super-admin' as UserRole, label: 'Супер админ' }] : [])
  ];

  return (
    <Dialog 
      open={state.showCreateDialog} 
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm"
        onPointerDownOutside={(e) => {
          const target = e.target as Element;
          if (
            target.closest('input[type="file"]') || 
            target.closest('[data-file-upload]') ||
            (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'file')
          ) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black">
            <User className="h-5 w-5" />
            {isEditing ? 'Редактировать пользователя' : 'Создать пользователя'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Измените информацию о пользователе. Оставьте пароль пустым, если не хотите его менять.'
              : 'Заполните информацию для создания нового пользователя.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Аватар */}
          <div className="flex justify-center" data-file-upload>
            <AvatarUpload
              currentUrl={formData.photoUrl}
              onUploadComplete={handleAvatarUpload}
              onRemove={handleAvatarRemove}
              userName={formData.name || 'Новый пользователь'}
              disabled={loading}
            />
          </div>

          {/* Основная информация */}
          <div className="grid grid-cols-1 gap-4">
            {/* Имя */}
            <div>
              <Label htmlFor="name">Полное имя *</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Введите полное имя"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email адрес *</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Пароль */}
            <div>
              <Label htmlFor="password">
                Пароль {!isEditing && '*'}
                {isEditing && <span className="text-gray-500 text-sm ml-1">(оставьте пустым, чтобы не менять)</span>}
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder={isEditing ? "Новый пароль" : "Введите пароль"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  required={!isEditing}
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Роль и статус */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Роль */}
            <div>
              <Label htmlFor="role">Роль *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: UserRole) => handleInputChange('role', value)}
                disabled={loading}
              >
                <SelectTrigger className={`mt-1 ${errors.role ? 'border-red-500' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600 mt-1">{errors.role}</p>
              )}
            </div>

            {/* Статус */}
            <div>
              <Label htmlFor="isActive">Статус</Label>
              <div className="flex items-center space-x-2 mt-3">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  disabled={loading}
                />
                <Label htmlFor="isActive" className="text-sm">
                  {formData.isActive ? 'Активен' : 'Неактивен'}
                </Label>
              </div>
            </div>
          </div>

          {/* Дополнительные поля для тренеров */}
          {isTrainerRole && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900">Информация о тренере</h3>
              
              {/* Телефон */}
              <div>
                <Label htmlFor="phone">Телефон</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Биография */}
              <div>
                <Label htmlFor="bio">О себе</Label>
                <Textarea
                  id="bio"
                  placeholder="Расскажите о своем опыте, достижениях и подходе к тренировкам..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="mt-1 min-h-[80px]"
                  maxLength={500}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.bio?.length || 0)}/500 символов
                </p>
              </div>

              {/* Специализации */}
              <div>
                <Label htmlFor="specializations">Специализации</Label>
                <Input
                  id="specializations"
                  type="text"
                  placeholder="Фитнес, Йога, Силовые тренировки (через запятую)"
                  value={formData.specializations?.join(', ') || ''}
                  onChange={(e) => handleSpecializationsChange(e.target.value)}
                  className="mt-1"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Введите специализации через запятую
                </p>
              </div>

              {/* Опыт и ставка */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Опыт */}
                <div>
                  <Label htmlFor="experience">Опыт (лет)</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      placeholder="0"
                      value={formData.experience || ''}
                      onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                      className={`pl-10 ${errors.experience ? 'border-red-500' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.experience && (
                    <p className="text-sm text-red-600 mt-1">{errors.experience}</p>
                  )}
                </div>

                {/* Ставка */}
                <div>
                  <Label htmlFor="hourlyRate">Ставка (₽/час)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      max="10000"
                      placeholder="0"
                      value={formData.hourlyRate || ''}
                      onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 0)}
                      className={`pl-10 ${errors.hourlyRate ? 'border-red-500' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.hourlyRate && (
                    <p className="text-sm text-red-600 mt-1">{errors.hourlyRate}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ошибка отправки */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Дебаг информация в development режиме */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-200 text-gray-600 border border-gray-200 rounded-lg p-3 text-xs">
              <p><strong>Режим:</strong> {isEditing ? 'Редактирование' : 'Создание'}</p>
              <p><strong>ID пользователя:</strong> {state.editingUser?.id || 'нет'}</p>
              <p><strong>Показать диалог:</strong> {state.showCreateDialog ? 'да' : 'нет'}</p>
            </div>
          )}

          {/* Кнопки */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isEditing ? 'Сохранение...' : 'Создание...'}
                </>
              ) : (
                <>
                  {isEditing ? 'Сохранить изменения' : 'Создать пользователя'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

CreateUserDialog.displayName = 'CreateUserDialog';
