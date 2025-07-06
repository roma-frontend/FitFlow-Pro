// app/trainer/[slug]/page.tsx (новый файл)
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Heart,
  Dumbbell,
  Flame,
  Target,
  Users,
  Crown,
  CheckCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// Данные тренеров
const trainersData: Record<string, any> = {
  "anna-petrova": {
    name: "Анна Петрова",
    specialty: "Йога и стретчинг",
    rating: 4.9,
    experience: "5+ лет",
    price: "от 2000₽/час",
    avatar: Heart,
    gradient: "from-pink-400 to-purple-600",
    color: "pink",
    badges: ["Йога", "Пилатес", "Стретчинг"],
    description:
      "Сертифицированный инструктор йоги с международным дипломом. Помогу обрести гармонию тела и духа через древние практики.",
    bio: "Анна начала заниматься йогой 10 лет назад и с тех пор полностью посвятила себя этому искусству. Прошла обучение в Индии у мастеров традиционной Хатха-йоги.",
    certifications: [
      "Сертифицированный инструктор Хатха-йоги (200 часов)",
      "Инструктор Виньяса-йоги (300 часов)",
      "Сертификат по анатомии и физиологии",
      "Мастер-класс по медитации и пранаяме",
    ],
    achievements: [
      "Более 1000 проведенных занятий",
      "Участник международных йога-фестивалей",
      'Автор методики "Йога для начинающих"',
      "Средний рейтинг клиентов 4.9/5",
    ],
    schedule: [
      { day: "Понедельник", time: "09:00 - 18:00" },
      { day: "Вторник", time: "10:00 - 19:00" },
      { day: "Среда", time: "09:00 - 18:00" },
      { day: "Четверг", time: "10:00 - 19:00" },
      { day: "Пятница", time: "09:00 - 17:00" },
      { day: "Суббота", time: "10:00 - 16:00" },
      { day: "Воскресенье", time: "Выходной" },
    ],
    services: [
      {
        name: "Индивидуальное занятие йогой",
        price: "2000₽",
        duration: "60 мин",
      },
      { name: "Парное занятие", price: "3000₽", duration: "60 мин" },
      {
        name: "Мини-группа (3-4 чел.)",
        price: "1200₽/чел",
        duration: "75 мин",
      },
      { name: "Консультация по питанию", price: "1500₽", duration: "45 мин" },
    ],
  },
  "mikhail-volkov": {
    name: "Михаил Волков",
    specialty: "Силовые тренировки",
    rating: 4.8,
    experience: "8+ лет",
    price: "от 2500₽/час",
    avatar: Dumbbell,
    gradient: "from-blue-500 to-indigo-700",
    color: "blue",
    badges: ["Силовые", "Кроссфит", "Пауэрлифтинг"],
    description:
      "Мастер спорта по пауэрлифтингу. Помогу набрать мышечную массу и значительно увеличить силовые показатели.",
    bio: "Михаил - действующий спортсмен и тренер с 8-летним стажем. Специализируется на силовых видах спорта и имеет звание мастера спорта по пауэрлифтингу.",
    certifications: [
      "Мастер спорта по пауэрлифтингу",
      "Сертифицированный тренер по бодибилдингу",
      "Инструктор CrossFit Level 2",
      "Специалист по спортивному питанию",
    ],
    achievements: [
      "Чемпион России по пауэрлифтингу 2019",
      "Подготовил 15+ спортсменов-разрядников",
      "Рекорд зала в жиме лежа - 180кг",
      "Более 2000 персональных тренировок",
    ],
    schedule: [
      { day: "Понедельник", time: "07:00 - 20:00" },
      { day: "Вторник", time: "07:00 - 20:00" },
      { day: "Среда", time: "07:00 - 20:00" },
      { day: "Четверг", time: "07:00 - 20:00" },
      { day: "Пятница", time: "07:00 - 18:00" },
      { day: "Суббота", time: "09:00 - 17:00" },
      { day: "Воскресенье", time: "10:00 - 16:00" },
    ],
    services: [
      {
        name: "Персональная силовая тренировка",
        price: "2500₽",
        duration: "60 мин",
      },
      {
        name: "Составление программы тренировок",
        price: "3000₽",
        duration: "90 мин",
      },
      {
        name: "Обучение технике упражнений",
        price: "2000₽",
        duration: "45 мин",
      },
      {
        name: "Консультация по спортпитанию",
        price: "1800₽",
        duration: "60 мин",
      },
    ],
  },
  "elena-smirnova": {
    name: "Елена Смирнова",
    specialty: "Кардио и похудение",
    rating: 5.0,
    experience: "6+ лет",
    price: "от 2200₽/час",
    avatar: Flame,
    gradient: "from-green-400 to-emerald-600",
    color: "green",
    badges: ["Кардио", "HIIT", "Похудение"],
    description:
      "Специалист по жиросжиганию и метаболическим тренировкам. Помогу достичь идеальной формы за короткий срок.",
    bio: "Елена - эксперт в области жиросжигания с научным подходом к тренировкам. Имеет образование в области физиологии спорта.",
    certifications: [
      "Магистр физической культуры и спорта",
      "Сертифицированный HIIT-тренер",
      "Специалист по метаболическим тренировкам",
      "Нутрициолог 1 категории",
    ],
    achievements: [
      "Помогла похудеть 200+ клиентам",
      'Автор программы "Жиросжигание за 12 недель"',
      "Спикер фитнес-конференций",
      "Рейтинг удовлетворенности клиентов 100%",
    ],
    schedule: [
      { day: "Понедельник", time: "08:00 - 19:00" },
      { day: "Вторник", time: "08:00 - 19:00" },
      { day: "Среда", time: "08:00 - 19:00" },
      { day: "Четверг", time: "08:00 - 19:00" },
      { day: "Пятница", time: "08:00 - 17:00" },
      { day: "Суббота", time: "09:00 - 15:00" },
      { day: "Воскресенье", time: "Выходной" },
    ],
    services: [
      { name: "HIIT тренировка", price: "2200₽", duration: "45 мин" },
      { name: "Кардио-силовая тренировка", price: "2400₽", duration: "60 мин" },
      {
        name: "Программа питания для похудения",
        price: "2800₽",
        duration: "90 мин",
      },
      {
        name: "Замеры и анализ состава тела",
        price: "1500₽",
        duration: "30 мин",
      },
    ],
  },
  "dmitriy-kozlov": {
    name: "Дмитрий Козлов",
    specialty: "Функциональный тренинг",
    rating: 4.7,
    experience: "7+ лет",
    price: "от 2300₽/час",
    avatar: Target,
    gradient: "from-orange-400 to-red-600",
    color: "orange",
    badges: ["TRX", "Функциональный", "Реабилитация"],
    description:
      "Эксперт функционального тренинга и реабилитации. Улучшу координацию, выносливость и функциональность движений.",
    bio: "Дмитрий специализируется на функциональных тренировках и реабилитации после травм. Работает с профессиональными спортсменами.",
    certifications: [
      "Сертифицированный TRX-инструктор",
      "Специалист по функциональному тренингу",
      "Инструктор по реабилитации",
      "Кинезиотерапевт",
    ],
    achievements: [
      "Реабилитировал 50+ спортсменов после травм",
      "Тренер сборной по легкой атлетике",
      "Автор методики восстановления",
      "Эксперт по биомеханике движений",
    ],
    schedule: [
      { day: "Понедельник", time: "09:00 - 18:00" },
      { day: "Вторник", time: "09:00 - 18:00" },
      { day: "Среда", time: "09:00 - 18:00" },
      { day: "Четверг", time: "09:00 - 18:00" },
      { day: "Пятница", time: "09:00 - 16:00" },
      { day: "Суббота", time: "10:00 - 14:00" },
      { day: "Воскресенье", time: "Выходной" },
    ],
    services: [
      { name: "Функциональная тренировка", price: "2300₽", duration: "60 мин" },
      { name: "TRX тренировка", price: "2100₽", duration: "45 мин" },
      {
        name: "Реабилитационная программа",
        price: "2800₽",
        duration: "75 мин",
      },
      {
        name: "Анализ движений и коррекция",
        price: "2500₽",
        duration: "60 мин",
      },
    ],
  },
  "olga-ivanova": {
    name: "Ольга Иванова",
    specialty: "Групповые программы",
    rating: 4.9,
    experience: "4+ года",
    price: "от 1800₽/час",
    avatar: Users,
    gradient: "from-teal-400 to-cyan-600",
    color: "teal",
    badges: ["Аэробика", "Зумба", "Степ"],
    description:
      "Энергичный тренер групповых программ. Сделаю ваши тренировки веселыми и эффективными!",
    bio: "Ольга - мастер групповых программ с невероятной энергетикой. Превращает каждую тренировку в праздник движения.",
    certifications: [
      "Инструктор групповых программ",
      "Сертифицированный Zumba-инструктор",
      "Инструктор степ-аэробики",
      "Специалист по танцевальной аэробике",
    ],
    achievements: [
      "Провела 800+ групповых занятий",
      "Чемпион по аэробике (региональный уровень)",
      "Создатель авторских хореографий",
      "Любимый тренер участников (опросы)",
    ],
    schedule: [
      { day: "Понедельник", time: "10:00 - 20:00" },
      { day: "Вторник", time: "10:00 - 20:00" },
      { day: "Среда", time: "10:00 - 20:00" },
      { day: "Четверг", time: "10:00 - 20:00" },
      { day: "Пятница", time: "10:00 - 18:00" },
      { day: "Суббота", time: "11:00 - 17:00" },
      { day: "Воскресенье", time: "11:00 - 16:00" },
    ],
    services: [
      { name: "Групповая аэробика", price: "800₽", duration: "60 мин" },
      { name: "Zumba занятие", price: "900₽", duration: "60 мин" },
      { name: "Персональное занятие", price: "1800₽", duration: "60 мин" },
      { name: "Постановка танца", price: "2500₽", duration: "90 мин" },
    ],
  },
  "aleksandr-petrov": {
    name: "Александр Петров",
    specialty: "Персональный тренинг",
    rating: 5.0,
    experience: "10+ лет",
    price: "от 5000₽/час",
    avatar: Crown,
    gradient: "from-violet-500 to-purple-700",
    color: "violet",
    badges: ["VIP", "Элитный", "Премиум"],
    description:
      "Элитный персональный тренер с 10-летним опытом. Работаю исключительно с VIP-клиентами.",
    bio: "Александр - элитный тренер, работающий с известными личностями, бизнесменами и звездами. Индивидуальный подход к каждому клиенту.",
    certifications: [
      "Мастер персонального тренинга",
      "Сертификат элитного тренера",
      "Специалист по VIP-программам",
      "Психолог спортивной мотивации",
    ],
    achievements: [
      "Тренер звезд шоу-бизнеса",
      "100% достижение целей клиентов",
      "Автор эксклюзивных методик",
      "Консультант фитнес-индустрии",
    ],
    schedule: [
      { day: "Понедельник", time: "По записи" },
      { day: "Вторник", time: "По записи" },
      { day: "Среда", time: "По записи" },
      { day: "Четверг", time: "По записи" },
      { day: "Пятница", time: "По записи" },
      { day: "Суббота", time: "По записи" },
      { day: "Воскресенье", time: "По записи" },
    ],
    services: [
      {
        name: "VIP персональная тренировка",
        price: "5000₽",
        duration: "90 мин",
      },
      {
        name: "Элитная программа трансформации",
        price: "15000₽",
        duration: "3 часа",
      },
      {
        name: "Консультация по lifestyle",
        price: "8000₽",
        duration: "120 мин",
      },
      { name: "Выездная тренировка", price: "10000₽", duration: "90 мин" },
    ],
  },
};

export default function TrainerPage() {
  const router = useRouter()
  const params = useParams();
  const slug = params.slug as string;
  const trainer = trainersData[slug];
  const [selectedService, setSelectedService] = useState(0);

  if (!trainer) {
    return (
      <div className="min-h-[100lvh] bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Тренер не найден</h2>
            <p className="text-gray-600 mb-4">
              Возможно, вы перешли по неверной ссылке
            </p>
            <a href="/trainers" className="text-blue-600 underline">
              Посмотреть всех тренеров
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const IconComponent = trainer.avatar;

  return (
    <div className="min-h-[100lvh] bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex justify-center">
              <Link href="/" className="group flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                    <Dumbbell className="h-5 w-5 text-white" />
                  </div>
                  {/* Блестки */}
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-300" />
                  <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-pink-400 opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-300 delay-150" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:bg-clip-text transition-all duration-300">
                  FitFlow Pro
                </h2>
              </Link>
            </div>

            <Link
              href="/trainers"
              className="flex items-center gap-3 px-6 py-3 h-auto bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 hover:from-blue-100/90 hover:via-white hover:to-indigo-100/90 border border-blue-200/60 hover:border-blue-300/80 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-105 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transform group-hover:-translate-x-1 transition-all duration-300" />
              Все тренеры
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero секция тренера */}
        <div className="mb-12">
          <Card className="overflow-hidden">
            <div
              className={`min-h-64 bg-gradient-to-br ${trainer.gradient} flex items-center justify-center relative p-4`}
            >
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="h-16 w-16" />
                </div>
                <h1 className="text-4xl font-bold mb-2">{trainer.name}</h1>
                <p className="text-xl opacity-90">{trainer.specialty}</p>
              </div>

              {/* Рейтинг */}
              <div className="absolute top-6 right-6">
                <div className="flex items-center bg-white/90 rounded-full px-4 py-2">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="font-bold text-gray-900">
                    {trainer.rating}
                  </span>
                  <span className="text-gray-600 ml-1">/5</span>
                </div>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Основная информация */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      О тренере
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      {trainer.description}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {trainer.bio}
                    </p>
                  </div>

                  {/* Специализации */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Специализации
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trainer.badges.map((badge: string, index: number) => (
                        <Badge
                          key={index}
                          className={`bg-${trainer.color}-100 text-${trainer.color}-800 px-3 py-1`}
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Сертификаты */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Сертификаты и образование
                    </h3>
                    <div className="space-y-2">
                      {trainer.certifications.map(
                        (cert: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                            <span className="text-gray-700">{cert}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Достижения */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Достижения
                    </h3>
                    <div className="space-y-2">
                      {trainer.achievements.map(
                        (achievement: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{achievement}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Боковая панель */}
                <div className="space-y-6">
                  {/* Быстрая информация */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Быстрая информация
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Опыт работы</p>
                          <p className="text-sm text-gray-600">
                            {trainer.experience}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">Рейтинг</p>
                          <p className="text-sm text-gray-600">
                            {trainer.rating}/5.0
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Локация</p>
                          <p className="text-sm text-gray-600">
                            FitFlow-Pro Club
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Контакты */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Контакты</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">+7 (999) 123-45-67</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {slug.replace("-", ".")}@fitclub.com
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Быстрое бронирование */}
                  <Card
                    className={`border-${trainer.color}-200 bg-${trainer.color}-50`}
                  >
                    <CardContent className="p-6 text-center">
                      <h3 className="font-bold text-lg mb-2">
                        Записаться на тренировку
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {trainer.price}
                      </p>
                      <a
                        href={`/book-trainer/${slug}`}
                        className={`block w-full bg-gradient-to-r ${trainer.gradient} text-white py-3 px-4 rounded-lg hover:opacity-90 transition-all font-medium`}
                      >
                        Забронировать
                      </a>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Услуги и цены */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Услуги и цены</CardTitle>
              <CardDescription>
                Выберите подходящий формат тренировки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trainer.services.map((service: any, index: number) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all ${selectedService === index
                        ? `border-${trainer.color}-300 bg-${trainer.color}-50`
                        : "hover:shadow-md"
                      }`}
                    onClick={() => setSelectedService(index)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">
                          {service.name}
                        </h3>
                        <Badge
                          className={`bg-${trainer.color}-100 text-${trainer.color}-800`}
                        >
                          {service.duration}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {service.price}
                        </span>
                        <Button
                          size="sm"
                          className={`bg-gradient-to-r ${trainer.gradient} hover:opacity-90 border-none`}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/book-trainer/${slug}?service=${index}`);
                          }}
                        >
                          Выбрать
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Расписание */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Расписание работы</CardTitle>
              <CardDescription>
                Время работы тренера в течение недели
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {trainer.schedule.map((day: any, index: number) => (
                  <Card key={index} className="text-center">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {day.day}
                      </h4>
                      <p
                        className={`text-sm ${day.time === "Выходной" ? "text-red-600" : "text-gray-600"}`}
                      >
                        {day.time}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Отзывы клиентов */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Отзывы клиентов</CardTitle>
              <CardDescription>
                Что говорят о тренере наши участники
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Отзыв 1 */}
                <Card className="bg-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4">
                      "Отличный тренер! Очень профессиональный подход, всегда
                      объясняет технику выполнения упражнений. Результат виден
                      уже через месяц тренировок."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">М</span>
                      </div>
                      <div>
                        <p className="font-medium">Мария К.</p>
                        <p className="text-sm text-gray-600">2 месяца назад</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Отзыв 2 */}
                <Card className="bg-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4">
                      "Занимаюсь уже полгода. Тренер всегда находит
                      индивидуальный подход, мотивирует и поддерживает.
                      Рекомендую всем!"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">А</span>
                      </div>
                      <div>
                        <p className="font-medium">Алексей П.</p>
                        <p className="text-sm text-gray-600">1 месяц назад</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Отзыв 3 */}
                <Card className="bg-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 text-yellow-400 fill-current"
                        />
                      ))}
                      <Star className="h-4 w-4 text-gray-300" />
                    </div>
                    <p className="text-gray-700 mb-4">
                      "Хороший специалист, но иногда бывает строговат. В целом
                      результатом довольна, похудела на 8 кг за 3 месяца."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">Е</span>
                      </div>
                      <div>
                        <p className="font-medium">Елена С.</p>
                        <p className="text-sm text-gray-600">3 недели назад</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Добавить отзыв */}
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="p-6 text-center">
                    <div className="text-gray-400 mb-4">
                      <Star className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Оставьте отзыв
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Поделитесь опытом тренировок
                    </p>
                    <Button variant="outline" size="sm">
                      Написать отзыв
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card
            className={`border-${trainer.color}-200 bg-gradient-to-r ${trainer.gradient} text-white`}
          >
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                Готовы начать тренировки с {trainer.name.split(" ")[0]}?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Запишитесь на первую тренировку и начните путь к своей цели
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`/book-trainer/${slug}`}
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Записаться на тренировку
                </a>
                <a
                  href="/trainers"
                  className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Посмотреть других тренеров
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
