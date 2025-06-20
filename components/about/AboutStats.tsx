// components/about/AboutStats.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Users, Award, Clock, TrendingUp } from "lucide-react";

export function AboutStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const stats = [
    {
      icon: Users,
      number: 5000,
      suffix: "+",
      label: "Активных участников",
      description: "Присоединились к нашему сообществу",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Award,
      number: 50,
      suffix: "+",
      label: "Профессиональных тренеров",
      description: "С сертификатами и многолетним опытом",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Clock,
      number: 100000,
      suffix: "+",
      label: "Часов тренировок",
      description: "Проведено за последний год",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: TrendingUp,
      number: 98,
      suffix: "%",
      label: "Довольных клиентов",
      description: "Рекомендуют нас друзьям",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Наши достижения в цифрах
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Результаты, которыми мы гордимся и которые мотивируют нас становиться еще лучше
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              stat={stat}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, index, isInView }: { stat: any, index: number, isInView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        const duration = 2000;
        const steps = 60;
        const stepValue = stat.number / steps;
        let currentStep = 0;

        const counter = setInterval(() => {
          currentStep++;
          setCount(Math.min(Math.floor(stepValue * currentStep), stat.number));
          
          if (currentStep >= steps) {
            clearInterval(counter);
          }
        }, duration / steps);

        return () => clearInterval(counter);
      }, index * 200);

      return () => clearTimeout(timer);
    }
  }, [isInView, stat.number, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group min-h-[280px]"
    >
      <div className="h-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 border border-white/20">
        <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <stat.icon className="h-8 w-8 text-white" />
        </div>
        
        <div className="text-4xl md:text-3xl font-bold text-white mb-2">
          {count.toLocaleString()}{stat.suffix}
        </div>
        
        <h3 className="text-md font-semibold text-blue-200 mb-2">
          {stat.label}
        </h3>
        
        <p className="text-blue-300 text-sm">
          {stat.description}
        </p>
      </div>
    </motion.div>
  );
}
