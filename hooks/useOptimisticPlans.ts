// hooks/useOptimisticPlans.ts
import { useState, useCallback } from 'react';
import type { MembershipPlan } from '@/types/membership';

export const useOptimisticPlans = (plans: MembershipPlan[], updatePlan: (id: string, data: Partial<MembershipPlan>) => Promise<boolean>) => {
  const [optimisticPlans, setOptimisticPlans] = useState<MembershipPlan[]>([]);

  const togglePlanActiveOptimistic = useCallback(async (plan: MembershipPlan) => {
    // Оптимистичное обновление UI
    const updatedPlans = plans.map(p => 
      p._id === plan._id ? { ...p, isActive: !p.isActive } : p
    );
    setOptimisticPlans(updatedPlans);

    try {
      const success = await updatePlan(plan._id, { isActive: !plan.isActive });
      if (!success) {
        // Откатываем изменения при ошибке
        setOptimisticPlans(plans);
      }
      return success;
    } catch (error) {
      // Откатываем изменения при ошибке
      setOptimisticPlans(plans);
      throw error;
    }
  }, [plans, updatePlan]);

  return {
    plans: optimisticPlans.length > 0 ? optimisticPlans : plans,
    togglePlanActiveOptimistic
  };
};
