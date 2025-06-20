// components/member/header/types.ts
import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number | null;
  badgeColor?: string;
  visible: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  href?: string;
}

// Component Props Types
export interface NavigationProps {
  items: NavigationItem[];
  onNavigation: (href: string) => void;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  user?: User;
  onNavigation: (href: string) => void;
  onLogout: () => void;
}

export interface QuickActionsProps {
  onNavigation: (href: string) => void;
}

export interface UserProfileDropdownProps {
  user?: User;
  onNavigation: (href: string) => void;
  onLogout: () => void;
}

export interface NotificationsDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigation: (href: string) => void;
}
