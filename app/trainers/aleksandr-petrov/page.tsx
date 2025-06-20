// app/trainer/aleksandr-petrov/page.tsx (новый файл)
"use client";

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
  Crown,
  CheckCircle,
  ArrowLeft,
  Dumbbell,
  Router,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AleksandrPetrovPage() {
  const router = useRouter()
  const trainer = {
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
  };

  const IconComponent = trainer.avatar;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FitAccess</h1>
            </a>

            <a
              href="/trainers"
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Все тренеры
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <Card className="overflow-hidden border-2 border-violet-200">
            <div
              className={`h-64 bg-gradient-to-br ${trainer.gradient} flex items-center justify-center relative`}
            >
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/30">
                  <IconComponent className="h-16 w-16" />
                </div>
                <h1 className="text-4xl font-bold mb-2">{trainer.name}</h1>
                <p className="text-xl opacity-90">{trainer.specialty}</p>
                <Badge className="bg-white/20 text-white border-white/30 mt-2">
                  ⭐ PREMIUM TRAINER
                </Badge>
              </div>

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

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Специализации
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trainer.badges.map((badge: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-violet-100 text-violet-800 px-3 py-1 border border-violet-200"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>

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

                  {/* Эксклюзивные особенности */}
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-violet-900 mb-3">
                      🌟 Эксклюзивные услуги
                    </h3>
                    <ul className="space-y-2 text-violet-800">
                      <li className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-violet-600" />
                        <span>Конфиденциальность и приватность</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-violet-600" />
                        <span>Гибкий график (24/7)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-violet-600" />
                        <span>Выездные тренировки</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-violet-600" />
                        <span>Комплексный lifestyle-коучинг</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <Card className="border-violet-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Crown className="h-5 w-5 text-violet-600" />
                        VIP информация
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-violet-500" />
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
                            {trainer.rating}/5.0 (Максимальный)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-violet-500" />
                        <div>
                          <p className="font-medium">Локация</p>
                          <p className="text-sm text-gray-600">
                            VIP-зона / Выездные
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
                    <CardContent className="p-6 text-center">
                      <Crown className="h-8 w-8 text-violet-600 mx-auto mb-3" />
                      <h3 className="font-bold text-lg mb-2">
                        Элитное бронирование
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {trainer.price}
                      </p>
                      <p className="text-xs text-violet-600 mb-4">
                        * Предварительная консультация обязательна
                      </p>
                      <a
                        href="/book-trainer/aleksandr-petrov"
                        className={`block w-full bg-gradient-to-r ${trainer.gradient} text-white py-3 px-4 rounded-lg hover:opacity-90 transition-all font-medium`}
                      >
                        Запросить консультацию
                      </a>
                    </CardContent>
                  </Card>

                  {/* Контакты VIP */}
                  <Card className="border-violet-200">
                    <CardHeader>
                      <CardTitle className="text-lg">VIP-контакты</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                        <span className="text-sm">Персональный менеджер</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                        <span className="text-sm">Приоритетная запись</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                        <span className="text-sm">Конфиденциальность</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <Card className="border-violet-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Crown className="h-6 w-6 text-violet-600" />
                Эксклюзивные услуги и цены
              </CardTitle>
              <CardDescription>
                Премиум-программы для достижения максимальных результатов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trainer.services.map((service: any, index: number) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-all cursor-pointer border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg text-violet-900">
                          {service.name}
                        </h3>
                        <Badge className="bg-violet-100 text-violet-800 border border-violet-200">
                          {service.duration}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-violet-900">
                          {service.price}
                        </span>
                        <Button
                          size="sm"
                          className={`bg-gradient-to-r ${trainer.gradient} hover:opacity-90`}
                          onClick={() =>
                            (router.push(`/book-trainer/aleksandr-petrov?service=${index}`))
                          }
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

        <div className="text-center">
          <Card
            className={`border-violet-200 bg-gradient-to-r ${trainer.gradient} text-white`}
          >
            <CardContent className="p-12">
              <Crown className="h-12 w-12 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Готовы к элитному уровню тренировок?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Присоединяйтесь к эксклюзивному кругу VIP-клиентов Александра
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/book-trainer/aleksandr-petrov"
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Запросить консультацию
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
