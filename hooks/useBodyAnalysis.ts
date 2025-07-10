"use client"

import { useState, useEffect } from 'react';
import { Id } from '../convex/_generated/dataModel';
import type {
    BodyAnalysisResult,
    ProgressCheckpoint,
    TransformationLeaderboardEntry,
    PersonalizedPlan,
    BodyAnalysisInput,
    ProgressUpdateInput,
    PersonalizedPlanInput,
    UserAchievement,
    UserBonus,
    ProgressData,
    LeaderboardData
} from '@/types/bodyAnalysis';

type ApiResponse<T> = {
    success: boolean;
    data: T;
    error?: string;
};

export function useBodyAnalysis() {
    const [state, setState] = useState({
        currentAnalysis: null as BodyAnalysisResult | null,
        progressCheckpoints: null as ProgressData | null,
        transformationLeaderboard: null as LeaderboardData | null,
        personalizedPlan: null as PersonalizedPlan | null,
        loading: {
            analysis: false,
            checkpoints: false,
            leaderboard: false,
            plan: false
        },
        error: null as string | null
    });

    const fetchApi = async <T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> => {
        try {
            const response = await fetch(`/api/${endpoint}`, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    };

    // Mutations
    const saveBodyAnalysis = async (input: BodyAnalysisInput) => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, analysis: true }, error: null }));
        try {
            const { data } = await fetchApi<BodyAnalysisResult>('body-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            });
            setState(prev => ({ ...prev, currentAnalysis: data }));
            return data;
        } catch (error) {
            setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, analysis: false } }));
        }
    };

    const updateProgress = async (input: ProgressUpdateInput): Promise<void> => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, checkpoints: true }, error: null }));
        try {
            const { data } = await fetchApi<ProgressData>('progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            });
            setState(prev => ({ ...prev, progressCheckpoints: data }));
            // Don't return anything
        } catch (error) {
            setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, checkpoints: false } }));
        }
    };

    const shareResults = async (analysis: BodyAnalysisResult, platform: string) => {
        try {
            // Implement your sharing logic here
            console.log(`Sharing analysis ${analysis._id} on ${platform}`);
            // Example implementation:
            const response = await fetchApi<void>('share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisId: analysis._id, platform })
            });
            return response;
        } catch (error) {
            console.error("Error sharing results:", error);
            throw error;
        }
    };

    const compareWithOthers = async (analysis: BodyAnalysisResult) => {
        try {
            // Implement comparison logic here
            console.log(`Comparing analysis ${analysis._id} with others`);
            // Example implementation:
            const response = await fetchApi<any>('compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisId: analysis._id })
            });
            return response.data;
        } catch (error) {
            console.error("Error comparing with others:", error);
            throw error;
        }
    };

    const savePersonalizedPlan = async (input: PersonalizedPlanInput) => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, plan: true }, error: null }));
        try {
            const { data } = await fetchApi<PersonalizedPlan>('personalized-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            });
            setState(prev => ({ ...prev, personalizedPlan: data }));
            return data;
        } catch (error) {
            setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, plan: false } }));
        }
    };



    // Queries
    const fetchCurrentAnalysis = async () => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, analysis: true }, error: null }));
        try {
            const { data } = await fetchApi<BodyAnalysisResult>('body-analysis');
            setState(prev => ({ ...prev, currentAnalysis: data }));
        } catch (error) {
            setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, analysis: false } }));
        }
    };

    const fetchProgressCheckpoints = async () => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, checkpoints: true }, error: null }));
        try {
            const { data } = await fetchApi<ProgressData>('progress');
            setState(prev => ({ ...prev, progressCheckpoints: data }));
        } catch (error) {
            setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, checkpoints: false } }));
        }
    };

    const fetchLeaderboard = async () => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, leaderboard: true }, error: null }));
        try {
            const { data } = await fetchApi<LeaderboardData>('leaderboard');
            setState(prev => ({ ...prev, transformationLeaderboard: data }));
        } catch (error) {
            setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, leaderboard: false } }));
        }
    };

    const fetchPersonalizedPlan = async (analysisId: Id<'bodyAnalysis'>) => {
        if (!analysisId) return;
        setState(prev => ({ ...prev, loading: { ...prev.loading, plan: true }, error: null }));
        try {
            const { data } = await fetchApi<PersonalizedPlan>(`personalized-plan?analysisId=${analysisId}`);
            setState(prev => ({ ...prev, personalizedPlan: data }));
        } catch (error) {
            setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, plan: false } }));
        }
    };

    // Initial data loading
    useEffect(() => {
        fetchCurrentAnalysis();
        fetchProgressCheckpoints();
        fetchLeaderboard();
    }, []);

    // Fetch plan when analysis changes
    useEffect(() => {
        if (state.currentAnalysis) {
            fetchPersonalizedPlan(state.currentAnalysis._id);
        }
    }, [state.currentAnalysis]);

    return {
        // Data
        currentAnalysis: state.currentAnalysis,
        progressCheckpoints: state.progressCheckpoints,
        transformationLeaderboard: state.transformationLeaderboard,
        personalizedPlan: state.personalizedPlan,

        // Loading states
        isLoadingAnalysis: state.loading.analysis,
        isLoadingCheckpoints: state.loading.checkpoints,
        isLoadingLeaderboard: state.loading.leaderboard,
        isLoadingPlan: state.loading.plan,
        isProcessing: state.loading.analysis || state.loading.checkpoints || state.loading.leaderboard || state.loading.plan,

        // Error
        error: state.error,

        // Mutations
        saveBodyAnalysis,
        updateProgress,
        savePersonalizedPlan,
        shareResults, // Add this
        compareWithOthers, // Add this

        // Refetch functions
        refetchAnalysis: fetchCurrentAnalysis,
        refetchCheckpoints: fetchProgressCheckpoints,
        refetchLeaderboard: fetchLeaderboard,
        refetchPlan: fetchPersonalizedPlan,

        // Derived state
        hasCurrentAnalysis: !!state.currentAnalysis,
        hasProgressData: !!state.progressCheckpoints?.checkpoints?.length,
        currentStreak: state.progressCheckpoints?.streak || 0,
        nextCheckpointDate: state.progressCheckpoints?.nextCheckpointDate,
    };
}

// Хук для работы с достижениями и бонусами
export function useUserAchievements(userId: string) {
    const [state, setState] = useState({
        achievements: null as UserAchievement[] | null,
        bonuses: null as UserBonus[] | null,
        loading: {
            achievements: false,
            bonuses: false
        },
        error: null as string | null
    });

    const fetchAchievements = async () => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, achievements: true }, error: null }));
        try {
            const { data } = await fetchApi<UserAchievement[]>('achievements', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            setState(prev => ({ ...prev, achievements: data }));
        } catch (error) {
            setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, achievements: false } }));
        }
    };

    const fetchBonuses = async () => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, bonuses: true }, error: null }));
        try {
            const { data } = await fetchApi<UserBonus[]>('bonuses', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            setState(prev => ({ ...prev, bonuses: data }));
        } catch (error) {
            setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, bonuses: false } }));
        }
    };

    useEffect(() => {
        if (userId) {
            fetchAchievements();
            fetchBonuses();
        }
    }, [userId]);

    return {
        achievements: state.achievements,
        bonuses: state.bonuses,
        isLoadingAchievements: state.loading.achievements,
        isLoadingBonuses: state.loading.bonuses,
        error: state.error,
        refetchAchievements: fetchAchievements,
        refetchBonuses: fetchBonuses,
        hasAchievements: !!state.achievements?.length,
        hasBonuses: !!state.bonuses?.length
    };
}

// Хук для работы с персонализированным планом
export function usePersonalizedPlan(analysisId?: Id<'bodyAnalysis'>) {
    const [state, setState] = useState({
        plan: null as PersonalizedPlan | null,
        loading: false,
        error: null as string | null
    });

    const fetchPlan = async (id?: Id<'bodyAnalysis'>) => {
        if (!id) return;
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const { data } = await fetchApi<PersonalizedPlan>(`personalized-plan?analysisId=${id}`);
            setState(prev => ({ ...prev, plan: data }));
        } catch (error) {
            setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        if (analysisId) {
            fetchPlan(analysisId);
        }
    }, [analysisId]);

    return {
        plan: state.plan,
        isLoadingPlan: state.loading,
        error: state.error,
        hasPlan: !!state.plan,
        refetchPlan: () => fetchPlan(analysisId)
    };
}

// Utility функции
export const formatProgress = (checkpoints: ProgressCheckpoint[]) => {
    if (!checkpoints || checkpoints.length === 0) return null;

    const first = checkpoints[0];
    const latest = checkpoints[checkpoints.length - 1];

    return {
        totalWeightLost: first.weight - latest.weight,
        bodyFatReduction: first.bodyFat - latest.bodyFat,
        muscleMassGain: latest.muscleMass - first.muscleMass,
        scoreImprovement: latest.aiScore - first.aiScore,
        duration: Math.ceil((latest.createdAt - first.createdAt) / (7 * 24 * 60 * 60 * 1000)),
    };
};

export const getProgressStatus = (comparison?: any) => {
    if (!comparison) return "unknown";

    if (comparison.progressPercentage >= 80) return "excellent";
    if (comparison.progressPercentage >= 60) return "good";
    if (comparison.progressPercentage >= 40) return "fair";
    if (comparison.onTrack) return "on-track";
    return "needs-improvement";
};

export const formatLeaderboardEntry = (entry: TransformationLeaderboardEntry) => ({
    id: entry._id,
    name: entry.userName || "Анонимный пользователь",
    imageUrl: entry.userImageUrl,
    result: `${entry.weightLost.toFixed(1)}кг за ${entry.weeks} недель`,
    duration: `${entry.weeks} недель`,
    score: entry.score,
    weightLost: entry.weightLost,
    bodyFatLost: entry.bodyFatLost,
    muscleMassGained: entry.muscleMassGained,
});

// Helper function for API calls
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`/api/${endpoint}`, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}