// types/booking.ts
export interface Booking {
  id: string;
  trainerId: string;
  trainerName: string;
  trainerAvatar?: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  clientPhone?: string;
  date: string;
  time: string;
  duration: number;
  type: 'personal' | 'group';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  price: number;
  service: string;
  notes?: string;
}

export interface BookingStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export interface BookingFilters {
  searchTerm: string;
  statusFilter: string;
  trainerFilter: string;
  dateFilter: string;
}
