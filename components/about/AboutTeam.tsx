// components/about/AboutTeam.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Award, Users, ArrowRight, Router } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function AboutTeam() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const router = useRouter()

  const teamMembers = [
    {
      name: "Александр Петров",
      role: "Главный тренер",
      experience: "8 лет опыта",
      specialization: "Силовые тренировки",
      achievements: ["Мастер спорта", "Сертификат ACSM"],
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749142357/about-images/j4w2euuccfofboyznwir.webp",
      rating: 4.9,
      clients: 200
    },
    {
      name: "Мария Иванова",
      role: "Тренер по йоге",
      experience: "6 лет опыта",
      specialization: "Йога и растяжка",
      achievements: ["200h YTT", "Инструктор пилатеса"],
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749142472/about-images/rnjajwinebmvpaayw9xw.webp",
      rating: 4.8,
      clients: 150
    },
    {
      name: "Дмитрий Козлов",
      role: "Фитнес-директор",
      experience: "10 лет опыта",
      specialization: "Функциональные тренировки",
      achievements: ["CrossFit Level 2", "Нутрициолог"],
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749142549/about-images/i4gfpqf7vwgm7iq1hqgf.webp",
      rating: 4.9,
      clients: 300
    },
    {
      name: "Елена Смирнова",
      role: "Тренер групповых программ",
      experience: "5 лет опыта",
      specialization: "Аэробика и танцы",
      achievements: ["Хореограф", "Сертификат Les Mills"],
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749142652/about-images/f9jdxmf5wqzlwuqnjwjk.webp",
      rating: 4.7,
      clients: 180
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
            Познакомьтесь с нашей командой
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Профессиональные тренеры с многолетним опытом, готовые помочь вам достичь ваших целей
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                {/* Image */}
                <div className="relative overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={300}
                    height={400}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold">{member.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  
                  <p className="text-blue-600 font-semibold mb-2">
                    {member.role}
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {member.specialization}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Award className="h-4 w-4" />
                      {member.experience}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="h-4 w-4" />
                      {member.clients}+ клиентов
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="space-y-2">
                    {member.achievements.map((achievement, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={() => router.push("/trainers")}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Познакомиться с тренерами
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
