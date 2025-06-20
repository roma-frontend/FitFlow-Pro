// app/admin/users/components/OptimizedUserFilters.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { useDebounce } from '@/hooks/useDebounce';
import { useUsersPage } from '@/app/admin/users/providers/UsersPageProvider';

export const OptimizedUserFilters = React.memo(() => {
  const { actions } = useUsersPage();
  const [searchInput, setSearchInput] = useState('');
  
  // ✅ Дебаунс для поиска
  const debouncedSearch = useDebounce(searchInput, 300);
  
  // ✅ Применяем дебаунсированный поиск
  React.useEffect(() => {
    actions.setSearchTerm(debouncedSearch);
  }, [debouncedSearch, actions.setSearchTerm]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Поиск пользователей..."
        value={searchInput}
        onChange={handleSearchChange}
        className="max-w-sm"
      />
      {/* Остальные фильтры */}
    </div>
  );
});

OptimizedUserFilters.displayName = 'OptimizedUserFilters';
