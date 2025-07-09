// components/BodyAnalysisComponent.tsx
import React, { useState } from 'react';
import { 
  useBodyAnalysis, 
  BodyAnalysisInput, 
  ProgressCheckpoint, 
  TransformationLeaderboardEntry,
  formatLeaderboardEntry
} from '../hooks/useBodyAnalysis';
import { useUser } from '@/hooks/useAuth';

export function BodyAnalysisComponent() {
  const { user } = useUser();
  const {
    saveBodyAnalysis,
    updateProgress,
    currentAnalysis,
    progressCheckpoints,
    transformationLeaderboard,
    isLoadingAnalysis,
    isLoadingCheckpoints,
    isLoadingLeaderboard,
  } = useBodyAnalysis();

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Функция для обработки загрузки и анализа фото
  const handlePhotoUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      // Здесь вы можете интегрировать ваш AI сервис для анализа фото
      const analysisResult = await analyzePhoto(file);
      
      // Сохраняем результат в Convex
      const result = await saveBodyAnalysis(analysisResult);
      
      console.log('Анализ сохранен:', result);
    } catch (error) {
      console.error('Ошибка при сохранении анализа:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Функция для обновления прогресса
  const handleProgressUpdate = async (file: File) => {
    if (!currentAnalysis) return;
    
    setIsProcessing(true);
    try {
      // Анализируем новое фото
      const newAnalysisData = await analyzePhoto(file);
      
      // Загружаем фото (здесь должна быть ваша логика загрузки)
      const photoUrl = await uploadPhoto(file);
      
      // Обновляем прогресс в Convex
      const result = await updateProgress({
        photoUrl,
        originalAnalysisId: currentAnalysis._id,
        newAnalysisData,
      });
      
      console.log('Прогресс обновлен:', result);
    } catch (error) {
      console.error('Ошибка при обновлении прогресса:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return <div>Пожалуйста, войдите в систему</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Анализ тела</h1>
      
      {/* Загрузка фото */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {currentAnalysis ? 'Обновить прогресс' : 'Первый анализ'}
        </h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="mb-4"
          />
          <button
            onClick={() => selectedFile && (currentAnalysis ? handleProgressUpdate(selectedFile) : handlePhotoUpload(selectedFile))}
            disabled={!selectedFile || isProcessing}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isProcessing ? 'Обрабатываем...' : (currentAnalysis ? 'Обновить прогресс' : 'Начать анализ')}
          </button>
        </div>
      </div>

      {/* Текущий анализ */}
      {isLoadingAnalysis ? (
        <div>Загрузка анализа...</div>
      ) : currentAnalysis ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Текущий анализ</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Тип тела:</strong> {currentAnalysis.bodyType}</p>
                <p><strong>Жир:</strong> {currentAnalysis.estimatedBodyFat}%</p>
                <p><strong>Мышцы:</strong> {currentAnalysis.estimatedMuscleMass}%</p>
              </div>
              <div>
                <p><strong>Осанка:</strong> {currentAnalysis.posture}</p>
                <p><strong>Фитнес-оценка:</strong> {currentAnalysis.fitnessScore}/100</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Рекомендации:</h3>
              <ul className="list-disc list-inside">
                {currentAnalysis.recommendations.secondaryGoals.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <p>Анализ не найден. Загрузите фото для первого анализа.</p>
        </div>
      )}

      {/* Прогресс чекпоинтов */}
      {isLoadingCheckpoints ? (
        <div>Загрузка чекпоинтов...</div>
      ) : progressCheckpoints ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Прогресс</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p><strong>Streak:</strong> {progressCheckpoints.streak} недель</p>
            <p><strong>Следующий чекпоинт:</strong> {progressCheckpoints.nextCheckpointDate.toLocaleDateString()}</p>
            <div className="mt-4">
              <h3 className="font-semibold">История чекпоинтов:</h3>
              <div className="space-y-2 mt-2">
                {progressCheckpoints.checkpoints.map((checkpoint: ProgressCheckpoint, index: number) => (
                  <div key={checkpoint._id} className="flex justify-between items-center p-2 bg-white rounded">
                    <span>Чекпоинт {index + 1}</span>
                    <span>Оценка: {checkpoint.aiScore}/100</span>
                    <span>{new Date(checkpoint.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Лидерборд */}
      {isLoadingLeaderboard ? (
        <div>Загрузка лидерборда...</div>
      ) : transformationLeaderboard ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Лидерборд трансформаций</h2>
          {transformationLeaderboard.userRank > 0 && (
            <p className="mb-4">Ваша позиция: {transformationLeaderboard.userRank}</p>
          )}
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="space-y-2">
              {transformationLeaderboard.leaderboard.map((entry: TransformationLeaderboardEntry, index: number) => {
                const formattedEntry = formatLeaderboardEntry(entry);
                return (
                  <div
                    key={entry._id}
                    className={`flex justify-between items-center p-2 rounded ${
                      entry.userId === user?.id ? 'bg-blue-100' : 'bg-white'
                    }`}
                  >
                    <span className="font-semibold">#{index + 1}</span>
                    <span>{formattedEntry.name}</span>
                    <span>{formattedEntry.result}</span>
                    <span>Оценка: {formattedEntry.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Вспомогательные функции (заменить на ваши реальные реализации)
async function analyzePhoto(file: File): Promise<BodyAnalysisInput> {
  // Здесь должна быть ваша логика анализа фото с помощью AI
  return {
    bodyType: "ectomorph",
    estimatedBodyFat: 15,
    estimatedMuscleMass: 35,
    posture: "good",
    fitnessScore: 75,
    progressPotential: 85,
    problemAreas: [
      { area: "живот", severity: "medium", recommendation: "Кардио тренировки" },
      { area: "спина", severity: "low", recommendation: "Упражнения на осанку" }
    ],
    recommendations: {
      primaryGoal: "Снижение веса",
      secondaryGoals: ["Улучшение осанки", "Увеличение мышечной массы"],
      estimatedTimeToGoal: 12,
      weeklyTrainingHours: 4
    },
    currentVisualData: {
      imageUrl: "https://example.com/photo.jpg",
    },
    futureProjections: {
      weeks4: { 
        estimatedWeight: 70,
        estimatedBodyFat: 13,
        estimatedMuscleMass: 37,
        confidenceLevel: 80
      },
      weeks8: { 
        estimatedWeight: 68,
        estimatedBodyFat: 11,
        estimatedMuscleMass: 39,
        confidenceLevel: 75
      },
      weeks12: { 
        estimatedWeight: 65,
        estimatedBodyFat: 9,
        estimatedMuscleMass: 41,
        confidenceLevel: 70
      },
    },
  };
}

async function uploadPhoto(file: File): Promise<string> {
  // Здесь должна быть ваша логика загрузки фото
  return "https://example.com/uploaded-photo.jpg";
}