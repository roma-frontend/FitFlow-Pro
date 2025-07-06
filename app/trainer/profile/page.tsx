// app/trainer/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import TrainerHeader from '@/components/trainer/TrainerHeader';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Star,
  Camera,
  Edit,
  Save,
  X,
  Plus,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  Users,
  Target,
  Dumbbell,
  Trophy,
  BookOpen,
  Instagram,
  Youtube,
  Globe,
  Loader2
} from "lucide-react";
import { TrainerProvider } from '@/contexts/TrainerContext';

interface TrainerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  coverImage: string;
  specialization: string[];
  experience: number;
  rating: number;
  totalClients: number;
  completedSessions: number;
  bio: string;
  education: string[];
  certifications: Certificate[];
  achievements: Achievement[];
  workingHours: WorkingHours;
  socialLinks: SocialLinks;
  pricing: PricingPlan[];
  gallery: GalleryImage[];
  reviews: Review[];
  stats: TrainerStats;
}

interface Certificate {
  id: string;
  name: string;
  organization: string;
  date: string;
  expiryDate?: string;
  image?: string;
  verified: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

interface WorkingHours {
  monday: { start: string; end: string; available: boolean };
  tuesday: { start: string; end: string; available: boolean };
  wednesday: { start: string; end: string; available: boolean };
  thursday: { start: string; end: string; available: boolean };
  friday: { start: string; end: string; available: boolean };
  saturday: { start: string; end: string; available: boolean };
  sunday: { start: string; end: string; available: boolean };
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  popular: boolean;
}

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

interface TrainerStats {
  totalHours: number;
  averageRating: number;
  responseTime: string;
  successRate: number;
}

export default function TrainerProfilePage() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Загрузка профиля тренера
  useEffect(() => {
    loadTrainerProfile();
  }, []);

  const loadTrainerProfile = async () => {
    try {
      // Симуляция загрузки данных
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Мок данные профиля тренера
      const mockProfile: TrainerProfile = {
        id: "trainer-1",
        name: "Адам Петров",
        email: "adam.petrov@FitFlow-Pro.com",
        phone: "+7 (999) 123-45-67",
        avatar: "/avatars/trainer-adam.jpg",
        coverImage: "/images/trainer-cover.jpg",
        specialization: ["Силовые тренировки", "Кроссфит", "Функциональный тренинг", "Реабилитация"],
        experience: 8,
        rating: 4.9,
        totalClients: 156,
        completedSessions: 2847,
        bio: "Сертифицированный персональный тренер с 8-летним опытом работы. Специализируюсь на силовых тренировках, кроссфите и функциональном тренинге. Помогаю людям достигать их фитнес-целей через индивидуальный подход и научно обоснованные методики. Верю, что каждый может стать лучшей версией себя при правильной мотивации и поддержке.",
        education: [
          "Российский государственный университет физической культуры, спорта, молодёжи и туризма (ГЦОЛИФК) - Бакалавр физической культуры",
          "Московский институт физической культуры - Магистр спортивной медицины",
          "Курсы повышения квалификации по функциональному тренингу"
        ],
        certifications: [
          {
            id: "cert-1",
            name: "Сертифицированный персональный тренер ACSM",
            organization: "American College of Sports Medicine",
            date: "2020-03-15",
            expiryDate: "2025-03-15",
            verified: true
          },
          {
            id: "cert-2",
            name: "Инструктор кроссфита Level 2",
            organization: "CrossFit Inc.",
            date: "2021-06-20",
            expiryDate: "2026-06-20",
            verified: true
          },
          {
            id: "cert-3",
            name: "Специалист по реабилитации",
            organization: "Российская ассоциация спортивной медицины",
            date: "2019-11-10",
            verified: true
          }
        ],
        achievements: [
          {
            id: "ach-1",
            title: "Тренер года 2023",
            description: "Лучший персональный тренер фитнес-центра по итогам года",
            date: "2023-12-31",
            icon: "trophy"
          },
          {
            id: "ach-2",
            title: "100+ довольных клиентов",
            description: "Достиг отметки в 100 постоянных клиентов",
            date: "2023-08-15",
            icon: "users"
          },
          {
            id: "ach-3",
            title: "Мастер спорта по пауэрлифтингу",
            description: "Получил звание мастера спорта России",
            date: "2018-05-20",
            icon: "award"
          }
        ],
        workingHours: {
          monday: { start: "08:00", end: "20:00", available: true },
          tuesday: { start: "08:00", end: "20:00", available: true },
          wednesday: { start: "08:00", end: "20:00", available: true },
          thursday: { start: "08:00", end: "20:00", available: true },
          friday: { start: "08:00", end: "18:00", available: true },
          saturday: { start: "10:00", end: "16:00", available: true },
          sunday: { start: "10:00", end: "16:00", available: false }
        },
        socialLinks: {
          instagram: "https://instagram.com/adam_trainer",
          youtube: "https://youtube.com/c/adamfitness",
          website: "https://adam-trainer.ru"
        },
        pricing: [
          {
            id: "price-1",
            name: "Разовая тренировка",
            price: 2500,
            duration: 60,
            description: "Индивидуальная тренировка 60 минут",
            popular: false
          },
          {
            id: "price-2",
            name: "Абонемент 8 тренировок",
            price: 18000,
            duration: 60,
            description: "8 тренировок по 60 минут (действует 1 месяц)",
            popular: true
          },
          {
            id: "price-3",
            name: "Месячный безлимит",
            price: 35000,
            duration: 60,
            description: "Безлимитные тренировки в течение месяца",
            popular: false
          }
        ],
        gallery: [
          {
            id: "img-1",
            url: "/images/gallery/training-1.jpg",
            title: "Силовая тренировка",
            description: "Работа с клиентом над техникой приседаний"
          },
          {
            id: "img-2",
            url: "/images/gallery/training-2.jpg",
            title: "Кроссфит тренировка",
            description: "Групповая тренировка по кроссфиту"
          },
          {
            id: "img-3",
            url: "/images/gallery/training-3.jpg",
            title: "Функциональный тренинг",
            description: "Работа с TRX петлями"
          }
        ],
        reviews: [
          {
            id: "review-1",
            clientName: "Мария Иванова",
            rating: 5,
            comment: "Отличный тренер! Адам помог мне достичь своих целей за 3 месяца. Профессиональный подход и индивидуальная программа.",
            date: "2024-01-15",
            avatar: "/avatars/client-1.jpg"
          },
          {
            id: "review-2",
            clientName: "Сергей Петров",
            rating: 5,
            comment: "Тренируюсь с Адамом уже полгода. Результаты превзошли все ожидания. Рекомендую всем!",
            date: "2024-01-10",
            avatar: "/avatars/client-2.jpg"
          },
          {
            id: "review-3",
            clientName: "Анна Смирнова",
            rating: 4,
            comment: "Очень довольна тренировками. Адам всегда поддерживает и мотивирует. Единственный минус - иногда сложно записаться.",
            date: "2024-01-05",
            avatar: "/avatars/client-3.jpg"
          }
        ],
        stats: {
          totalHours: 2847,
          averageRating: 4.9,
          responseTime: "< 2 часов",
          successRate: 96
        }
      };

      setProfile(mockProfile);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Здесь будет логика сохранения профиля
      setEditing(false);
      // Показать уведомление об успешном сохранении
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
    }
  };

  const getAchievementIcon = (iconType: string) => {
    switch (iconType) {
      case 'trophy': return Trophy;
      case 'users': return Users;
      case 'award': return Award;
      default: return Star;
    }
  };

  if (loading) {
    return (
        <TrainerProvider>
          <div className="min-h-[100lvh] bg-gray-50">
            <TrainerHeader />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Загрузка профиля...</p>
                </div>
              </div>
            </div>
          </div>
        </TrainerProvider>
    );
  }

  if (!profile) {
    return (
        <TrainerProvider>
          <div className="min-h-[100lvh] bg-gray-50">
            <TrainerHeader />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <p className="text-gray-600">Профиль не найден</p>
              </div>
            </div>
          </div>
        </TrainerProvider>
    );
  }

  return (
      <TrainerProvider>
        <div className="min-h-[100lvh] bg-gray-50">
          <TrainerHeader />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Cover Image и основная информация */}
            <div className="relative mb-8">
              {/* Cover Image */}
              <div className="h-64 md:h-80 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl overflow-hidden relative">
                {profile.coverImage ? (
                  <img 
                    src={profile.coverImage} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
                    <Dumbbell className="h-24 w-24 text-white opacity-50" />
                  </div>
                )}
                
                {/* Кнопка редактирования обложки */}
                <Button
                  variant="secondary"
                                    size="sm"
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Изменить обложку
                </Button>
              </div>

              {/* Профиль информация */}
              <div className="relative -mt-20 px-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Аватар */}
                    <div className="relative">
                      <Avatar className="h-32 w-32 ring-4 ring-white shadow-lg">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-3xl font-bold">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Основная информация */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {profile.specialization.map((spec, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button
                            onClick={() => setEditing(!editing)}
                            variant={editing ? "destructive" : "outline"}
                            className="flex items-center gap-2"
                          >
                            {editing ? (
                              <>
                                <X className="h-4 w-4" />
                                Отменить
                              </>
                            ) : (
                              <>
                                <Edit className="h-4 w-4" />
                                Редактировать
                              </>
                            )}
                          </Button>
                          
                          {editing && (
                            <Button
                              onClick={handleSaveProfile}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                              Сохранить
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Статистика */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span className="text-2xl font-bold text-gray-900">{profile.rating}</span>
                          </div>
                          <p className="text-sm text-gray-600">Рейтинг</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Users className="h-5 w-5 text-blue-500" />
                            <span className="text-2xl font-bold text-gray-900">{profile.totalClients}</span>
                          </div>
                          <p className="text-sm text-gray-600">Клиентов</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Target className="h-5 w-5 text-green-500" />
                            <span className="text-2xl font-bold text-gray-900">{profile.completedSessions}</span>
                          </div>
                          <p className="text-sm text-gray-600">Тренировок</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="h-5 w-5 text-purple-500" />
                            <span className="text-2xl font-bold text-gray-900">{profile.experience}</span>
                          </div>
                          <p className="text-sm text-gray-600">Лет опыта</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Табы с информацией */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:w-[800px] mx-auto">
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="bio">О себе</TabsTrigger>
                <TabsTrigger value="certificates">Сертификаты</TabsTrigger>
                <TabsTrigger value="schedule">Расписание</TabsTrigger>
                <TabsTrigger value="pricing">Цены</TabsTrigger>
                <TabsTrigger value="reviews">Отзывы</TabsTrigger>
              </TabsList>

              {/* Обзор */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Контактная информация */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Контактная информация
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        {editing ? (
                          <Input defaultValue={profile.email} className="flex-1" />
                        ) : (
                          <span className="text-gray-900">{profile.email}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        {editing ? (
                          <Input defaultValue={profile.phone} className="flex-1" />
                        ) : (
                          <span className="text-gray-900">{profile.phone}</span>
                        )}
                      </div>

                      {/* Социальные сети */}
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">Социальные сети</h4>
                        <div className="space-y-2">
                          {profile.socialLinks.instagram && (
                            <div className="flex items-center gap-3">
                              <Instagram className="h-5 w-5 text-pink-500" />
                              <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-600 hover:underline">
                                Instagram
                              </a>
                            </div>
                          )}
                          
                          {profile.socialLinks.youtube && (
                            <div className="flex items-center gap-3">
                              <Youtube className="h-5 w-5 text-red-500" />
                              <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-600 hover:underline">
                                YouTube
                              </a>
                            </div>
                          )}
                          
                          {profile.socialLinks.website && (
                            <div className="flex items-center gap-3">
                              <Globe className="h-5 w-5 text-blue-500" />
                              <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-600 hover:underline">
                                Личный сайт
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Достижения */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Достижения
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {profile.achievements.map((achievement) => {
                          const IconComponent = getAchievementIcon(achievement.icon);
                          return (
                            <div key={achievement.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <IconComponent className="h-5 w-5 text-yellow-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(achievement.date).toLocaleDateString('ru-RU')}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Статистика */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Статистика
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Общее время тренировок</span>
                        <span className="font-semibold">{profile.stats.totalHours} ч</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Средний рейтинг</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{profile.stats.averageRating}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Время ответа</span>
                        <span className="font-semibold">{profile.stats.responseTime}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Успешность</span>
                        <span className="font-semibold text-green-600">{profile.stats.successRate}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* О себе */}
              <TabsContent value="bio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Биография</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <Textarea 
                        defaultValue={profile.bio}
                        rows={6}
                        className="w-full"
                        placeholder="Расскажите о себе, своем опыте и подходе к тренировкам..."
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Образование
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.education.map((edu, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <p className="text-gray-700">{edu}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Сертификаты */}
              <TabsContent value="certificates" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Сертификаты и лицензии</h2>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить сертификат
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.certifications.map((cert) => (
                    <Card key={cert.id} className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Award className="h-6 w-6 text-blue-600" />
                            {cert.verified && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">{cert.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{cert.organization}</p>
                        
                        <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                            <span className="text-gray-500">Получен:</span>
                            <span className="text-gray-900">
                              {new Date(cert.date).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          
                          {cert.expiryDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Действует до:</span>
                              <span className="text-gray-900">
                                {new Date(cert.expiryDate).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {cert.verified && (
                          <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Верифицирован
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Расписание */}
              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Рабочие часы
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(profile.workingHours).map(([day, hours]) => {
                        const dayNames = {
                          monday: 'Понедельник',
                          tuesday: 'Вторник',
                          wednesday: 'Среда',
                          thursday: 'Четверг',
                          friday: 'Пятница',
                          saturday: 'Суббота',
                          sunday: 'Воскресенье'
                        };
                        
                        return (
                          <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">
                              {dayNames[day as keyof typeof dayNames]}
                            </span>
                            
                            {editing ? (
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                  <input 
                                    type="checkbox" 
                                    defaultChecked={hours.available}
                                    className="rounded"
                                  />
                                  <span className="text-sm">Доступен</span>
                                </label>
                                
                                {hours.available && (
                                  <div className="flex items-center gap-2">
                                    <Input 
                                      type="time" 
                                      defaultValue={hours.start}
                                      className="w-24"
                                    />
                                    <span>-</span>
                                    <Input 
                                      type="time" 
                                      defaultValue={hours.end}
                                      className="w-24"
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {hours.available ? (
                                  <>
                                    <Clock className="h-4 w-4 text-green-500" />
                                    <span className="text-green-600 font-medium">
                                      {hours.start} - {hours.end}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-gray-500">Выходной</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Цены */}
              <TabsContent value="pricing" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Тарифы и цены</h2>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить тариф
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {profile.pricing.map((plan) => (
                    <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-500 text-white px-4 py-1">
                            Популярный
                          </Badge>
                        </div>
                      )}
                      
                      <CardContent className="p-6 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-blue-600">{plan.price.toLocaleString()}</span>
                          <span className="text-gray-500"> ₽</span>
                        </div>
                        
                        <p className="text-gray-600 mb-6">{plan.description}</p>
                        
                        <div className="space-y-3 text-sm text-gray-600">
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{plan.duration} минут</span>
                          </div>
                        </div>
                        
                        {editing && (
                          <div className="mt-6 flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="h-4 w-4 mr-2" />
                              Изменить
                            </Button>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Отзывы */}
              <TabsContent value="reviews" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Отзывы клиентов</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-5 w-5 ${star <= Math.floor(profile.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold">{profile.rating}</span>
                      <span className="text-gray-500">({profile.reviews.length} отзывов)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {profile.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={review.avatar} />
                            <AvatarFallback className="bg-gray-200">
                              {review.clientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{review.clientName}</h4>
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{review.rating}/5</span>
                            </div>
                            
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </TrainerProvider>
  );
}


