// components/about/timeline/modal/ModalImage.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { memo, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { TimelineEvent } from "../hooks/useTimelineData";

interface ModalImageProps {
  event: TimelineEvent;
  eventIndex: number;
  direction: 'next' | 'prev' | null;
  isTransitioning: boolean;
}

export const ModalImage = memo<ModalImageProps>(({
  event,
  eventIndex,
  direction,
  isTransitioning
}) => {
  const [displayEvent, setDisplayEvent] = useState(event);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  // Исправляем типизацию useRef
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const IconComponent = displayEvent.icon;

  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    if (isTransitioning) {
      return;
    }

    updateTimeoutRef.current = setTimeout(() => {
      setDisplayEvent(event);
      setIsImageLoaded(false);
    }, 50);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [event, isTransitioning]);

  return (
    <div className="relative lg:w-1/2 h-[18rem] xs:h-48 sm:h-64 lg:h-auto overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{ 
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
        animate={{
          opacity: isTransitioning ? 0.8 : 1,
          scale: isTransitioning ? 1.01 : 1,
          transition: {
            duration: 0.25,
            ease: "easeInOut"
          }
        }}
      >
        <Image
          src={displayEvent.image}
          alt={`${displayEvent.year} - ${displayEvent.title}`}
          fill
          className="object-cover"
          priority
          quality={90}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
          style={{ 
            willChange: 'transform, opacity, filter',
            filter: isTransitioning ? 'blur(0.5px) brightness(0.95)' : 'blur(0px) brightness(1)',
            transform: isTransitioning ? 'scale(1.02)' : 'scale(1)',
            transition: 'filter 0.25s ease-out, transform 0.25s ease-out'
          }}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${displayEvent.imageGradient}`}
          animate={{
            opacity: isTransitioning ? 0.4 : 0.3,
            transition: { duration: 0.25 }
          }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/30"
          animate={{
            opacity: isTransitioning ? 0.9 : 1,
            transition: { duration: 0.25 }
          }}
        />
        
        <motion.div 
          className={`absolute top-2 left-2 sm:top-3 sm:left-3 md:top-6 md:left-6 bg-gradient-to-r ${displayEvent.yearGradient} text-white px-2 py-1 sm:px-3 sm:py-2 md:px-6 md:py-3 rounded-full font-bold text-xs sm:text-sm md:text-lg shadow-lg backdrop-blur-sm`}
          animate={{
            scale: isTransitioning ? 0.95 : 1,
            opacity: isTransitioning ? 0.8 : 1,
            y: isTransitioning ? 2 : 0,
            transition: {
              duration: 0.25,
              ease: "easeOut"
            }
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          {displayEvent.year}
        </motion.div>

        <motion.div 
          className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-6 md:right-6 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-r ${displayEvent.yearGradient} rounded-full flex items-center justify-center shadow-lg`}
          animate={{
            scale: isTransitioning ? 0.9 : 1,
            opacity: isTransitioning ? 0.8 : 1,
            rotate: isTransitioning ? 5 : 0,
            transition: {
              duration: 0.25,
              ease: "easeOut"
            }
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
        </motion.div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-900/5 via-transparent to-gray-900/5"
          animate={{
            opacity: isTransitioning ? 1 : 0,
            transition: { duration: 0.15 }
          }}
          style={{ willChange: 'opacity' }}
        />
      </motion.div>
    </div>
  );
});

ModalImage.displayName = 'ModalImage';
