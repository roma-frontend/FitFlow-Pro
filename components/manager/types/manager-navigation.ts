// components/manager/types/manager-navigation.ts
import { LucideIcon } from "lucide-react";

export interface ManagerNavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  category: "management" | "bookings" | "analytics" | "settings";
  description: string;
  requiresAuth?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  showPulse?: boolean;
  isNew?: boolean;
}
