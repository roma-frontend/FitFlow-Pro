// components/admin/users/SearchComponent.tsx
"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchComponentProps {
  onSearchChange: (term: string) => void;
  onFilterToggle?: () => void;
  placeholder?: string;
  showFilters?: boolean;
  initialValue?: string;
}

export const SearchComponent = React.memo(({
  onSearchChange,
  onFilterToggle,
  placeholder = "Поиск пользователей...",
  showFilters = true,
  initialValue = ""
}: SearchComponentProps) => {
  const [searchInput, setSearchInput] = useState(initialValue);
  
  // Дебаунсинг поискового запроса
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // Эффект для отправки дебаунсированного значения
  React.useEffect(() => {
    onSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange]);

  // Мемоизированные обработчики
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setSearchInput('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  // Мемоизированные значения
  const hasValue = useMemo(() => searchInput.length > 0, [searchInput.length]);
  const isSearching = useMemo(() => searchInput !== debouncedSearchTerm, [searchInput, debouncedSearchTerm]);

  return (
    <div className="flex items-center gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
          isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'
        }`} />
        
        <Input
          type="text"
          placeholder={placeholder}
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
        />
        
        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
            title="Очистить поиск"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showFilters && onFilterToggle && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onFilterToggle}
          className="flex items-center gap-2 whitespace-nowrap"
          title="Фильтры"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Фильтры</span>
        </Button>
      )}
    </div>
  );
});

SearchComponent.displayName = 'SearchComponent';
