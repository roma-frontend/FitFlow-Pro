"use client";

import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, ArrowRight, Zap, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AuthStatus } from "@/types/home";
import { getRoleLabel } from "@/utils/roleHelpers";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";
import HeroSparklesButton from "./components/HeroAnimatedButton";
import Image from "next/image";

interface HeroSectionProps {
  authStatus: AuthStatus | null;
  onDashboardRedirect: () => void;
}

export default function HeroSection({ authStatus, onDashboardRedirect }: HeroSectionProps) {
  const router = useRouter();

  return (
    <div className="mb-16">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
        {/* Левая часть — картинка */}
        <div className="w-full lg:w-1/2 h-[400px] md:h-[600px] flex justify-center">
          <div className="relative group">
            {/* Градиентное свечение */}
            <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition duration-500 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #818cf8 100%)"
              }}
            />
            {/* Градиентная рамка */}
            <div className="p-[3px] h-full rounded-2xl bg-gradient-to-tr from-blue-400 via-indigo-400 to-violet-400">
              <Image
                src="https://res.cloudinary.com/dgbtipi5o/image/upload/v1751097541/Hero/utiltg9tyg7hnn04phip.webp"
                alt="FitFlow Pro"
                className="
    max-w-xs md:max-w-md lg:max-w-lg h-full rounded-2xl shadow-xl object-cover
    filter brightness-110 contrast-120 saturate-150 hue-rotate-30
    group-hover:rotate-1 group-hover:scale-110
    transition-all duration-500
  "
                width={500}
                height={600}
                priority
              />
            </div>
          </div>
        </div>
        {/* Правая часть — тексты и кнопки */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left mt-[-70px] lg:mt-0">
          <HeroSparklesButton variant="gradient" className="mb-6" />
          <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-800 leading-tight mb-4">
            {authStatus?.authenticated ? (
              <>
                Приветствуем!
              </>
            ) : (
              <>
                Управляй фитнес-клубом <br />
                <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  умнее с FitFlow Pro
                </span>
              </>
            )}
          </h1>
          <p className="text-lg xl:text-xl text-slate-600 mb-6 max-w-xl">
            {authStatus?.authenticated
              ? "Ваша персональная панель управления уже готова — используйте все возможности платформы на максимум."
              : "Автоматизация, аналитика и инновации для вашего фитнес-бизнеса. Всё в одной платформе."}
          </p>

          {!authStatus?.authenticated && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full max-w-xl">
              <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50 rounded-xl px-4 py-3 shadow-sm">
                <Zap className="text-blue-500" size={22} />
                <span className="font-medium text-slate-700 text-center sm:text-left">AI-аналитика и прогнозы</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50 rounded-xl px-4 py-3 shadow-sm">
                <Shield className="text-indigo-500" size={22} />
                <span className="font-medium text-slate-700 text-center sm:text-left">Безопасный биометрический доступ</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50 rounded-xl px-4 py-3 shadow-sm">
                <TrendingUp className="text-violet-500" size={22} />
                <span className="font-medium text-slate-700 text-center sm:text-left">Умное расписание и автоматизация</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50 rounded-xl px-4 py-3 shadow-sm">
                <Globe className="text-blue-400" size={22} />
                <span className="font-medium text-slate-700 text-center sm:text-left">Интеграция с магазином и CRM</span>
              </div>
            </div>
          )}

          {authStatus?.authenticated &&
            <div className="space-y-6 w-full mt-4">

              <Button
                onClick={onDashboardRedirect}
                size="lg"
                className={combineAnimations(
                  "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl",
                  ANIMATION_CLASSES.transition.all,
                  ANIMATION_CLASSES.hover.scale,
                  ANIMATION_CLASSES.hover.shadow
                )}
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Перейти в дашборд
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          }
        </div>
      </div>
    </div>
  );
}