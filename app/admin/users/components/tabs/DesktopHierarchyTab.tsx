// app/admin/users/components/tabs/DesktopHierarchyTab.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Shield,
  UserCheck,
  User,
  ChevronDown,
  Lock,
  Unlock,
  Eye,
  Settings,
  BarChart3,
  Users as UsersIcon,
} from "lucide-react";
import { useHierarchyData } from "@/hooks/useHierarchyData";

export const DesktopHierarchyTab = () => {
  const { roleHierarchy, permissionMatrix, getRoleIcon, hasPermission } = useHierarchyData();
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  
  const toggleRole = (role: string) => {
    setExpandedRoles(prev => ({ ...prev, [role]: !prev[role] }));
  };

  return (
    <div className="space-y-8">
      {/* Шапка панели */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-4">
              <Crown className="h-8 w-8 text-purple-600" />
              Панель супер-администратора
            </h1>
            <p className="text-gray-600 mt-2 text-base">Управление пользователями и правами доступа</p>
          </div>
          <div className="bg-white px-4 py-3 rounded-xl border border-purple-200 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium text-base">Всего пользователей:</span>
              <Badge variant="special" className="text-md px-4 py-2">
                {roleHierarchy.reduce((sum, role) => sum + role.count, 0)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Иерархия ролей */}
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <Crown className="h-6 w-6" />
            Иерархия ролей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {roleHierarchy.map((role, index) => {
              const Icon = role.icon;
              const isExpanded = expandedRoles[role.role];
              
              return (
                <div key={role.role} className="relative">
                  {/* Линия связи */}
                  {index < roleHierarchy.length - 1 && (
                    <div className="absolute left-10 top-20 w-0.5 h-8 bg-gray-300"></div>
                  )}

                  <div
                    className={`p-5 rounded-xl border-2 ${role.borderColor} ${role.bgColor} transition-all duration-300 hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-5">
                        <div
                          className={`p-4 rounded-xl ${role.color} text-white shadow-md`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-4 mb-3">
                            <h3 className="text-md font-bold text-gray-900">
                              {role.name}
                            </h3>
                            <Badge
                              className={`text-sm py-1 px-3 ${role.textColor} ${role.bgColor}`}
                            >
                              Уровень {role.level}
                            </Badge>
                            <Badge variant="destructive" className="text-sm py-1 px-3">
                              {role.count} пользователей
                            </Badge>
                          </div>
                          <p className="text-gray-700 text-sm mb-4">
                            {role.description}
                          </p>
                          
                          <button 
                            onClick={() => toggleRole(role.role)}
                            className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                          >
                            <span className="mr-1">{isExpanded ? "Свернуть" : "Подробнее"}</span>
                            <ChevronDown 
                              className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            />
                          </button>
                          
                          {isExpanded && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-900 mb-2">Полные права доступа:</h4>
                              <div className="grid grid-cols-2 gap-3">
                                {role.permissions.map((permission, idx) => (
                                  <div key={idx} className="flex items-start">
                                    <div className="bg-green-100 rounded-full p-1 mt-0.5 mr-2">
                                      <Unlock className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="text-gray-700">{permission}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {index < roleHierarchy.length - 1 && (
                        <div className="flex items-center h-full pt-10">
                          <ChevronDown className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Матрица прав доступа */}
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Lock className="h-6 w-6" />
            Матрица прав доступа
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-10">
            {permissionMatrix.map((category, categoryIndex) => {
              const CategoryIcon = category.icon;
              return (
                <div key={categoryIndex} className="space-y-6">
                  <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <CategoryIcon className="h-6 w-6" />
                    {category.category}
                  </h3>

                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-4 px-6 font-bold text-gray-700 text-md">
                            Разрешение
                          </th>
                          {roleHierarchy.map((role) => {
                            const Icon = getRoleIcon(role.role);
                            return (
                              <th
                                key={role.role}
                                className="text-center py-4 px-5"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className={`p-2 rounded-lg ${role.color} text-white`}>
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <span className="font-medium text-gray-800">
                                    {role.name}
                                  </span>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {category.permissions.map((permission, permIndex) => (
                          <tr
                            key={permIndex}
                            className="border-b border-gray-100 hover:bg-gray-50/50 even:bg-gray-50/30"
                          >
                            <td className="py-4 px-6 text-gray-800 font-medium">
                              {permission.name}
                            </td>
                            {roleHierarchy.map((role) => (
                              <td
                                key={role.role}
                                className="py-4 px-5 text-center"
                              >
                                {hasPermission(permission, role.role) ? (
                                  <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full shadow-inner">
                                    <Unlock className="h-4 w-4 text-green-600" />
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full shadow-inner">
                                    <Lock className="h-4 w-4 text-red-600" />
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Статистика по ролям */}
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Распределение пользователей по ролям</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-5">
            {roleHierarchy.map((role) => {
              const Icon = role.icon;
              const totalUsers = roleHierarchy.reduce((sum, r) => sum + r.count, 0);
              const percentage = totalUsers > 0 ? (role.count / totalUsers) * 100 : 0;

              return (
                <div
                  key={role.role}
                  className={`p-5 rounded-xl ${role.bgColor} border ${role.borderColor} flex flex-col`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${role.color} text-white shadow-md`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {role.count}
                      </div>
                      <div className="text-sm text-gray-600">{role.name}</div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="text-2xl font-bold mb-2">{percentage.toFixed(1)}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${role.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Легенда */}
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Обозначения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-900 text-lg mb-4">Права доступа:</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-green-50 p-4 rounded-xl">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full shadow">
                    <Unlock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Разрешено</div>
                    <p className="text-gray-600 mt-1">Пользователь имеет доступ к этой функции</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-red-50 p-4 rounded-xl">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full shadow">
                    <Lock className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Запрещено</div>
                    <p className="text-gray-600 mt-1">Доступ к функции ограничен</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-lg mb-4">Иерархия:</h4>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mt-1 mr-3">
                    <Crown className="h-4 w-4 text-blue-600" />
                  </div>
                  <p>Более высокие роли включают все права нижестоящих ролей</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-1 mt-1 mr-3">
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                  <p>Супер-админ имеет полный контроль над системой</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-1 mt-1 mr-3">
                    <UserCheck className="h-4 w-4 text-red-600" />
                  </div>
                  <p>Администратор управляет пользователями (кроме супер-админов)</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mt-1 mr-3">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <p>Клиенты имеют ограниченный доступ к функциям</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};