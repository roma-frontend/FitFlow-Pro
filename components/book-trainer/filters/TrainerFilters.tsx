// components/book-trainer/filters/TrainerFilters.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface TrainerFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  specializationFilter: string;
  setSpecializationFilter: (filter: string) => void;
  priceFilter: string;
  setPriceFilter: (filter: string) => void;
  resetFilters: () => void;
}

export function TrainerFilters({
  searchQuery,
  setSearchQuery,
  specializationFilter,
  setSpecializationFilter,
  priceFilter,
  setPriceFilter,
  resetFilters,
}: TrainerFiltersProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск тренера..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={specializationFilter}
            onValueChange={setSpecializationFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Специализация" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все специализации</SelectItem>
              <SelectItem value="Силовые тренировки">Силовые тренировки</SelectItem>
              <SelectItem value="Йога">Йога</SelectItem>
              <SelectItem value="Кардио">Кардио</SelectItem>
              <SelectItem value="Кроссфит">Кроссфит</SelectItem>
              <SelectItem value="Пилатес">Пилатес</SelectItem>
              <SelectItem value="Функциональный тренинг">Функциональный тренинг</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Цена" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любая цена</SelectItem>
              <SelectItem value="budget">До 2000 ₽</SelectItem>
              <SelectItem value="medium">2000-3500 ₽</SelectItem>
              <SelectItem value="premium">От 3500 ₽</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={resetFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Сбросить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
