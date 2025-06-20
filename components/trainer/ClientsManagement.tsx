// components/trainer/ClientsManagement.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTrainer } from '@/contexts/TrainerContext';
import { Users, Search, Plus, Mail, Phone } from "lucide-react";

export default function ClientsManagement() {
  const { members, clients } = useTrainer();
  const [searchTerm, setSearchTerm] = useState('');

  // Объединяем участников и клиентов
  const allClients = [
    ...members.map(m => ({ ...m, type: 'member' })),
    ...clients.map(c => ({ ...c, type: 'client' }))
  ];

  // Фильтруем по поисковому запросу
  const filteredClients = allClients.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'inactive': return 'Неактивный';
      case 'trial': return 'Пробный';
      default: return status || 'Неизвестно';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и поиск */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Управление клиентами</h2>
          <p className="text-gray-600">Всего клиентов: {allClients.length}</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск клиентов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Добавить
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Всего</span>
            </div>
            <p className="text-2xl font-bold">{allClients.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Активные</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {allClients.filter(c => c.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Пробные</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {allClients.filter(c => c.status === 'trial').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Неактивные</span>
            </div>
            <p className="text-2xl font-bold text-gray-600">
              {allClients.filter(c => c.status === 'inactive').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Список клиентов */}
      <Card>
        <CardHeader>
          <CardTitle>Список клиентов</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length > 0 ? (
            <div className="space-y-4">
              {filteredClients.map((client, index) => (
                <div key={client.id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{client.name || 'Имя не указано'}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {client.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(client.status || '')}>
                      {getStatusText(client.status || '')}
                    </Badge>
                    
                    <Badge variant="outline">
                      {client.type === 'member' ? 'Участник' : 'Клиент'}
                    </Badge>
                    
                    <Button variant="ghost" size="sm">
                      Подробнее
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {searchTerm ? 'Клиенты не найдены' : 'Нет клиентов'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
