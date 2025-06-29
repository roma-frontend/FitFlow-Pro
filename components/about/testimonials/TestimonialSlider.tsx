// components/about/testimonials/TestimonialSlider.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface TestimonialSliderProps {
  testimonials: any[];
  currentTestimonial: number;
  isTransitioning: boolean;
  onNext: () => void;
  onPrev: () => void;
  onChange: (index: number) => void;
  isInView: boolean;
  isMounted: boolean;
}

export function TestimonialSlider({
  testimonials,
  currentTestimonial,
  isTransitioning,
  onNext,
  onPrev,
  onChange,
  isInView,
  isMounted
}: TestimonialSliderProps) {
  const [direction, setDirection] = useState(0);
  
  // Мемоизируем текущие данные
  const currentData = useMemo(() => 
    testimonials[currentTestimonial], 
    [testimonials, currentTestimonial]
  );

  // Мемоизируем фиксированные позиции для частиц
  const particles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: 20 + i * 15,
      top: 30 + (i % 2) * 40,
      delay: i * 0.2,
    }));
  }, []);

  // Мемоизируем варианты анимации
  const slideVariants = useMemo(() => ({
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
    }),
  }), []);

  const contentVariants = useMemo(() => ({
    enter: { y: 50, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
  }), []);

  const handleNext = useCallback(() => {
    setDirection(1);
    onNext();
  }, [onNext]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    onPrev();
  }, [onPrev]);

  const handleDotClick = useCallback((index: number) => {
    setDirection(index > currentTestimonial ? 1 : -1);
    onChange(index);
  }, [currentTestimonial, onChange]);

  // Мемоизируем рендер частиц
  const particlesRender = useMemo(() => {
    if (!isMounted) return null;
    
    return particles.map((particle) => (
      <motion.div
        key={particle.id}
        className="absolute w-2 h-2 bg-white/30 rounded-full"
        style={{
          left: `${particle.left}%`,
          top: `${particle.top}%`,
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3 + particle.id * 0.5,
          repeat: Infinity,
          delay: particle.delay,
        }}
      />
    ));
  }, [isMounted, particles]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="max-w-5xl mx-auto mb-12"
    >
      <div className="relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentTestimonial}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
              scale: { duration: 0.5 },
              rotateY: { duration: 0.5 },
            }}
          >
            <Card className="relative overflow-hidden shadow-2xl border-0 bg-white">
              <CardContent className="p-0">
                <motion.div 
                  className={`relative bg-gradient-to-br ${currentData.color} p-8 md:p-12`}
                >
                                    {/* Animated Quote Icon */}
                  <motion.div 
                    className="absolute top-6 left-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                  >
                    <Quote className="h-6 w-6 text-white" />
                  </motion.div>

                  {/* Enhanced Navigation */}
                  <motion.div 
                    className="absolute top-6 right-6 flex gap-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrev}
                      disabled={isTransitioning}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white p-0 backdrop-blur-sm border border-white/20"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNext}
                      disabled={isTransitioning}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white p-0 backdrop-blur-sm border border-white/20"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </motion.div>

                  {/* Floating Particles */}
                  {particlesRender}

                  <motion.div
                    variants={contentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10"
                  >
                    {/* User Info */}
                    <motion.div 
                      className="text-center md:text-left"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <div className="relative w-24 h-24 mx-auto md:mx-0 mb-4">
                        <Image
                          src={currentData.image}
                          alt={currentData.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded-full border-4 border-white/30 relative z-10"
                          priority={currentTestimonial < 2} // Приоритет для первых двух изображений
                        />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-1">
                        {currentData.name}
                      </h3>
                      
                      <p className="text-white/80 mb-3">
                        {currentData.role}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex justify-center md:justify-start gap-1 mb-3">
                        {[...Array(currentData.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>

                      {/* Achievement Badge */}
                      <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white font-medium border border-white/20">
                        {currentData.achievement}
                      </div>
                    </motion.div>

                    {/* Testimonial Text */}
                    <motion.div 
                      className="md:col-span-2"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <blockquote className="text-lg md:text-xl text-white leading-relaxed italic relative">
                        "{currentData.text}"
                      </blockquote>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <motion.div 
          className="flex justify-center mt-8 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              disabled={isTransitioning}
              className={`relative overflow-hidden rounded-full transition-all duration-300 ${
                index === currentTestimonial 
                  ? 'bg-blue-600 w-10 h-3' 
                  : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
              }`}
            >
              {index === currentTestimonial && (
                <motion.div
                  layoutId="activeTestimonialIndicator"
                  className="absolute inset-0 bg-blue-600 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

