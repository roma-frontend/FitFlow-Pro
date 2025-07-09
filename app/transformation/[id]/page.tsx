// app/transformation/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Award, Calendar, Target, 
  Zap, Users, Share2, Download, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import BodyAnalysisTrigger from '@/components/BodyAnalysisTrigger';

interface TransformationData {
  id: string;
  userName: string;
  userAvatar?: string;
  startDate: Date;
  bodyType: string;
  progressPotential: number;
  currentProgress: {
    weightLost: number;
    bodyFatReduced: number;
    muscleMassGained: number;
    daysInProgram: number;
    completionPercentage: number;
  };
  projections: {
    weeks4: { weight: number; bodyFat: number; };
    weeks8: { weight: number; bodyFat: number; };
    weeks12: { weight: number; bodyFat: number; };
  };
  achievements: Array<{
    title: string;
    icon: any;
    unlockedAt: Date;
  }>;
  trainer?: {
    name: string;
    photo?: string;
  };
  isPublic: boolean;
}

export default function TransformationSharePage() {
  const params = useParams();
  const [data, setData] = useState<TransformationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerStarted, setViewerStarted] = useState(false);

  useEffect(() => {
    loadTransformationData();
    trackView();
  }, [params.id]);

  const loadTransformationData = async () => {
    try {
      const response = await fetch(`/api/transformation/${params.id}`);
      if (response.ok) {
        const transformationData = await response.json();
        setData(transformationData);
      }
    } catch (error) {
      console.error('Error loading transformation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`/api/transformation/${params.id}/view`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleShare = async () => {
    if (!data) return;

    const shareData = {
      title: `Трансформация ${data.userName} с FitFlow Pro`,
      text: `Потенциал изменений ${data.progressPotential}%! Присоединяйтесь к программе трансформации!`,
      url: window.location.href
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      // Показать уведомление о копировании
    }
  };

  const handleDownloadImage = async () => {
    // Генерируем изображение для скачивания
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || !data) return;

    // Рисуем фон
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(1, '#EC4899');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Добавляем контент
    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('МОЯ ТРАНСФОРМАЦИЯ', canvas.width / 2, 200);

    ctx.font = '48px Arial';
    ctx.fillText(`Потенциал: ${data.progressPotential}%`, canvas.width / 2, 300);

    // Скачиваем
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-transformation.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-purple-500 rounded-full mx-auto mb-4" />
          <p className="text-purple-700">Загрузка трансформации...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.isPublic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Трансформация недоступна</h2>
            <p className="text-gray-600 mb-6">
              Эта трансформация приватная или не найдена
            </p>
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => setViewerStarted(true)}
            >
              Начать свою трансформацию
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Hero секция */}
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            Трансформация в процессе
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {data.userName} меняется с FitFlow Pro
          </h1>
          
          <p className="text-xl text-purple-100 mb-8">
            Потенциал трансформации: {data.progressPotential}%
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold">{data.currentProgress.daysInProgram}</p>
              <p className="text-purple-100">дней в программе</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{data.currentProgress.completionPercentage}%</p>
              <p className="text-purple-100">выполнено</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{data.achievements.length}</p>
              <p className="text-purple-100">достижений</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleShare}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Поделиться
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleDownloadImage}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <Download className="h-5 w-5 mr-2" />
              Скачать картинку
            </Button>
          </div>
        </div>

        {/* Декоративные элементы */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-24 translate-y-24" />
      </div>

      {/* Основной контент */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Прогресс */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                Текущий прогресс
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-green-600">
                    -{data.currentProgress.weightLost} кг
                  </p>
                  <p className="text-gray-600">Снижение веса</p>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">
                    -{data.currentProgress.bodyFatReduced}%
                  </p>
                  <p className="text-gray-600">Жировая масса</p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <p className="text-3xl font-bold text-purple-600">
                    +{data.currentProgress.muscleMassGained}%
                  </p>
                  <p className="text-gray-600">Мышечная масса</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Прогресс программы</span>
                  <span>{data.currentProgress.completionPercentage}%</span>
                </div>
                <Progress value={data.currentProgress.completionPercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Прогноз */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Target className="h-6 w-6 text-purple-500" />
                AI прогноз результатов
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-purple-600">4</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Через 4 недели</p>
                    <p className="text-gray-600">
                      -{data.projections.weeks4.weight} кг, жир {data.projections.weeks4.bodyFat}%
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-purple-600">8</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Через 8 недель</p>
                    <p className="text-gray-600">
                      -{data.projections.weeks8.weight} кг, жир {data.projections.weeks8.bodyFat}%
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">12</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Через 12 недель</p>
                    <p className="text-gray-600">
                      -{data.projections.weeks12.weight} кг, жир {data.projections.weeks12.bodyFat}%
                    </p>
                  </div>
                  <Award className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Достижения */}
        {data.achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  Достижения
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="text-center p-4 bg-yellow-50 rounded-xl"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-medium">{achievement.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* CTA для посетителей */}
        {!viewerStarted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold mb-4">
                  Хотите такие же результаты?
                </h3>
                <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                  Начните свою трансформацию прямо сейчас! AI проанализирует ваше фото 
                  и создаст персональный план достижения целей.
                </p>
                
                <BodyAnalysisTrigger variant="hero" />
                
                <p className="mt-6 text-sm text-gray-600">
                  Присоединяйтесь к 1000+ людей, которые уже меняют свою жизнь
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}