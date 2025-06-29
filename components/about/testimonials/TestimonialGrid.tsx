// components/about/testimonials/TestimonialGrid.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";
import { useMemo, useCallback } from "react";

interface TestimonialGridProps {
  testimonials: any[];
  currentTestimonial: number;
  onChange: (index: number) => void;
  isInView: boolean;
  isMounted: boolean;
}

export function TestimonialGrid({
  testimonials,
  currentTestimonial,
  onChange,
  isInView,
  isMounted
}: TestimonialGridProps) {
  
  // Мемоизируем варианты анимации
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 1.4
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }), []);

  // Мемоизируем обработчик клика
  const handleCardClick = useCallback((index: number) => {
    onChange(index);
  }, [onChange]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
    >
      {testimonials.map((testimonial, index) => {
        const isActive = index === currentTestimonial;
        
        return (
          <motion.div
            key={testimonial.id}
            variants={itemVariants}
            className="cursor-pointer group"
            onClick={() => handleCardClick(index)}
          >
            <Card 
              className={`h-full shadow-lg transition-all duration-300 border-2 relative overflow-hidden ${
                isActive 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-blue-200 shadow-xl' 
                  : 'border-transparent bg-white hover:shadow-xl'
              }`}
            >
              <CardContent className="p-6 text-center relative z-10">
                {/* Avatar */}
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-full relative z-10 border-2 border-white shadow-lg"
                    loading="lazy" // Ленивая загрузка для неактивных карточек
                  />
                  
                  {/* Status Indicator */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                
                {/* Name */}
                <h3 className={`font-bold mb-1 transition-colors duration-300 ${
                  isActive ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {testimonial.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3">
                  {testimonial.role}
                </p>
                
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-4 w-4 text-yellow-400 fill-current" 
                    />
                  ))}
                </div>

                {/* Text */}
                <p className={`text-sm line-clamp-3 leading-relaxed transition-all duration-300 ${
                  isActive 
                    ? 'text-gray-800 font-medium' 
                    : 'text-gray-700'
                }`}>
                  {testimonial.text}
                </p>

                {/* Achievement Badge */}
                <div
                  className={`mt-3 text-xs px-3 py-1 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {testimonial.achievement}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
