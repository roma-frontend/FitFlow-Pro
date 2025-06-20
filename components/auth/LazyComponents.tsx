"use client";

import { lazy } from 'react';

// Ленивая загрузка компонентов для дальнейшей оптимизации
export const LazySecurityInfo = lazy(() => 
  import('./SecurityInfo').then(module => ({ default: module.SecurityInfo }))
);

export const LazyDevelopmentTools = lazy(() => 
  import('./DevelopmentTools').then(module => ({ default: module.DevelopmentTools }))
);

export const LazyForgotPasswordForm = lazy(() => 
  import('./ForgotPasswordForm').then(module => ({ default: module.ForgotPasswordForm }))
);
