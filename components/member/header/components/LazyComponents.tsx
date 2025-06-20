// components/member/header/components/LazyComponents.tsx
import { lazy } from 'react';

// Ленивая загрузка тяжелых компонентов
export const LazyNotificationsDropdown = lazy(() => 
  import('./NotificationsDropdown').then(module => ({ 
    default: module.NotificationsDropdown 
  }))
);

export const LazyMobileMenu = lazy(() => 
  import('./MobileMenu').then(module => ({ 
    default: module.MobileMenu 
  }))
);
