"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, Heart, MessageCircle, Users } from "lucide-react";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";
import { testimonials } from "./constants/TESTIMONIALS";

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  index: number;
  isVisible: boolean;
}

function TestimonialCard({
  name,
  role,
  content,
  rating,
  avatar,
  index,
  isVisible,
}: TestimonialProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={combineAnimations(
        "relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 rounded-3xl",
        "hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02]",
        "transition-all duration-700 ease-out will-change-transform",
        "group border-gray-200/50 hover:border-blue-300/50",
        "transform opacity-100"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Декоративные элементы */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 will-change-opacity" />

      {/* Анимированные частицы */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 will-change-transform">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full" />
          <div className="w-2 h-2 bg-purple-400 rounded-full" />
          <div className="w-2 h-2 bg-pink-400 rounded-full" />
        </div>
      </div>

      {/* Плавающее сердечко */}
      <div
        className={combineAnimations(
          "absolute top-6 right-6 transition-all duration-500 will-change-transform",
          isHovered
            ? "scale-110 rotate-12 opacity-100"
            : "scale-0 rotate-0 opacity-0"
        )}
      >
        <Heart className="h-5 w-5 text-red-400 fill-current" />
      </div>

      <CardContent className="p-8 relative z-10">
        {/* Рейтинг с анимацией */}
        <div className="flex items-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={combineAnimations(
                "h-5 w-5 transition-all duration-300 will-change-transform",
                i < rating
                  ? "text-yellow-400 fill-current scale-100"
                  : "text-gray-300 scale-90",
                "hover:scale-125 hover:rotate-12"
              )}
            />
          ))}
          <span className="ml-2 text-sm font-semibold text-gray-600 bg-yellow-50 px-2 py-1 rounded-full">
            {rating}.0
          </span>
        </div>

        {/* Цитата с улучшенным дизайном */}
        <div className="relative mb-8">
          <Quote className="hidden sm:inline-flex h-6 w-6 text-blue-400 absolute -top-1 -left-1 transition-all duration-300 group-hover:scale-110 will-change-transform" />
          <p className="text-gray-700 leading-relaxed sm:pl-8 font-medium relative">
            {content}
            <span className="absolute -bottom-1 left-8 w-0 h-0.5 bg-gradient-to-r from-slate-400 to-gray-500 group-hover:w-full transition-all duration-700 will-change-auto" />
          </p>
        </div>

        {/* Профиль пользователя */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className={combineAnimations(
              "relative w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-700 font-bold text-lg",
              "bg-gradient-to-br from-indigo-100 via-blue-200 to-slate-300",
              "transition-all duration-500 will-change-transform",
              "hover:scale-110 hover:rotate-6",
              "shadow-lg group-hover:shadow-xl"
            )}
          >
            {avatar}
            <div className="absolute inset-0 rounded-2xl bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors duration-300">
              {name}
            </h4>
            <p className="text-sm text-gray-600 font-medium bg-gray-50 sm:px-3 py-1 rounded-full inline-block">
              {role}
            </p>
          </div>

          {/* Индикатор активности */}
          <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 will-change-opacity">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-xs text-gray-500">Активен</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="mb-16 relative">
      {/* Фоновые декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-2xl will-change-transform" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-2xl will-change-transform" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-pink-400/5 to-blue-600/5 rounded-full blur-3xl will-change-transform" />
      </div>

      {/* Заголовок без анимации появления */}
      <div className="text-center mb-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
          <div
            className={combineAnimations(
              "w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
              "rounded-2xl flex items-center justify-center relative",
              "transform transition-all duration-700 ease-out will-change-transform",
              "hover:scale-110 hover:rotate-12",
              "shadow-xl shadow-violet-200/40"
            )}
          >
            <MessageCircle className="h-8 w-8 text-white" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center">
              <Heart className="h-3 w-3 text-white fill-current" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Отзывы наших клиентов
          </h2>
        </div>

        <div className="relative">
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Узнайте, что говорят о нас наши участники
          </p>

          {/* Статистика */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">
                500+ клиентов
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-semibold text-gray-700">
                4.9 рейтинг
              </span>
            </div>
          </div>

          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full will-change-transform" />
        </div>
      </div>

      {/* Сетка отзывов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            {...testimonial}
            index={index}
            isVisible={isVisible}
          />
        ))}
      </div>
    </div>
  );
}
