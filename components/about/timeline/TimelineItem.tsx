// components/about/timeline/TimelineItem.tsx
"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import { TimelineEvent } from "./hooks/useTimelineData";

interface TimelineItemProps {
  event: TimelineEvent;
  index: number;
  isInView: boolean;
  onClick: () => void;
  isImageVariant?: boolean;
}

export const TimelineItem = memo<TimelineItemProps>(({ 
  event, 
  index, 
  isInView, 
  onClick, 
  isImageVariant = false 
}) => {
  if (isImageVariant) {
    return (
      <motion.div
        initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
        transition={{ duration: 0.8, delay: index * 0.2 }}
        className="flex-1 max-w-lg"
      >
        <div 
          className="relative overflow-hidden rounded-2xl shadow-lg group cursor-pointer transform hover:scale-105 transition-all duration-300 will-change-transform"
          onClick={onClick}
        >
          <Image
            src={event.image}
            alt={`${event.year} - ${event.title}`}
            width={400}
            height={300}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform"
            priority={index < 2}
            loading={index < 2 ? "eager" : "lazy"}
          />
          
          <div className={`absolute inset-0 bg-gradient-to-br ${event.imageGradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-500"></div>
          
                    <div className={`absolute top-4 left-4 bg-gradient-to-r ${event.yearGradient} text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-all duration-300`}>
            {event.year}
          </div>

          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 border border-white/30">
            <Eye className="w-5 h-5 text-white" />
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-center">
            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Нажмите для подробностей
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className="flex-1 max-w-lg"
    >
      <div className={`${event.gradient} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border ${event.borderColor} relative overflow-hidden group`}>
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Decorative corner element */}
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${event.yearGradient} opacity-10 rounded-bl-full`}></div>
        
        {/* Floating icon */}
        <div className={`absolute top-4 right-4 w-8 h-8 ${event.iconColor} opacity-20`}>
          <event.icon className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${event.yearGradient} rounded-xl text-white font-bold text-lg mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
            {event.year}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {event.title}
          </h3>
          
          <p className="text-gray-700 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </motion.div>
  );
});

TimelineItem.displayName = 'TimelineItem';
