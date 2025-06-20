"use client";

import { motion } from "framer-motion";
import { Home, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BackToHomeButton() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: 180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: 0.5,
        type: "spring",
        stiffness: 200
      }}
      className="fixed top-10 right-8 z-50"
    >
      <Button
        onClick={() => router.push("/")}
        className="group relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-green-500 to-yellow-500 hover:from-yellow-500 hover:via-green-500 hover:via-blue-500 hover:via-purple-500 hover:to-pink-500 text-white p-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-700 border-2 border-white/30"
        size="lg"
      >
        {/* Анимированный голографический фон */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/50 via-purple-400/50 via-blue-400/50 via-green-400/50 to-yellow-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full animate-pulse"></div>
        
        {/* Вращающийся градиент */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
        ></motion.div>

        {/* Контент кнопки */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-10 flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
          <Home className="h-6 w-6" />
          <span className="hidden sm:inline font-bold text-lg">Главная</span>
        </motion.div>

        {/* Светящиеся частицы */}
        <div className="absolute inset-0 rounded-full">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${20 + i * 10}%`,
                left: `${15 + i * 12}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </Button>
    </motion.div>
  );
}
