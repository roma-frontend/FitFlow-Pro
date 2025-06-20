// components/about/testimonials/CallToAction.tsx
"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface CallToActionProps {
  isInView: boolean;
  isMounted: boolean;
}

export function CallToAction({ isInView, isMounted }: CallToActionProps) {
  // Мемоизируем фиксированные позиции для частиц
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({ // Уменьшили количество с 20 до 12
      id: i,
      left: (i * 8.33) % 100, // Более равномерное распределение
      top: (i * 11.11) % 100,
      delay: i * 0.2,
    }));
  }, []);

  // Мемоизируем рендер частиц
  const particlesRender = useMemo(() => {
    if (!isMounted) return null;
    
    return particles.map((particle) => (
      <motion.div
        key={particle.id}
        className="absolute w-2 h-2 bg-white rounded-full"
        style={{
          left: `${particle.left}%`,
          top: `${particle.top}%`,
        }}
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3,
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
      transition={{ duration: 0.8, delay: 2 }}
      className="text-center mt-16"
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {particlesRender}
        </div>

        <div className="relative z-10">
          <motion.h3
            className="text-2xl md:text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 2.2 }}
          >
            Готовы изменить свою жизнь?
          </motion.h3>
          
          <motion.p
            className="text-lg mb-6 opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 2.4 }}
          >
            Присоединяйтесь к тысячам довольных клиентов FitAccess
          </motion.p>
          
          <motion.button
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 2.6, type: "spring" }}
          >
            Начать тренировки
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
