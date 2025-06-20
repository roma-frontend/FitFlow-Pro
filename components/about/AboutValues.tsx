// components/about/AboutValues.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Lightbulb, Users, Star, Rocket, Shield, Heart } from "lucide-react";

export function AboutValues() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const values = [
    {
      icon: Lightbulb,
      title: "Инновации",
      description: "Мы постоянно внедряем новые технологии и методики для достижения лучших результатов",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: Users,
      title: "Сообщество",
      description: "Создаем дружную атмосферу, где каждый чувствует себя частью большой фитнес-семьи",
      gradient: "from-blue-400 to-purple-500"
    },
    {
      icon: Star,
      title: "Качество",
      description: "Высокие стандарты во всем: от оборудования до сервиса и профессионализма тренеров",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: Rocket,
      title: "Прогресс",
      description: "Помогаем каждому клиенту достигать новых высот и превосходить собственные ожидания",
      gradient: "from-green-400 to-blue-500"
    },
    {
      icon: Shield,
      title: "Безопасность",
      description: "Обеспечиваем безопасную среду для тренировок с соблюдением всех стандартов",
      gradient: "from-emerald-400 to-teal-500"
    },
    {
      icon: Heart,
      title: "Забота",
      description: "Индивидуальный подход к каждому клиенту с учетом его целей и особенностей",
      gradient: "from-red-400 to-pink-500"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Наши ценности
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Принципы, которые определяют наш подход к работе и отношения с клиентами
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className={`relative w-16 h-16 bg-gradient-to-r ${value.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Content */}
                <div className="relative">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                    {value.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {value.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${value.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
