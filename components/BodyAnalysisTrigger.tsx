// components/BodyAnalysisTrigger.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BodyAnalysisModal from '@/components/ai-body-analysis/BodyAnalysisModal';
import { useToast } from '@/hooks/use-toast';
import type { BodyAnalysisResult, PersonalizedPlan } from '@/types/bodyAnalysis';

interface BodyAnalysisTriggerProps {
  variant?: 'banner' | 'card' | 'floating' | 'hero';
  onAnalysisComplete?: (result: BodyAnalysisResult, plan: PersonalizedPlan) => void;
}

export default function BodyAnalysisTrigger({ 
  variant = 'banner',
  onAnalysisComplete 
}: BodyAnalysisTriggerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Глобальный слушатель для открытия модального окна
  useEffect(() => {
    const handleOpenBodyAnalysis = (event: CustomEvent) => {
      setIsModalOpen(true);
      
      // Если передан trainerId, можем использовать его для персонализации
      if (event.detail?.trainerId) {
        localStorage.setItem('preferred_trainer', event.detail.trainerId);
      }
    };

    window.addEventListener('open-body-analysis' as any, handleOpenBodyAnalysis);
    
    return () => {
      window.removeEventListener('open-body-analysis' as any, handleOpenBodyAnalysis);
    };
  }, []);

  const handleAnalysisComplete = (result: BodyAnalysisResult, plan: PersonalizedPlan) => {
    setIsModalOpen(false);
    
    if (onAnalysisComplete) {
      onAnalysisComplete(result, plan);
    }
    
    toast({
      title: "Анализ завершен! 🎉",
      description: `Ваш потенциал трансформации: ${result.progressPotential}%`,
    });
  };

  const renderTrigger = () => {
    switch (variant) {
      case 'banner':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white"
          >
            <div className="flex flex-col items-center lg:items-start justify-between gap-4">
              <div className="flex flex-col items-center lg:items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div className='text-center lg:text-left'>
                  <h3 className="text-xl font-bold mb-1">
                    Узнайте свой потенциал трансформации
                  </h3>
                  <p className="text-blue-100">
                    AI анализ тела за 30 секунд • Персональный план • Точный прогноз
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => setIsModalOpen(true)}
                data-body-analysis-trigger
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Начать анализ
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 'card':
        return (
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            onClick={() => setIsModalOpen(true)}
            data-body-analysis-trigger
          >
            <Camera className="h-5 w-5 mr-2" />
            Начать AI анализ
          </Button>
        );

      case 'floating':
        return (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1 }}
            className="fixed bottom-6 left-6 z-40"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-xl"
                onClick={() => setIsModalOpen(true)}
                data-body-analysis-trigger
              >
                <Camera className="h-6 w-6 mr-2" />
                AI Анализ тела
                <Badge className="ml-2 bg-white/20 text-white border-white/30">
                  NEW
                </Badge>
              </Button>
            </motion.div>
          </motion.div>
        );

      case 'hero':
        return (
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-indigo-500">
                <Sparkles className="h-3 w-3 mr-1" />
                Бесплатный AI анализ
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Откройте свой потенциал
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {" "}трансформации
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Загрузите фото, и наш AI создаст персональный план достижения 
                ваших фитнес-целей с точностью 87%
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  onClick={() => setIsModalOpen(true)}
                  data-body-analysis-trigger
                >
                  <Camera className="h-6 w-6 mr-2" />
                  Начать анализ бесплатно
                  <ArrowRight className="h-6 w-6 ml-2" />
                </Button>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>30 секунд</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-blue-600">1000+</span>
                    <span>трансформаций</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderTrigger()}
      
      <BodyAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
      />
    </>
  );
}