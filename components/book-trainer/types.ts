// components/book-trainer/types.ts
export interface Trainer {
  _id: string;
  name: string;
  email: string;
  photoUrl?: string;
  bio?: string;
  specializations: string[];
  experience: number;
  rating?: number;
  totalReviews?: number;
  hourlyRate: number;
  workingHours: WorkingHours;
  languages?: string[];
  certifications?: string[];
}

export interface WorkingHours {
  [key: string]: DaySchedule | undefined;
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  start: string;
  end: string;
  breaks?: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
}

export interface BookingData {
  trainerId: string;
  startTime: number;
  endTime: number;
  duration: number;
  workoutType: string;
  notes?: string;
  price: number;
}

export type BookingStep = "select" | "schedule" | "details" | "confirm";

export type PriceFilter = "all" | "budget" | "medium" | "premium";

export type WorkoutType = 
  | "Персональная тренировка"
  | "Консультация" 
  | "Составление программы"
  | "Техника выполнения"
  | "Растяжка";
