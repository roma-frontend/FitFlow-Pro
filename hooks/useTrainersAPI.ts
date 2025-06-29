// hooks/useTrainersAPI.ts
"use client";

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface CreateTrainerData {
    name: string;
    email: string;
    phone: string;
    specialization: string[];
    experience: number;
    hourlyRate: number;
    certifications: string[];
    bio: string;
    avatar: string;
}

export interface Trainer extends CreateTrainerData {
    id: string;
    _id?: string;
    rating?: number;
    isActive?: boolean;
    status?: string;
    createdAt?: number;
    _creationTime?: number;
    activeClients?: number;
    totalSessions?: number;
}

// Хук для получения одного тренера
export function useTrainer(trainerId: string) {
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { token } = useAuth();

    const fetchTrainer = useCallback(async () => {
        if (!token || !trainerId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/trainers/${trainerId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setTrainer(result.data);
            } else {
                throw new Error(result.error || 'Ошибка загрузки тренера');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            setError(errorMessage);
            console.error('Ошибка загрузки тренера:', err);
        } finally {
            setIsLoading(false);
        }
    }, [token, trainerId]);

    React.useEffect(() => {
        if (trainerId) {
            fetchTrainer();
        }
    }, [fetchTrainer, trainerId]);

    return {
        trainer,
        isLoading,
        error,
        refetch: fetchTrainer
    };
}

// Хук для создания тренера
export function useCreateTrainer() {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { token } = useAuth();

    const createTrainer = useCallback(async (data: CreateTrainerData) => {
        if (!token) {
            setError('Не авторизован');
            return null;
        }

        setIsCreating(true);
        setError(null);

        try {
            const response = await fetch('/api/trainers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            if (!result.success) {
                throw new Error(result.error || 'Ошибка создания тренера');
            }

            return result.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            setError(errorMessage);
            console.error('Ошибка создания тренера:', err);
            return null;
        } finally {
            setIsCreating(false);
        }
    }, [token]);

    return {
        createTrainer,
        isCreating,
        error
    };
}

// Хук для обновления тренера
export function useUpdateTrainer() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { token } = useAuth();

    const updateTrainer = useCallback(async (trainerId: string, data: Partial<CreateTrainerData>) => {
        if (!token) {
            setError('Не авторизован');
            return false;
        }

        setIsUpdating(true);
        setError(null);

        try {
            const response = await fetch(`/api/trainers/${trainerId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            if (!result.success) {
                throw new Error(result.error || 'Ошибка обновления тренера');
            }

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            setError(errorMessage);
            console.error('Ошибка обновления тренера:', err);
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [token]);

    return {
        updateTrainer,
        isUpdating,
        error
    };
}
