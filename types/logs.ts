export interface Log {
  _id: string;
  userId: string;
  success: boolean;
  deviceInfo?: string;
  timestamp: number;
}
