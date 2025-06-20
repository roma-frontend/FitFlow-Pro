// components/about/facilities/FacilitySmoothSlider.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface FacilitySmoothSliderProps {
  facilities: any[];
  activeSlide: number;
  isTransitioning: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSlideChange: (index: number) => void;
  isInView: boolean;
}

export function FacilitySmoothSlider({
  facilities,
  activeSlide,
  isTransitioning,
  onNext,
  onPrev,
  onSlideChange,
  isInView
}: FacilitySmoothSliderProps) {
  const [direction, setDirection] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(facilities.length).fill(false));

  const currentFacility = facilities[activeSlide];
  const CurrentIcon = currentFacility.icon;

  // Предзагрузка всех изображений
  useEffect(() => {
    facilities.forEach((facility, index) => {
      const img = new window.Image();
      img.onload = () => {
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
      img.src = facility.image;
    });
  }, [facilities]);

  const crossfadeVariants = {
    enter: {
      opacity: 0,
      scale: 1.05,
      filter: 'blur(2px)',
    },
    center: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: 'blur(2px)',
    },
  };

  const contentVariants = {
    enter: {
      y: 30,
      opacity: 0,
    },
    center: {
      y: 0,
      opacity: 1,
    },
    exit: {
      y: -30,
      opacity: 0,
    },
  };

  const handleNext = () => {
    setDirection(1);
    onNext();
  };

  const handlePrev = () => {
    setDirection(-1);
    onPrev();
  };

  const handleDotClick = (index: number) => {
    setDirection(index > activeSlide ? 1 : -1);
    onSlideChange(index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative max-w-6xl mx-auto mb-16"
    >
      {/* Container with dark background */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gray-900 no-white-background">
        {/* Permanent background layer */}
        <div className="absolute inset-0 bg-gray-900 z-0" />
        
        {/* Image layers - все изображения рендерятся одновременно */}
        <div className="relative w-full h-96 md:h-[500px]">
          {facilities.map((facility, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              animate={{
                opacity: index === activeSlide ? 1 : 0,
                scale: index === activeSlide ? 1 : 1.05,
                filter: index === activeSlide ? 'blur(0px)' : 'blur(2px)',
              }}
              transition={{
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }}
              style={{ zIndex: index === activeSlide ? 10 : 5 }}
            >
              <Image
                src={facility.image}
                alt={facility.name}
                fill
                className="object-cover"
                priority={index === 0}
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              
              {/* Loading placeholder */}
              {!imagesLoaded[index] && (
                <div className="absolute inset-0 bg-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
                </div>
              )}
            </motion.div>
          ))}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-20" />
        </div>
        
        {/* Content with smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ 
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="absolute bottom-0 left-0 right-0 p-8 text-white z-30"
          >
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-3 mb-4"
            >
              <motion.div 
                className={`w-12 h-12 bg-gradient-to-r ${currentFacility.color} rounded-xl flex items-center justify-center backdrop-blur-sm`}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5,
                  boxShadow: "0 8px 32px rgba(255,255,255,0.2)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <CurrentIcon className="h-6 w-6 text-white" />
              </motion.div>
              <h3 className="text-3xl font-bold drop-shadow-lg">{currentFacility.name}</h3>
            </motion.div>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl mb-6 max-w-2xl drop-shadow-md"
            >
              {currentFacility.description}
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-2"
            >
              {currentFacility.features.map((feature: string, index: number) => (
                <motion.div
                  key={`${activeSlide}-${feature}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.4 + index * 0.1,
                    type: "spring",
                    stiffness: 400
                  }}
                >
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
                    {feature}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.button
          onClick={handlePrev}
          disabled={isTransitioning}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition-all duration-300 disabled:opacity-50 group z-40 border border-white/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
        </motion.button>
        
        <motion.button
          onClick={handleNext}
          disabled={isTransitioning}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition-all duration-300 disabled:opacity-50 group z-40 border border-white/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
        </motion.button>
      </div>

      {/* Indicators */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="flex justify-center mt-6 gap-2"
      >
        {facilities.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => handleDotClick(index)}
            disabled={isTransitioning}
            className={`relative overflow-hidden rounded-full transition-all duration-500 ${
              index === activeSlide 
                ? 'bg-blue-600 w-8 h-3 shadow-lg shadow-blue-500/30' 
                : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {index === activeSlide && (
              <motion.div
                layoutId="smoothActiveIndicator"
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          animate={{ width: `${((activeSlide + 1) / facilities.length) * 100}%` }}
          transition={{ 
            duration: 0.6, 
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </motion.div>
  );
}
