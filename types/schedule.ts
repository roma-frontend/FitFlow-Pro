// types/schedule.ts
export interface ConvexTrainer {
    id: string;
    name: string;
    role: string;
    email: string;
    photoUri?: string;
  }
  
  export interface ConvexClient {
    id: string;
    name: string;
    role: string;
    email: string;
    photoUri?: string;
  }
  
  export interface ConvexEvent {
    _id: string;
    _creationTime: number;
    title: string;
    type: string;
    trainerId: string;
    trainerName: string;
    clientId?: string;
    clientName?: string;
    startTime: string;
    endTime: string;
    location?: string;
    description?: string;
    status: string;
    updatedAt?: string;
    price?: number;
  }
  
  export interface TransformedTrainer {
    trainerId: string;
    trainerName: string;
    trainerRole: string;
    id: string;
    name: string;
    email: string;
    photoUri?: string;
    events: any[];
    workingHours: { start: string; end: string };
  }
  
  export interface TransformedClient {
    clientId: string;
    clientName: string;
    id: string;
    name: string;
    email: string;
  }
  