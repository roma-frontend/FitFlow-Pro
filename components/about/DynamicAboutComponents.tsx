// components/about/DynamicAboutComponents.tsx
'use client';

import dynamic from 'next/dynamic';

// 🚀 Используем next/dynamic вместо React.lazy для лучшей поддержки SSR
export const AboutHero = dynamic(() => import('./AboutHero').then(module => ({
  default: module.AboutHero
})), {
});

export const AboutMission = dynamic(() => import('./AboutMission').then(module => ({
  default: module.AboutMission
})));

export const AboutValues = dynamic(() => import('./AboutValues').then(module => ({
  default: module.AboutValues
})));

export const AboutTeam = dynamic(() => import('./AboutTeam').then(module => ({
  default: module.AboutTeam
})));

export const AboutStats = dynamic(() => import('./AboutStats').then(module => ({
  default: module.AboutStats
})));

export const AboutTimeline = dynamic(() => import('./AboutTimeline').then(module => ({
  default: module.AboutTimeline
})));

export const AboutFacilities = dynamic(() => import('./AboutFacilities').then(module => ({
  default: module.AboutFacilities
})));

export const AboutTestimonials = dynamic(() => import('./AboutTestimonials').then(module => ({
  default: module.AboutTestimonials
})));

export const AboutCTA = dynamic(() => import('./AboutCTA').then(module => ({
  default: module.AboutCTA
})));

export const AboutContact = dynamic(() => import('./AboutContact').then(module => ({
  default: module.AboutContact
})));

export const BackToHomeButton = dynamic(() => import('../ui/BackToHomeButton').then(module => ({
  default: module.BackToHomeButton
})));
