// Final Optimized AdminMembershipPlansPage.tsx
"use client";

import React, { useState, Suspense, lazy } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

// Основные компоненты (загружаются сразу)
import { PlansHeader } from "@/components/admin/plans/PlansHeader";
import { PlansStatistics } from "@/components/admin/plans/PlansStatistics";
import { PlansFilters } from "@/components/admin/plans/PlansFilters";
import { PlansGrid } from "@/components/admin/plans/PlansGrid";

// Lazy-загружаемые компоненты (загружаются по требованию)
const PlanDialog = lazy(() => import("@/components/admin/plans/PlanDialog"));
const DeleteConfirmDialog = lazy(() => import("@/components/admin/plans/DeleteConfirmDialog"));

// Хуки
import { usePlans, type MembershipPlan, type PlanUpdateData } from "@/hooks/usePlans";
import { usePlanForm, type PlanFormData } from "@/hooks/usePlanForm";
import { usePlansFilter, type FilterType, type SortBy } from "@/hooks/usePlansFilter";
import { useOptimisticPlans } from "@/hooks/useOptimisticPlans";

// Утилиты
import { validatePlanForm } from "@/utils/validation";

// Error Boundary для диалогов
class DialogErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Dialog error:', error, errorInfo);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Произошла ошибка при загрузке диалога. Попробуйте обновить страницу.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default function AdminMembershipPlansPage() {
  const { toast } = useToast();
  
  // Основные хуки
  const {
    plans,
    loading,
    actionLoading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan
  } = usePlans();

  // Оптимистичные обновления
  const { plans: optimisticPlans, togglePlanActiveOptimistic } = useOptimisticPlans(plans, updatePlan);

  // Фильтрация и поиск
  const {
    filteredPlans,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    showActiveOnly,
    setShowActiveOnly,
    resultsCount,
    totalCount
  } = usePlansFilter(optimisticPlans);

  // Состояния диалогов
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  // Формы
  const createForm = usePlanForm();
  const editForm = usePlanForm();

  // Вспомогательные функции
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

  // Обработчики диалогов
  const handleCreatePlan = () => {
    createForm.resetForm();
    setShowCreateDialog(true);
  };

  const handleEditPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    editForm.setFormData({
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

  const handleDeletePlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setDeleteAlertOpen(true);
  };

  // Обработчики отправки форм с валидацией
  const handleSubmitCreate = async () => {
    const validationErrors = validatePlanForm(createForm.formData);
    
    if (validationErrors.length > 0) {
      toast({
        variant: "destructive",
        title: "Ошибка валидации",
        description: validationErrors[0]
      });
      return;
    }

    const success = await createPlan(createForm.formData);
    if (success) {
      setShowCreateDialog(false);
      createForm.resetForm();
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedPlan) return;
    
    const validationErrors = validatePlanForm(editForm.formData);
    
    if (validationErrors.length > 0) {
      toast({
        variant: "destructive",
        title: "Ошибка валидации",
        description: validationErrors[0]
      });
      return;
    }

    // Преобразуем данные формы в данные для обновления
    const updateData: PlanUpdateData = {
      name: editForm.formData.name,
      type: editForm.formData.type,
      duration: editForm.formData.duration,
      price: editForm.formData.price,
      description: editForm.formData.description,
      features: editForm.formData.features,
      isActive: editForm.formData.isActive
    };

    const success = await updatePlan(selectedPlan._id, updateData);
    if (success) {
      setShowEditDialog(false);
      setSelectedPlan(null);
      editForm.resetForm();
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPlan) return;

    const success = await deletePlan(selectedPlan._id);
    if (success) {
      setDeleteAlertOpen(false);
      setSelectedPlan(null);
    }
  };

  // Обработчик ошибок диалогов
  const handleDialogError = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setDeleteAlertOpen(false);
    setSelectedPlan(null);
    
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: "Произошла ошибка при загрузке диалога. Попробуйте еще раз."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Заголовок */}
      <PlansHeader
        loading={loading}
        onRefresh={fetchPlans}
        onCreatePlan={handleCreatePlan}
        onCheckPlans={handleCheckPlans}
        onSeedPlans={handleSeedPlans}
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Статистика */}
        <PlansStatistics plans={optimisticPlans} />

        {/* Фильтры */}
        {!loading && !error && optimisticPlans.length > 0 && (
          <PlansFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            showActiveOnly={showActiveOnly}
            onShowActiveOnlyChange={setShowActiveOnly}
            resultsCount={resultsCount}
            totalCount={totalCount}
          />
        )}

        {/* Основной контент */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        ) : (
          <PlansGrid
            plans={filteredPlans}
            onEdit={handleEditPlan}
            onDelete={handleDeletePlan}
            onToggleActive={togglePlanActiveOptimistic}
            onCreatePlan={handleCreatePlan}
          />
        )}

        {/* Диалоги с lazy loading и error boundary */}
        <DialogErrorBoundary onError={handleDialogError}>
          <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>}>
            {/* Диалог создания */}
            {showCreateDialog && (
              <PlanDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                title="Создать новый план"
                description="Заполните информацию о новом плане абонемента"
                mode="create"
                loading={actionLoading}
                formData={createForm.formData}
                featureInput={createForm.featureInput}
                onFieldChange={createForm.updateField}
                onFeatureInputChange={createForm.setFeatureInput}
                onAddFeature={createForm.addFeature}
                onRemoveFeature={createForm.removeFeature}
                onSubmit={handleSubmitCreate}
                onCancel={() => setShowCreateDialog(false)}
              />
            )}

            {/* Диалог редактирования */}
            {showEditDialog && (
              <PlanDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                title="Редактировать план"
                description="Измените информацию о плане абонемента"
                mode="edit"
                loading={actionLoading}
                formData={editForm.formData}
                featureInput={editForm.featureInput}
                onFieldChange={editForm.updateField}
                onFeatureInputChange={editForm.setFeatureInput}
                onAddFeature={editForm.addFeature}
                onRemoveFeature={editForm.removeFeature}
                onSubmit={handleSubmitEdit}
                onCancel={() => setShowEditDialog(false)}
              />
            )}

            {/* Диалог удаления */}
            {deleteAlertOpen && (
              <DeleteConfirmDialog
                open={deleteAlertOpen}
                onOpenChange={setDeleteAlertOpen}
                plan={selectedPlan}
                loading={actionLoading}
                onConfirm={handleConfirmDelete}
              />
            )}
          </Suspense>
        </DialogErrorBoundary>
      </div>
    </div>
  );
}

// Performance monitoring (опционально)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Мониторинг производительности в dev режиме
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure' && entry.name.includes('membership-plans')) {
        console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
      }
    }
  });
  
  observer.observe({ entryTypes: ['measure'] });
}