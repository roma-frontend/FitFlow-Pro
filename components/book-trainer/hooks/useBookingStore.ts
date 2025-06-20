// components/book-trainer/hooks/useBookingStore.ts
import { create } from 'zustand';
import { Trainer, BookingStep } from '../types';

interface BookingStore {
  // State
  bookingStep: BookingStep;
  selectedTrainer: Trainer | null;
  selectedDate: Date | undefined;
  selectedTime: string;
  workoutType: string;
  duration: number;
  notes: string;
  
  // Actions
  setBookingStep: (step: BookingStep) => void;
  setSelectedTrainer: (trainer: Trainer | null) => void;
  setSelectedDate: (date: Date | undefined) => void;
  setSelectedTime: (time: string) => void;
  setWorkoutType: (type: string) => void;
  setDuration: (duration: number) => void;
  setNotes: (notes: string) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  // Initial state
  bookingStep: "select",
  selectedTrainer: null,
  selectedDate: new Date(),
  selectedTime: "",
  workoutType: "",
  duration: 60,
  notes: "",
  
  // Actions
  setBookingStep: (step) => set({ bookingStep: step }),
  setSelectedTrainer: (trainer) => set({ selectedTrainer: trainer }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setWorkoutType: (type) => set({ workoutType: type }),
  setDuration: (duration) => set({ duration }),
  setNotes: (notes) => set({ notes }),
  resetBooking: () => set({
    bookingStep: "select",
    selectedTrainer: null,
    selectedDate: new Date(),
    selectedTime: "",
    workoutType: "",
    duration: 60,
    notes: "",
  }),
}));
