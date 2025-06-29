// components/about/facilities/FacilityGrid.tsx
"use client";

import { motion } from "framer-motion";

interface FacilityGridProps {
  facilities: any[];
  activeSlide: number;
  onSlideChange: (index: number) => void;
  isInView: boolean;
}

export function FacilityGrid({
  facilities,
  activeSlide,
  onSlideChange,
  isInView
}: FacilityGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.4
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
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
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
    >
      {facilities.map((facility, index) => {
        const FacilityIcon = facility.icon;
        const isActive = index === activeSlide;
        
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className="cursor-pointer group"
            onClick={() => onSlideChange(index)}
            whileHover={{ 
              y: -8,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-500 border-2 relative overflow-hidden ${
                isActive 
                  ? 'border-blue-500 shadow-blue-100 shadow-xl' 
                  : 'border-transparent hover:shadow-xl'
              }`}
              animate={{
                scale: isActive ? 1.02 : 1,
                boxShadow: isActive 
                  ? "0 20px 40px rgba(59, 130, 246, 0.15)" 
                  : "0 4px 20px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeCard"
                  className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-2xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Icon with Enhanced Animation */}
              <motion.div 
                className={`relative w-12 h-12 bg-gradient-to-r ${facility.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                animate={{
                  rotate: isActive ? [0, 5, -5, 0] : 0,
                  scale: isActive ? 1.1 : 1
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: isActive ? 1 : 0
                }}
              >
                <FacilityIcon className="h-6 w-6 text-white" />
                
                {/* Pulse Effect for Active Card */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-white/30 rounded-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>
              
              {/* Content */}
              <div className="relative z-10">
                <motion.h3 
                  className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isActive ? 'text-blue-600' : 'text-gray-900'
                  }`}
                  animate={{
                    scale: isActive ? 1.05 : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {facility.name}
                </motion.h3>
                
                <motion.p 
                  className="text-gray-600 text-sm leading-relaxed"
                  animate={{
                    opacity: isActive ? 1 : 0.8
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {facility.description}
                </motion.p>
              </div>

              {/* Hover Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
