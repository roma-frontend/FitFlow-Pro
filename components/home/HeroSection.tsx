"use client";

import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, ArrowRight, Zap, Globe, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AuthStatus } from "@/types/home";
import { getRoleLabel } from "@/utils/roleHelpers";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";

interface HeroSectionProps {
  authStatus: AuthStatus | null;
  onDashboardRedirect: () => void;
}

export default function HeroSection({ authStatus, onDashboardRedirect }: HeroSectionProps) {
  const router = useRouter();

  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center mb-6">
        <div className="flex flex-col items-center gap-3">
          <div className={combineAnimations(
            "hidden md:flex w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl items-center justify-center",
            ANIMATION_CLASSES.transition.all,
            ANIMATION_CLASSES.hover.scale
          )}>
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              {authStatus?.authenticated ? (
                <>
                  Добро пожаловать,{" "}
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    {authStatus.user?.name}!
                  </span>
                </>
              ) : (
                <>
                  FitFlow
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    {" "}Pro
                  </span>
                </>
              )}
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Умная система управления фитнес-центром
            </p>
          </div>
        </div>
      </div>

      {authStatus?.authenticated ? (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  Вы вошли как{" "}
                  <span className="text-blue-600">
                    {getRoleLabel(authStatus.user?.role || "")}
                  </span>
                </p>
                <p className="text-sm text-gray-600">{authStatus.user?.email}</p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onDashboardRedirect}
            size="lg"
            className={combineAnimations(
              "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg rounded-xl",
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
      ) : (
        <>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Современная платформа для управления фитнес-клубом с биометрическим доступом, 
            AI-аналитикой, умным расписанием и интегрированным магазином.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/setup-users")}
              size="lg"
              className={combineAnimations(
                "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl px-8 py-4",
                ANIMATION_CLASSES.transition.all,
                ANIMATION_CLASSES.hover.scale,
                "hover:shadow-lg"
              )}
            >
              <Zap className="h-5 w-5 mr-2" />
              Быстрый старт
            </Button>
            <Button
              onClick={() => router.push("/demo")}
              variant="outline"
              size="lg"
              className={combineAnimations(
                "rounded-xl px-8 py-4",
                ANIMATION_CLASSES.transition.all,
                ANIMATION_CLASSES.hover.scale
              )}
            >
              <Globe className="h-5 w-5 mr-2" />
              Посмотреть демо
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
