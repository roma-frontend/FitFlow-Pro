// app/admin/users/components/tabs/TabletHierarchyTab.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, Unlock, ChevronDown } from "lucide-react";
import { useHierarchyData } from "@/hooks/useHierarchyData";

export const TabletHierarchyTab = () => {
  const { roleHierarchy, permissionMatrix, getRoleIcon, hasPermission, totalUsers } = useHierarchyData();

  return (
    <div className="space-y-6 p-4">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-3">
              <Crown className="h-6 w-6 text-purple-600" />
              Панель управления
            </h1>
            <p className="text-gray-600 mt-2">Управление пользователями и правами доступа</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-purple-200">
            <span className="text-gray-700 font-medium">Пользователей:</span>
            <span className="text-xl font-bold ml-2 text-purple-600">{totalUsers}</span>
          </div>
        </div>
      </div>

      {/* Иерархия ролей */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="py-4">
          <CardTitle className="text-xl flex items-center gap-3">
            <Crown className="h-6 w-6" />
            Иерархия ролей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleHierarchy.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.role}
                  className={`p-4 rounded-xl border-2 ${role.borderColor} ${role.bgColor}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${role.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-md font-bold text-gray-900">
                          {role.name}
                        </h3>
                        <Badge className={`${role.textColor} ${role.bgColor}`}>
                          Уровень {role.level}
                        </Badge>
                        <Badge variant="destructive">
                          {role.count} пользователей
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-3 text-sm">{role.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 3).map((permission, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{role.permissions.length - 3} еще
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Матрица прав доступа */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="py-4">
          <CardTitle className="text-xl flex items-center gap-3">
            <Lock className="h-6 w-6" />
            Матрица прав доступа
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {permissionMatrix.map((category, categoryIndex) => {
              const CategoryIcon = category.icon;
              return (
                <div key={categoryIndex} className="space-y-4">
                  <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <CategoryIcon className="h-5 w-5" />
                    {category.category}
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">
                            Разрешение
                          </th>
                          {roleHierarchy.map((role) => {
                            const Icon = getRoleIcon(role.role);
                            return (
                              <th
                                key={role.role}
                                className="text-center py-3 px-2"
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <Icon className="h-4 w-4" />
                                  <span className="text-xs font-medium">
                                    {role.name.split(' ')[0]}
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
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 text-sm text-gray-700">
                              {permission.name}
                            </td>
                            {roleHierarchy.map((role) => (
                              <td
                                key={role.role}
                                className="py-3 px-2 text-center"
                              >
                                {hasPermission(permission, role.role) ? (
                                  <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                                    <Unlock className="h-3 w-3 text-green-600" />
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                                    <Lock className="h-3 w-3 text-red-600" />
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
    </div>
  );
};