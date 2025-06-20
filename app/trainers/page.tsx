// app/trainers/page.tsx (обновленная версия)
"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Users,
  ArrowLeft,
  Star,
  Award,
  Search,
} from "lucide-react";
import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { trainersData } from "@/lib/trainers-data";
import TrainersPageHeader from "./_components/TrainersHeader";

const TrainerCard = memo(({ trainer }: { trainer: any }) => {
  const router = useRouter();
  const IconComponent = trainer.icon;

  const handleCardClick = () => {
    console.log('Card clicked, navigating to:', trainer.link); 
    router.push(trainer.link);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Profile clicked, navigating to:', trainer.link); 
  };

  const handleBookingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Booking clicked, navigating to:', trainer.bookingLink);
    router.push(trainer.bookingLink);
  };

  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <div
          className={`h-64 bg-gradient-to-br ${trainer.gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
        >
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
              <IconComponent className="h-12 w-12 transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <h3 className="text-xl font-bold transition-all duration-300 group-hover:scale-105">
              {trainer.name}
            </h3>
            <p
              className={`${trainer.textColor} transition-opacity duration-300 group-hover:opacity-90`}
            >
              {trainer.specialty}
            </p>
          </div>
        </div>
        <div className="absolute top-4 right-4 transition-all duration-300 group-hover:scale-110">
          <div className="flex items-center bg-white/90 rounded-full px-2 py-1 backdrop-blur-sm">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{trainer.rating}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award
              className={`h-4 w-4 ${trainer.iconColor} transition-colors duration-300`}
            />
            <span>{trainer.experience}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {trainer.badges.map((badge: string, index: number) => (
              <Badge
                key={index}
                className={`${trainer.badgeColor} transition-all duration-300 hover:scale-105`}
              >
                {badge}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
            {trainer.description}
          </p>

          <div className="flex items-center justify-between pt-4">
            <div className="text-lg font-bold text-gray-900 transition-all duration-300 group-hover:scale-105">
              {trainer.price}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleProfileClick}
                className={`px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-all duration-300 transform hover:scale-105`}
              >
                Профиль
              </button>
              <button
                onClick={handleBookingClick}
                className={`px-3 py-1 text-sm bg-gradient-to-r ${trainer.gradient} text-white rounded ${trainer.hoverGradient} transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
              >
                Записаться
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TrainerCard.displayName = "TrainerCard";

export default function TrainersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");

  const categories = [
    "Все",
    "Йога",
    "Силовые",
    "Кардио",
    "Функциональный",
    "Групповые",
    "VIP",
    "Единоборства",
  ];

  // Фильтрация тренеров
  const filteredTrainers = trainersData.filter((trainer) => {
    const matchesSearch =
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.badges.some((badge) =>
        badge.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "Все" || trainer.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <TrainersPageHeader 
        totalTrainers={trainersData.length}
        categoriesCount={categories.length - 1}
        filteredCount={filteredTrainers.length}
        averageRating={4.8}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        categories={categories}
        onCategoryChange={setSelectedCategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Профессиональные тренеры
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {" "}
              FitAccess
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Выберите идеального тренера для достижения ваших фитнес-целей. Все
            наши специалисты имеют сертификаты и богатый опыт работы.
          </p>
        </div>

        {/* Поиск и фильтры */}
        <div className="mb-8 space-y-4">
          {/* Поиск */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Поиск по имени, специализации или навыкам..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Фильтры по категориям */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">
              {trainersData.length}
            </div>
            <div className="text-sm text-gray-600">Всего тренеров</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">
              {categories.length - 1}
            </div>
            <div className="text-sm text-gray-600">Специализаций</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-purple-600">4.8</div>
            <div className="text-sm text-gray-600">Средний рейтинг</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-orange-600">
              {filteredTrainers.length}
            </div>
            <div className="text-sm text-gray-600">Найдено</div>
          </Card>
        </div>

        {/* Сетка тренеров */}
        {filteredTrainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrainers.map((trainer, index) => (
              <TrainerCard key={trainer.name} trainer={trainer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Тренеры не найдены
            </h3>
            <p className="text-gray-500 mb-4">
              Попробуйте изменить критерии поиска или выбрать другую категорию
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Все");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* Призыв к действию */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-dashed border-blue-300 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Не можете выбрать?
            </h3>
            <p className="text-gray-600 mb-6">
              Наши консультанты помогут подобрать идеального тренера под ваши
              цели и предпочтения
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/consultation")}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
              >
                Получить консультацию
              </button>
              <button
                onClick={() => router.push("/programs/yoga")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                Групповые занятия
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
