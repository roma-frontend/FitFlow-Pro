"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TrainerCardProps {
  trainer: {
    name: string;
    specialty: string;
    rating: string;
    experience: string;
    price: string;
    icon: any;
    gradient: string;
    hoverGradient: string;
    textColor: string;
    iconColor: string;
    badgeColor: string;
    description: string;
    badges: string[];
    link: string;
    bookingLink: string;
  };
}

const TrainerCard = memo(({ trainer }: TrainerCardProps) => {
  const router = useRouter();
  const { user, loading } = useAuth(); // 🔧 ИСПОЛЬЗУЕМ ГЛОБАЛЬНЫЙ КОНТЕКСТ
  const IconComponent = trainer.icon;

  // 🔧 ОПРЕДЕЛЯЕМ АВТОРИЗАЦИЮ ИЗ КОНТЕКСТА
  const isAuthenticated = !!user;

  const handleProfileClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      // Если не авторизован, перенаправляем на страницу входа с redirect параметром
      const redirectUrl = `/member-login?redirect=${encodeURIComponent(trainer.link)}`;
      console.log('🔄 TrainerCard: переход на member-login с redirect:', redirectUrl);
      router.push(redirectUrl);
      return;
    }

    console.log('✅ TrainerCard: переход на профиль тренера:', trainer.link);
    router.push(trainer.link);
  };

  const handleBookingClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      // Если не авторизован, перенаправляем на страницу входа с redirect параметром
      const redirectUrl = `/member-login?redirect=${encodeURIComponent(trainer.bookingLink)}`;
      console.log('🔄 TrainerCard: переход на member-login с redirect:', redirectUrl);
      router.push(redirectUrl);
      return;
    }

    // Если авторизован, просто переходим на бронирование
    console.log('✅ TrainerCard: переход на бронирование:', trainer.bookingLink);
    router.push(trainer.bookingLink);
  };

  // 🔧 ДОБАВИЛИ ОТЛАДОЧНЫЙ ЛОГ
  console.log('🔍 TrainerCard render:', {
    trainerName: trainer.name,
    isAuthenticated,
    userExists: !!user,
    userId: user?.id,
    loading
  });

  return (
    <Card
      className="hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-3 cursor-pointer border-0 shadow-lg h-full overflow-clip"
      onClick={handleBookingClick}
    >
      <div className="h-full flex flex-col">
        <div className="relative flex-shrink-0 rounded-t-xl group-hover:rounded-t-2xl">
          <div
            className={`group h-64 bg-gradient-to-br ${trainer.gradient} flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-[1.02]`}
          >
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ease-out group-hover:bg-white/30 group-hover:scale-110 backdrop-blur-sm border border-white/20 shadow-lg">
                <IconComponent className="h-12 w-12 transition-all duration-500 ease-out group-hover:rotate-12 group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-bold transition-all duration-300 group-hover:scale-105">
                {trainer.name}
              </h3>
              <p
                className={`${trainer.textColor} transition-opacity duration-300 group-hover:opacity-90`}
              >
                {trainer.specialty}
              </p>
            </div>
          </div>
          <div className="absolute top-3 right-3 transition-all duration-500 ease-out group-hover:scale-110">
            <div className="flex items-center bg-white/20 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/30 shadow-lg">
              <Star className="h-4 w-4 text-yellow-300 mr-1.5 drop-shadow-sm" />
              <span className="text-sm font-semibold text-white drop-shadow-sm">{trainer.rating}</span>
            </div>
          </div>

          {/* 🎨 GLASSMORPHISM ИНДИКАТОР АВТОРИЗАЦИИ */}
          {!isAuthenticated && (
            <div className="absolute top-3 left-3 transition-all duration-300 group-hover:scale-105">
              <div className="relative flex items-center px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl"></div>
                {/* Content */}
                <div className="relative flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-white/90 tracking-wide">
                    {loading ? "Проверка" : "Войти"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 🎨 GLASSMORPHISM ИНДИКАТОР ДЛЯ АВТОРИЗОВАННЫХ */}
          {isAuthenticated && (
            <div className="absolute top-3 left-3 transition-all duration-300 group-hover:scale-105">
              <div className="relative flex items-center px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/15 border border-white/30 shadow-lg">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-xl"></div>
                {/* Content */}
                <div className="relative flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-sm"></div>
                  <span className="text-xs font-medium text-white/95 tracking-wide">
                    {user?.name?.split(' ')[0] || "Вы"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award
                className={`h-4 w-4 ${trainer.iconColor} transition-colors duration-300`}
              />
              <span>{trainer.experience}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {trainer.badges.map((badge: string, index: number) => (
                <Badge
                  key={index}
                  className={`${trainer.badgeColor} transition-all duration-300 hover:scale-105`}
                >
                  {badge}
                </Badge>
              ))}
            </div>

            <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700 flex-1">
              {trainer.description}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 gap-2 md:gap-0 mt-auto">
            <div className="text-md font-bold text-gray-900 transition-all duration-300 group-hover:scale-105">
              {trainer.price}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleProfileClick}
                className="px-4 py-2 text-sm border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform hover:scale-105 hover:shadow-md font-medium"
                title={!isAuthenticated ? "Требуется авторизация" : "Просмотреть профиль"}
                disabled={loading}
              >
                {loading ? "..." : (!isAuthenticated ? "Посмотреть" : "Профиль")}
              </button>
              <button
                onClick={handleBookingClick}
                className={`px-4 py-2 text-sm bg-gradient-to-r ${trainer.gradient} text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:-translate-y-0.5 font-medium`}
                title={!isAuthenticated ? "Требуется авторизация" : "Записаться на тренировку"}
                disabled={loading}
              >
                {loading ? "..." : (!isAuthenticated ? "Войти" : "Записаться")}
              </button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
});

TrainerCard.displayName = "TrainerCard";

export default TrainerCard;