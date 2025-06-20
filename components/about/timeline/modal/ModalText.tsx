// components/about/timeline/modal/ModalText.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { memo, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TimelineEvent } from "../hooks/useTimelineData";
import { useReducedMotion } from "framer-motion";

interface ModalTextProps {
  event: TimelineEvent;
  eventIndex: number;
  totalEvents: number;
  direction: 'next' | 'prev' | null;
  onNext: () => void;
  onPrev: () => void;
  onEventChange: (index: number, direction: 'next' | 'prev') => void;
  allEvents: TimelineEvent[];
  isTransitioning: boolean;
}

export const ModalText = memo<ModalTextProps>((props) => {
  const {
    event,
    eventIndex,
    totalEvents,
    direction,
    onNext,
    onPrev,
    onEventChange,
    allEvents,
    isTransitioning
  } = props;

  const [currentEvent, setCurrentEvent] = useState(event);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => {
        setCurrentEvent(event);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [event, isTransitioning]);

  return (
    <div className="lg:w-1/2 p-3 sm:p-4 md:p-6 lg:p-12 overflow-y-auto custom-scrollbar bg-white">
      <motion.div
        className="h-full flex flex-col"
        style={{ 
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
        animate={{
          opacity: isTransitioning ? 0.6 : 1,
          x: isTransitioning ? (direction === 'next' ? -10 : direction === 'prev' ? 10 : 0) : 0,
          transition: {
            duration: 0.3,
            ease: "easeInOut"
          }
        }}
      >
        {/* Header - четкие цвета без теней */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4"
            animate={{
              opacity: isTransitioning ? 0.5 : 1,
              y: isTransitioning ? -5 : 0,
              transition: { duration: 0.3 }
            }}
            style={{ 
              willChange: 'transform, opacity',
              color: '#111827' // Принудительно устанавливаем темный цвет
            }}
          >
            {currentEvent.title}
          </motion.h2>
          <motion.div 
            className={`w-12 sm:w-16 md:w-20 h-1 bg-gradient-to-r ${currentEvent.yearGradient} rounded-full mb-3 sm:mb-4 md:mb-6`}
            animate={{
              scaleX: isTransitioning ? 0.7 : 1,
              opacity: isTransitioning ? 0.6 : 1,
              transition: { duration: 0.3 }
            }}
            style={{ 
              transformOrigin: 'left', 
              willChange: 'transform, opacity'
            }}
          />
        </div>

        {/* Description - четкий темный текст */}
        <div className="mb-4 sm:mb-6 md:mb-8 flex-grow">
          <motion.p 
            className="text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4 md:mb-6 font-medium"
            animate={{
              opacity: isTransitioning ? 0.4 : 1,
              y: isTransitioning ? 5 : 0,
              transition: { duration: 0.3, delay: 0.05 }
            }}
            style={{ 
              willChange: 'transform, opacity',
              color: '#374151' // Принудительно устанавливаем темно-серый цвет
            }}
          >
            {currentEvent.fullDescription}
          </motion.p>
        </div>

        {/* Achievements - четкие цвета */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <motion.h3 
            className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4"
            animate={{
              opacity: isTransitioning ? 0.5 : 1,
              y: isTransitioning ? -3 : 0,
              transition: { duration: 0.3, delay: 0.1 }
            }}
            style={{ 
              willChange: 'transform, opacity',
              color: '#111827' // Принудительно устанавливаем темный цвет
            }}
          >
            Ключевые достижения:
          </motion.h3>
          <div className="grid grid-cols-1 gap-1.5 sm:gap-2 md:gap-3">
            {currentEvent.achievements.map((achievement, index) => (
              <motion.div
                key={`${eventIndex}-${index}`}
                className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                style={{ willChange: 'transform, opacity, background-color' }}
                animate={{
                  opacity: isTransitioning ? 0.3 : 1,
                  x: isTransitioning ? (index % 2 === 0 ? -5 : 5) : 0,
                  transition: { 
                    duration: 0.3, 
                    delay: isTransitioning ? 0 : 0.15 + index * 0.05 
                  }
                }}
                whileHover={shouldReduceMotion ? {} : { 
                  scale: 1.01, 
                  x: 3
                }}
              >
                <motion.div 
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r ${currentEvent.yearGradient} rounded-full flex-shrink-0`}
                  animate={{
                    scale: isTransitioning ? 0.7 : 1,
                    opacity: isTransitioning ? 0.5 : 1,
                    transition: { duration: 0.3, delay: 0.2 + index * 0.03 }
                  }}
                  style={{ willChange: 'transform, opacity' }}
                />
                <span 
                  className="text-xs sm:text-sm md:text-base font-medium"
                  style={{ color: '#374151' }} // Принудительно устанавливаем темно-серый цвет
                >
                  {achievement}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation - четкие кнопки */}
        <motion.div 
          className="flex justify-center gap-3 sm:gap-4 mb-3 sm:mb-4 xs:hidden"
          animate={{
            opacity: isTransitioning ? 0.4 : 1,
            y: isTransitioning ? 5 : 0,
            transition: { duration: 0.3, delay: 0.2 }
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          <motion.button
            onClick={onPrev}
            disabled={isTransitioning}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 transition-all duration-150 disabled:opacity-50 border border-gray-300"
            whileHover={shouldReduceMotion ? {} : { 
              scale: 1.05
            }}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: 'transform, background-color' }}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
          <motion.button
            onClick={onNext}
            disabled={isTransitioning}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 transition-all duration-150 disabled:opacity-50 border border-gray-300"
            whileHover={shouldReduceMotion ? {} : { 
              scale: 1.05
            }}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: 'transform, background-color' }}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        </motion.div>

        {/* Timeline Navigation - четкие индикаторы */}
        <motion.div 
          className="flex items-center justify-between pt-3 sm:pt-4 md:pt-6 border-t border-gray-200"
          animate={{
            opacity: isTransitioning ? 0.5 : 1,
            y: isTransitioning ? 3 : 0,
            transition: { duration: 0.3, delay: 0.25 }
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            {allEvents.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => onEventChange(index, index > eventIndex ? 'next' : 'prev')}
                disabled={isTransitioning}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                  index === eventIndex 
                    ? `bg-gradient-to-r ${currentEvent.yearGradient} scale-125` 
                    : 'bg-gray-400 hover:bg-gray-500'
                }`}
                animate={{
                  opacity: isTransitioning ? 0.6 : 1,
                  scale: index === eventIndex 
                    ? (isTransitioning ? 1.1 : 1.25) 
                    : (isTransitioning ? 0.8 : 1),
                  transition: { duration: 0.2 }
                }}
                whileHover={shouldReduceMotion ? {} : { 
                  scale: index === eventIndex ? 1.4 : 1.2 
                }}
                whileTap={{ scale: 0.9 }}
                style={{ willChange: 'transform, background' }}
              />
            ))}
          </div>
          
          <motion.div 
            className="text-xs sm:text-sm bg-gray-100 px-2 py-1 rounded-full border border-gray-300"
            animate={{
              opacity: isTransitioning ? 0.5 : 1,
              transition: { duration: 0.2 }
            }}
            style={{ color: '#374151' }} // Принудительно устанавливаем темно-серый цвет
          >
            {eventIndex + 1} из {totalEvents}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
});

ModalText.displayName = 'ModalText';
