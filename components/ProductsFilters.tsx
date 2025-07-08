"use client";

import React from 'react';
import { useProductsStoreWithDefaults } from '@/hooks/useStoreWithDefaults';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductsFilters() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = useProductsStoreWithDefaults();

  const categories = [
    { value: 'all', label: 'Все категории' },
    { value: 'supplements', label: 'Добавки' },
    { value: 'protein', label: 'Протеин' },
    { value: 'vitamins', label: 'Витамины' },
    { value: 'creatine', label: 'Креатин' },
    { value: 'bars', label: 'Батончики' },
    { value: 'drinks', label: 'Напитки' },
  ];

  const sortOptions = [
    { value: '', label: 'Выберите сортировку', isHeader: true },
    { value: 'name', label: 'По названию' },
    { value: 'price', label: 'По цене' },
    { value: 'popularity', label: 'По популярности' },
    { value: 'inStock', label: 'По наличию' },
  ];

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 10000]);
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 10000;

  return (
    <div className="space-y-6">
      {/* Поиск */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Поиск
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Категории */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Категория
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Цена */}
      <Card>
        <CardHeader>
          <CardTitle>Цена</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="min-price">От</Label>
              <Input
                id="min-price"
                type="number"
                placeholder="0"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              />
            </div>
            <div>
              <Label htmlFor="max-price">До</Label>
              <Input
                id="max-price"
                type="number"
                placeholder="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              />
            </div>
          </div>

          {/* Быстрые фильтры по цене */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPriceRange([0, 1000])}
            >
              До 1000₽
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPriceRange([1000, 3000])}
            >
              1000-3000₽
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPriceRange([3000, 10000])}
            >
              Свыше 3000₽
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Сортировка */}
      <Card>
        <CardHeader>
          <CardTitle>Сортировка</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Сортировать по</Label>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Сортировка</SelectLabel>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant={sortOrder === 'asc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortOrder('asc')}
              className="flex-1 p-3"
            >
              По возрастанию
            </Button>
            <Button
              variant={sortOrder === 'desc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortOrder('desc')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 flex-1 p-3"
            >
              По убыванию
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Сброс фильтров */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Сбросить фильтры
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Активные фильтры */}
      {hasActiveFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Активные фильтры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Поиск: "{searchQuery}"
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}

              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find(c => c.value === selectedCategory)?.label}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSelectedCategory('all')}
                  />
                </Badge>
              )}

              {(priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {priceRange[0]}₽ - {priceRange[1]}₽
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setPriceRange([0, 10000])}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}