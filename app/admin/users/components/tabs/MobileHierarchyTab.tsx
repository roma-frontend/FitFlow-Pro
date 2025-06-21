// app/admin/users/components/tabs/MobileHierarchyTab.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Crown, Lock, Unlock } from "lucide-react";
import { useHierarchyData } from "@/hooks/useHierarchyData";

export const MobileHierarchyTab = () => {
  const { roleHierarchy, permissionMatrix, hasPermission, totalUsers } = useHierarchyData();
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleRole = (role: string) => {
    setExpandedRoles(prev => ({ ...prev, [role]: !prev[role] }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="space-y-4 p-2">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Crown className="h-5 w-5 text-purple-600" />
          Панель супер-администратора
        </h1>
        <p className="text-gray-500 text-sm mt-1">Управление пользователями</p>
        <div className="mt-4 bg-blue-50 rounded-lg p-3 flex items-center justify-between">
          <span className="font-medium">Всего пользователей</span>
          <Badge variant="special" className="text-base px-3 py-1">
            {totalUsers}
          </Badge>
        </div>
      </div>

      {/* Иерархия ролей */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Иерархия ролей
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-3">
            {roleHierarchy.map((role) => {
              const Icon = role.icon;
              const isExpanded = expandedRoles[role.role];
              
              return (
                <div 
                  key={role.role} 
                  className={`border-b border-gray-100 pb-3 mx-4 ${isExpanded ? 'pb-4' : ''}`}
                >
                  <div 
                    className="flex items-center justify-between py-2 cursor-pointer"
                    onClick={() => toggleRole(role.role)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${role.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${role.textColor} ${role.bgColor}`}>
                            Уровень {role.level}
                          </Badge>
                          <Badge variant="destructive" className="text-xs">
                            {role.count} пользователей
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    />
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-3 pl-11 pr-2 space-y-3">
                      <p className="text-sm text-gray-600">{role.description}</p>
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-500">Права доступа:</h4>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs py-1 px-2"
                            >
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Матрица прав доступа */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Матрица прав
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-4">
            {permissionMatrix.map((category, categoryIndex) => {
              const CategoryIcon = category.icon;
              const isExpanded = expandedCategories[category.category];
              
              return (
                <div key={categoryIndex} className="mx-4">
                  <div 
                    className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer"
                    onClick={() => toggleCategory(category.category)}
                  >
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4 text-gray-700" />
                      <h3 className="font-medium text-gray-900">{category.category}</h3>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    />
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-3 space-y-3">
                      {category.permissions.map((permission, permIndex) => (
                        <div 
                          key={permIndex} 
                          className="bg-gray-50 rounded-lg p-3"
                        >
                          <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Доступно для:</p>
                            <div className="flex flex-wrap gap-2">
                              {roleHierarchy.map((role) => {
                                if (!hasPermission(permission, role.role)) return null;
                                const Icon = role.icon;
                                
                                return (
                                  <div 
                                    key={role.role} 
                                    className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border"
                                  >
                                    <div className={`p-1 rounded-full ${role.color}`}>
                                      <Icon className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-xs">{role.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Статистика по ролям */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Распределение ролей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roleHierarchy.map((role) => {
              const Icon = role.icon;
              const percentage = totalUsers > 0 ? (role.count / totalUsers) * 100 : 0;

              return (
                <div
                  key={role.role}
                  className={`p-3 rounded-lg ${role.bgColor} border ${role.borderColor}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${role.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{role.name}</span>
                        <span className="font-bold">{role.count}</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${role.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};