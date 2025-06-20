// hooks/useBookingActions.ts
import { useState } from "react";
import { useManager } from "@/contexts/ManagerContext";

export const useBookingActions = () => {
  const { updateBooking, deleteBooking } = useManager();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (
    bookingId: string,
    newStatus: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await updateBooking(bookingId, { status: newStatus });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteBooking?.(bookingId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleStatusChange,
    handleDeleteBooking,
    loading,
    error,
    clearError: () => setError(null),
  };
};
