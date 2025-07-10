// app/page.tsx - Исправленная версия
"use client";

import MainHeader from "@/components/MainHeader";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import TrainersSection from "@/components/home/TrainersSection";
import ProgramsSection from "@/components/home/ProgramsSection";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import QuickActionsSection from "@/components/home/QuickActionsSection";
import DeveloperPanel from "@/components/home/DeveloperPanel";
import CTASection from "@/components/home/CTASection";
import { useAuth, useNavigation } from "@/hooks/useAuth";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import usePWA from "@/hooks/usePWA";
import { Smartphone, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthPreserver } from "@/components/home/AuthPreserver";
import { usePersistentAuth } from "@/hooks/usePersistentAuth";
import BodyAnalysisSection from "@/components/home/BodyAnalysisSection";

export default function HomePage() {
  const { authStatus } = useAuth();
  const { handleDashboardRedirect } = useNavigation();
  const { canInstall, isInstalled } = usePWA();
  const { preserveAuthState } = usePersistentAuth();
  const [isPWABannerVisible, setIsPWABannerVisible] = useState(true);

  useEffect(() => {
    if (authStatus?.authenticated) {
      preserveAuthState();
    }
  }, [authStatus, preserveAuthState]);

  // Проверяем режим разработки
  const isDevelopment = process.env.NODE_ENV === "development";

  const hidePWABanner = () => {
    console.log("PWA Banner - hiding banner");
    setIsPWABannerVisible(false);
  };

  return (
    <>
      <AuthPreserver />
      <div className="min-h-[100lvh] bg-gradient-to-br from-blue-50 to-indigo-50 w-full overflow-x-hidden">
        {/* HEADER */}
        <div className="w-full">
          <MainHeader />
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-2 text-center text-sm">
            DEBUG: canInstall={canInstall ? "true" : "false"}, isInstalled=
            {isInstalled ? "true" : "false"}, visible=
            {isPWABannerVisible ? "true" : "false"}, isDev=
            {isDevelopment ? "true" : "false"}
          </div>
        )}

        {/* PWA BANNER - только в продакшене */}
        {!isDevelopment && !isInstalled && isPWABannerVisible && (
          <div className="hidden sm:block w-full bg-gradient-to-r from-blue-600 to-purple-500 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
              <div className="flex items-center justify-between gap-2 py-2 sm:py-3">
                {/* Основной контент баннера */}
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">
                      Установите FitFlow Pro как приложение
                    </p>
                    <p className="text-xs sm:text-sm text-blue-100 truncate">
                      Быстрый доступ и работа офлайн
                    </p>
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <PWAInstallButton
                    variant="ghost"
                    size="sm"
                    className="border-white text-white hover:bg-white hover:text-blue-600 text-xs sm:text-sm px-2 sm:px-3"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={hidePWABanner}
                    className="text-white hover:bg-white/20 p-1 sm:p-2"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <main className="w-full relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-4 lg:px-6 xl:px-8">
            {/* HERO SECTION */}
            <section className="py-6 sm:py-8 lg:py-12 w-full">
              <HeroSection
                authStatus={authStatus}
                onDashboardRedirect={handleDashboardRedirect}
              />
            </section>

            <section className="py-6 sm:py-8 lg:py-12 w-full">
              <FeaturesSection />
            </section>

            <section className="py-6 sm:py-8 lg:py-12 w-full">
              <StatsSection />
            </section>

            <section className="py-6 sm:py-8 lg:py-12 w-full">
              <TrainersSection />
            </section>

            <section className="py-6 sm:py-8 lg:py-12 w-full">
              <ProgramsSection />
            </section>

            <section className="py-6 sm:py-8 lg:py-12 w-full">
              <TestimonialsSection />
            </section>

            <section className="py-6 sm:py-8 lg:py-12 w-full">
              <FAQSection />
            </section>

            <section className="py-6 sm:py-8 lg:py-12 w-full">
              <QuickActionsSection
                authStatus={authStatus}
                onDashboardRedirect={handleDashboardRedirect}
              />
            </section>

            {authStatus?.authenticated &&
              (authStatus?.user?.role === "admin" ||
                authStatus?.user?.role === "super-admin") && (
                <section className="py-6 sm:py-8 lg:py-12 w-full">
                  <DeveloperPanel authStatus={authStatus} />
                </section>
              )}

            <section className="py-6 sm:py-8 lg:py-12 w-full">
              <CTASection
                authStatus={authStatus}
                onDashboardRedirect={handleDashboardRedirect}
              />
            </section>
          </div>
        </main>
      </div>
    </>
  );
}