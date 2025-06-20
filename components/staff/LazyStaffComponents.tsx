"use client";

import { lazy } from 'react';

// Ленивая загрузка компонентов для дальнейшей оптимизации
export const LazyStaffSecurityInfo = lazy(() => 
  import('./StaffSecurityInfo').then(module => ({ default: module.StaffSecurityInfo }))
);

export const LazyStaffDevelopmentTools = lazy(() => 
  import('./StaffDevelopmentTools').then(module => ({ default: module.StaffDevelopmentTools }))
);

export const LazyStaffForgotPasswordForm = lazy(() => 
  import('./StaffForgotPasswordForm').then(module => ({ default: module.StaffForgotPasswordForm }))
);
