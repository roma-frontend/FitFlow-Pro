// components/group-classes/types.ts
export interface GroupClass {
  _id: string;
  name: string;
  description?: string;
  instructorId: string;
  instructorName: string;
  instructorPhoto?: string;
  startTime: number;
  endTime: number;
  location: string;
  capacity: number;
  enrolled: string[];
  waitlist?: string[];
  difficulty: string;
  equipment?: string[];
  price: number;
  isRecurring: boolean;
  status: string;
}

export interface ClassCardProps {
  classItem: GroupClass;
  onEnroll: () => void;
  onCancel: () => void;
  isEnrolling: boolean;
  isUserEnrolled: boolean;
  isUserOnWaitlist: boolean;
}
