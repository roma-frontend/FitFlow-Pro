// app/trainer/olga-ivanova/page.tsx (новый файл)
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Award,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  ArrowLeft,
  Dumbbell,
  Router,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OlgaIvanovaPage() {
  const router = useRouter()
  const trainer = {
    name: 'Ольга Иванова',
    specialty: 'Групповые программы',
    rating: 4.9,
    experience: '4+ года',
    price: 'от 1800₽/час',
    avatar: Users,
    gradient: 'from-teal-400 to-cyan-600',
    color: 'teal',
    badges: ['Аэробика', 'Зумба', 'Степ'],
    description: 'Энергичный тренер групповых программ. Сделаю ваши тренировки веселыми и эффективными!',
    bio: 'Ольга - мастер групповых программ с невероятной энергетикой. Превращает каждую тренировку в праздник движения.',
    certifications: [
      'Инструктор групповых программ',
      'Сертифицированный Zumba-инструктор',
      'Инструктор степ-аэробики',
      'Специалист по танцевальной аэробике'
    ],
    achievements: [
      'Провела 800+ групповых занятий',
      'Чемпион по аэробике (региональный уровень)',
      'Создатель авторских хореографий',
      'Любимый тренер участников (опросы)'
    ],
    services: [
      { name: 'Групповая аэробика', price: '800₽', duration: '60 мин' },
      { name: 'Zumba занятие', price: '900₽', duration: '60 мин' },
      { name: 'Персональное занятие', price: '1800₽', duration: '60 мин' },
      { name: 'Постановка танца', price: '2500₽', duration: '90 мин' }
    ]
  };

  const IconComponent = trainer.avatar;

  return (
    <div className="min-h-[100svh] bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex justify-center">
              <Link href="/" className="group flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-8 h-8 bg-gradient-to-r ${trainer.gradient} rounded-lg flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-300`}>
                    <Dumbbell className="h-5 w-5 text-white" />
                  </div>
                  {/* Блестки */}
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-300" />
                  <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-pink-400 opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-300 delay-150" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-cyan-600 group-hover:bg-clip-text transition-all duration-300">
                  FitFlow Pro
                </h2>
              </Link>
            </div>

            <Link
              href="/trainers"
              className="flex items-center gap-3 px-6 py-3 h-auto bg-gradient-to-r hover:from-cyan-100/90 hover:via-white hover:to-cyan-100/90 border border-none hover:border-blue-300/80 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-105 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Все тренеры
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-12">
          <Card className="overflow-hidden">
            <div className={`min-h-64 bg-gradient-to-br ${trainer.gradient} flex items-center justify-center relative p-4`}>
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="h-16 w-16" />
                </div>
                <h1 className="text-4xl font-bold mb-2">{trainer.name}</h1>
                <p className="text-xl opacity-90">{trainer.specialty}</p>
              </div>

              <div className="absolute top-6 right-6">
                <div className="flex items-center bg-white/90 rounded-full px-4 py-2">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="font-bold text-gray-900">{trainer.rating}</span>
                  <span className="text-gray-600 ml-1">/5</span>
                </div>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">О тренере</h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      {trainer.description}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {trainer.bio}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Специализации</h3>
                    <div className="flex flex-wrap gap-2">
                      {trainer.badges.map((badge: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-teal-100 text-teal-800 px-3 py-1"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Сертификаты и образование</h3>
                    <div className="space-y-2">
                      {trainer.certifications.map((cert: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          <span className="text-gray-700">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Достижения</h3>
                    <div className="space-y-2">
                      {trainer.achievements.map((achievement: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Быстрая информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Опыт работы</p>
                          <p className="text-sm text-gray-600">{trainer.experience}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">Рейтинг</p>
                          <p className="text-sm text-gray-600">{trainer.rating}/5.0</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Локация</p>
                          <p className="text-sm text-gray-600">FitFlow-Pro Club</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-teal-200 bg-teal-50">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-bold text-lg mb-2">Записаться на тренировку</h3>
                      <p className="text-sm text-gray-600 mb-4">{trainer.price}</p>
                      <a
                        href="/book-trainer/olga-ivanova"
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
                    className="hover:shadow-md transition-all cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <Badge className="bg-teal-100 text-teal-800">
                          {service.duration}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">{service.price}</span>
                        <Button
                          size="sm"
                          className={`bg-gradient-to-r ${trainer.gradient} hover:opacity-90 border-none`}
                          onClick={() => router.push(`/book-trainer/olga-ivanova?service=${index}`)}
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
          <Card className={`border-teal-200 bg-gradient-to-r ${trainer.gradient} text-white`}>
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                Готовы начать тренировки с Ольгой?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Присоединяйтесь к веселым и энергичным групповым занятиям
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/book-trainer/olga-ivanova"
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
