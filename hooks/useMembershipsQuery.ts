// hooks/useMembershipsQuery.ts
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchCurrentMembership,
  fetchMembershipPlans,
  createMembership,
  renewMembership,
  cancelMembership,
  fetchMembershipHistory,
  fetchMembershipStats
} from '@/lib/api/memberships';

// Хук для получения текущего абонемента пользователя
export function useCurrentMembership(userId?: string) {
  const {
    data: membership,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['membership', 'current', userId],
    queryFn: () => fetchCurrentMembership(userId!),
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    membership,
    isLoading,
    error: error?.message,
    refetch
  };
}

// Хук для получения планов абонементов
export function useMembershipPlans() {
  const {
    data: plans = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: fetchMembershipPlans,
    staleTime: 5 * 60 * 1000, // 5 минут - планы меняются редко
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    plans,
    isLoading,
    error: error?.message,
    refetch
  };
}

// Хук для получения истории абонементов
export function useMembershipHistory(userId?: string, includeExpired = true) {
  const {
    data: history = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['membership-history', userId, includeExpired],
    queryFn: () => fetchMembershipHistory(userId!, includeExpired),
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
  });

  return {
    history,
    isLoading,
    error: error?.message,
    refetch
  };
}

// Хук для статистики абонементов (для админов)
export function useMembershipStats() {
  const {
    data: stats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['membership-stats'],
    queryFn: fetchMembershipStats,
    staleTime: 60 * 1000, // 1 минута
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Обновляем каждые 5 минут
  });

  return {
    stats,
    isLoading,
    error: error?.message,
    refetch
  };
}

// Хук для мутаций абонементов
export function useMembershipMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createMembership,
    onSuccess: (newMembership, variables) => {
      // Инвалидируем все связанные запросы
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      queryClient.invalidateQueries({ queryKey: ['membership-history'] });
      queryClient.invalidateQueries({ queryKey: ['membership-stats'] });
      
      // Обновляем текущий абонемент
      if (variables.userId) {
        queryClient.setQueryData(
          ['membership', 'current', variables.userId], 
          newMembership
        );
      }
    },
    onError: (error) => {
      console.error('Failed to create membership:', error);
    }
  });

  const renewMutation = useMutation({
    mutationFn: ({ membershipId, planId }: { membershipId: string; planId: string }) =>
      renewMembership(membershipId, planId),
    onSuccess: (data, variables) => {
      // Инвалидируем все связанные запросы
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      queryClient.invalidateQueries({ queryKey: ['membership-history'] });
      queryClient.invalidateQueries({ queryKey: ['membership-stats'] });
    },
    onError: (error) => {
      console.error('Failed to renew membership:', error);
    }
  });

  const cancelMutation = useMutation({
    mutationFn: cancelMembership,
    onSuccess: (data, membershipId) => {
      // Инвалидируем все связанные запросы
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      queryClient.invalidateQueries({ queryKey: ['membership-history'] });
      queryClient.invalidateQueries({ queryKey: ['membership-stats'] });
      
      // Удаляем из кэша
      queryClient.removeQueries({ queryKey: ['membership', 'current'] });
    },
    onError: (error) => {
      console.error('Failed to cancel membership:', error);
    }
  });

  return {
    createMembership: createMutation.mutateAsync,
    renewMembership: (membershipId: string, planId: string) =>
      renewMutation.mutateAsync({ membershipId, planId }),
    cancelMembership: cancelMutation.mutateAsync,

    // Состояния загрузки
    isCreating: createMutation.isPending,
    isRenewing: renewMutation.isPending,
    isCancelling: cancelMutation.isPending,

    // Ошибки
    createError: createMutation.error?.message,
    renewError: renewMutation.error?.message,
    cancelError: cancelMutation.error?.message,
  };
}
