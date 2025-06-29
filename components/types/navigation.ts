export interface NavigationItem {
  href: string;
  label: string;
  icon: any;
  requiresAuth?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  showPulse?: boolean;
  description?: string;
  isNew?: boolean;
  category?: string;
  prefetch?: boolean;
}