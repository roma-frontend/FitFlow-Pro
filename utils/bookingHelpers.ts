// utils/bookingHelpers.ts (обновленная версия с типизацией)
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import type { Booking, BookingStats } from "@/types/bookings";

export const getBookingStatusColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "no-show":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getBookingStatusIcon = (status: string) => {
  switch (status) {
    case "scheduled":
      return Clock;
    case "completed":
      return CheckCircle;
    case "cancelled":
      return XCircle;
    case "no-show":
      return AlertTriangle;
    default:
      return Clock;
  }
};

export const getBookingStatusText = (status: string) => {
  switch (status) {
    case "scheduled":
      return "Запланирована";
    case "completed":
      return "Завершена";
    case "cancelled":
      return "Отменена";
    case "no-show":
      return "Не явился";
    default:
      return "Неизвестно";
  }
};

export const getTypeColor = (type: string) => {
  return type === "personal"
    ? "bg-purple-100 text-purple-800"
    : "bg-orange-100 text-orange-800";
};

export const getTypeText = (type: string) => {
  return type === "personal" ? "Персональная" : "Групповая";
};

export const calculateBookingStats = (bookings: Booking[]): BookingStats => {
  if (!bookings || bookings.length === 0) {
    return {
      total: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      revenue: 0,
    };
  }

  return {
    total: bookings.length,
    scheduled: bookings.filter((b) => b.status === "scheduled").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    revenue: bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.price || 0), 0),
  };
};

export const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Неверная дата";
  }
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);
};
