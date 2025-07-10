// components/BodyAnalysisUpload.tsx
"use client";

import { useState } from "react";
import { useBodyAnalysis } from "@/hooks/useBodyAnalysis";
import { useBodyAnalysisAI } from "@/hooks/useBodyAnalysisAI";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import type { BodyAnalysisInput } from "@/types/bodyAnalysis";

interface AnalysisStep {
  id: string;
  label: string;
  progress: number;
}

export function BodyAnalysisUpload() {
  const { authStatus, user } = useAuth();
  const { saveBodyAnalysis, currentAnalysis } = useBodyAnalysis();
  const { openAnalysisConsultation } = useBodyAnalysisAI();
  const { upload, isUploading, validateFile } = useCloudinaryUpload();
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const analysisSteps: AnalysisStep[] = [
    { id: 'upload', label: 'Загрузка изображения', progress: 20 },
    { id: 'body-detection', label: 'Определение контуров тела', progress: 40 },
    { id: 'metrics', label: 'Анализ метрик', progress: 60 },
    { id: 'ai-analysis', label: 'AI анализ и прогнозирование', progress: 80 },
    { id: 'plan', label: 'Создание персонального плана', progress: 100 }
  ];

  const handleImageUpload = async (file: File) => {
    setError(null);

    // Валидация файла
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Неверный формат файла');
      return;
    }

    try {
      // Шаг 1: Загрузка в Cloudinary
      setCurrentStep('upload');
      setAnalysisProgress(20);

      const imageUrl = await upload(file, {
        folder: 'body-analysis',
        uploadPreset: 'body_analysis'
      });

      setUploadedImage(imageUrl);

      // Шаг 2-5: Анализ изображения
      setIsAnalyzing(true);

      // Симуляция прогресса анализа
      for (let i = 1; i < analysisSteps.length; i++) {
        setCurrentStep(analysisSteps[i].id);
        setAnalysisProgress(analysisSteps[i].progress);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Получаем результаты анализа от AI (здесь должен быть реальный вызов к вашему AI сервису)
      const analysisResults = await analyzeImageWithAI(imageUrl);

      // Сохраняем результаты через API
      const savedAnalysis = await saveBodyAnalysis(analysisResults);

      if (savedAnalysis) {
        // Открываем AI консультацию с результатами
        if (savedAnalysis.personalizedPlan) {
          openAnalysisConsultation(savedAnalysis, savedAnalysis.personalizedPlan);
        }
      }

    } catch (err) {
      console.error("Error during analysis:", err);
      setError(err instanceof Error ? err.message : "Произошла ошибка при анализе");
    } finally {
      setIsAnalyzing(false);
      setCurrentStep(null);
      setAnalysisProgress(0);
    }
  };

  if (!authStatus?.authenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <p className="text-gray-700 text-center">
          Пожалуйста, войдите в систему для анализа тела
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!uploadedImage && !isAnalyzing ? (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 transition-all hover:border-blue-400">
          <label className="flex flex-col items-center cursor-pointer">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-10 h-10 text-blue-500" />
            </div>
            <span className="text-lg font-medium text-gray-700 mb-2">
              Загрузите фото для анализа
            </span>
            <span className="text-sm text-gray-500 text-center">
              JPG, PNG до 10MB • Лучше всего подходит фото в полный рост
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              disabled={isUploading || isAnalyzing}
            />
            <Button className="mt-4" variant="outline">
              Выбрать фото
            </Button>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {uploadedImage && (
            <div className="relative rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={uploadedImage}
                alt="Uploaded"
                width={400}
                height={600}
                className="w-full h-auto object-contain"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
                    <div className="text-center mb-6">
                      <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-3 animate-pulse" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        AI анализирует ваше фото
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {analysisSteps.map((step) => (
                        <div
                          key={step.id}
                          className={`flex items-center gap-3 transition-opacity ${
                            currentStep === step.id ? 'opacity-100' : 'opacity-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            analysisProgress >= step.progress
                              ? 'bg-blue-500'
                              : 'bg-gray-200'
                          }`}>
                            {analysisProgress >= step.progress && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm text-gray-700">{step.label}</span>
                          {currentStep === step.id && (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500 ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>

                    <Progress value={analysisProgress} className="mt-6" />
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ошибка анализа</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Функция для анализа изображения через AI
async function analyzeImageWithAI(imageUrl: string): Promise<BodyAnalysisInput> {
  // Здесь должен быть реальный вызов к вашему AI сервису
  // Например, через API endpoint:
  /*
  const response = await fetch('/api/ai/analyze-body', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl })
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze image');
  }
  
  return await response.json();
  */

  // Для демонстрации возвращаем mock данные
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    bodyType: "mesomorph",
    estimatedBodyFat: 18.5,
    estimatedMuscleMass: 32.5,
    posture: "good",
    fitnessScore: 75,
    progressPotential: 85,
    problemAreas: [
      {
        area: "живот",
        severity: "medium",
        recommendation: "Увеличить кардио нагрузки и следить за питанием"
      }
    ],
    recommendations: {
      primaryGoal: "Снижение процента жира до 15%",
      secondaryGoals: ["Увеличение мышечной массы", "Улучшение выносливости"],
      estimatedTimeToGoal: 12,
      weeklyTrainingHours: 5
    },
    currentVisualData: {
      imageUrl: imageUrl,
      analyzedImageUrl: imageUrl,
      bodyOutlineData: {
        // Mock данные для контура тела
        shoulders: { width: 45, height: 20 },
        chest: { width: 95, height: 40 },
        waist: { width: 85, height: 35 },
        hips: { width: 95, height: 35 },
        arms: { width: 35, height: 30 },
        legs: { width: 55, height: 50 }
      }
    },
    futureProjections: {
      weeks4: {
        estimatedWeight: 73,
        estimatedBodyFat: 16.5,
        estimatedMuscleMass: 33,
        confidenceLevel: 0.8
      },
      weeks8: {
        estimatedWeight: 71,
        estimatedBodyFat: 14.5,
        estimatedMuscleMass: 33.5,
        confidenceLevel: 0.7
      },
      weeks12: {
        estimatedWeight: 69,
        estimatedBodyFat: 12.5,
        estimatedMuscleMass: 34,
        confidenceLevel: 0.6
      }
    }
  };
}