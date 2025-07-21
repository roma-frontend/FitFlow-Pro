// hooks/usePlans.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { MembershipPlan } from '@/types/membership';
import { PlanFormData } from '@/types/common';

// Тип для обновления планов (включает все поля, которые можно обновлять)
export interface PlanUpdateData {
  name?: string;
  type?: string;
  duration?: number;
  price?: number;
  description?: string; // Может быть undefined или строка
  features?: string[];
  isActive?: boolean;
}

export const usePlans = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPlans = useCallback(async () => {
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
  }, [toast]);

  const createPlan = useCallback(async (planData: PlanFormData): Promise<boolean> => {
    setActionLoading(true);
    try {
      // Подготавливаем данные для отправки: убираем isActive и обрабатываем description
      const dataToSend = {
        name: planData.name,
        type: planData.type,
        duration: planData.duration,
        price: planData.price,
        description: planData.description.trim() || undefined, // Отправляем undefined если пустое
        features: planData.features,
        isActive: planData.isActive ?? true
      };

      const response = await fetch("/api/memberships/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка создания плана");
      }

      toast({
        title: "Успех",
        description: "План успешно создан"
      });

      await fetchPlans();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchPlans, toast]);

  const updatePlan = useCallback(async (id: string, planData: PlanUpdateData): Promise<boolean> => {
    setActionLoading(true);
    try {
      // Обрабатываем description для отправки
      const dataToSend = {
        ...planData,
        // Если description это пустая строка, отправляем undefined
        ...(planData.description !== undefined && {
          description: planData.description.trim() || undefined
        })
      };

      const response = await fetch("/api/memberships/plans/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...dataToSend })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка обновления плана");
      }

      toast({
        title: "Успех",
        description: "План успешно обновлен"
      });

      await fetchPlans();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchPlans, toast]);

  const deletePlan = useCallback(async (id: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/memberships/plans/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка удаления плана");
      }

      toast({
        title: "Успех",
        description: "План успешно удален"
      });

      await fetchPlans();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchPlans, toast]);

  const togglePlanActive = useCallback(async (plan: MembershipPlan): Promise<boolean> => {
    return updatePlan(plan._id, { isActive: !plan.isActive });
  }, [updatePlan]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    actionLoading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanActive
  };
};