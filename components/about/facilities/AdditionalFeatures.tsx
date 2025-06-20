// components/about/facilities/AdditionalFeatures.tsx
"use client";

import { motion } from "framer-motion";
import { additionalFeaturesData } from "./facilitiesData";

interface AdditionalFeaturesProps {
  isInView: boolean;
}

export function AdditionalFeatures({ isInView }: AdditionalFeaturesProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.8,
        staggerChildren: 0.2,
        delayChildren: 1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
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
      className="bg-white rounded-3xl p-8 shadow-lg relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      <motion.h3 
        variants={itemVariants}
        className="text-2xl font-bold text-gray-900 mb-8 text-center relative z-10"
      >
        Дополнительные удобства
      </motion.h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {additionalFeaturesData.map((feature, index) => {
          const FeatureIcon = feature.icon;
          
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center group"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div 
                className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}
                whileHover={{ 
                  rotate: [0, -10, 10, 0],
                  scale: 1.1
                }}
                transition={{ duration: 0.5 }}
              >
                <FeatureIcon className="h-8 w-8 text-white" />
                
                {/* Pulse Effect on Hover */}
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              <motion.h4 
                className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300"
                variants={itemVariants}
              >
                {feature.title}
              </motion.h4>
              
              <motion.p 
                className="text-gray-600 leading-relaxed"
                variants={itemVariants}
              >
                {feature.description}
              </motion.p>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [360, 180, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  );
}
