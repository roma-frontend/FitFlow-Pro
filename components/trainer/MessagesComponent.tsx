// components/trainer/MessagesComponent.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTrainer } from '@/contexts/TrainerContext';
import { MessageSquare, Search, Plus, Clock, User } from "lucide-react";

export default function MessagesComponent() {
  const { messages, messageStats } = useTrainer();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Фильтруем сообщения
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.senderName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'unread' && message.status !== 'read') ||
                         (selectedFilter === 'read' && message.status === 'read');
    
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Срочно';
      case 'high': return 'Высокий';
      case 'normal': return 'Обычный';
      case 'low': return 'Низкий';
      default: return priority || 'Обычный';
    }
  };

   const formatDate = (timestamp: number | string | undefined) => {
    if (!timestamp) return 'Неизвестно';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ч. назад`;
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и поиск */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Сообщения</h2>
          <p className="text-gray-600">Всего сообщений: {messages.length}</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск сообщений..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Написать
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Всего</span>
            </div>
            <p className="text-2xl font-bold">{messageStats.totalMessages}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Непрочитанные</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{messageStats.unreadMessages}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Сегодня</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{messageStats.todayMessages}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Срочные</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{messageStats.messagesByPriority.urgent}</p>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2">
        <Button 
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('all')}
        >
          Все
        </Button>
        <Button 
          variant={selectedFilter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('unread')}
        >
          Непрочитанные ({messageStats.unreadMessages})
        </Button>
        <Button 
          variant={selectedFilter === 'read' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('read')}
        >
          Прочитанные
        </Button>
      </div>

      {/* Список сообщений */}
      <Card>
        <CardHeader>
          <CardTitle>Список сообщений</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMessages.length > 0 ? (
            <div className="space-y-4">
              {filteredMessages.map((message, index) => (
                <div 
                  key={message.id || index} 
                  className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                    message.status !== 'read' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {message.senderName || 'Неизвестный отправитель'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {message.type === 'direct' ? 'Личное сообщение' :
                           message.type === 'group' ? 'Групповое сообщение' :
                           message.type === 'announcement' ? 'Объявление' :
                           message.type === 'notification' ? 'Уведомление' :
                           'Сообщение'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {message.priority && message.priority !== 'normal' && (
                        <Badge className={getPriorityColor(message.priority)}>
                          {getPriorityText(message.priority)}
                        </Badge>
                      )}
                      
                      {message.status !== 'read' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      
                      <span className="text-xs text-gray-500">
                        {formatDate(message._creationTime || message.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 line-clamp-2">
                    {message.content || 'Содержимое сообщения недоступно'}
                  </p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">
                        📎 {message.attachments.length} вложений
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {searchTerm ? 'Сообщения не найдены' : 'Нет сообщений'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

