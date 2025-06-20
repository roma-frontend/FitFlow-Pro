// components/about/timeline/hooks/useTimelineData.ts
import { useMemo } from 'react';
import { Calendar, TrendingUp, Users, Award, Rocket } from "lucide-react";

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  icon: any;
  gradient: string;
  yearGradient: string;
  borderColor: string;
  iconColor: string;
  imageGradient: string;
  achievements: string[];
}

export const useTimelineData = () => {
  const timelineEvents = useMemo<TimelineEvent[]>(() => [
    {
      year: 2016,
      title: "Основание FitAccess",
      description: "Открытие первого фитнес-центра с современным оборудованием и командой из 10 тренеров",
      fullDescription: "В 2016 году мы открыли наш первый фитнес-центр площадью 800 кв.м. с современным оборудованием от ведущих мировых производителей. Команда из 10 сертифицированных тренеров была готова помочь каждому клиенту достичь своих фитнес-целей. Мы начинали с базовых программ силовых тренировок и кардио, но уже тогда знали, что это только начало большого пути.",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749143937/about-images/ak5x7yoeyxsd5su2pzgg.webp",
      icon: Calendar,
      gradient: "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
      yearGradient: "from-amber-500 to-orange-500",
      borderColor: "border-amber-200",
      iconColor: "text-amber-600",
      imageGradient: "from-amber-500/80 via-orange-500/60 to-yellow-500/40",
      achievements: ["800 кв.м площади", "10 тренеров", "50+ клиентов в первый месяц", "Современное оборудование"]
    },
    {
      year: 2018,
      title: "Расширение команды",
      description: "Привлечение 25+ сертифицированных тренеров и запуск программ групповых тренировок",
      fullDescription: "Через два года работы мы значительно расширили нашу команду, привлекли более 25 сертифицированных тренеров различных специализаций. Запустили программы групповых тренировок: йогу, пилатес, функциональный тренинг, танцевальные направления. Открыли детскую секцию и программы для людей старшего возраста.",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749144061/about-images/a6ja50k5lxtpym0rc1ji.webp", 
      icon: Users,
      gradient: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50",
      yearGradient: "from-emerald-500 to-green-500",
      borderColor: "border-emerald-200",
      iconColor: "text-emerald-600",
      imageGradient: "from-emerald-500/80 via-green-500/60 to-teal-500/40",
      achievements: ["25+ тренеров", "15 видов групповых программ", "Детская секция", "1000+ активных клиентов"]
    },
    {
      year: 2020,
      title: "Цифровая трансформация",
      description: "Запуск мобильного приложения и онлайн-тренировок в период пандемии",
      fullDescription: "2020 год стал переломным - мы быстро адаптировались к новым условиям и запустили собственное мобильное приложение. Внедрили систему онлайн-тренировок, виртуальные консультации с тренерами, систему записи и оплаты через приложение. Это позволило нам не только сохранить, но и увеличить количество клиентов.",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749144141/about-images/agzorw1oamdmq8gin8av.webp",
      icon: TrendingUp,
      gradient: "bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50", 
      yearGradient: "from-violet-500 to-purple-500",
      borderColor: "border-violet-200",
      iconColor: "text-violet-600",
      imageGradient: "from-violet-500/80 via-purple-500/60 to-indigo-500/40",
      achievements: ["Мобильное приложение", "Онлайн-тренировки", "Виртуальные консультации", "Бесконтактная оплата"]
    },
    {
      year: 2022,
      title: "Признание лидерства",
      description: "Получение награды 'Лучший фитнес-центр года' и достижение 3000+ активных клиентов",
      fullDescription: "В 2022 году наши усилия были признаны на городском уровне - мы получили престижную награду 'Лучший фитнес-центр года'. К этому времени у нас было уже более 3000 активных клиентов, 40+ тренеров и мы стали лидерами в области инновационных фитнес-программ в городе.",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749144340/about-images/vjb744k38hpcel4drysp.webp",
      icon: Award,
      gradient: "bg-gradient-to-br from-rose-50 via-pink-50 to-red-50",
      yearGradient: "from-rose-500 to-pink-500", 
      borderColor: "border-rose-200",
      iconColor: "text-rose-600",
      imageGradient: "from-rose-500/80 via-pink-500/60 to-red-500/40",
      achievements: ["Награда 'Лучший фитнес-центр'", "3000+ клиентов", "40+ тренеров", "Лидер инноваций"]
    },
    {
      year: 2024,
      title: "Новые горизонты",
      description: "Планы по открытию второго филиала и запуску SPA-центра с восстановительными программами",
      fullDescription: "Сегодня мы активно работаем над расширением. В планах открытие второго филиала площадью 1200 кв.м., запуск полноценного SPA-центра с восстановительными программами, массажными кабинетами и криотерапией. Также планируем запуск программы франчайзинга для развития сети по всей стране.",
      image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749144448/about-images/ws6t2dt5qmuvpnask8uk.webp",
      icon: Rocket,
      gradient: "bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50",
      yearGradient: "from-cyan-500 to-blue-500",
      borderColor: "border-cyan-200",
      iconColor: "text-cyan-600",
      imageGradient: "from-cyan-500/80 via-sky-500/60 to-blue-500/40",
      achievements: ["Второй филиал 1200 кв.м", "SPA-центр", "Программа франчайзинга", "Криотерапия"]
    }
  ], []);

  return { timelineEvents };
};
