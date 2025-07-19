"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Plus,
  CreditCard,
  AlertTriangle,
  Loader2,
  Package,
  RefreshCw,
  Settings,
  Eye,
  Activity,
  Database,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Users,
  Dumbbell,
  Star,
  Trophy,
  Infinity,
  X,
  Save
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Типы
export interface MembershipPlan {
  _id: string;
  name: string;
  type: string;
  duration: number;
  price: number;
  description?: string;
  features: string[];
  isActive: boolean;
  createdAt?: number;
}

interface PlanFormData {
  name: string;
  type: string;
  duration: number;
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export default function AdminMembershipPlansPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояния модальных окон
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  // Форма
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    type: "basic",
    duration: 30,
    price: 0,
    description: "",
    features: [],
    isActive: true
  });

  const [featureInput, setFeatureInput] = useState("");


  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput("");
    }
  };

  // Функция удаления особенности
  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({
      name: "",
      type: "basic",
      duration: 30,
      price: 0,
      description: "",
      features: [],
      isActive: true
    });
    setFeatureInput("");
  };

  // Загрузка планов
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/memberships/plans");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка загрузки планов");
      }

      setPlans(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Создание плана
  const handleCreate = async () => {
    if (!formData.name || !formData.price || !formData.duration) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните все обязательные поля"
      });
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/memberships/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка создания плана");
      }

      toast({
        title: "Успех",
        description: "План успешно создан"
      });

      setShowCreateDialog(false);
      resetForm();
      await fetchPlans();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Обновление плана
  const handleUpdate = async () => {
    if (!selectedPlan || !formData.name || !formData.price || !formData.duration) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните все обязательные поля"
      });
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/memberships/plans/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPlan._id,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка обновления плана");
      }

      toast({
        title: "Успех",
        description: "План успешно обновлен"
      });

      setShowEditDialog(false);
      setSelectedPlan(null);
      resetForm();
      await fetchPlans();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Удаление плана
  const handleDelete = async () => {
    if (!selectedPlan) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/memberships/plans/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedPlan._id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка удаления плана");
      }

      toast({
        title: "Успех",
        description: "План успешно удален"
      });

      setDeleteAlertOpen(false);
      setSelectedPlan(null);
      await fetchPlans();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Открытие диалога редактирования
  const openEditDialog = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      type: plan.type,
      duration: plan.duration,
      price: plan.price,
      description: plan.description || "",
      features: plan.features || [],
      isActive: plan.isActive
    });
    setShowEditDialog(true);
  };

  // Переключение активности плана
  const togglePlanActive = async (plan: MembershipPlan) => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/memberships/plans/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: plan._id,
          isActive: !plan.isActive
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка обновления статуса");
      }

      toast({
        title: "Успех",
        description: `План ${!plan.isActive ? "активирован" : "деактивирован"}`
      });

      await fetchPlans();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/admin");
  };

  const handleRefresh = () => {
    setError(null);
    fetchPlans();
  };

  const handleGoToMemberships = () => {
    router.push("/admin/memberships");
  };

  const handleCheckPlans = async () => {
    try {
      const response = await fetch("/api/memberships/check-plans");
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Проверка завершена",
          description: `Найдено планов: ${data.count}`
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось проверить планы"
      });
    }
  };

  const handleSeedPlans = async () => {
    try {
      const response = await fetch("/api/memberships/seed", {
        method: "POST"
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успех",
          description: data.message
        });
        await fetchPlans();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось инициализировать планы"
      });
    }
  };

  // Статистика
  const stats = {
    total: plans.length,
    active: plans.filter(p => p.isActive).length,
    monthly: plans.filter(p => p.duration === 30).length,
    yearly: plans.filter(p => p.duration === 365).length,
  };

  // Иконки и цвета для карточек
  const planIcons = {
    basic: Dumbbell,
    premium: Star,
    vip: Trophy,
    unlimited: Infinity
  };

  const planColors = {
    basic: "from-gray-500 to-gray-600",
    premium: "from-blue-500 to-indigo-600",
    vip: "from-purple-500 to-pink-600",
    unlimited: "from-yellow-500 to-orange-600"
  };

  const durationLabels = {
    30: "Месячный",
    90: "Квартальный",
    180: "Полугодовой",
    365: "Годовой"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header с кнопками */}
      <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm rounded-xl">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Левая часть */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={handleBack}
                className="group p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>

              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm bg-green-400 animate-pulse" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="hidden md:inline text-base md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Управление планами
                </h1>
                <p className="hidden md:inline-block text-sm text-gray-500 mt-0.5">
                  Создание и редактирование тарифных планов
                </p>
              </div>
            </div>

            {/* Правая часть - действия */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Кнопка обновления */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="group p-2.5 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Обновить"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Кнопка перехода к абонементам */}
              <button
                onClick={handleGoToMemberships}
                className="group p-2.5 hover:bg-purple-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
                aria-label="Абонементы"
              >
                <Package className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
              </button>

              {/* Кнопка настроек */}
              <button
                onClick={() => router.push('/admin/settings')}
                className="group p-2.5 hover:bg-orange-50 rounded-xl transition-all duration-200 hidden sm:block transform hover:scale-105 active:scale-95 hover:shadow-lg"
                aria-label="Настройки"
              >
                <Settings className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
              </button>

              {/* Кнопка проверки планов */}
              <button
                onClick={handleCheckPlans}
                disabled={loading}
                className="group p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Проверить планы"
              >
                <Eye className="h-5 w-5 text-gray-600 group-hover:text-blue-600 hidden sm:block transition-colors" />
              </button>

              {/* Кнопка инициализации */}
              <button
                onClick={handleSeedPlans}
                disabled={loading}
                className="group p-2.5 hover:bg-indigo-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
                aria-label="Инициализировать планы"
              >
                <Database className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
              </button>

              {/* Кнопка создания плана */}
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg ml-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Новый план</span>
                <span className="md:hidden">Новый</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Статистика */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-muted-foreground">Всего планов</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-muted-foreground">Активные</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-muted-foreground">Месячные</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.monthly}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-muted-foreground">Годовые</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.yearly}</p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Контент */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Нет планов абонементов
              </h3>
              <p className="text-gray-600 mb-6">
                Создайте первый план для начала работы
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                <Plus className="h-4 w-4 mr-2" />
                Создать план
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = planIcons[plan.type as keyof typeof planIcons] || Package;
              const color = planColors[plan.type as keyof typeof planColors] || "from-gray-500 to-gray-600";
              const durationLabel = durationLabels[plan.duration as keyof typeof durationLabels] || `${plan.duration} дней`;

              return (
                <div key={plan._id} className="relative group h-full flex flex-col min-h-[320px]">
                  {/* Затемнение фона при наведении */}
                  <div className={`absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 z-10 pointer-events-none`} />

                  {/* Кнопки управления (центр карточки) */}
                  <div className="absolute w-full h-full flex items-center justify-center z-30 gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {/* Кнопка редактирования с tooltip */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 bg-white hover:bg-white shadow-md hover:shadow-lg hover:scale-110 transition-all"
                            onClick={() => openEditDialog(plan)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-gray-50 text-black text-[11px]">
                          Редактировать план
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Кнопка удаления с tooltip */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 bg-white hover:bg-white shadow-md hover:shadow-lg hover:scale-110 transition-all"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setDeleteAlertOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-gray-50 text-black text-[11px]">
                          Удалить план
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Индикатор статуса (правый верхний угол) */}
                  <div className="absolute top-3 right-3 z-30">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${plan.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlanActive(plan);
                            }}
                          >
                            {plan.isActive ? (
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
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-gray-800 text-white text-sm">
                          {plan.isActive
                            ? "Кликните для деактивации плана"
                            : "Кликните для активации плана"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Карточка плана */}
                  <Card className={`relative z-0 flex-1 flex flex-col bg-gradient-to-br ${color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
                    <CardHeader className="pb-3 pt-10">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                          {durationLabel}
                        </Badge>
                      </div>
                      {plan.description && (
                        <CardDescription className="text-white/80">
                          {plan.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="flex-1">
                      <div className="mb-4">
                        <div className="text-3xl font-bold">
                          {plan.price.toLocaleString()}₽
                        </div>
                        <div className="text-sm opacity-90">
                          {plan.duration === 30 ? 'в месяц' : plan.duration === 365 ? 'в год' : `на ${plan.duration} дней`}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {plan.features?.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {/* Диалог создания плана */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создать новый план</DialogTitle>
              <DialogDescription>Заполните информацию о новом плане абонемента</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Название *</Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Например: Премиум"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-type">Тип *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Базовый</SelectItem>
                      <SelectItem value="premium">Премиум</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="unlimited">Безлимит</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-duration">Длительность (дней) *</Label>
                  <Input
                    id="create-duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-price">Цена (₽) *</Label>
                  <Input
                    id="create-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    placeholder="2990"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-description">Описание</Label>
                <Textarea
                  id="create-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Идеально для начинающих"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Особенности плана</Label>
                <div className="flex gap-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Например: Доступ в тренажерный зал"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button
                    type="button"
                    onClick={addFeature}
                    disabled={!featureInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.features.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="flex-1 text-sm">{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeature(index)}
                          className="h-6 w-6"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                />
                <Label htmlFor="create-isActive">
                  Активировать план сразу после создания
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Отмена
              </Button>
              <Button
                onClick={handleCreate}
                disabled={actionLoading}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать план
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования плана */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактировать план</DialogTitle>
              <DialogDescription>Измените информацию о плане абонемента</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Название *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Например: Премиум"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-type">Тип *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Базовый</SelectItem>
                      <SelectItem value="premium">Премиум</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="unlimited">Безлимит</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Длительность (дней) *</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-price">Цена (₽) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    placeholder="2990"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Описание</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Идеально для начинающих"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Особенности плана</Label>
                <div className="flex gap-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Например: Доступ в тренажерный зал"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button
                    type="button"
                    onClick={addFeature}
                    disabled={!featureInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.features.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="flex-1 text-sm">{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeature(index)}
                          className="h-6 w-6"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                />
                <Label htmlFor="edit-isActive" className="mb-0">
                  План активен
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Отмена
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={actionLoading}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Диалог подтверждения удаления */}
        <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Удалить план?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Вы действительно хотите удалить план "{selectedPlan?.name}"?
                Это действие нельзя отменить. План будет деактивирован, если у него есть активные абонементы.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Удаление...
                  </>
                ) : (
                  "Удалить"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}