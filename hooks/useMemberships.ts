// hooks/useMemberships.ts
import { useCurrentMembership, useMembershipPlans, useMembershipHistory, useMembershipMutations } from './useMembershipsQuery';
import { useQueryClient } from '@tanstack/react-query';
import type { MembershipFormData } from '@/types/membership';

export function useMemberships(userId?: string) {
  const { membership, isLoading: membershipLoading, error: membershipError, refetch: refetchMembership } = useCurrentMembership(userId);
  const { plans, isLoading: plansLoading, error: plansError, refetch: refetchPlans } = useMembershipPlans();
  const { history, isLoading: historyLoading, error: historyError, refetch: refetchHistory } = useMembershipHistory(userId);
  const mutations = useMembershipMutations();
  const queryClient = useQueryClient();

  // Улучшенная функция принудительного обновления всех данных
  const forceRefresh = async () => {
    console.log("🔄 Начинаем принудительное обновление данных");
    
    try {
      // Сначала инвалидируем кэш
      await queryClient.invalidateQueries({ queryKey: ['membership'] });
      await queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      await queryClient.invalidateQueries({ queryKey: ['membership-history'] });
      
      // Затем принудительно перезапрашиваем данные
      const results = await Promise.allSettled([
        queryClient.refetchQueries({ queryKey: ['membership'] }),
        refetchMembership(),
        refetchPlans(),
        refetchHistory()
      ]);
      
      console.log("✅ Принудительное обновление завершено", results);
      
      return results;
    } catch (error) {
      console.error("❌ Ошибка при принудительном обновлении:", error);
      throw error;
    }
  };

  return {
    // Данные
    currentMembership: membership,
    plans,
    history,
    
    // Состояния загрузки
    isLoading: membershipLoading || plansLoading,
    isLoadingMembership: membershipLoading,
    isLoadingPlans: plansLoading,
    isLoadingHistory: historyLoading,
    
    // Ошибки
    error: membershipError || plansError || historyError,
    membershipError,
    plansError,
    historyError,
    
    // Функции обновления
    refetch: forceRefresh,
    refetchMembership,
    refetchPlans,
    refetchHistory,
    
    // Мутации
    ...mutations
  };
}

// Обновленный хук для управления абонементами
export function useMembershipManagement() {
  const mutations = useMembershipMutations();
  const queryClient = useQueryClient();

  // Функция для принудительного обновления кэша
  const invalidateAndRefreshMembership = async () => {
    console.log("🔄 Обновление кэша абонементов");
    
    // Инвалидируем кэш
    await queryClient.invalidateQueries({ queryKey: ['membership'] });
    
    // Принудительно обновляем
    await queryClient.refetchQueries({ 
      queryKey: ['membership'], 
      type: 'active' 
    });
    
    console.log("✅ Кэш абонементов обновлен");
  };

  return {
    purchaseMembership: async (data: MembershipFormData): Promise<any> => {
      try {
        console.log("🛒 Покупка абонемента:", data);
        const result = await mutations.createMembership(data);
        
        // Обновляем кэш после покупки
        await invalidateAndRefreshMembership();
        
        console.log("✅ Абонемент успешно приобретен");
        return result;
      } catch (error) {
        console.error('❌ Ошибка покупки абонемента:', error);
        throw error;
      }
    },
    
    renewMembership: async (membershipId: string, planId: string): Promise<any> => {
      try {
        console.log("🔄 Продление абонемента:", { membershipId, planId });
        const result = await mutations.renewMembership(membershipId, planId);
        
        // Обновляем кэш после продления
        await invalidateAndRefreshMembership();
        
        console.log("✅ Абонемент успешно продлен");
        return result;
      } catch (error) {
        console.error('❌ Ошибка продления абонемента:', error);
        throw error;
      }
    },
    
    cancelMembership: async (membershipId: string): Promise<void> => {
      try {
        console.log("🚫 Отмена абонемента:", membershipId);
        await mutations.cancelMembership(membershipId);
        
        // Обновляем кэш после отмены
        await invalidateAndRefreshMembership();
        
        console.log("✅ Абонемент успешно отменен");
      } catch (error) {
        console.error('❌ Ошибка отмены абонемента:', error);
        throw error;
      }
    },
    
    isProcessing: mutations.isCreating || mutations.isRenewing || mutations.isCancelling,
    isCreating: mutations.isCreating,
    isRenewing: mutations.isRenewing,
    isCancelling: mutations.isCancelling,
    
    createError: mutations.createError,
    renewError: mutations.renewError,
    cancelError: mutations.cancelError,
  };
}