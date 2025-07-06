"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Star,
  Clock,
  Users,
  Calendar,
  Target,
  CheckCircle,
  Heart,
  Share2,
  Play,
  Award,
  Flame,
  Dumbbell,
  AlertCircle,
} from "lucide-react";
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import { memo, useEffect, useState } from "react";

// Данные программ (остаются без изменений)
const programsData = [
  {
    slug: "yoga",
    title: "Йога и релакс",
    shortDescription: "Гармония тела и духа через древние практики",
    fullDescription:
      "Наша программа йоги сочетает в себе традиционные асаны, дыхательные техники и медитацию. Подходит для всех уровней подготовки - от новичков до продвинутых практиков. Занятия помогают улучшить гибкость, силу, баланс и внутреннее спокойствие.",
    duration: "60-90 мин",
    level: "Все уровни",
    participants: "До 15 человек",
    price: "от 800₽",
    icon: Heart,
    bgGradient: "bg-gradient-to-br from-pink-50 to-rose-100",
    borderColor: "border-pink-200",
    iconGradient: "from-pink-400 to-rose-500",
    buttonGradient: "from-pink-500 to-rose-600",
    buttonHover: "hover:from-pink-600 hover:to-rose-700",
    features: ["Хатха-йога", "Виньяса", "Медитация", "Пранаяма"],
    benefits: [
      "Улучшение гибкости и подвижности суставов",
      "Снижение уровня стресса и тревожности",
      "Укрепление мышц кора и улучшение осанки",
      "Развитие концентрации и внимательности",
      "Нормализация сна и общего самочувствия",
    ],
    schedule: [
      {
        day: "Понедельник",
        time: "09:00-10:30",
        instructor: "Анна Петрова",
        type: "Хатха-йога",
      },
      {
        day: "Среда",
        time: "18:00-19:30",
        instructor: "Анна Петрова",
        type: "Виньяса-флоу",
      },
      {
        day: "Пятница",
        time: "19:00-20:30",
        instructor: "Мария Соколова",
        type: "Инь-йога",
      },
      {
        day: "Суббота",
        time: "10:00-11:30",
        instructor: "Анна Петрова",
        type: "Йога для начинающих",
      },
    ],
    equipment: ["Коврик для йоги", "Блоки", "Ремни", "Болстеры"],
    contraindications: [
      "Острые травмы позвоночника",
      "Высокое артериальное давление (для некоторых асан)",
      "Беременность (требуется специальная программа)",
    ],
    instructors: ["anna-petrova", "maria-sokolova"],
  },
  {
    slug: "strength",
    title: "Силовой тренинг",
    shortDescription: "Наращивание мышечной массы и увеличение силы",
    fullDescription:
      "Комплексная программа силовых тренировок, направленная на развитие всех групп мышц. Включает базовые и изолирующие упражнения с использованием свободных весов и тренажеров. Программа адаптируется под индивидуальные цели и уровень подготовки.",
    duration: "45-60 мин",
    level: "Средний/Продвинутый",
    participants: "До 10 человек",
    price: "от 1000₽",
    icon: Dumbbell,
    bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-100",
    borderColor: "border-blue-200",
    iconGradient: "from-blue-500 to-indigo-600",
    buttonGradient: "from-blue-500 to-indigo-600",
    buttonHover: "hover:from-blue-600 hover:to-indigo-700",
    features: [
      "Базовые упражнения",
      "Изоляция",
      "Прогрессия нагрузок",
      "Техника",
    ],
    benefits: [
      "Увеличение мышечной массы и силы",
      "Ускорение метаболизма",
      "Укрепление костной системы",
      "Улучшение композиции тела",
      "Повышение функциональной силы",
    ],
    schedule: [
      {
        day: "Понедельник",
        time: "18:00-19:00",
        instructor: "Михаил Волков",
        type: "Верх тела",
      },
      {
        day: "Среда",
        time: "19:00-20:00",
        instructor: "Михаил Волков",
        type: "Низ тела",
      },
      {
        day: "Пятница",
        time: "18:00-19:00",
        instructor: "Михаил Волков",
        type: "Full Body",
      },
      {
        day: "Суббота",
        time: "11:00-12:00",
        instructor: "Михаил Волков",
        type: "Пауэрлифтинг",
      },
    ],
    equipment: ["Штанги", "Гантели", "Тренажеры", "Скамьи"],
    contraindications: [
      "Острые травмы опорно-двигательного аппарата",
      "Сердечно-сосудистые заболевания в стадии обострения",
      "Высокое артериальное давление",
    ],
    instructors: ["mikhail-volkov"],
  },
  {
    slug: "cardio",
    title: "Кардио и жиросжигание",
    shortDescription: "Интенсивные кардио-тренировки для быстрого похудения",
    fullDescription:
      "Высокоинтенсивные интервальные тренировки (HIIT), направленные на максимальное жиросжигание. Программа включает различные виды кардио-упражнений, круговые тренировки и функциональные движения для эффективного снижения веса.",
    duration: "30-45 мин",
    level: "Все уровни",
    participants: "До 20 человек",
    price: "от 700₽",
    icon: Flame,
    bgGradient: "bg-gradient-to-br from-green-50 to-emerald-100",
    borderColor: "border-green-200",
    iconGradient: "from-green-500 to-emerald-600",
    buttonGradient: "from-green-500 to-emerald-600",
    buttonHover: "hover:from-green-600 hover:to-emerald-700",
    features: ["HIIT тренировки", "Табата", "Круговые тренировки", "Аэробика"],
    benefits: [
      "Быстрое сжигание калорий и жира",
      "Улучшение сердечно-сосудистой системы",
      "Повышение выносливости",
      "Ускорение метаболизма на 24-48 часов",
      "Улучшение композиции тела",
    ],
    schedule: [
      {
        day: "Вторник",
        time: "07:00-07:45",
        instructor: "Елена Смирнова",
        type: "HIIT Morning",
      },
      {
        day: "Четверг",
        time: "18:30-19:15",
        instructor: "Елена Смирнова",
        type: "Табата",
      },
      {
        day: "Суббота",
        time: "09:00-09:45",
        instructor: "Елена Смирнова",
        type: "Кардио-микс",
      },
      {
        day: "Воскресенье",
        time: "10:00-10:45",
        instructor: "Ольга Иванова",
        type: "Аэробика",
      },
    ],
    equipment: ["Степ-платформы", "Гантели", "Медболы", "Скакалки"],
    contraindications: [
      "Серьезные заболевания сердца",
      "Острые респираторные заболевания",
      "Травмы суставов нижних конечностей",
    ],
    instructors: ["elena-smirnova", "olga-ivanova"],
  },
  {
    slug: "functional",
    title: "Функциональный тренинг",
    shortDescription: "Тренировка движений для повседневной активности",
    fullDescription:
      "Функциональный тренинг развивает силу, координацию, баланс и выносливость через естественные движения. Программа включает упражнения с собственным весом, TRX, медболами и другим функциональным оборудованием.",
    duration: "50-70 мин",
    level: "Средний",
    participants: "До 12 человек",
    price: "от 900₽",
    icon: Target,
    bgGradient: "bg-gradient-to-br from-orange-50 to-red-100",
    borderColor: "border-orange-200",
    iconGradient: "from-orange-500 to-red-600",
    buttonGradient: "from-orange-500 to-red-600",
    buttonHover: "hover:from-orange-600 hover:to-red-700",
    features: ["TRX", "Функциональные движения", "Координация", "Баланс"],
    benefits: [
      "Улучшение функциональной силы",
      "Развитие координации и баланса",
      "Профилактика травм в повседневной жизни",
      "Улучшение спортивных показателей",
      "Развитие стабильности кора",
    ],
    schedule: [
      {
        day: "Понедельник",
        time: "19:00-20:10",
        instructor: "Дмитрий Козлов",
        type: "TRX Training",
      },
      {
        day: "Среда",
        time: "20:00-21:10",
        instructor: "Дмитрий Козлов",
        type: "Functional Mix",
      },
      {
        day: "Пятница",
        time: "19:30-20:40",
        instructor: "Дмитрий Козлов",
        type: "Core & Balance",
      },
      {
        day: "Воскресенье",
        time: "11:00-12:10",
        instructor: "Дмитрий Козлов",
        type: "Реабилитация",
      },
    ],
    equipment: ["TRX", "Медболы", "Босу", "Канаты", "Кольца"],
    contraindications: [
      "Острые травмы позвоночника",
      "Нестабильность суставов",
      "Головокружения и нарушения вестибулярного аппарата",
    ],
    instructors: ["dmitriy-kozlov"],
  },
];

// Компонент для проверки авторизации
const AuthButton = memo(
  ({
    onBooking,
    redirectPath,
    program,
  }: {
    onBooking: () => void;
    redirectPath: string;
    program: any;
  }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await fetch("/api/auth/check");
          const data = await response.json();
          setIsAuthenticated(
            data.authenticated && data.user?.role === "member"
          );
        } catch (error) {
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, []);

    if (loading) {
      return (
        <button className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed">
          Проверка авторизации...
        </button>
      );
    }

    if (isAuthenticated) {
      return (
        <button
          onClick={onBooking}
          className={`w-full bg-gradient-to-r ${program.buttonGradient} text-white py-3 px-4 rounded-lg ${program.buttonHover} transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium`}
        >
          Записаться на занятие
        </button>
      );
    }

    return (
      <button
        onClick={() =>
          router.push(
            `/member-login?redirect=${encodeURIComponent(redirectPath)}`
          )
        }
        className={`w-full bg-gradient-to-r ${program.buttonGradient} text-white py-3 px-4 rounded-lg ${program.buttonHover} transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium`}
      >
        Войти для записи
      </button>
    );
  }
);

AuthButton.displayName = "AuthButton";

// Компонент бронирования (остается без изменений)
const BookingSection = memo(
  ({ program, onClose }: { program: any; onClose: () => void }) => {
    const router = useRouter();
    const [selectedSession, setSelectedSession] = useState<number | null>(null);
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleBooking = async () => {
      setLoading(true);
      setError("");

      try {
        console.log("Отправляем запрос на бронирование программы...");

        const bookingData = {
          programId: program.slug,
          programTitle: program.title,
          sessionIndex: selectedSession,
          date: program.schedule[selectedSession!].day,
          time: program.schedule[selectedSession!].time,
          instructor: program.schedule[selectedSession!].instructor,
          type: program.schedule[selectedSession!].type,
        };

        console.log("Данные бронирования программы:", bookingData);

        const response = await fetch("/api/bookings/program", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        });

        console.log("Ответ сервера:", response.status, response.statusText);

        const data = await response.json();
        console.log("Данные ответа:", data);

        if (!response.ok) {
          throw new Error(
            data.error || `HTTP error! status: ${response.status}`
          );
        }

        if (data.success) {
          console.log("Бронирование программы успешно создано");
          setStep(3);
        } else {
          throw new Error(data.error || "Неизвестная ошибка");
        }
      } catch (error) {
        console.error("Ошибка при бронировании программы:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Произошла ошибка при бронировании"
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <Card className="mb-8 border-2 border-blue-500">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Запись на {program.title}
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
              <button
                onClick={() => setError("")}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Закрыть
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Выберите занятие</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {program.schedule.map((session: any, index: number) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all ${
                      selectedSession === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedSession(index)}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium text-gray-900 mb-1">
                        {session.day}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {session.time}
                      </div>
                      <div className="text-sm font-medium text-blue-600 mb-1">
                        {session.type}
                      </div>
                      <div className="text-xs text-gray-500">
                        {session.instructor}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={selectedSession === null}
                className="w-full"
              >
                Продолжить
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Подтверждение записи</h3>
              {selectedSession !== null && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Детали записи
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Программа: {program.title}</div>
                    <div>День: {program.schedule[selectedSession].day}</div>
                    <div>Время: {program.schedule[selectedSession].time}</div>
                    <div>Тип: {program.schedule[selectedSession].type}</div>
                    <div>
                      Инструктор: {program.schedule[selectedSession].instructor}
                    </div>
                    <div>Стоимость: {program.price}</div>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  disabled={loading}
                >
                  Назад
                </Button>
                <Button
                  onClick={handleBooking}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Обработка..." : "Подтвердить запись"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Запись подтверждена!
              </h3>
              <p className="text-gray-600">
                Вы записаны на {program.title} в{" "}
                {program.schedule[selectedSession!].day} в{" "}
                {program.schedule[selectedSession!].time}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/member-dashboard/my-bookings")}
                  className="flex-1"
                >
                  Мои записи
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Продолжить просмотр
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

BookingSection.displayName = "BookingSection";

// Компонент карточки инструктора (остается без изменений)
const InstructorCard = memo(
  ({ instructorSlug }: { instructorSlug: string }) => {
    const router = useRouter();

    const instructorNames: { [key: string]: string } = {
      "anna-petrova": "Анна Петрова",
      "mikhail-volkov": "Михаил Волков",
      "elena-smirnova": "Елена Смирнова",
      "dmitriy-kozlov": "Дмитрий Козлов",
      "olga-ivanova": "Ольга Иванова",
      "maria-sokolova": "Мария Соколова",
    };

    const instructorName = instructorNames[instructorSlug] || "Инструктор";

    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        onClick={() => router.push(`/trainer/${instructorSlug}`)}
      >
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h4 className="font-medium text-gray-900">{instructorName}</h4>
          <p className="text-sm text-gray-600">Сертифицированный тренер</p>
        </CardContent>
      </Card>
    );
  }
);

InstructorCard.displayName = "InstructorCard";

export default function ProgramPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const action = searchParams.get("action");

  const [showBooking, setShowBooking] = useState(false);

  const program = programsData.find((p) => p.slug === slug);

  // Показать форму бронирования, если есть параметр action=book
  useEffect(() => {
    if (action === "book") {
      setShowBooking(true);
      // Убираем параметр из URL без перезагрузки страницы
      const newUrl = pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [action]);

  if (!program) {
    return (
      <div className="min-h-[100lvh] bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Программа не найдена
          </h1>
          <p className="text-gray-600 mb-6">
            К сожалению, запрашиваемая программа не найдена.
          </p>
          <Button onClick={() => router.push("/programs")}>
            Вернуться к программам
          </Button>
        </Card>
      </div>
    );
  }

  const IconComponent = program.icon;

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Назад</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Форма бронирования (показывается при необходимости) */}
        {showBooking && (
          <BookingSection
            program={program}
            onClose={() => setShowBooking(false)}
          />
        )}

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Основная информация о программе */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div
                className={`h-64 bg-gradient-to-br ${program.iconGradient} flex items-center justify-center relative`}
              >
                <div className="text-center text-white">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-16 w-16" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{program.title}</h1>
                  <p className="text-xl text-white/90">
                    {program.shortDescription}
                  </p>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="flex items-center bg-white/90 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      О программе
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {program.fullDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {program.features.map((feature, index) => (
                      <Badge
                        key={index}
                        className="bg-gray-100 text-gray-800 text-sm px-3 py-1"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Преимущества
                      </h3>
                      <ul className="space-y-2">
                        {program.benefits.map((benefit, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-600"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        Оборудование
                      </h3>
                      <ul className="space-y-2">
                        {program.equipment.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-600"
                          >
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Противопоказания */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      Противопоказания
                    </h3>
                    <ul className="space-y-1">
                      {program.contraindications.map((item, index) => (
                        <li key={index} className="text-sm text-red-700">
                          • {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-red-600 mt-2">
                      При наличии хронических заболеваний обязательно
                      проконсультируйтесь с врачом
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель с информацией */}
          <div className="space-y-6">
            {/* Карточка записи */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Записаться на занятие
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {program.price}
                  </div>
                  <div className="text-sm text-gray-600">за занятие</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Длительность: {program.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{program.participants}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Target className="h-4 w-4" />
                    <span>Уровень: {program.level}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  {/* ЗАМЕНА: Используем AuthButton вместо обычной кнопки */}
                  <AuthButton
                    onBooking={() => setShowBooking(true)}
                    redirectPath={`/programs/${program.slug}?action=book`}
                    program={program}
                  />
                  <button
                    onClick={() => router.push(`/trial-class/${program.slug}`)}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                  >
                    Пробное занятие
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Быстрая информация */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Быстрая информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Калории за занятие:</span>
                  <span className="font-medium">300-500 ккал</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Занятий в неделю:</span>
                  <span className="font-medium">{program.schedule.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Абонемент на месяц:</span>
                  <span className="font-medium">от 5000₽</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Расписание */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Расписание занятий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {program.schedule.map((session, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="font-medium text-gray-900 mb-1">
                      {session.day}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {session.time}
                    </div>
                    <div className="text-sm font-medium text-blue-600 mb-1">
                      {session.type}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {session.instructor}
                    </div>
                    {/* ЗАМЕНА: Используем AuthButton для кнопок в расписании */}
                    <AuthButton
                      onBooking={() => setShowBooking(true)}
                      redirectPath={`/programs/${program.slug}?action=book`}
                      program={{
                        ...program,
                        buttonGradient: "from-blue-500 to-blue-600",
                        buttonHover: "hover:from-blue-600 hover:to-blue-700",
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Инструкторы */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Наши инструкторы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {program.instructors.map((instructorSlug, index) => (
                <InstructorCard key={index} instructorSlug={instructorSlug} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Галерея/Видео */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Посмотрите, как проходят занятия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`h-48 bg-gradient-to-br ${program.iconGradient} rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity`}
                >
                  <div className="text-center text-white">
                    <Play className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Видео {item}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Отзывы */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Отзывы участников
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Анна К.</span>
                </div>
                <p className="text-gray-700 text-sm">
                  "Отличная программа! {program.title.toLowerCase()} помогла мне
                  значительно улучшить физическую форму. Инструкторы очень
                  профессиональные и внимательные."
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Михаил П.</span>
                </div>
                <p className="text-gray-700 text-sm">
                  "Результаты видны уже через месяц занятий! Атмосфера в группе
                  очень дружелюбная, всегда хочется вернуться."
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Елена С.</span>
                </div>
                <p className="text-gray-700 text-sm">
                  "Программа идеально подходит для моего уровня подготовки.
                  Тренеры всегда подскажут правильную технику выполнения
                  упражнений."
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Дмитрий Л.</span>
                </div>
                <p className="text-gray-700 text-sm">
                  "Занимаюсь уже полгода, результат превзошел все ожидания!
                  Удобное расписание и профессиональный подход тренеров."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Часто задаваемые вопросы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Нужна ли предварительная подготовка?
                </h4>
                <p className="text-sm text-gray-600">
                  Нет, программа адаптируется под любой уровень подготовки.
                  Тренер подберет нагрузку индивидуально для каждого участника.
                </p>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Что нужно взять с собой на первое занятие?
                </h4>
                <p className="text-sm text-gray-600">
                  Удобную спортивную одежду, кроссовки и полотенце. Все
                  необходимое оборудование предоставляется клубом.
                </p>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Можно ли заниматься при травмах?
                </h4>
                <p className="text-sm text-gray-600">
                  При наличии травм или хронических заболеваний обязательно
                  проконсультируйтесь с врачом и сообщите тренеру о своих
                  ограничениях.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Как часто нужно заниматься для достижения результата?
                </h4>
                <p className="text-sm text-gray-600">
                  Рекомендуется заниматься 2-3 раза в неделю. Первые результаты
                  обычно заметны через 2-4 недели регулярных тренировок.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Другие программы */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Другие программы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programsData
              .filter((p) => p.slug !== program.slug)
              .slice(0, 3)
              .map((otherProgram) => {
                const OtherIconComponent = otherProgram.icon;
                return (
                  <Card
                    key={otherProgram.slug}
                    className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    onClick={() =>
                      router.push(`/programs/${otherProgram.slug}`)
                    }
                  >
                    <div
                      className={`h-32 bg-gradient-to-br ${otherProgram.iconGradient} flex items-center justify-center`}
                    >
                      <div className="text-center text-white">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <OtherIconComponent className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold">
                          {otherProgram.title}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {otherProgram.shortDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {otherProgram.duration}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {otherProgram.price}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Призыв к действию */}
        <div className="mt-16 text-center">
          <Card
            className={`${program.bgGradient} border-2 border-dashed ${program.borderColor} p-8`}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Готовы начать тренировки?
            </h3>
            <p className="text-gray-600 mb-6">
              Запишитесь на пробное занятие или получите персональную
              консультацию
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* ЗАМЕНА: Используем AuthButton в призыве к действию */}
              <div className="flex-1 max-w-xs">
                <AuthButton
                  onBooking={() => setShowBooking(true)}
                  redirectPath={`/programs/${program.slug}?action=book`}
                  program={program}
                />
              </div>
              <button
                onClick={() =>
                  router.push(`/consultation?program=${program.slug}`)
                }
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white/80 transition-all duration-300 transform hover:scale-105"
              >
                Получить консультацию
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
