// components/admin/settings/UserManagement.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Mail,
  Phone,
  MoreHorizontal,
  UserPlus,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super-admin' | 'admin' | 'manager' | 'trainer' | 'reception';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Администратор',
      email: 'admin@fitaccess.ru',
      phone: '+7 (495) 123-45-67',
      role: 'super-admin',
      status: 'active',
      lastLogin: '2024-01-15 10:30:00',
      createdAt: '2024-01-01 00:00:00'
    },
    {
      id: '2',
      name: 'Иван Петров',
      email: 'ivan@fitaccess.ru',
      phone: '+7 (495) 123-45-68',
      role: 'trainer',
      status: 'active',
      lastLogin: '2024-01-15 09:15:00',
      createdAt: '2024-01-05 10:00:00'
    },
    {
      id: '3',
      name: 'Мария Иванова',
      email: 'maria@fitaccess.ru',
      phone: '+7 (495) 123-45-69',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-14 18:45:00',
      createdAt: '2024-01-03 14:30:00'
    },
    {
      id: '4',
      name: 'Алексей Сидоров',
      email: 'alexey@fitaccess.ru',
      role: 'reception',
      status: 'inactive',
      createdAt: '2024-01-08 11:20:00'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const getRoleInfo = (role: User['role']) => {
    const roles = {
      'super-admin': { name: 'Супер-администратор', color: 'bg-red-100 text-red-800' },
      'admin': { name: 'Администратор', color: 'bg-purple-100 text-purple-800' },
      'manager': { name: 'Менеджер', color: 'bg-blue-100 text-blue-800' },
      'trainer': { name: 'Тренер', color: 'bg-green-100 text-green-800' },
      'reception': { name: 'Администратор', color: 'bg-gray-100 text-gray-800' }
    };
    return roles[role];
  };

  const getStatusInfo = (status: User['status']) => {
    const statuses = {
      'active': { name: 'Активен', color: 'bg-green-100 text-green-800' },
      'inactive': { name: 'Неактивен', color: 'bg-gray-100 text-gray-800' },
      'suspended': { name: 'Заблокирован', color: 'bg-red-100 text-red-800' }
    };
    return statuses[status];
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleStatusChange = (userId: string, newStatus: User['status']) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    ));
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Управление пользователями</h2>
          <p className="text-gray-600">Управление учетными записями и правами доступа</p>
        </div>
        <Button 
          onClick={() => {
            setEditingUser(null);
            setShowUserDialog(true);
          }}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Добавить пользователя
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-sm text-gray-600">Всего пользователей</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Активных</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {users.filter(u => ['super-admin', 'admin'].includes(u.role)).length}
                </div>
                <div className="text-sm text-gray-600">Администраторов</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'trainer').length}
                </div>
                <div className="text-sm text-gray-600">Тренеров</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список пользователей */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Пользователи</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-[5px] top-[10px] transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск пользователей..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map(user => {
              const roleInfo = getRoleInfo(user.role);
              const statusInfo = getStatusInfo(user.status);
              
              return (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        )}
                      </div>
                      {user.lastLogin && (
                        <div className="text-xs text-gray-500">
                          Последний вход: {new Date(user.lastLogin).toLocaleString('ru')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={roleInfo.color}>
                      {roleInfo.name}
                    </Badge>
                    
                    <Badge className={statusInfo.color}>
                      {statusInfo.name}
                    </Badge>

                    <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        
                        {user.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'suspended')}>
                            <Shield className="h-4 w-4 mr-2" />
                            Заблокировать
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')}>
                            <Shield className="h-4 w-4 mr-2" />
                            Активировать
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Пользователи не найдены</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Диалог создания/редактирования пользователя */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Имя</label>
              <Input placeholder="Введите имя пользователя" />
            </div>
            
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="user@fitaccess.ru" />
            </div>
            
            <div>
              <label className="text-sm font-medium">Телефон</label>
              <Input placeholder="+7 (495) 123-45-67" />
            </div>
            
            <div>
              <label className="text-sm font-medium">Роль</label>
              <select className="w-full p-2 border rounded-md">
                <option value="reception">Администратор</option>
                <option value="trainer">Тренер</option>
                <option value="manager">Менеджер</option>
                <option value="admin">Администратор</option>
                <option value="super-admin">Супер-администратор</option>
              </select>
            </div>
            
            {!editingUser && (
              <div>
                <label className="text-sm font-medium">Пароль</label>
                <Input type="password" placeholder="Введите пароль" />
              </div>
            )}
            
            <div className="flex items-center gap-2 pt-4">
              <Button className="flex-1">
                {editingUser ? 'Сохранить' : 'Создать'}
              </Button>
              <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

