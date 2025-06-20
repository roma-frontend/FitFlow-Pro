// components/about/facilities/facilitiesData.ts
import { 
  Dumbbell, 
  Users, 
  Waves, 
  Heart, 
  Zap, 
  Shield,
  MapPin
} from "lucide-react";

export const facilitiesData = [
  {
    name: "Тренажерный зал",
    description: "Современное оборудование от ведущих мировых производителей",
    image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749141729/about-images/oqqokgej7dmw3d91o531.avif",
    features: ["50+ тренажеров", "Свободные веса", "Кардио-зона"],
    icon: Dumbbell,
    color: "from-blue-500 to-blue-600"
  },
  {
    name: "Групповые залы",
    description: "Просторные залы для групповых тренировок с профессиональным звуком",
    image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749141728/about-images/ikr6tc8jjgjkwxelbl9e.jpg",
    features: ["3 зала", "Зеркальные стены", "Профессиональный звук"],
    icon: Users,
    color: "from-green-500 to-green-600"
  },
  {
    name: "Бассейн",
    description: "25-метровый бассейн с системой очистки воды последнего поколения",
    image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749141729/about-images/hojidmxqrgmp3vvmodag.avif",
    features: ["25м длина", "4 дорожки", "Детская зона"],
    icon: Waves,
    color: "from-cyan-500 to-blue-500"
  },
  {
    name: "SPA-зона",
    description: "Расслабляющие процедуры для восстановления после тренировок",
    image: "https://res.cloudinary.com/dgbtipi5o/image/upload/v1749142228/about-images/kxjtecg7bawvwsuoleex.jpg",
    features: ["Сауна", "Массажные кабинеты", "Зона отдыха"],
    icon: Heart,
    color: "from-pink-500 to-red-500"
  }
];

export const additionalFeaturesData = [
  {
    icon: Shield,
    title: "Безопасность",
    description: "Система видеонаблюдения и контроля доступа",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Zap,
    title: "Технологии",
    description: "Wi-Fi, мобильное приложение, умные тренажеры",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: MapPin,
    title: "Расположение",
    description: "Удобное расположение в центре города",
    color: "from-purple-500 to-pink-500"
  }
];
