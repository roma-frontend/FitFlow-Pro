// components/admin/QuickActions.tsx - обновленная версия с утилитами
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePersonalizedActions } from '@/hooks/usePersonalizedActions';
import { useAuth } from '@/hooks/useAuth';
import { useRoleTexts } from '@/lib/roleTexts';
import { FaceIdSetup } from "@/components/face-id/FaceIdSetup";
import { toast } from "@/hooks/use-toast";
import { faceIdUtils } from "@/utils/faceIdUtils"; // ✅ Импорт утилит
import {
  Zap,
  Plus,
  BarChart3,
  Settings,
  MessageSquare,
  ChevronRight,
  Star,
  Clock,
  Users,
  Calendar,
  Target,
  Activity,
  UserPlus,
  FileText,
  TrendingUp,
  CreditCard,
  Shield,
  AlertTriangle,
  DollarSign,
  CalendarPlus,
  Camera,
  X,
  Trash2
} from "lucide-react";

// Типы остаются те же...
interface FaceIdAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  roleSpecific: boolean;
}

type AnyAction = FaceIdAction | any;
type ActionsByCategory = Record<string, AnyAction[]>;

// Маппинг иконок
const iconMap = {
  Shield, Activity, BarChart3, AlertTriangle, UserPlus, DollarSign,
  CreditCard, TrendingUp, Calendar, Users, Settings, MessageSquare,
  CalendarPlus, FileText, Target, Clock, Plus, Star, Camera
};

interface QuickActionsProps {
  variant?: 'compact' | 'expanded';
  showCategories?: boolean;
  maxActions?: number;
}

export function QuickActions({
  variant = 'expanded',
  showCategories = true,
  maxActions = 6
}: QuickActionsProps) {
  const { user } = useAuth();
  const userRole = user?.role;
  const roleTexts = useRoleTexts(userRole);
  const { actions, actionsByCategory, recommendedActions, executeAction } = usePersonalizedActions();
  const [selectedCategory, setSelectedCategory] = useState<string>('create');

  // ✅ Face ID состояния с использованием утилит
  const [showFaceIdSetup, setShowFaceIdSetup] = useState(false);
  const [faceIdStatus, setFaceIdStatus] = useState(() => faceIdUtils.getStatus());

  // ✅ Проверяем статус при монтировании
  useEffect(() => {
    const status = faceIdUtils.getStatus();
    setFaceIdStatus(status);
    console.log('🔍 Face ID статус:', status);
  }, []);

  // ✅ Улучшенный Face ID Setup
  if (showFaceIdSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              {faceIdStatus.enabled ? 'Переустановка Face ID' : 'Настройка Face ID'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFaceIdSetup(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* ✅ Показываем текущий статус если уже настроен */}
          {faceIdStatus.enabled && faceIdStatus.profile && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800">
                  Текущий профиль
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    faceIdUtils.removeProfile();
                    setFaceIdStatus(faceIdUtils.getStatus());
                    toast({
                      title: "Профиль удален",
                      description: "Face ID отключен",
                    });
                  }}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-yellow-700">
                ID: {faceIdStatus.profile.id}<br />
                Создан: {new Date(faceIdStatus.profile.created).toLocaleDateString()}
                {faceIdStatus.profile.lastUsed && (
                  <><br />Последний вход: {new Date(faceIdStatus.profile.lastUsed).toLocaleDateString()}</>
                )}
              </p>
            </div>
          )}

          <FaceIdSetup
            onComplete={(success: boolean, data?: any) => {
              console.log('🎯 Face ID Setup результат:', { success, data });

              if (success && data) {
                // ✅ Создаем профиль с полной информацией
                const profile = {
                  id: data.profileId || `face_${Date.now()}`,
                  userId: user?.id || 'unknown',
                  created: new Date().toISOString(),
                  lastUsed: new Date().toISOString()
                };

                // Сохраняем через утилиты
                faceIdUtils.saveProfile(profile);

                // Обновляем состояние
                setFaceIdStatus(faceIdUtils.getStatus());
                setShowFaceIdSetup(false);

                toast({
                  title: "Face ID настроен! 🎉",
                  description: `Профиль создан: ${profile.id.slice(0, 8)}...`,
                });
              } else {
                toast({
                  variant: "destructive",
                  title: "Ошибка настройки Face ID",
                  description: "Не удалось создать профиль. Попробуйте еще раз.",
                });
              }
            }}
          />

          {/* Инструкция для пользователя */}
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Как настроить:</strong>
              </p>
              <ol className="text-xs text-blue-600 mt-2 space-y-1">
                <li>1. Разрешите доступ к камере</li>
                <li>2. Посмотрите прямо в камеру</li>
                <li>3. Дождитесь сканирования лица</li>
                <li>4. Подтвердите создание профиля</li>
              </ol>
            </div>

            {/* Проверка поддержки */}
            {!faceIdUtils.isSupported() && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  ⚠️ <strong>Внимание:</strong> Ваш браузер не поддерживает доступ к камере
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Остальные функции остаются без изменений...
  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Plus;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'create': return 'bg-green-100 text-green-700 border-green-200';
      case 'manage': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'analyze': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'communicate': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'security': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'create': return 'Создание';
      case 'manage': return 'Управление';
      case 'analyze': return 'Аналитика';
      case 'communicate': return 'Общение';
      case 'security': return 'Безопасность';
      default: return 'Другое';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // ✅ Улучшенный обработчик Face ID
  const handleFaceIdAction = () => {
    if (!faceIdUtils.isSupported()) {
      toast({
        variant: "destructive",
        title: "Браузер не поддерживается",
        description: "Ваш браузер не поддерживает доступ к камере",
      });
      return;
    }

    setShowFaceIdSetup(true);
  };

  // ✅ Создаем Face ID действие с реальным статусом
  const faceIdAction: FaceIdAction = {
    id: 'setup-face-id',
    label: faceIdStatus.enabled ? 'Управление Face ID' : 'Настроить Face ID',
    description: faceIdStatus.enabled
      ? `Профиль: ${faceIdStatus.profile?.id.slice(0, 8)}...`
      : 'Настройте быстрый вход через Face ID',
    icon: 'Camera',
    category: 'security',
    priority: 'medium',
    roleSpecific: true
  };

  // Остальной код остается без изменений...
  if (!user || !userRole) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm">Загрузка действий...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Компактный вариант и основная часть остаются без изменений,
  // только заменяем faceIdEnabled на faceIdStatus.enabled
  // и добавляем правильные проверки статуса

  const extendedRecommendedActions: AnyAction[] = faceIdStatus.enabled
    ? recommendedActions
    : [faceIdAction, ...recommendedActions];

  const extendedActionsByCategory: ActionsByCategory = {
    ...actionsByCategory,
    security: [faceIdAction, ...(actionsByCategory.security || [])]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          {roleTexts.quickActionsTitle || 'Быстрые действия'}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Персонализированные действия для вашей роли
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ✅ Улучшенный статус Face ID */}
        {faceIdStatus.enabled && faceIdStatus.profile && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Face ID активен
                </span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {faceIdStatus.profile.id.slice(0, 8)}...
              </Badge>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Последний вход: {faceIdStatus.profile.lastUsed
                ? new Date(faceIdStatus.profile.lastUsed).toLocaleString()
                : 'Не использовался'
              }
            </p>
          </div>
        )}

        {/* Остальной JSX код остается тот же, только заменяем проверки на faceIdStatus.enabled */}

        {/* Рекомендуемые действия */}
        {extendedRecommendedActions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-yellow-500" />
              <h3 className="font-medium text-gray-900">Рекомендуемые</h3>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {extendedRecommendedActions.map((action: AnyAction) => {
                const Icon = getIcon(action.icon);
                const isFaceId = action.id === 'setup-face-id';

                return (
                  <div
                    key={action.id}
                    className={`p-4 border rounded-lg transition-colors cursor-pointer group ${isFaceId
                        ? faceIdStatus.enabled
                          ? 'border-green-200 bg-green-50 hover:bg-green-100'
                          : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                        : 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
                      }`}
                    onClick={() => isFaceId ? handleFaceIdAction() : executeAction(action.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon className={`h-5 w-5 ${isFaceId
                          ? faceIdStatus.enabled ? 'text-green-600' : 'text-blue-600'
                          : 'text-yellow-600'
                        }`} />
                      <Badge variant="outline" className={`text-xs ${isFaceId
                          ? faceIdStatus.enabled
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                        }`}>
                        {isFaceId ? (faceIdStatus.enabled ? 'Активен' : 'Настроить') : 'Важно'}
                      </Badge>
                    </div>
                    <h4 className={`font-medium mb-1 transition-colors ${isFaceId
                        ? faceIdStatus.enabled
                          ? 'text-gray-900 group-hover:text-green-800'
                          : 'text-gray-900 group-hover:text-blue-800'
                        : 'text-gray-900 group-hover:text-yellow-800'
                      }`}>
                      {action.label}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {action.description}
                    </p>
                    <div className="flex items-center justify-end mt-3">
                      <ChevronRight className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${isFaceId
                          ? faceIdStatus.enabled ? 'text-green-600' : 'text-blue-600'
                          : 'text-yellow-600'
                        }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Остальные секции... */}
        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>Доступно действий: {actions.length + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Обновлено только что</span>
            </div>
          </div>
        </div>

        {/* Действия по категориям */}
        {showCategories && Object.keys(extendedActionsByCategory).length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Все действия</h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(extendedActionsByCategory).map((category: string) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`${selectedCategory === category ? '' : getCategoryColor(category)}`}
                >
                  {getCategoryName(category)}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {extendedActionsByCategory[category]?.length || 0}
                  </Badge>
                </Button>
              ))}
            </div>

            {extendedActionsByCategory[selectedCategory] && (
              <div className="space-y-3">
                {extendedActionsByCategory[selectedCategory].map((action: AnyAction) => {
                  const Icon = getIcon(action.icon);
                  const isFaceId = action.id === 'setup-face-id';

                  return (
                    <div
                      key={action.id}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => isFaceId ? handleFaceIdAction() : executeAction(action.id)}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(selectedCategory)}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                            {action.label}
                          </h4>
                          {action.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              Приоритет
                            </Badge>
                          )}
                          {action.roleSpecific && (
                            <Badge variant="outline" className="text-xs">
                              Для {roleTexts.roleDisplayName}
                            </Badge>
                          )}
                          {isFaceId && faceIdStatus.enabled && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Активен
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {action.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(action.priority)}`} />
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Если нет доступных действий */}
        {actions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Нет доступных действий</h3>
            <p className="text-sm">
              Действия появятся в зависимости от ваших прав доступа и текущего контекста
            </p>
          </div>
        )}

        {/* Персонализированные подсказки */}
        {userRole && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Star className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">
                  Совет для {roleTexts.roleDisplayName}
                </div>
                <div className="text-blue-700">
                  {userRole === 'super-admin' && 'Настройте Face ID для быстрого доступа к критическим функциям администрации'}
                  {userRole === 'admin' && 'Используйте Face ID для безопасного входа в панель управления'}
                  {userRole === 'manager' && 'Face ID поможет быстро получать доступ к инструментам управления'}
                  {userRole === 'trainer' && 'Настройте Face ID для удобного доступа к клиентским данным'}
                  {userRole === 'member' && 'Записывайтесь на новые занятия и отслеживайте свой прогресс'}
                  {userRole === 'client' && 'Обсуждайте цели с тренером и ведите дневник тренировок'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
