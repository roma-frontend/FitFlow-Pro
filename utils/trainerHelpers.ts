// utils/trainerHelpers.ts (обновленная версия с безопасными функциями)
"use client";

import { Trainer } from "@/types/trainer";
import {
  CheckCircle,
  Clock,
  XCircle,
  Plane,
  AlertCircle,
} from "lucide-react";

export const getTrainerStatusColor = (status?: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "busy":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "vacation":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getTrainerStatusIcon = (status?: string) => {
  switch (status) {
    case "active":
      return CheckCircle;
    case "busy":
      return Clock;
    case "inactive":
      return XCircle;
    case "vacation":
      return Plane;
    default:
      return AlertCircle;
  }
};

export const getTrainerStatusText = (status?: string) => {
  switch (status) {
    case "active":
      return "Активен";
    case "busy":
      return "Занят";
    case "inactive":
      return "Неактивен";
    case "vacation":
      return "В отпуске";
    default:
      return "Неизвестно";
  }
};

export const formatEarnings = (earnings?: number): string => {
  if (!earnings || earnings === 0) return "0";
  return `${(earnings / 1000).toFixed(0)}К`;
};

export const getInitials = (name?: string): string => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Функция для безопасного получения числового значения
export const safeNumber = (value?: number | string, defaultValue: number = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

// Функция для безопасного получения строкового значения
export const safeString = (value?: string | null, defaultValue: string = ""): string => {
  return value ?? defaultValue;
};

// Функция для безопасного получения булевого значения
export const safeBoolean = (value?: boolean | string, defaultValue: boolean = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return defaultValue;
};

// Функция для нормализации данных тренера
export const normalizeTrainer = (trainer: any): Trainer => {
  return {
    id: trainer.id || trainer._id || '',
    _id: trainer._id,
    name: safeString(trainer.name, ''),
    email: safeString(trainer.email, ''),
    phone: safeString(trainer.phone, ''),
    specialization: Array.isArray(trainer.specialization) ? trainer.specialization : [],
    experience: safeNumber(trainer.experience, 0),
    hourlyRate: safeNumber(trainer.hourlyRate, 0),
    certifications: Array.isArray(trainer.certifications) ? trainer.certifications : [],
    bio: safeString(trainer.bio, ''),
    avatar: safeString(trainer.avatar, ''),
    rating: safeNumber(trainer.rating, 0),
    isActive: safeBoolean(trainer.isActive, true),
    status: trainer.status || 'inactive',
    activeClients: safeNumber(trainer.activeClients, 0),
    totalSessions: safeNumber(trainer.totalSessions, 0),
    createdAt: safeNumber(trainer.createdAt, Date.now()),
    _creationTime: safeNumber(trainer._creationTime, Date.now()),
    totalClients: safeNumber(trainer.totalClients, 0),
    monthlyEarnings: safeNumber(trainer.monthlyEarnings, 0),
    workingHours: trainer.workingHours || {
      start: '09:00',
      end: '18:00',
      days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']
    },
    nextSession: trainer.nextSession,
  };
};
