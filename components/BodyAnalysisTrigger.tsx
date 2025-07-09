// components/BodyAnalysisTrigger.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Sparkles, TrendingUp, Clock, 
  Award, ArrowRight, X, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import BodyAnalysisModal from '@/components/ai-body-analysis/BodyAnalysisModal';
import type { BodyAnalysisResult, PersonalizedPlan } from '@/types/bodyAnalysis';

interface BodyAnalysisTriggerProps {
  variant?: 'banner' | 'card' | 'floating' | 'hero';
  onAnalysisComplete?: (result: BodyAnalysisResult, plan: PersonalizedPlan) => void;
}

export default function BodyAnalysisTrigger({ 
  variant = 'banner',
  onAnalysisComplete 
}: BodyAnalysisTriggerProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [lastAnalysis, setLastAnalysis] = useState<BodyAnalysisResult | null>(null);

  // Загружаем последний анализ пользователя
  useEffect(() => {
    if (user?.id) {
      loadLastAnalysis();
    }
  }, [user]);

  const loadLastAnalysis = async () => {
    try {
      const response = await fetch(`/api/body-analysis/last/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setLastAnalysis(data);
      }
    } catch (error) {
      console.error('Error loading last analysis:', error);
    }
  };

  const handleAnalysisComplete = (result: BodyAnalysisResult, plan: PersonalizedPlan) => {
    setLastAnalysis(result);
    if (onAnalysisComplete) {
      onAnalysisComplete(result, plan);
    }
  };

  // Варианты отображения
  if (variant === 'banner' && showPromo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-8 overflow-hidden"
      >
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                Новинка!
              </Badge>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">
              AI Анализ тела за 30 секунд!
            </h3>
            <p className="text-white/90 mb-4">
              Загрузите фото и получите персональный план трансформации с прогнозом результатов
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 text-white/80">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Прогноз на 12 недель</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="h-4 w-4" />
                <span className="text-sm">30 секунд</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Award className="h-4 w-4" />
                <span className="text-sm">Точность 87%</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => setIsModalOpen(true)}
              >
                <Camera className="h-5 w-5 mr-2" />
                Начать анализ
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setShowPromo(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Preview изображение */}
          <div className="hidden lg:block ml-8">
            <div className="relative">
              <div className="w-48 h-64 bg-white/20 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur rounded-xl p-3">
                    <p className="text-xs font-medium text-gray-900 mb-1">Ваш результат через 12 недель:</p>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-purple-600">-12кг</div>
                      <Badge className="bg-green-100 text-green-700">87%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1">
          <div className="bg-white m-[2px] rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                <Camera className="h-7 w-7 text-purple-600" />
              </div>
              {lastAnalysis && (
                <Badge variant="outline">
                  Последний анализ: {new Date(lastAnalysis.date).toLocaleDateString()}
                </Badge>
              )}
            </div>
            
            <h3 className="text-xl font-bold mb-2">AI Анализ тела</h3>
            <p className="text-gray-600 mb-4">
              Получите персональный план трансформации за 30 секунд
            </p>
            
            {lastAnalysis ? (
              <div className="mb-4 p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Ваш прогресс</span>
                  <span className="text-sm font-medium text-purple-600">
                    {lastAnalysis.progressPotential}% потенциал
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Цель: {lastAnalysis.recommendations.primaryGoal}
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <div className="text-sm">
                    <p className="font-medium">Быстрый старт</p>
                    <p className="text-gray-600">Первый анализ бесплатно!</p>
                  </div>
                </div>
              </div>
            )}
            
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              {lastAnalysis ? 'Новый анализ' : 'Начать анализ'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'floating') {
    return (
      <>
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-white"
        >
          <Camera className="h-6 w-6" />
          
          {/* Пульсация */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-24 right-24 z-40 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap"
        >
          AI Анализ тела
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
        </motion.div>
      </>
    );
  }

  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500">
          AI Технология
        </Badge>
        
        <h2 className="text-4xl font-bold mb-4">
          Узнайте свой потенциал трансформации
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Загрузите фото, и наш AI создаст персональный план достижения ваших целей
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Прогноз результатов</p>
              <p className="text-sm text-gray-600">На 4, 8 и 12 недель</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-pink-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Персональный план</p>
              <p className="text-sm text-gray-600">Тренер + питание + добавки</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">30 секунд</p>
              <p className="text-sm text-gray-600">Мгновенный результат</p>
            </div>
          </div>
        </div>
        
        <Button
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          onClick={() => setIsModalOpen(true)}
        >
          <Camera className="h-6 w-6 mr-2" />
          Начать AI анализ
          <Sparkles className="h-6 w-6 ml-2" />
        </Button>
        
        {lastAnalysis && (
          <p className="mt-4 text-sm text-gray-600">
            Ваш последний анализ показал потенциал трансформации {lastAnalysis.progressPotential}%
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <>
      {/* Модальное окно анализа */}
      <BodyAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
      />
    </>
  );
}