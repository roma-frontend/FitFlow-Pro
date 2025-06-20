import { LucideIcon } from "lucide-react";

// Экспортируем AuthStatus из useAuth для совместимости
export type { AuthStatus } from "@/hooks/useAuth";

export interface TrainerData {
  name: string;
  specialty: string;
  rating: string;
  experience: string;
  price: string;
  icon: LucideIcon;
  gradient: string;
  hoverGradient: string;
  textColor: string;
  iconColor: string;
  badgeColor: string;
  description: string;
  badges: string[];
  link: string;
  bookingLink: string;
}

export interface ProgramData {
  title: string;
  description: string;
  duration: string;
  icon: LucideIcon;
  bgGradient: string;
  borderColor: string;
  iconGradient: string;
  buttonGradient: string;
  buttonHover: string;
  link: string;
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  borderColor: string;
}
