// components/about/AboutPageClient.tsx
'use client';

import {
  AboutHero,
  AboutMission,
  AboutStats,
  AboutValues,
  AboutTimeline,
  AboutTeam,
  AboutFacilities,
  AboutTestimonials,
  AboutContact,
  AboutCTA,
  BackToHomeButton
} from './DynamicAboutComponents';

export function AboutPageClient() {
  return (
    <div className="min-h-screen bg-white">
      {/* 🚀 Кнопка возврата - загружается сразу */}
      <div className="fixed top-4 left-4 z-50">
        <BackToHomeButton />
      </div>
      
      {/* 🚀 Все секции загружаются сразу - никаких лоадеров */}
      <div className="mb-16">
        <AboutHero />
      </div>
      
      <div className="mb-16">
        <AboutMission />
      </div>
      
      <div className="mb-16">
        <AboutStats />
      </div>
      
      <div className="mb-16">
        <AboutValues />
      </div>
      
      <div className="mb-16">
        <AboutTimeline />
      </div>
      
      <div className="mb-16">
        <AboutTeam />
      </div>
      
      <div className="mb-16">
        <AboutFacilities />
      </div>
      
      <div className="mb-16">
        <AboutTestimonials />
      </div>
      
      <div className="mb-16">
        <AboutContact />
      </div>
      
      <div>
        <AboutCTA />
      </div>
    </div>
  );
}
