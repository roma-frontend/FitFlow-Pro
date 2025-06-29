// components/TrainersPageHeader.tsx
"use client";

import React from 'react';
import {
  Users,
  Star,
  Award,
  TrendingUp,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import MainHeader from '@/components/MainHeader';

interface TrainersPageHeaderProps {
  totalTrainers: number;
  categoriesCount: number;
  filteredCount: number;
  averageRating?: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
}

export default function TrainersPageHeader({
  totalTrainers,
  categoriesCount,
  filteredCount,
  averageRating = 4.8,
  searchTerm,
  onSearchChange,
  selectedCategory,
  categories,
  onCategoryChange
}: TrainersPageHeaderProps) {

  return (
    <>
      {/* Основной header */}
      <MainHeader
      />

      {/* Секция поиска и фильтров */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Hero текст */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Профессиональные тренеры
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                {" "}FitFlow-Pro
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Выберите идеального тренера для достижения ваших фитнес-целей
            </p>
          </div>

          {/* Поиск */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Поиск по имени, специализации..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Фильтры по категориям */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === category
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:border-gray-400"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Статистические карточки */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <div className="text-2xl font-bold text-blue-600">{totalTrainers}</div>
              </div>
              <div className="text-sm text-gray-600">Всего тренеров</div>
            </Card>

            <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-green-600 mr-2" />
                <div className="text-2xl font-bold text-green-600">{categoriesCount}</div>
              </div>
              <div className="text-sm text-gray-600">Специализаций</div>
            </Card>

            <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-yellow-600 mr-2" />
                <div className="text-2xl font-bold text-yellow-600">{averageRating}</div>
              </div>
              <div className="text-sm text-gray-600">Средний рейтинг</div>
            </Card>

            <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <div className="text-2xl font-bold text-purple-600">{filteredCount}</div>
              </div>
              <div className="text-sm text-gray-600">
                {filteredCount === totalTrainers ? 'Доступно' : 'Найдено'}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}