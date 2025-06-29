// hooks/useMembershipData.ts
import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useMembershipData(userId?: string) {
    const [error, setError] = useState<string | null>(null);

    // Получаем текущий абонемент пользователя
    const currentMembership = useQuery(
        api.memberships.getCurrentMembership,
        userId ? { userId } : "skip"
    );

    // Получаем все планы абонементов
    const plans = useQuery(api.memberships.getPlans);

    // Получаем историю заказов пользователя
    const orderHistory = useQuery(
        api.membershipOrders.getUserOrders,
        userId ? { userId } : "skip"
    );

    // Состояния загрузки
    const isLoadingMembership = currentMembership === undefined;
    const isLoadingPlans = plans === undefined;
    const isLoadingOrders = orderHistory === undefined;
    const isLoading = isLoadingMembership || isLoadingPlans;

    // Функция обновления данных
    const refetch = async () => {
        try {
            setError(null);
            // Данные автоматически обновятся через Convex реактивность
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления данных';
            setError(errorMessage);
        }
    };

    // Вычисляем оставшиеся дни для текущего абонемента
    useEffect(() => {
        if (currentMembership && currentMembership.expiresAt) {
            const expirationDate = new Date(currentMembership.expiresAt);
            const now = new Date();
            const diffTime = expirationDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Обновляем remainingDays если нужно
            if (currentMembership.remainingDays !== diffDays) {
                // Можно добавить мутацию для обновления remainingDays
            }
        }
    }, [currentMembership]);

    return {
        // Данные
        currentMembership,
        plans: plans || [],
        orderHistory: orderHistory || [],

        // Состояния
        isLoading,
        isLoadingMembership,
        isLoadingPlans,
        isLoadingOrders,
        error,

        // Функции
        refetch,
        clearError: () => setError(null),

        // Вычисляемые свойства
        hasActiveMembership: currentMembership?.status === 'active',
        isExpiringSoon: currentMembership?.remainingDays ? currentMembership.remainingDays <= 7 : false,
        isExpired: currentMembership?.remainingDays ? currentMembership.remainingDays <= 0 : false,
    };
}

