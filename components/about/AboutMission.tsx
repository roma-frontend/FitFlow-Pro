// components/about/AboutMission.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Eye, Heart, Users, Award, Zap } from "lucide-react";

export function AboutMission() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const missionCards = [
    {
      icon: Target,
      title: "Наша миссия",
      description: "Вдохновлять людей на здоровый образ жизни и помогать достигать фитнес-целей через профессиональный подход и современные методики тренировок",
      gradient: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
      iconGradient: "from-blue-500 to-indigo-600",
      borderGradient: "hover:border-blue-200"
    },
    {
      icon: Eye,
      title: "Наше видение", 
      description: "Стать ведущим фитнес-центром, где каждый найдет свой путь к здоровью, независимо от возраста и уровня подготовки",
      gradient: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50",
      iconGradient: "from-green-500 to-emerald-600",
      borderGradient: "hover:border-green-200"
    },
    {
      icon: Heart,
      title: "Наши ценности",
      description: "Профессионализм, забота о клиентах и индивидуальный подход к каждому. Мы создаем атмосферу поддержки и мотивации",
      gradient: "bg-gradient-to-br from-rose-50 via-pink-50 to-red-50",
      iconGradient: "from-rose-500 to-pink-600", 
      borderGradient: "hover:border-rose-200"
    }
  ];

  const stats = [
    {
      icon: Users,
      number: "5000+",
      label: "Довольных клиентов",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: Award,
      number: "50+",
      label: "Сертифицированных тренеров",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      number: "8",
      label: "Лет успешной работы",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section id="mission" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
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
            Кто мы и что нас вдохновляет
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FitAccess — это больше чем фитнес-центр. Это место, где рождаются новые привычки и достигаются цели
          </p>
        </motion.div>

        {/* Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {missionCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group h-full"
            >
              <div className={`${card.gradient} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 ${card.borderGradient} relative overflow-hidden h-full flex flex-col`}>
                {/* Subtle overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${card.iconGradient} opacity-10 rounded-bl-full`}></div>
                
                <div className={`w-16 h-16 bg-gradient-to-r ${card.iconGradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-lg`}>
                  <card.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">
                  {card.title}
                </h3>
                
                <p className="text-gray-700 leading-relaxed relative z-10 flex-grow">
                  {card.description}
                </p>

                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-3xl p-8 shadow-lg relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="absolute inset-0 bg-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`
              }}
            ></div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center relative z-10">
            Наши достижения говорят сами за себя
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="text-center group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
