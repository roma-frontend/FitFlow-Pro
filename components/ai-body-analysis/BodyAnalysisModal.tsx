// components/ai-body-analysis/BodyAnalysisModal.tsx
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, ArrowRight, Loader2, Check,
  Share2, Zap, TrendingUp, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBodyAnalysisConvex } from '@/hooks/useBodyAnalysisConvex';
import { BodyPhotoUpload } from '@/components/ui/body-photo-upload';
import { generatePersonalizedPlan } from '@/utils/generatePersonalizedPlan';
import type { BodyAnalysisResult, PersonalizedPlan } from '@/types/bodyAnalysis';

interface BodyAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete?: (result: BodyAnalysisResult, plan: PersonalizedPlan) => void;
}

export default function BodyAnalysisModal({ isOpen, onClose, onAnalysisComplete }: BodyAnalysisModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const {
    analyzeAndSaveBody,
    savePersonalizedPlan,
    shareResults,
    isProcessing,
    error
  } = useBodyAnalysisConvex();

  const [step, setStep] = useState<'upload' | 'ready' | 'analyzing' | 'results' | 'plan'>('upload');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<BodyAnalysisResult | null>(null);
  const [personalizedPlan, setPersonalizedPlan] = useState<PersonalizedPlan | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const disableScroll = () => {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
      // Опционально: предотвращаем скролл на мобильных устройствах
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
  };

  const enableScroll = () => {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      disableScroll();
    } else {
      enableScroll();
    }

    // Cleanup при размонтировании компонента
    return () => {
      enableScroll();
    };
  }, [isOpen]);

  // Обработка успешной загрузки фото
  const handlePhotoUpload = useCallback((url: string, file: File) => {
    console.log('📸 handlePhotoUpload вызван:', {
      url: url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    if (!file || !url) {
      console.error('❌ Некорректные данные загрузки:', { url, file });
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить фото",
        variant: "destructive"
      });
      return;
    }

    setUploadedImageUrl(url);
    setUploadedFile(file);
    setStep('ready');

    toast({
      title: "Фото загружено!",
      description: "Теперь можно запустить анализ"
    });

    console.log('✅ Фото успешно установлено в state');
  }, [toast]);

  // Удаление фото
  const handlePhotoRemove = useCallback(() => {
    setUploadedImageUrl(null);
    setUploadedFile(null);
    setStep('upload');
  }, []);

  // Запуск анализа
  const startAnalysis = async () => {
  if (!uploadedFile) {
    toast({
      title: "Ошибка",
      description: "Сначала загрузите фото",
      variant: "destructive"
    });
    return;
  }

  setStep('analyzing');
  setProgress(0);

  let progressInterval: NodeJS.Timeout | null = null;

  try {
    // Симуляция прогресса
    progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    // Анализируем и сохраняем в Convex
    const result = await analyzeAndSaveBody(uploadedFile, user?.id || 'guest');

    if (!result || !result.bodyType) {
      console.error('❌ Получен пустой или некорректный результат:', result);
      toast({
        title: "Ошибка",
        description: "Не удалось получить результаты анализа",
        variant: "destructive"
      });
      setStep('ready');
      return;
    }

    const requiredFields: (keyof BodyAnalysisResult)[] = [
      'bodyType',
      'estimatedBodyFat',
      'estimatedMuscleMass',
      'recommendations',
      'futureProjections'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = result[field];
      return value === undefined || value === null;
    });

    if (missingFields.length > 0) {
      console.error('❌ Отсутствуют обязательные поля:', missingFields);
      console.error('📊 Полученные данные:', result);
    }

    // Дополнительная проверка для отладки
    console.log('🔍 DEBUG: Результат анализа после сохранения:', {
      hasResult: !!result,
      resultId: result._id,
      bodyType: result.bodyType,
      metrics: {
        bodyFat: result.estimatedBodyFat,
        muscleMass: result.estimatedMuscleMass,
        fitnessScore: result.fitnessScore,
        progressPotential: result.progressPotential
      },
      hasRecommendations: !!result.recommendations,
      hasFutureProjections: !!result.futureProjections,
      problemAreas: result.problemAreas
    });

    // Генерируем персонализированный план
    console.log('📋 Генерируем персональный план...');
    const plan = await generatePersonalizedPlan(result);

    console.log('🔍 DEBUG: Сгенерированный план:', {
      hasPlan: !!plan,
      planId: plan?._id,
      trainer: plan?.recommendedTrainer,
      program: plan?.trainingProgram,
      hasNutrition: !!plan?.nutritionPlan,
      productsCount: plan?.recommendedProducts?.length
    });

    // Сохраняем план в Convex (только один раз!)
    if (result._id && plan) {
      try {
        await savePersonalizedPlan(result._id as any, plan);
        console.log('✅ План сохранен в Convex');
      } catch (saveError) {
        console.error('❌ Ошибка сохранения плана:', saveError);
        // Не прерываем выполнение, показываем результаты даже если план не сохранился
      }
    }

    // Устанавливаем состояния
    setAnalysisResult(result);
    setPersonalizedPlan(plan);

    // Завершаем прогресс
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    setProgress(100);

    // Переходим к результатам
    setTimeout(() => {
      setStep('results');
    }, 500);

  } catch (error) {
    console.error('❌ Ошибка анализа:', error);
    
    // Очищаем интервал при ошибке
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    toast({
      title: "Ошибка анализа",
      description: error instanceof Error ? error.message : "Не удалось проанализировать изображение",
      variant: "destructive"
    });
    setStep('ready');
  }
};

  // Поделиться результатами
  const handleShare = async () => {
    if (!analysisResult) return;

    setIsSharing(true);

    try {
      await shareResults(analysisResult, 'instagram');

      toast({
        title: "Успешно!",
        description: "Результаты готовы к публикации"
      });
    } catch (error) {
      console.error('Ошибка шаринга:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось поделиться результатами",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Применить план
  const handleApplyPlan = () => {
    if (onAnalysisComplete && analysisResult && personalizedPlan) {
      onAnalysisComplete(analysisResult, personalizedPlan);
    }

    // Переходим к оформлению подписки
    router.push(`/transformation/checkout?analysisId=${analysisResult?._id}`);
  };

  // Сброс состояния при закрытии
  const handleClose = () => {
    setStep('upload');
    setUploadedImageUrl(null);
    setUploadedFile(null);
    setAnalysisResult(null);
    setPersonalizedPlan(null);
    setProgress(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 p-6 border-b">
              <div className="flex items-center justify-center">
                <div className="flex flex-col lg:flex-row justify-center items-center text-center lg:text-left gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Анализ тела</h2>
                    <p className="text-gray-600">Узнайте свой потенциал трансформации</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="rounded-full absolute right-4 top-4"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Upload Step */}
              {step === 'upload' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-3">Загрузите фото в полный рост</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      AI проанализирует ваше телосложение и создаст персональный план трансформации
                    </p>
                  </div>

                  <BodyPhotoUpload
                    onUploadComplete={handlePhotoUpload}
                    disabled={false}
                    className="max-w-lg mx-auto"
                  />

                  {error && (
                    <div className="mt-6 p-4 bg-red-50 rounded-2xl max-w-md mx-auto">
                      <div className="flex items-center gap-3 text-red-700">
                        <X className="h-5 w-5" />
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Ready Step */}
              {step === 'ready' && uploadedImageUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-3">Фото загружено!</h3>
                    <p className="text-gray-600 mb-6">
                      Теперь можно запустить AI анализ вашего тела
                    </p>
                  </div>

                  <div className="max-w-md mx-auto mb-8">
                    <BodyPhotoUpload
                      currentUrl={uploadedImageUrl}
                      onUploadComplete={handlePhotoUpload}
                      onRemove={handlePhotoRemove}
                      disabled={false}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      onClick={startAnalysis}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Анализируем...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Начать анализ
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setStep('upload')}
                    >
                      Выбрать другое фото
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Analyzing Step */}
              {step === 'analyzing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <div className="max-w-md mx-auto">
                    {uploadedImageUrl && (
                      <div className="mb-8 relative">
                        <img
                          src={uploadedImageUrl}
                          alt="Анализируемое фото"
                          className="w-48 h-64 object-cover rounded-2xl mx-auto shadow-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent rounded-2xl" />
                      </div>
                    )}

                    <div className="mb-8">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Анализируем ваше фото...</h3>
                      <p className="text-gray-600 mb-6">AI определяет тип телосложения и создает план</p>

                      <Progress value={progress} className="h-2 mb-4" />

                      <div className="space-y-2 text-sm">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: progress > 20 ? 1 : 0, x: 0 }}
                          className="flex items-center gap-2 text-gray-600"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          Определение типа телосложения
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: progress > 40 ? 1 : 0, x: 0 }}
                          className="flex items-center gap-2 text-gray-600"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          Анализ проблемных зон
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: progress > 60 ? 1 : 0, x: 0 }}
                          className="flex items-center gap-2 text-gray-600"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          Расчет потенциала трансформации
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: progress > 80 ? 1 : 0, x: 0 }}
                          className="flex items-center gap-2 text-gray-600"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          Создание персонального плана
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Results Step */}
              {step === 'results' && analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Текущее состояние */}
                    <div>
                      <h3 className="text-xl font-bold mb-4">Ваш анализ</h3>
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-gray-600">Тип телосложения</span>
                              <Badge variant="custom" className="capitalize">
                                {analysisResult.bodyType}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Мышечная масса</span>
                                  <span>{analysisResult.estimatedMuscleMass}%</span>
                                </div>
                                <Progress value={analysisResult.estimatedMuscleMass} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Процент жира</span>
                                  <span>{analysisResult.estimatedBodyFat}%</span>
                                </div>
                                <Progress value={analysisResult.estimatedBodyFat} className="h-2" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Фитнес-уровень</span>
                                  <span>{analysisResult.fitnessScore}/100</span>
                                </div>
                                <Progress value={analysisResult.fitnessScore} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Проблемные зоны */}
                        <Card>
                          <CardContent className="p-6">
                            <h4 className="font-medium mb-3">Зоны для работы</h4>
                            <div className="space-y-2">
                              {analysisResult.problemAreas && analysisResult.problemAreas.length > 0 ? (
                                analysisResult.problemAreas.map((area, index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm">{area.area}</span>
                                    <Badge
                                      variant={
                                        area.severity === 'high' ? 'destructive' :
                                          area.severity === 'medium' ? 'secondary' :
                                            'custom'
                                      }
                                    >
                                      {area.severity === 'high' ? 'Высокий приоритет' :
                                        area.severity === 'medium' ? 'Средний приоритет' :
                                          'Низкий приоритет'}
                                    </Badge>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">Проблемные зоны не обнаружены</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Прогноз трансформации */}
                    <div>
                      <h3 className="text-xl font-bold mb-4">Ваша трансформация</h3>
                      <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                          <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="h-8 w-8" />
                            <div>
                              <h4 className="text-2xl font-bold">
                                Потенциал: {analysisResult.progressPotential}%
                              </h4>
                              <p className="text-blue-100">Вероятность успеха при следовании плану</p>
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {analysisResult.futureProjections?.weeks4 && (
                              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-lg font-bold text-blue-600">4</span>
                                </div>
                                <div>
                                  <p className="font-medium">Через 4 недели</p>
                                  <p className="text-sm text-gray-600">
                                    -{Math.abs(analysisResult.futureProjections.weeks4.estimatedWeight || 0)} кг,
                                    улучшение формы
                                  </p>
                                </div>
                              </div>
                            )}

                            {analysisResult.futureProjections?.weeks8 && (
                              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-lg font-bold text-blue-600">8</span>
                                </div>
                                <div>
                                  <p className="font-medium">Через 8 недель</p>
                                  <p className="text-sm text-gray-600">
                                    -{Math.abs(analysisResult.futureProjections.weeks8.estimatedWeight || 0)} кг,
                                    видимые изменения
                                  </p>
                                </div>
                              </div>
                            )}

                            {analysisResult.futureProjections?.weeks12 && (
                              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                  <span className="text-lg font-bold text-white">12</span>
                                </div>
                                <div>
                                  <p className="font-medium">Через 12 недель</p>
                                  <p className="text-sm text-gray-600">
                                    -{Math.abs(analysisResult.futureProjections.weeks12.estimatedWeight || 0)} кг,
                                    полная трансформация!
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                      onClick={() => setStep('plan')}
                    >
                      Смотреть персональный план
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleShare}
                      disabled={isSharing}
                    >
                      {isSharing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Share2 className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Plan Step */}
              {step === 'plan' && personalizedPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-center mb-8">
                    <Badge className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-500">
                      Персональный план готов!
                    </Badge>
                    <h3 className="text-2xl font-bold mb-2">Ваша программа трансформации</h3>
                    <p className="text-gray-600">Все подобрано специально под ваши цели и особенности</p>
                  </div>

                  {/* Тренер */}
                  <Card className="mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-1">
                      <CardContent className="bg-white m-[1px] rounded p-6">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                            <Award className="h-10 w-10 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <Badge className="mb-2">
                              Совпадение {personalizedPlan.recommendedTrainer.matchScore}%
                            </Badge>
                            <h4 className="text-xl font-bold mb-1">
                              {personalizedPlan.recommendedTrainer.name}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                              {personalizedPlan.recommendedTrainer.specialty}
                            </p>
                            <p className="text-sm text-gray-500">
                              {personalizedPlan.recommendedTrainer.reason}
                            </p>
                          </div>
                          <Button variant="outline">
                            Записаться
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>

                  {/* CTA */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold mb-3">Готовы начать трансформацию?</h3>
                    <p className="text-gray-600 mb-6">
                      Вероятность успеха: {personalizedPlan.projectedResults.successProbability}%
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        onClick={handleApplyPlan}
                      >
                        <Zap className="h-5 w-5 mr-2" />
                        Начать трансформацию
                      </Button>

                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setStep('results')}
                      >
                        Вернуться к результатам
                      </Button>
                    </div>

                    <p className="text-sm text-gray-500 mt-4">
                      При оформлении сегодня — бесплатная консультация нутрициолога
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}