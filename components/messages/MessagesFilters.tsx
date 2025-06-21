// components/messages/MessagesFilters.tsx
import React from 'react';
import { Search } from 'lucide-react';

interface MessagesFiltersProps {
  searchTerm: string;
  filterType: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const MessagesFilters: React.FC<MessagesFiltersProps> = ({
  searchTerm,
  filterType,
  filterStatus,
  onSearchChange,
  onTypeChange,
  onStatusChange
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск сообщений..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <select
          value={filterType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">Все типы</option>
          <option value="direct">Личные</option>
          <option value="announcement">Объявления</option>
          <option value="notification">Уведомления</option>
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">Все статусы</option>
          <option value="unread">Непрочитанные</option>
          <option value="read">Прочитанные</option>
          <option value="archived">Архивные</option>
        </select>
      </div>
    </div>
  );
};

export default MessagesFilters;