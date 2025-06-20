// components/about/AboutFacilities.tsx (обновленная версия)
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { FacilitySmoothSlider } from "./facilities/FacilitySmoothSlider"; // Используем новый компонент
import { FacilityGrid } from "./facilities/FacilityGrid";
import { AdditionalFeatures } from "./facilities/AdditionalFeatures";
import { facilitiesData } from "./facilities/facilitiesData";
import { useAutoplay } from "./facilities/useAutoplay";

export function AboutFacilities() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoplayActive, setIsAutoplayActive] = useState(true);

  const handleSlideChange = (newIndex: number) => {
    if (isTransitioning || newIndex === activeSlide) return;
    
    setIsTransitioning(true);
    setActiveSlide(newIndex);
    
    // Сброс состояния перехода
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600); // Увеличили время для плавности
  };

  const nextSlide = () => {
    const newIndex = (activeSlide + 1) % facilitiesData.length;
    handleSlideChange(newIndex);
  };

  const prevSlide = () => {
    const newIndex = (activeSlide - 1 + facilitiesData.length) % facilitiesData.length;
    handleSlideChange(newIndex);
  };

  // Автоплей с паузой при наведении
  const { pause, resume } = useAutoplay({
    isPlaying: isAutoplayActive && isInView,
    onNext: nextSlide,
    delay: 5000 // Увеличили интервал
  });

  const handleMouseEnter = () => {
    setIsAutoplayActive(false);
    pause();
  };

    const handleMouseLeave = () => {
    setIsAutoplayActive(true);
    resume();
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Наши возможности
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Современная инфраструктура для комфортных и эффективных тренировок
          </p>
        </motion.div>

        {/* Main Facility Slider - с обработчиками мыши для автоплея */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="no-white-background"
        >
          <FacilitySmoothSlider
            facilities={facilitiesData}
            activeSlide={activeSlide}
            isTransitioning={isTransitioning}
            onNext={nextSlide}
            onPrev={prevSlide}
            onSlideChange={handleSlideChange}
            isInView={isInView}
          />
        </div>

        {/* Facility Grid */}
        <FacilityGrid
          facilities={facilitiesData}
          activeSlide={activeSlide}
          onSlideChange={handleSlideChange}
          isInView={isInView}
        />

        {/* Additional Features */}
        <AdditionalFeatures isInView={isInView} />
      </div>
    </section>
  );
}

