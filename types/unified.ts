// types/unified.ts
export interface WorkingHours {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  }
  
  export interface UnifiedTrainer {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: 'active' | 'inactive' | 'suspended';
    // Поля из mock-data
    specialization: string[];
    specializations?: string[]; // Для совместимости
    experience: number;
    rating: number;
    activeClients: number;
    totalSessions: number;
    hourlyRate: number;
    certifications: string[];
    workingHours: WorkingHours;
    // Поля из контекста
    avatar?: string;
    joinDate: string;
    totalClients: number;
    monthlyRevenue: number;
    lastActivity: string;
    // Общие поля
    createdAt: string;
    updatedAt?: string;
    createdBy: string;
    updatedBy?: string;
  }
  
  export interface UnifiedEvent {
    id: string;
    _id?: string; // Для совместимости с MongoDB
    title: string;
    startTime: string;
    endTime?: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
    trainerName: string;
    clientName: string;
    trainerId?: string;
    clientId?: string;
    type?: 'personal' | 'group' | 'consultation';
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    createdBy: string;
    updatedBy?: string;
  }
  
  export interface UnifiedClient {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive' | 'suspended' | 'trial';
    trainerId?: string;
    membershipType: 'basic' | 'premium' | 'vip';
    membershipExpiry: string;
    joinDate: string;
    totalSessions: number;
    trainerName?: string;
    lastVisit: string;
    birthDate?: string;
    medicalInfo?: string;
    emergencyContact?: string;
    goals?: string[];
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
  }
  