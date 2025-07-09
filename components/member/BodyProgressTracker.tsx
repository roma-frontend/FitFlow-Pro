"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Camera, TrendingUp, Award, Share2, Users,
    Trophy, Zap, Calendar, ChevronRight, Star,
    Lock, Unlock, Gift, Target, Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useBodyAnalysis } from '@/hooks/useBodyAnalysis';
import BodyAnalysisTrigger from '@/components/BodyAnalysisTrigger';
import { validateImage, optimizeImage } from '@/utils/imageUpload';
import type {
    BodyAnalysisResult,
    ProgressCheckpoint,
    TransformationLeaderboardEntry,
    ProgressData,
    LeaderboardData,
    BodyAnalysisHookReturn
} from '@/types/bodyAnalysis';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    unlocked: boolean;
    unlockedAt?: Date;
    reward: {
        type: 'discount' | 'product' | 'session' | 'badge';
        value: string;
    };
}

export default function BodyProgressTracker() {
    const { toast } = useToast();
    const {
        currentAnalysis,
        progressCheckpoints,
        transformationLeaderboard,
        updateProgress,
        shareResults,
        compareWithOthers,
        isProcessing,
        error,
    } = useBodyAnalysis();

    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    const [weight, setWeight] = useState<number | undefined>();
    const [achievements, setAchievements] = useState<Achievement[]>([
        {
            id: 'first_analysis',
            title: 'Первый шаг',
            description: 'Выполните первый AI анализ',
            icon: Camera,
            unlocked: false,
            reward: { type: 'discount', value: '10% на первый месяц' }
        },
        {
            id: 'week_4_progress',
            title: 'Месяц упорства',
            description: 'Отслеживайте прогресс 4 недели',
            icon: Calendar,
            unlocked: false,
            reward: { type: 'product', value: 'Бесплатный шейкер' }
        },
        {
            id: 'target_reached',
            title: 'Цель достигнута',
            description: 'Достигните прогнозируемого результата',
            icon: Target,
            unlocked: false,
            reward: { type: 'session', value: '3 бесплатные тренировки' }
        },
        {
            id: 'motivator',
            title: 'Мотиватор',
            description: 'Поделитесь прогрессом 5 раз',
            icon: Share2,
            unlocked: false,
            reward: { type: 'badge', value: 'VIP статус на месяц' }
        },
        {
            id: 'transformer',
            title: 'Трансформер',
            description: 'Завершите 12-недельную программу',
            icon: Trophy,
            unlocked: false,
            reward: { type: 'discount', value: '50% на следующий анализ' }
        }
    ]);

    // Properly type the progress data
    const progressData = progressCheckpoints as ProgressData | null;
    const leaderboardData = transformationLeaderboard as LeaderboardData | null;

    // Update achievements based on data
    useEffect(() => {
        if (currentAnalysis) {
            const newAchievements = [...achievements];
            newAchievements[0].unlocked = true;

            if (progressData?.checkpoints && progressData.checkpoints.length >= 4) {
                newAchievements[1].unlocked = true;
            }

            if (progressData?.checkpoints && progressData.checkpoints.length >= 12) {
                newAchievements[4].unlocked = true;
            }

            setAchievements(newAchievements);
        }
    }, [currentAnalysis, progressData]);

    const handleNewCheckpoint = async (photo: File): Promise<void> => {
        if (!currentAnalysis) return;

        setIsUpdatingProgress(true);

        try {
            const validation = validateImage(photo);
            if (!validation.valid) {
                toast({
                    title: "Ошибка",
                    description: validation.error,
                    variant: "destructive"
                });
                return;
            }

            const optimizedPhoto = await optimizeImage(photo);

            toast({
                title: "Прогресс обновлен! 🎉",
                description: "Отличная работа!",
            });

        } catch (error) {
            console.error("Error updating progress:", error);
            toast({
                title: "Ошибка",
                description: "Не удалось обновить прогресс",
                variant: "destructive"
            });
        } finally {
            setIsUpdatingProgress(false);
        }
    };

    const showAchievementNotification = (achievement: Achievement): void => {
        toast({
            title: "🏆 Новое достижение!",
            description: (
                <div>
                    <p className="font-bold">{achievement.title}</p>
                    <p className="text-sm">{achievement.description}</p>
                    <p className="text-sm mt-2">Награда: {achievement.reward.value}</p>
                </div>
            ),
            duration: 5000,
        });
    };

    const handleShare = async (): Promise<void> => {
        if (!currentAnalysis) return;

        try {
            await shareResults(currentAnalysis, 'instagram');

            const shareCount = parseInt(localStorage.getItem('share_count') || '0') + 1;
            localStorage.setItem('share_count', shareCount.toString());

            if (shareCount >= 5 && !achievements[3].unlocked) {
                const newAchievements = [...achievements];
                newAchievements[3].unlocked = true;
                newAchievements[3].unlockedAt = new Date();
                setAchievements(newAchievements);
                showAchievementNotification(newAchievements[3]);
            }

            toast({
                title: "Успешно!",
                description: "Результаты готовы к публикации"
            });
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось поделиться результатами",
                variant: "destructive"
            });
        }
    };

    if (!currentAnalysis) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Начните отслеживать прогресс</h3>
                    <p className="text-gray-600 mb-6">
                        Сделайте первый AI анализ тела для начала трансформации
                    </p>
                    <BodyAnalysisTrigger variant="card" />
                </CardContent>
            </Card>
        );
    }

    const { checkpoints = [], streak = 0, nextCheckpointDate = new Date() } = progressData || {};
    const { leaderboard = [], userRank = 0 } = leaderboardData || {};

    return (
        <div className="space-y-6">
            {/* Прогресс хедер с геймификацией */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Ваша трансформация</h2>
                            <p className="text-purple-100">
                                День {checkpoints.length * 7} из 84 • Неделя {Math.ceil(checkpoints.length * 7 / 7)}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center gap-2 mb-1">
                                <Flame className="h-6 w-6 text-orange-300" />
                                <span className="text-3xl font-bold">{streak}</span>
                            </div>
                            <p className="text-xs text-purple-100">дней подряд</p>
                        </div>
                    </div>

                    {/* Общий прогресс */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Прогресс программы</span>
                            <span>{Math.round((checkpoints.length / 12) * 100)}%</span>
                        </div>
                        <Progress value={(checkpoints.length / 12) * 100} className="h-3" />
                    </div>

                    {/* Статистика */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold">
                                {Math.abs(currentAnalysis.futureProjections.weeks12.estimatedWeight)}кг
                            </p>
                            <p className="text-sm text-purple-100">Осталось сбросить</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold">{currentAnalysis.progressPotential}%</p>
                            <p className="text-sm text-purple-100">Потенциал</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold">#{userRank}</p>
                            <p className="text-sm text-purple-100">В рейтинге</p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6">
                    {/* Следующий чекпоинт */}
                    {nextCheckpointDate && (
                        <div className="mb-6 p-4 bg-purple-50 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-purple-900">Следующий чекпоинт</p>
                                    <p className="text-sm text-purple-700">
                                        {new Date(nextCheckpointDate).toLocaleDateString()}
                                        ({Math.ceil((new Date(nextCheckpointDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} дней)
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        placeholder="Вес (кг)"
                                        value={weight || ''}
                                        onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                                        className="w-24 px-3 py-2 border rounded-lg text-sm"
                                    />
                                    <Button
                                        className="bg-purple-600 hover:bg-purple-700"
                                        disabled={isUpdatingProgress || isProcessing}
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = 'image/*';
                                            input.onchange = (e) => {
                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                if (file) handleNewCheckpoint(file);
                                            };
                                            input.click();
                                        }}
                                    >
                                        <Camera className="h-4 w-4 mr-2" />
                                        Обновить прогресс
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Быстрые действия */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            onClick={() => compareWithOthers(currentAnalysis)}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Сравнить с другими
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Поделиться прогрессом
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Достижения */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Достижения и награды
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement) => (
                            <motion.div
                                key={achievement.id}
                                whileHover={{ scale: achievement.unlocked ? 1.02 : 1 }}
                                className={`p-4 rounded-xl border-2 transition-all ${achievement.unlocked
                                    ? 'border-yellow-400 bg-yellow-50'
                                    : 'border-gray-200 bg-gray-50 opacity-75'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${achievement.unlocked
                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                                        : 'bg-gray-300'
                                        }`}>
                                        {achievement.unlocked ? (
                                            <achievement.icon className="h-6 w-6 text-white" />
                                        ) : (
                                            <Lock className="h-6 w-6 text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold mb-1">{achievement.title}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                                        <div className="flex items-center justify-between">
                                            <Badge variant={achievement.unlocked ? "default" : "outline"}>
                                                {achievement.reward.value}
                                            </Badge>
                                            {achievement.unlocked && achievement.unlockedAt && (
                                                <span className="text-xs text-gray-500">
                                                    {achievement.unlockedAt.toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* График прогресса */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        График изменений
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                        <p className="text-gray-500">График прогресса</p>
                    </div>

                    {/* Чекпоинты */}
                    <div className="mt-6 space-y-3">
                        {checkpoints.map((checkpoint: ProgressCheckpoint, index: number) => (
                            <motion.div
                                key={checkpoint._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                            >
                                <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden">
                                    {checkpoint.photoUrl && (
                                        <img
                                            src={checkpoint.photoUrl}
                                            alt={`Checkpoint ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium">
                                            Неделя {index + 1} • {new Date(checkpoint.createdAt).toLocaleDateString()}
                                        </p>
                                        <Badge variant="outline">
                                            AI Score: {checkpoint.aiScore}/100
                                        </Badge>
                                    </div>
                                    <div className="flex gap-4 text-sm text-gray-600">
                                        <span>Вес: {checkpoint.weight} кг</span>
                                        <span>Жир: {checkpoint.bodyFat}%</span>
                                        <span>Мышцы: {checkpoint.muscleMass}%</span>
                                    </div>
                                    {checkpoint.comparisonWithProjection && (
                                        <div className="mt-1">
                                            <Badge
                                                variant={checkpoint.comparisonWithProjection.onTrack ? "default" : "secondary"}
                                                className="text-xs"
                                            >
                                                {checkpoint.comparisonWithProjection.onTrack ? "На правильном пути" : "Нужна корректировка"}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Лидерборд */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Рейтинг трансформаций
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {leaderboard.slice(0, 5).map((entry: TransformationLeaderboardEntry, index: number) => (
                            <div
                                key={entry._id}
                                className={`flex items-center gap-4 p-4 rounded-xl ${entry.userId === currentAnalysis.userId ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-400 text-white' :
                                    index === 1 ? 'bg-gray-300 text-gray-700' :
                                        index === 2 ? 'bg-orange-400 text-white' :
                                            'bg-gray-200 text-gray-600'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                                    {entry.userImageUrl && (
                                        <img src={entry.userImageUrl} alt={entry.userName} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{entry.userName}</p>
                                    <p className="text-sm text-gray-600">
                                        {entry.weightLost}кг • {entry.weeks} недель
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">{entry.score}</p>
                                    <p className="text-xs text-gray-500">очков</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {userRank > 5 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
                            <p className="text-sm text-blue-700">
                                Ваша позиция: #{userRank} из {leaderboard.length}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Еще {Math.max(0, userRank - 5)} мест до топ-5!
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}