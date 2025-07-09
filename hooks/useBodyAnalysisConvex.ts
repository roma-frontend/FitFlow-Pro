// hooks/useBodyAnalysisAPI.ts
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { analyzeBodyImage } from "@/utils/bodyAnalysisAI";
import type { BodyAnalysisResult, PersonalizedPlan } from "@/types/bodyAnalysis";

type ApiResponse<T> = {
    success: boolean;
    data: T;
    error?: string;
};

export function useBodyAnalysisConvex() {
    const [state, setState] = useState({
        isProcessing: false,
        error: null as string | null,
        currentAnalysis: null as BodyAnalysisResult | null,
        progressCheckpoints: null as any[] | null,
        transformationLeaderboard: null as any[] | null,
        personalizedPlan: null as PersonalizedPlan | null,
        loading: {
            analysis: false,
            checkpoints: false,
            leaderboard: false,
            plan: false
        }
    });

    // Unified API fetch function with JWT auth
    const fetchApi = async <T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/${endpoint}`, {
                ...options,
                headers: {
                    ...options?.headers,
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Add auth token
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    };

    // File upload function matching the working pattern
    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'body-analysis');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include' // Include cookies for JWT auth
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload file');
            }

            const result = await response.json();
            return result.url;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to upload file');
        }
    };

    // Main analysis function
    const analyzeAndSaveBody = async (imageFile: File, userId: string) => {
        setState(prev => ({ ...prev, isProcessing: true, error: null }));

        try {
            // 1. Upload image with JWT auth
            const imageUrl = await uploadFile(imageFile);

            // 2. Analyze image with AI
            const analysisResult = await analyzeBodyImage(imageFile, userId);

            // 3. Update image URL in result
            analysisResult.currentVisualData.imageUrl = imageUrl;

            // 4. Save analysis via API with JWT auth
            const { data } = await fetchApi<BodyAnalysisResult>('body-analysis/save', {
                method: 'POST',
                body: JSON.stringify({
                    userId, // Обязательное поле
                    bodyType: analysisResult.bodyType,
                    estimatedBodyFat: analysisResult.estimatedBodyFat,
                    estimatedMuscleMass: analysisResult.estimatedMuscleMass,
                    posture: analysisResult.posture,
                    fitnessScore: analysisResult.fitnessScore,
                    progressPotential: analysisResult.progressPotential,
                    problemAreas: analysisResult.problemAreas,
                    recommendations: analysisResult.recommendations,
                    currentVisualData: analysisResult.currentVisualData,
                    futureProjections: analysisResult.futureProjections
                })
            });

            setState(prev => ({ ...prev, currentAnalysis: data }));
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Analysis failed";
            setState(prev => ({ ...prev, error: errorMessage }));
            throw err;
        } finally {
            setState(prev => ({ ...prev, isProcessing: false }));
        }
    };

    // Progress update function
    const updateProgress = async (
        originalAnalysisId: Id<"bodyAnalyses">,
        newPhotoFile: File,
        weight?: number
    ) => {
        setState(prev => ({ ...prev, isProcessing: true, error: null }));

        try {
            // 1. Upload new photo with JWT auth
            const photoUrl = await uploadFile(newPhotoFile);

            // 2. Analyze new photo
            const newAnalysisData = await analyzeBodyImage(newPhotoFile, "update");

            // 3. Save progress via API with JWT auth
            const { data } = await fetchApi<any[]>('progress', {
                method: 'POST',
                body: JSON.stringify({
                    photoUrl,
                    originalAnalysisId,
                    newAnalysisData: {
                        bodyType: newAnalysisData.bodyType,
                        estimatedBodyFat: newAnalysisData.estimatedBodyFat,
                        estimatedMuscleMass: newAnalysisData.estimatedMuscleMass,
                        posture: newAnalysisData.posture,
                        fitnessScore: newAnalysisData.fitnessScore,
                        progressPotential: newAnalysisData.progressPotential,
                        problemAreas: newAnalysisData.problemAreas,
                        recommendations: newAnalysisData.recommendations,
                        currentVisualData: newAnalysisData.currentVisualData,
                        futureProjections: newAnalysisData.futureProjections,
                    },
                    weight,
                })
            });

            setState(prev => ({ ...prev, progressCheckpoints: data }));
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Progress update failed";
            setState(prev => ({ ...prev, error: errorMessage }));
            throw err;
        } finally {
            setState(prev => ({ ...prev, isProcessing: false }));
        }
    };

    // Сохранение персонализированного плана
    const savePersonalizedPlan = async (
        analysisId: Id<"bodyAnalyses">,
        plan: PersonalizedPlan
    ) => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, plan: true }, error: null }));

        try {
            const { data } = await fetchApi<PersonalizedPlan>('personalized-plan', {
                method: 'POST',
                body: JSON.stringify({
                    analysisId,
                    recommendedTrainer: plan.recommendedTrainer,
                    trainingProgram: plan.trainingProgram,
                    nutritionPlan: plan.nutritionPlan,
                    recommendedProducts: plan.recommendedProducts,
                    membershipRecommendation: plan.membershipRecommendation,
                    projectedResults: plan.projectedResults,
                })
            });

            setState(prev => ({ ...prev, personalizedPlan: data }));
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to save plan";
            setState(prev => ({ ...prev, error: errorMessage }));
            throw err;
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, plan: false } }));
        }
    };

    // Загрузка данных
    const fetchCurrentAnalysis = async () => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, analysis: true }, error: null }));
        try {
            const { data } = await fetchApi<BodyAnalysisResult>('body-analysis');
            setState(prev => ({ ...prev, currentAnalysis: data }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки анализа";
            setState(prev => ({ ...prev, error: errorMessage }));
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, analysis: false } }));
        }
    };

    const fetchProgressCheckpoints = async () => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, checkpoints: true }, error: null }));
        try {
            const { data } = await fetchApi<any[]>('progress');
            setState(prev => ({ ...prev, progressCheckpoints: data }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки прогресса";
            setState(prev => ({ ...prev, error: errorMessage }));
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, checkpoints: false } }));
        }
    };

    const fetchLeaderboard = async () => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, leaderboard: true }, error: null }));
        try {
            const { data } = await fetchApi<any[]>('leaderboard');
            setState(prev => ({ ...prev, transformationLeaderboard: data }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки лидерборда";
            setState(prev => ({ ...prev, error: errorMessage }));
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, leaderboard: false } }));
        }
    };

    const fetchPersonalizedPlan = async (analysisId: Id<"bodyAnalyses">) => {
        if (!analysisId) return;
        setState(prev => ({ ...prev, loading: { ...prev.loading, plan: true }, error: null }));
        try {
            const { data } = await fetchApi<PersonalizedPlan>(`personalized-plan?analysisId=${analysisId}`);
            setState(prev => ({ ...prev, personalizedPlan: data }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки плана";
            setState(prev => ({ ...prev, error: errorMessage }));
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, plan: false } }));
        }
    };

    // Функции для социальных сетей
    const shareResults = async (analysis: BodyAnalysisResult, platform: "instagram" | "facebook" | "twitter") => {
        const shareUrl = `${window.location.origin}/transformation/${analysis._id}`;

        const shareData = {
            title: "Моя фитнес-трансформация с FitFlow Pro!",
            text: `Начинаю свое преображение! AI предсказывает потенциал трансформации ${analysis.progressPotential}%! 💪`,
            url: shareUrl,
        };

        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            const shareUrls = {
                instagram: `https://www.instagram.com/create/story/?url=${encodeURIComponent(shareUrl)}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareUrl)}`,
            };

            window.open(shareUrls[platform], "_blank");
        }
    };

    const compareWithOthers = (analysis: BodyAnalysisResult) => {
        window.location.href = `/compare/${analysis._id}`;
    };

    return {
        // Состояния
        isProcessing: state.isProcessing,
        error: state.error,

        // Данные
        currentAnalysis: state.currentAnalysis,
        progressCheckpoints: state.progressCheckpoints,
        transformationLeaderboard: state.transformationLeaderboard,
        personalizedPlan: state.personalizedPlan,

        // Функции
        analyzeAndSaveBody,
        updateProgress,
        savePersonalizedPlan,
        shareResults,
        compareWithOthers,

        // Флаги загрузки
        isLoadingAnalysis: state.loading.analysis,
        isLoadingCheckpoints: state.loading.checkpoints,
        isLoadingLeaderboard: state.loading.leaderboard,
        isLoadingPlan: state.loading.plan,

        // Функции для загрузки данных
        fetchCurrentAnalysis,
        fetchProgressCheckpoints,
        fetchLeaderboard,
        fetchPersonalizedPlan
    };
}