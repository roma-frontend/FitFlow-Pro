// components/admin/users/UserDetailsModal.tsx
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Shield, 
  CreditCard,
  Activity,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Target,
  Zap
} from "lucide-react";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  membership?: any;
  stats?: any;
  isLoadingMembership?: boolean;
  isLoadingStats?: boolean;
}

export function UserDetailsModal({
  isOpen,
  onClose,
  user,
  membership,
  stats,
  isLoadingMembership = false,
  isLoadingStats = false
}: UserDetailsModalProps) {
  if (!user) return null;

  const formatDate = (timestamp: number | string) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (timestamp: number | string) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'super-admin': 'bg-red-100 text-red-800',
      'admin': 'bg-purple-100 text-purple-800',
      'manager': 'bg-blue-100 text-blue-800',
      'trainer': 'bg-green-100 text-green-800',
      'member': 'bg-gray-100 text-gray-800',
      'client': 'bg-orange-100 text-orange-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getMembershipBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Информация о пользователе</DialogTitle>
          <DialogDescription>
            Подробная информация и статистика
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Основное</TabsTrigger>
              <TabsTrigger value="membership">Абонемент</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              {/* Основная информация */}
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                  <AvatarImage src={user.photoUrl} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                    {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Активен
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Неактивен
                          </>
                        )}
                      </Badge>
                      {user.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Верифицирован
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.department && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>{user.department}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Временные метки */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex flex-col sm:flex-row items:start sm:items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Дата регистрации
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg sm:text-xl font-bold">{formatDate(user.createdAt)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Последний вход
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {user.lastLogin ? formatDateTime(user.lastLogin) : 'Никогда'}
                    </p>
                  </CardContent>
                </Card>

                {user.createdBy && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Создан пользователем
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">{user.createdBy}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Дополнительная информация */}
              {user.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">О себе</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{user.bio}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="membership" className="space-y-6 mt-6">
              {isLoadingMembership ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : membership ? (
                <>
                  {/* Текущий абонемент */}
                  <Card className="border-2 border-blue-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Текущий абонемент
                        </CardTitle>
                        <Badge className={getMembershipBadgeColor(membership.status)}>
                          {membership.status === 'active' ? 'Активен' : 
                           membership.status === 'expired' ? 'Истек' : 
                           membership.status === 'cancelled' ? 'Отменен' : membership.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Тип абонемента</p>
                          <p className="font-semibold capitalize">{membership.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Стоимость</p>
                          <p className="font-semibold">{membership.price?.toLocaleString()} ₽</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Дата начала</p>
                          <p className="font-semibold">{formatDate(membership.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Дата окончания</p>
                          <p className="font-semibold">{formatDate(membership.expiresAt)}</p>
                        </div>
                      </div>

                      {membership.remainingDays !== undefined && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Осталось дней:</span>
                            <span className={`text-2xl font-bold ${
                              membership.remainingDays > 14 ? 'text-green-600' :
                              membership.remainingDays > 7 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {membership.remainingDays}
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                membership.remainingDays > 14 ? 'bg-green-500' :
                                membership.remainingDays > 7 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.max(0, Math.min(100, (membership.remainingDays / 30) * 100))}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {membership.autoRenew && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Автопродление включено
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {/* Статистика использования */}
                  {membership.usageStats && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Статистика использования
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="space-y-2">
                            <p className="text-base sm:text-lg md:text-xl font-bold text-blue-600">
                              {membership.usageStats.visitsThisMonth || 0}
                            </p>
                            <p className="text-sm text-gray-500">Визитов в этом месяце</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-base sm:text-lg md:text-xl font-bold text-green-600">
                              {membership.usageStats.totalVisits || 0}
                            </p>
                            <p className="text-sm text-gray-500">Всего визитов</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-base sm:text-lg md:text-xl font-bold text-purple-600">
                              {membership.usageStats.favoriteTime || 'Не определено'}
                            </p>
                            <p className="text-sm text-gray-500">Любимое время</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">У пользователя нет активного абонемента</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-6 mt-6">
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : stats ? (
                <>
                  {/* Основная статистика */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          Тренировок
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.totalWorkouts || 0}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          Часов
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.totalHours || 0}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          Серия дней
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.currentStreak || 0}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Award className="h-4 w-4 text-purple-500" />
                          Рекордов
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.personalRecords || 0}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Достижения */}
                  {stats.achievements && stats.achievements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Достижения
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {stats.achievements.map((achievement: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Award className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{achievement.title}</p>
                                {achievement.earnedAt && (
                                  <p className="text-xs text-gray-500">
                                    {formatDate(achievement.earnedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Цели */}
                  {stats.goals && stats.goals.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Цели
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {stats.goals.map((goal: any, index: number) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{goal.title}</p>
                                <Badge variant={goal.completed ? "default" : "secondary"}>
                                  {goal.completed ? 'Выполнено' : 'В процессе'}
                                </Badge>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Статистика недоступна</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}