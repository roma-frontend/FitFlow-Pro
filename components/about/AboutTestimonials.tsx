// components/about/AboutTestimonials.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { TestimonialSlider } from "./testimonials/TestimonialSlider";
import { TestimonialGrid } from "./testimonials/TestimonialGrid";
import { TestimonialStats } from "./testimonials/TestimonialStats";
import { testimonialsData } from "./testimonials/testimonialsData";
import { useAutoplay } from "./facilities/useAutoplay";
import { useSwipeGesture } from "./testimonials/useSwipeGesture";
import { CallToAction } from "./testimonials/CallToAction";

export function AboutTestimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoplayActive, setIsAutoplayActive] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Мемоизируем данные отзывов
  const memoizedTestimonials = useMemo(() => testimonialsData, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleTestimonialChange = useCallback((newIndex: number) => {
    if (isTransitioning || newIndex === currentTestimonial) return;
    
    setIsTransitioning(true);
    setCurrentTestimonial(newIndex);
    
    // Используем requestAnimationFrame для лучшей производительности
    const timeoutId = setTimeout(() => {
      setIsTransitioning(false);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [isTransitioning, currentTestimonial]);

  const nextTestimonial = useCallback(() => {
    const newIndex = (currentTestimonial + 1) % memoizedTestimonials.length;
    handleTestimonialChange(newIndex);
  }, [currentTestimonial, handleTestimonialChange, memoizedTestimonials.length]);

  const prevTestimonial = useCallback(() => {
    const newIndex = (currentTestimonial - 1 + memoizedTestimonials.length) % memoizedTestimonials.length;
    handleTestimonialChange(newIndex);
  }, [currentTestimonial, handleTestimonialChange, memoizedTestimonials.length]);

  // Автоплей с оптимизацией
  const { pause, resume } = useAutoplay({
    isPlaying: isAutoplayActive && isInView && isMounted,
    onNext: nextTestimonial,
    delay: 5000
  });

  // Свайп жесты
  useSwipeGesture({
    onSwipeLeft: nextTestimonial,
    onSwipeRight: prevTestimonial,
    threshold: 50,
    enabled: isMounted
  });

  // Оптимизированные обработчики мыши
  const handleMouseEnter = useCallback(() => {
    if (!isMounted) return;
    setIsAutoplayActive(false);
    pause();
  }, [isMounted, pause]);

  const handleMouseLeave = useCallback(() => {
    if (!isMounted) return;
    setIsAutoplayActive(true);
    resume();
  }, [isMounted, resume]);

  // Клавиатурная навигация с debounce
  useEffect(() => {
    if (!isMounted) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (e.key === 'ArrowLeft') {
          prevTestimonial();
        } else if (e.key === 'ArrowRight') {
          nextTestimonial();
        }
      }, 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [nextTestimonial, prevTestimonial, isMounted]);

  // Мемоизированные фоновые декорации
  const backgroundDecorations = useMemo(() => {
    if (!isMounted) return null;

    return (
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-blue-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-24 h-24 bg-purple-400 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-400 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 360]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    );
  }, [isMounted]);

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      {backgroundDecorations}

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-blue-200"
          >
            {isMounted && (
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="text-2xl"
              >
                💬
              </motion.span>
            )}
            <span className="text-blue-600 font-medium">Отзывы клиентов</span>
          </motion.div>

          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="text-blue-600">
              Истории наших клиентов
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Реальные результаты реальных людей, которые изменили свою жизнь с FitAccess
          </motion.p>
        </motion.div>

        {/* Main Testimonial Slider */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="touch-pan-y"
        >
          <TestimonialSlider
            testimonials={memoizedTestimonials}
            currentTestimonial={currentTestimonial}
            isTransitioning={isTransitioning}
            onNext={nextTestimonial}
            onPrev={prevTestimonial}
            onChange={handleTestimonialChange}
            isInView={isInView}
            isMounted={isMounted}
          />
        </div>

        {/* Testimonial Grid */}
        <TestimonialGrid
          testimonials={memoizedTestimonials}
          currentTestimonial={currentTestimonial}
          onChange={handleTestimonialChange}
          isInView={isInView}
          isMounted={isMounted}
        />

        {/* Statistics */}
        <TestimonialStats 
          isInView={isInView} 
          isMounted={isMounted}
        />

        {/* Call to Action */}
        <CallToAction 
          isInView={isInView} 
          isMounted={isMounted}
        />
      </div>
    </section>
  );
}
