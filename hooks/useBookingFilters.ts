// hooks/useBookingFilters.ts
import { useState, useMemo } from "react";

export const useBookingFilters = (bookings: any[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  const filteredBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      
      const matchesTrainer =
        trainerFilter === "all" || booking.trainerId === trainerFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        if (dateFilter === "today") {
          matchesDate = booking.date === today;
        } else if (dateFilter === "tomorrow") {
          matchesDate = booking.date === tomorrow;
        } else if (dateFilter === "yesterday") {
          matchesDate = booking.date === yesterday;
        }
      }

      return matchesSearch && matchesStatus && matchesTrainer && matchesDate;
    });
  }, [bookings, searchTerm, statusFilter, trainerFilter, dateFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTrainerFilter("all");
    setDateFilter("today");
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    trainerFilter,
    setTrainerFilter,
    dateFilter,
    setDateFilter,
    filteredBookings,
    resetFilters,
  };
};
