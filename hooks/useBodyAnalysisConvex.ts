// hooks/useBodyAnalysisConvex.ts
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { analyzeBodyImage } from "@/utils/bodyAnalysisAI";
import { logAnalysisData, validateAnalysisData, prepareDataForConvex } from "@/utils/bodyAnalysisDebug";
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
            // Получаем токен из localStorage или cookies
            const token = localStorage.getItem('auth_token') || 
                         document.cookie.split('; ').find(row => row.startsWith('session_id='))?.split('=')[1];
            
            const response = await fetch(`/api/${endpoint}`, {
                ...options,
                headers: {
                    ...options?.headers,
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Включаем cookies
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

    // File upload function - исправлено для работы с JWT и cookies
    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'body-analysis');

        try {
            console.log('📤 Начало загрузки файла...');
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include', // Важно для передачи cookies
                // Не устанавливаем Content-Type, браузер сделает это автоматически для FormData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Ошибка загрузки:', errorData);
                throw new Error(errorData.error || 'Failed to upload file');
            }

            const result = await response.json();
            console.log('✅ Файл загружен:', result.url);
            return result.url;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to upload file');
        }
    };

    // Main analysis function - с улучшенной обработкой и отладкой
    const analyzeAndSaveBody = async (imageFile: File, userId: string) => {
        setState(prev => ({ ...prev, isProcessing: true, error: null }));

        try {
            console.log('🔄 Начало анализа для пользователя:', userId);
            
            // 1. Upload image
            let imageUrl = '';
            try {
                imageUrl = await uploadFile(imageFile);
            } catch (uploadError) {
                console.error('❌ Ошибка загрузки изображения:', uploadError);
                throw new Error('Не удалось загрузить изображение. Проверьте подключение.');
            }

            // 2. Analyze image with AI
            console.log('🤖 Анализ изображения с помощью AI...');
            const analysisResult = await analyzeBodyImage(imageFile, userId);
            
            // Логируем результат анализа для отладки
            logAnalysisData(analysisResult, 'После AI анализа');

            // 3. Update image URL in result
            analysisResult.currentVisualData.imageUrl = imageUrl;

            // 4. Validate analysis data
            const validation = validateAnalysisData(analysisResult);
            if (!validation.isValid) {
                console.error('❌ Ошибки валидации:', validation.errors);
                throw new Error(`Ошибка валидации данных: ${validation.errors.join(', ')}`);
            }

            // 5. Prepare data for Convex (ensure all numbers are properly typed)
            const preparedData = prepareDataForConvex({
                userId,
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
            });

            // Логируем подготовленные данные
            console.log('📦 Данные подготовлены для сохранения:', preparedData);

            // 6. Save analysis via API
            const { data } = await fetchApi<BodyAnalysisResult>('body-analysis/save', {
                method: 'POST',
                body: JSON.stringify(preparedData)
            });

            console.log('✅ Анализ успешно сохранен:', data);
            setState(prev => ({ ...prev, currentAnalysis: data }));
            
            // Логируем финальные данные
            logAnalysisData(data, 'Сохраненные данные');
            
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Analysis failed";
            console.error('❌ Ошибка анализа:', errorMessage);
            setState(prev => ({ ...prev, error: errorMessage }));
            throw err;
        } finally {
            setState(prev => ({ ...prev, isProcessing: false }));
        }
    };

    // Progress update function
    const updateProgress = async (
        originalAnalysisId: Id<"bodyAnalysis">,
        newPhotoFile: File,
        weight?: number
    ) => {
        setState(prev => ({ ...prev, isProcessing: true, error: null }));

        try {
            console.log('📸 Обновление прогресса...');
            
            // 1. Upload new photo
            const photoUrl = await uploadFile(newPhotoFile);

            // 2. Analyze new photo
            const newAnalysisData = await analyzeBodyImage(newPhotoFile, "update");
            
            // Логируем новый анализ
            logAnalysisData(newAnalysisData, 'Новый анализ для прогресса');

            // 3. Prepare and validate data
            const preparedAnalysisData = prepareDataForConvex({
                bodyType: newAnalysisData.bodyType,
                estimatedBodyFat: newAnalysisData.estimatedBodyFat,
                estimatedMuscleMass: newAnalysisData.estimatedMuscleMass,
                posture: newAnalysisData.posture,
                fitnessScore: newAnalysisData.fitnessScore,
                progressPotential: newAnalysisData.progressPotential,
                problemAreas: newAnalysisData.problemAreas || [],
                recommendations: newAnalysisData.recommendations || {
                    primaryGoal: 'Общее улучшение формы',
                    secondaryGoals: [],
                    estimatedTimeToGoal: 12,
                    weeklyTrainingHours: 4
                },
                currentVisualData: {
                    ...newAnalysisData.currentVisualData,
                    imageUrl: photoUrl
                },
                futureProjections: newAnalysisData.futureProjections || {
                    weeks4: { estimatedWeight: 0, estimatedBodyFat: 0, estimatedMuscleMass: 0, confidenceLevel: 0 },
                    weeks8: { estimatedWeight: 0, estimatedBodyFat: 0, estimatedMuscleMass: 0, confidenceLevel: 0 },
                    weeks12: { estimatedWeight: 0, estimatedBodyFat: 0, estimatedMuscleMass: 0, confidenceLevel: 0 }
                },
            });

            // 4. Save progress via API
            const { data } = await fetchApi<any>('body-analysis/progress', {
                method: 'POST',
                body: JSON.stringify({
                    photoUrl,
                    originalAnalysisId,
                    newAnalysisData: preparedAnalysisData,
                    weight: weight ? Number(weight) : undefined,
                })
            });

            console.log('✅ Прогресс обновлен:', data);
            setState(prev => ({ ...prev, progressCheckpoints: data }));
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Progress update failed";
            console.error('❌ Ошибка обновления прогресса:', errorMessage);
            setState(prev => ({ ...prev, error: errorMessage }));
            throw err;
        } finally {
            setState(prev => ({ ...prev, isProcessing: false }));
        }
    };

    // Сохранение персонализированного плана
    const savePersonalizedPlan = async (
        analysisId: Id<"bodyAnalysis">,
        plan: PersonalizedPlan
    ) => {
        setState(prev => ({ ...prev, loading: { ...prev.loading, plan: true }, error: null }));

        try {
            console.log('💾 Сохранение персонализированного плана...');
            
            const preparedPlan = {
                analysisId,
                recommendedTrainer: {
                    ...plan.recommendedTrainer,
                    matchScore: Number(plan.recommendedTrainer.matchScore)
                },
                trainingProgram: {
                    ...plan.trainingProgram,
                    duration: Number(plan.trainingProgram.duration),
                    sessionsPerWeek: Number(plan.trainingProgram.sessionsPerWeek)
                },
                nutritionPlan: {
                    dailyCalories: Number(plan.nutritionPlan.dailyCalories),
                    macros: {
                        protein: Number(plan.nutritionPlan.macros.protein),
                        carbs: Number(plan.nutritionPlan.macros.carbs),
                        fats: Number(plan.nutritionPlan.macros.fats)
                    }
                },
                recommendedProducts: plan.recommendedProducts?.map(product => ({
                    ...product,
                    monthlyBudget: Number(product.monthlyBudget)
                })) || [],
                membershipRecommendation: {
                    ...plan.membershipRecommendation,
                    price: Number(plan.membershipRecommendation.price),
                    savings: Number(plan.membershipRecommendation.savings)
                },
                projectedResults: {
                    ...plan.projectedResults,
                    successProbability: Number(plan.projectedResults.successProbability)
                },
            };

            const { data } = await fetchApi<PersonalizedPlan>('personalized-plan', {
                method: 'POST',
                body: JSON.stringify(preparedPlan)
            });

            console.log('✅ План сохранен:', data);
            setState(prev => ({ ...prev, personalizedPlan: data }));
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to save plan";
            console.error('❌ Ошибка сохранения плана:', errorMessage);
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
            logAnalysisData(data, 'Загруженный анализ');
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
            const { data } = await fetchApi<any>('body-analysis/progress');
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
            const { data } = await fetchApi<any>('leaderboard');
            setState(prev => ({ ...prev, transformationLeaderboard: data }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки лидерборда";
            setState(prev => ({ ...prev, error: errorMessage }));
        } finally {
            setState(prev => ({ ...prev, loading: { ...prev.loading, leaderboard: false } }));
        }
    };

    const fetchPersonalizedPlan = async (analysisId: Id<"bodyAnalysis">) => {
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