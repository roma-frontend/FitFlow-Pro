import React, { memo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useProductsStore } from '@/stores/productsStore';
import { useDebounce } from '@/utils/shopOptimization';

const ProductFilters = memo(() => {
  const {
    selectedCategory,
    searchQuery,
    sortBy,
    sortOrder,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    filteredProducts,
    products
  } = useProductsStore();

  // Дебаунс для поиска
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, [setSelectedCategory]);

  const handleSortChange = useCallback((newSortBy: string) => {
    // ИСПРАВЛЕНО: используем 'popular' вместо 'popularity'
    setSortBy(newSortBy as 'name' | 'price' | 'popular');
  }, [setSortBy]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  }, [sortOrder, setSortOrder]);

  const categories = [
    { value: 'all', label: 'Все категории', count: products.length },
    { value: 'supplements', label: 'Добавки', count: products.filter(p => p.category === 'supplements').length },
    { value: 'drinks', label: 'Напитки', count: products.filter(p => p.category === 'drinks').length },
    { value: 'snacks', label: 'Снеки', count: products.filter(p => p.category === 'snacks').length },
    { value: 'merchandise', label: 'Товары', count: products.filter(p => p.category === 'merchandise').length },
  ];

const sortOptions = [
  { value: 'name', label: 'По названию' },
  { value: 'price', label: 'По цене' },
  { value: 'popularity', label: 'По популярности' }, 
];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Заголовок и счетчик */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Фильтры
            </h2>
            <span className="text-sm text-gray-500">
              Найдено: {filteredProducts.length} из {products.length}
            </span>
          </div>

          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Фильтры в одну строку на больших экранах */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Категории */}
            <div>
              <label className="text-sm font-medium mb-2 block">Категория</label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Сортировка */}
            <div>
              <label className="text-sm font-medium mb-2 block">Сортировка</label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Порядок сортировки */}
            <div>
              <label className="text-sm font-medium mb-2 block">Порядок</label>
              <Button
                variant="outline"
                onClick={toggleSortOrder}
                className="w-full justify-start"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <SortAsc className="h-4 w-4 mr-2" />
                    По возрастанию
                  </>
                ) : (
                  <>
                    <SortDesc className="h-4 w-4 mr-2" />
                    По убыванию
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Быстрые фильтры */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('all')}
            >
              Все
            </Button>
            {categories.slice(1).map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(category.value)}
                disabled={category.count === 0}
              >
                {category.label} ({category.count})
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductFilters.displayName = 'ProductFilters';

export default ProductFilters;
