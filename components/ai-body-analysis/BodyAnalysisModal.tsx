// components/ai-body-analysis/BodyAnalysisModal.tsx
"use client";

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, Sparkles, X, ArrowRight, 
  Loader2, Check, AlertCircle, Share2, Zap,
  TrendingUp, Clock, Target, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { analyzeBodyImage } from '@/utils/bodyAnalysisAI';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results' | 'plan'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<BodyAnalysisResult | null>(null);
  const [personalizedPlan, setPersonalizedPlan] = useState<PersonalizedPlan | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  // Обработка загрузки изображения
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, загрузите изображение",
        variant: "destructive"
      });
      return;
    }

    // Создаем preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      startAnalysis(file);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  // Запуск анализа
  const startAnalysis = async (file: File) => {
    setStep('analyzing');
    setProgress(0);

    try {
      // Симуляция прогресса
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Анализируем изображение
      const result = await analyzeBodyImage(file, user?.id || 'guest');
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setAnalysisResult(result);
      
      // Генерируем персонализированный план
      const plan = await generatePersonalizedPlan(result);
      setPersonalizedPlan(plan);
      
      setTimeout(() => {
        setStep('results');
      }, 500);
      
    } catch (error) {
      console.error('Ошибка анализа:', error);
      toast({
        title: "Ошибка анализа",
        description: "Не удалось проанализировать изображение. Попробуйте еще раз.",
        variant: "destructive"
      });
      setStep('upload');
    }
  };

  // Генерация персонализированного плана
  const generatePersonalizedPlan = async (analysis: BodyAnalysisResult): Promise<PersonalizedPlan> => {
    // Здесь будет вызов API для генерации плана
    // Пока возвращаем mock данные
    return {
      analysisId: analysis.id,
      recommendedTrainer: {
        id: 'trainer-1',
        name: 'Анна Петрова',
        specialty: 'Трансформация тела',
        matchScore: 95,
        reason: 'Специализируется на клиентах с вашим типом телосложения'
      },
      trainingProgram: {
        id: 'program-1',
        name: 'Интенсивная трансформация 12 недель',
        duration: 12,
        sessionsPerWeek: 4,
        focusAreas: ['Снижение веса', 'Укрепление мышц'],
        exercises: []
      },
      nutritionPlan: {
        dailyCalories: 2000,
        macros: {
          protein: 150,
          carbs: 200,
          fats: 70
        }
      },
      recommendedProducts: [
        {
          productId: 'prod-1',
          name: 'Протеин Whey Gold Standard',
          purpose: 'Восстановление и рост мышц',
          timing: 'После тренировки',
          monthlyBudget: 3500,
          importance: 'essential'
        },
        {
          productId: 'prod-2',
          name: 'BCAA Energy',
          purpose: 'Энергия во время тренировки',
          timing: 'Во время тренировки',
          monthlyBudget: 2000,
          importance: 'recommended'
        }
      ],
      membershipRecommendation: {
        type: 'Premium',
        reason: 'Включает все необходимые услуги для вашей трансформации',
        features: ['Безлимитные тренировки', 'Консультации нутрициолога', 'Приоритетная запись'],
        price: 4990,
        savings: 1500
      },
      projectedResults: {
        week4: '-3-4 кг, улучшение выносливости',
        week8: '-6-8 кг, видимое укрепление мышц',
        week12: '-10-12 кг, полная трансформация тела',
        successProbability: 87
      }
    };
  };

  // Поделиться результатами
  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Генерируем изображение для шаринга
      const shareData = {
        title: 'Моя фитнес-трансформация с FitFlow Pro!',
        text: `Начинаю свое преображение! AI предсказывает -${analysisResult?.recommendations.estimatedTimeToGoal} кг за 12 недель! 💪`,
        url: `${window.location.origin}/transformation/${analysisResult?.id}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback - копируем в буфер
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Ссылка скопирована!",
          description: "Поделитесь ей в социальных сетях"
        });
      }
    } catch (error) {
      console.error('Ошибка шаринга:', error);
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
    router.push(`/transformation/checkout?analysisId=${analysisResult?.id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
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
                  onClick={onClose}
                  className="rounded-full"
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
                  className="text-center py-12"
                >
                  <div className="mb-8">
                    <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Camera className="h-16 w-16 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Загрузите фото в полный рост</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      AI проанализирует ваше телосложение и создаст персональный план трансформации
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    
                    <Button
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Выбрать фото
                    </Button>
                    
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        // Открыть камеру на мобильных
                        if (fileInputRef.current) {
                          fileInputRef.current.capture = 'environment';
                          fileInputRef.current.click();
                        }
                      }}
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Сделать фото
                    </Button>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-2xl max-w-md mx-auto">
                    <h4 className="font-medium text-blue-900 mb-2">Рекомендации для лучшего результата:</h4>
                    <ul className="text-sm text-blue-700 space-y-1 text-left">
                      <li>• Фото в полный рост на светлом фоне</li>
                      <li>• Облегающая одежда или спортивная форма</li>
                      <li>• Хорошее освещение</li>
                      <li>• Прямая поза, руки вдоль тела</li>
                    </ul>
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
                    {uploadedImage && (
                      <div className="mb-8 relative">
                        <img
                          src={uploadedImage}
                          alt="Анализируемое фото"
                          className="w-48 h-64 object-cover rounded-2xl mx-auto shadow-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/50 to-transparent rounded-2xl" />
                      </div>
                    )}
                    
                    <div className="mb-8">
                      <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
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
                              <Badge variant="outline" className="capitalize">
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
                              {analysisResult.problemAreas.map((area, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm">{area.area}</span>
                                  <Badge
                                    variant={
                                      area.severity === 'high' ? 'destructive' :
                                      area.severity === 'medium' ? 'secondary' :
                                      'outline'
                                    }
                                  >
                                    {area.severity === 'high' ? 'Высокий приоритет' :
                                     area.severity === 'medium' ? 'Средний приоритет' :
                                     'Низкий приоритет'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Прогноз трансформации */}
                    <div>
                      <h3 className="text-xl font-bold mb-4">Ваша трансформация</h3>
                      <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                          <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="h-8 w-8" />
                            <div>
                              <h4 className="text-2xl font-bold">
                                Потенциал: {analysisResult.progressPotential}%
                              </h4>
                              <p className="text-purple-100">Вероятность успеха при следовании плану</p>
                            </div>
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-purple-600">4</span>
                              </div>
                              <div>
                                <p className="font-medium">Через 4 недели</p>
                                <p className="text-sm text-gray-600">
                                  -{analysisResult.futureProjections.weeks4.estimatedWeight} кг, 
                                  улучшение формы
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-purple-600">8</span>
                              </div>
                              <div>
                                <p className="font-medium">Через 8 недель</p>
                                <p className="text-sm text-gray-600">
                                  -{analysisResult.futureProjections.weeks8.estimatedWeight} кг, 
                                  видимые изменения
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-white">12</span>
                              </div>
                              <div>
                                <p className="font-medium">Через 12 недель</p>
                                <p className="text-sm text-gray-600">
                                  -{analysisResult.futureProjections.weeks12.estimatedWeight} кг, 
                                  полная трансформация!
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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
                    <Badge className="mb-3 bg-gradient-to-r from-purple-500 to-pink-500">
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

                  {/* Программа и питание */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Target className="h-6 w-6 text-purple-600" />
                          <h4 className="text-lg font-bold">Программа тренировок</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Название</span>
                            <span className="font-medium">{personalizedPlan.trainingProgram.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Длительность</span>
                            <span className="font-medium">{personalizedPlan.trainingProgram.duration} недель</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Тренировок в неделю</span>
                            <span className="font-medium">{personalizedPlan.trainingProgram.sessionsPerWeek}</span>
                          </div>
                          <div className="pt-3 border-t">
                            <p className="text-sm text-gray-600 mb-2">Фокус программы:</p>
                            <div className="flex flex-wrap gap-2">
                              {personalizedPlan.trainingProgram.focusAreas.map((area, i) => (
                                <Badge key={i} variant="secondary">{area}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Zap className="h-6 w-6 text-orange-600" />
                          <h4 className="text-lg font-bold">План питания</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Калории в день</span>
                            <span className="font-medium">{personalizedPlan.nutritionPlan.dailyCalories} ккал</span>
                          </div>
                          <div className="pt-3 border-t space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Белки</span>
                              <span className="font-medium">{personalizedPlan.nutritionPlan.macros.protein}г</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Углеводы</span>
                              <span className="font-medium">{personalizedPlan.nutritionPlan.macros.carbs}г</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Жиры</span>
                              <span className="font-medium">{personalizedPlan.nutritionPlan.macros.fats}г</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Рекомендуемые продукты */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-bold mb-4">Рекомендуемое спортивное питание</h4>
                      <div className="space-y-3">
                        {personalizedPlan.recommendedProducts.map((product, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h5 className="font-medium">{product.name}</h5>
                                <Badge 
                                  variant={
                                    product.importance === 'essential' ? 'default' :
                                    product.importance === 'recommended' ? 'secondary' :
                                    'outline'
                                  }
                                >
                                  {product.importance === 'essential' ? 'Обязательно' :
                                   product.importance === 'recommended' ? 'Рекомендуется' :
                                   'Опционально'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{product.purpose}</p>
                              <p className="text-xs text-gray-500 mt-1">Принимать: {product.timing}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{product.monthlyBudget}₽</p>
                              <p className="text-xs text-gray-500">в месяц</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-800">Общий бюджет на спортпит</p>
                            <p className="text-2xl font-bold text-green-900">
                              {personalizedPlan.recommendedProducts.reduce((sum, p) => sum + p.monthlyBudget, 0)}₽/мес
                            </p>
                          </div>
                          <Button variant="outline" className="text-green-700 border-green-300">
                            Добавить все в корзину
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Абонемент */}
                  <Card className="mb-8 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-2xl font-bold mb-2">
                            Абонемент "{personalizedPlan.membershipRecommendation.type}"
                          </h4>
                          <p className="text-purple-100 mb-4">
                            {personalizedPlan.membershipRecommendation.reason}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {personalizedPlan.membershipRecommendation.features.map((feature, i) => (
                              <Badge key={i} className="bg-white/20 text-white border-white/30">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold">{personalizedPlan.membershipRecommendation.price}₽</p>
                          <p className="text-purple-100">в месяц</p>
                          <Badge className="mt-2 bg-white text-purple-600">
                            Экономия {personalizedPlan.membershipRecommendation.savings}₽
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* CTA */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-bold mb-3">Готовы начать трансформацию?</h3>
                    <p className="text-gray-600 mb-6">
                      Вероятность успеха: {personalizedPlan.projectedResults.successProbability}%
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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