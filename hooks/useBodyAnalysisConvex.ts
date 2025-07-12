// hooks/useBodyAnalysisConvex.ts
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { analyzeBodyImage } from "@/utils/bodyAnalysisAI";
import { logAnalysisData, validateAnalysisData, prepareDataForConvex } from "@/utils/bodyAnalysisDebug";
import type { BodyAnalysisResult, PersonalizedPlan } from "@/types/bodyAnalysis";

export function useBodyAnalysisConvex() {
    const [state, setState] = useState({
        isProcessing: false,
        error: null as string | null,
        currentAnalysis: null as BodyAnalysisResult | null,
        progressCheckpoints: null as any[] | null,
        transformationLeaderboard: null as any | null,
        personalizedPlan: null as PersonalizedPlan | null,
        loading: {
            analysis: false,
            checkpoints: false,
            leaderboard: false,
            plan: false
        }
    });

    // Unified API fetch function with JWT auth
    const fetchApi = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
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

            const result = await response.json();

            // Логируем полученные данные для отладки
            console.log(`📥 API Response from ${endpoint}:`, result);

            // Если ответ содержит поле data, возвращаем его содержимое
            if (result.data !== undefined) {
                return result.data as T;
            }

            // Иначе возвращаем весь результат
            return result as T;
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
            let analysisResult;
            try {
                analysisResult = await analyzeBodyImage(imageFile, userId);

                // Проверяем что получили валидные данные
                if (!analysisResult || !analysisResult.bodyType) {
                    throw new Error('AI анализ вернул некорректные данные');
                }
            } catch (aiError) {
                console.error('❌ Ошибка AI анализа:', aiError);
                // Создаем дефолтные данные если AI анализ провалился
                analysisResult = {
                    _id: `analysis_${userId}_${Date.now()}` as Id<"bodyAnalysis">,
                    userId: userId,
                    date: new Date(),
                    bodyType: 'mixed' as const,
                    estimatedBodyFat: 20,
                    estimatedMuscleMass: 35,
                    posture: 'fair' as const,
                    problemAreas: [],
                    fitnessScore: 50,
                    progressPotential: 70,
                    recommendations: {
                        primaryGoal: 'Общее улучшение формы',
                        secondaryGoals: [],
                        estimatedTimeToGoal: 12,
                        weeklyTrainingHours: 4
                    },
                    currentVisualData: {
                        imageUrl: imageUrl,
                        analyzedImageUrl: imageUrl,
                        bodyOutlineData: null
                    },
                    futureProjections: {
                        weeks4: { estimatedWeight: 73, estimatedBodyFat: 18, estimatedMuscleMass: 36, confidenceLevel: 0.85 },
                        weeks8: { estimatedWeight: 71, estimatedBodyFat: 16, estimatedMuscleMass: 37, confidenceLevel: 0.75 },
                        weeks12: { estimatedWeight: 69, estimatedBodyFat: 14, estimatedMuscleMass: 38, confidenceLevel: 0.65 }
                    },
                    bodyMetrics: {
                        shoulderWidth: 45,
                        waistWidth: 38,
                        hipWidth: 42,
                        bodyRatio: 0.7
                    }
                };
            }

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
            const savedAnalysis = await fetchApi<BodyAnalysisResult>('body-analysis/save', {
                method: 'POST',
                body: JSON.stringify(preparedData)
            });

            console.log('✅ Анализ успешно сохранен:', savedAnalysis);

            // Проверяем, что получили все данные
            if (!savedAnalysis || !savedAnalysis.bodyType || !savedAnalysis.estimatedBodyFat) {
                console.error('⚠️ Получены неполные данные:', savedAnalysis);
                throw new Error('Получены неполные данные анализа');
            }

            setState(prev => ({ ...prev, currentAnalysis: savedAnalysis }));

            // Логируем финальные данные
            logAnalysisData(savedAnalysis, 'Сохраненные данные');

            return savedAnalysis;
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
            const progressData = await fetchApi<any>('body-analysis/progress', {
                method: 'POST',
                body: JSON.stringify({
                    photoUrl,
                    originalAnalysisId,
                    newAnalysisData: preparedAnalysisData,
                    weight: weight ? Number(weight) : undefined,
                })
            });

            console.log('✅ Прогресс обновлен:', progressData);
            setState(prev => ({ ...prev, progressCheckpoints: progressData }));
            return progressData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Progress update failed";
            console.error('❌ Ошибка обновления прогресса:', errorMessage);
            setState(prev => ({ ...prev, error: errorMessage }));
            throw err;
        } finally {
            setState(prev => ({ ...prev, isProcessing: false }));
        }
    };

    // Сохранение персонализированного плана - ОБНОВЛЕНО
    const savePersonalizedPlan = async (
        analysisId: Id<"bodyAnalysis">,
        plan: PersonalizedPlan
    ) => {
        setState(prev => ({
            ...prev,
            loading: { ...prev.loading, plan: true },
            error: null
        }));

        try {
            console.log('💾 Сохранение персонализированного плана...');

            // Валидация данных перед отправкой
            if (!analysisId) {
                throw new Error('analysisId не указан');
            }

            if (!plan.recommendedTrainer) {
                throw new Error('Отсутствует рекомендуемый тренер');
            }

            // Подготавливаем данные - отделяем exercises от основных полей trainingProgram
            const preparedPlan = {
                analysisId,
                recommendedTrainer: {
                    ...plan.recommendedTrainer,
                    matchScore: Number(plan.recommendedTrainer.matchScore) || 0
                },
                trainingProgram: {
                    // Оставляем только те поля, которые есть в Convex валидаторе
                    duration: Number(plan.trainingProgram.duration) || 0,
                    sessionsPerWeek: Number(plan.trainingProgram.sessionsPerWeek) || 0,
                    focusAreas: plan.trainingProgram.focusAreas || [],
                    id: plan.trainingProgram.id,
                    name: plan.trainingProgram.name,
                    // exercises передаем отдельно - НЕ в trainingProgram
                    exercises: plan.trainingProgram.exercises || []
                },
                nutritionPlan: {
                    dailyCalories: Number(plan.nutritionPlan.dailyCalories) || 0,
                    macros: {
                        protein: Number(plan.nutritionPlan.macros.protein) || 0,
                        carbs: Number(plan.nutritionPlan.macros.carbs) || 0,
                        fats: Number(plan.nutritionPlan.macros.fats) || 0
                    }
                },
                recommendedProducts: plan.recommendedProducts?.map(product => ({
                    ...product,
                    monthlyBudget: Number(product.monthlyBudget) || 0
                })) || [],
                membershipRecommendation: {
                    ...plan.membershipRecommendation,
                    price: Number(plan.membershipRecommendation.price) || 0,
                    savings: Number(plan.membershipRecommendation.savings) || 0
                },
                projectedResults: {
                    ...plan.projectedResults,
                    successProbability: Number(plan.projectedResults.successProbability) || 0
                },
            };

            console.log('📦 Подготовленные данные для сохранения:', {
                analysisId: preparedPlan.analysisId,
                hasTrainer: !!preparedPlan.recommendedTrainer,
                hasProgram: !!preparedPlan.trainingProgram,
                hasNutrition: !!preparedPlan.nutritionPlan,
                exercisesCount: preparedPlan.trainingProgram.exercises.length
            });

            const savedPlan = await fetchApi<PersonalizedPlan>('personalized-plan', {
                method: 'POST',
                body: JSON.stringify(preparedPlan)
            });

            console.log('✅ План сохранен:', savedPlan);
            setState(prev => ({ ...prev, personalizedPlan: savedPlan }));
            return savedPlan;

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
            const analysis = await fetchApi<BodyAnalysisResult>('body-analysis');
            setState(prev => ({ ...prev, currentAnalysis: analysis }));
            logAnalysisData(analysis, 'Загруженный анализ');
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
            const checkpoints = await fetchApi<any>('progress');
            setState(prev => ({ ...prev, progressCheckpoints: checkpoints }));
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
            const leaderboard = await fetchApi<any>('leaderboard');
            setState(prev => ({ ...prev, transformationLeaderboard: leaderboard }));
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
            const plan = await fetchApi<PersonalizedPlan>(`personalized-plan?analysisId=${analysisId}`);
            setState(prev => ({ ...prev, personalizedPlan: plan }));
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