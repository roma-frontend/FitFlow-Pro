// components/about/timeline/FutureVisionCard.tsx
"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { Rocket } from "lucide-react";

interface FutureVisionCardProps {
  isInView: boolean;
}

export const FutureVisionCard = memo<FutureVisionCardProps>(({ isInView }) => {
  const futureItems = [
    { year: "2025", title: "Второй филиал", gradient: "from-indigo-500 to-purple-500" },
    { year: "2026", title: "SPA-центр", gradient: "from-purple-500 to-pink-500" },
    { year: "2027", title: "Франшиза", gradient: "from-pink-500 to-red-500" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay: 1 }}
      className="mt-16"
    >
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 shadow-lg border border-purple-100 relative overflow-hidden group">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <div 
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M15 0l15 15-15 15L0 15z'/%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
        </div>

        {/* Animated Background Orbs */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
            <Rocket className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors duration-300">
            Будущее FitAccess
          </h3>
          
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Мы продолжаем развиваться и внедрять инновационные подходы к фитнесу. 
            Наша цель — стать эталоном здорового образа жизни для всего города.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {futureItems.map((item, index) => (
              <div 
                key={item.year}
                className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/70 hover:scale-105 hover:shadow-lg transition-all duration-300 group/card"
              >
                <div className={`text-2xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-2 group-hover/card:scale-110 transition-transform duration-300`}>
                  {item.year}
                </div>
                <div className="text-gray-700">{item.title}</div>
                <div className={`w-full h-1 bg-gradient-to-r ${item.gradient} rounded-full mt-3 scale-x-0 group-hover/card:scale-x-100 transition-transform duration-500`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

FutureVisionCard.displayName = 'FutureVisionCard';
