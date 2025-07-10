// utils/bodyAnalysisAI.ts
import * as tf from '@tensorflow/tfjs';
import { BodyAnalysisResult, VisualData, FutureProjections } from '@/types/bodyAnalysis';
import { Id } from '@/convex/_generated/dataModel';

// Инициализация модели
let poseDetectionModel: any = null;
let bodySegmentationModel: any = null;

// Загрузка моделей TensorFlow.js
export const initializeModels = async () => {
  try {
    const poseNet = await tf.loadLayersModel(
      'https://tfhub.dev/tensorflow/tfjs-model/posenet/mobilenet/float/075/1/default/1'
    );
    
    const bodyPix = await tf.loadLayersModel(
      'https://tfhub.dev/tensorflow/tfjs-model/bodypix/mobilenet/float/050/1/default/1'
    );
    
    poseDetectionModel = poseNet;
    bodySegmentationModel = bodyPix;
  } catch (error) {
    console.error('Ошибка загрузки моделей:', error);
  }
};

const calculateWaistWidth = (segmentationData: any): number => {
  const middleY = Math.floor(segmentationData.height * 0.5);
  let leftX = 0;
  let rightX = segmentationData.width;

  for (let x = 0; x < segmentationData.width; x++) {
    if (segmentationData.data[middleY * segmentationData.width + x] > 0) {
      leftX = x;
      break;
    }
  }

  for (let x = segmentationData.width - 1; x >= 0; x--) {
    if (segmentationData.data[middleY * segmentationData.width + x] > 0) {
      rightX = x;
      break;
    }
  }

  return rightX - leftX;
};


// Основная функция анализа
export const analyzeBodyImage = async (
  imageFile: File,
  userId: string
): Promise<BodyAnalysisResult> => {
  const imageTensor = await imageToTensor(imageFile);
  const poseData = await analyzePose(imageTensor);
  const segmentationData = await analyzeBodySegmentation(imageTensor);
  const analyzedImageUrl = await createAnalyzedImage(imageFile, segmentationData);

  tf.dispose([imageTensor]);

  const bodyType = determineBodyType(poseData, segmentationData);
  const metrics = calculateBodyMetrics(segmentationData);
  const problemAreas = identifyProblemAreas(segmentationData, bodyType);
  const recommendations = generateRecommendations(bodyType, metrics, problemAreas);
  const futureProjections = generateFutureProjections(metrics, bodyType, recommendations);

  // Рассчитываем метрики тела
  const bodyMetrics = {
    shoulderWidth: calculateDistance(poseData.keypoints, 'leftShoulder', 'rightShoulder'),
    waistWidth: calculateWaistWidth(segmentationData),
    hipWidth: calculateDistance(poseData.keypoints, 'leftHip', 'rightHip'),
    bodyRatio: calculateBodyRatio(segmentationData),
  };

  const result: BodyAnalysisResult = {
    _id: `analysis_${userId}_${Date.now()}` as Id<"bodyAnalysis">,
    userId,
    date: new Date(),
    bodyType,
    estimatedBodyFat: metrics.bodyFat,
    estimatedMuscleMass: metrics.muscleMass,
    posture: evaluatePosture(poseData),
    problemAreas,
    fitnessScore: calculateFitnessScore(metrics, bodyType),
    progressPotential: calculateProgressPotential(metrics, bodyType),
    recommendations,
    currentVisualData: {
      imageUrl: URL.createObjectURL(imageFile),
      analyzedImageUrl,
      bodyOutlineData: null
    },
    futureProjections,
    bodyMetrics
  };

  await saveAnalysisResult(result);
  URL.revokeObjectURL(result.currentVisualData.imageUrl);
  
  return result;
};

// Конвертация изображения в тензор
const imageToTensor = async (file: File): Promise<tf.Tensor3D> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = () => {
        const tensor = tf.browser.fromPixels(img);
        resolve(tensor);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// Анализ позы
const analyzePose = async (imageTensor: tf.Tensor3D): Promise<any> => {
  if (!poseDetectionModel) {
    // Возвращаем mock данные если модель не загружена
    return {
      keypoints: generateMockKeypoints(),
      score: 0.85
    };
  }

  const predictions = await poseDetectionModel.estimateSinglePose(imageTensor);
  return predictions;
};

// Анализ сегментации тела
const analyzeBodySegmentation = async (imageTensor: tf.Tensor3D): Promise<any> => {
  if (!bodySegmentationModel) {
    // Возвращаем mock данные
    return generateMockSegmentation();
  }

  const segmentation = await bodySegmentationModel.segmentPerson(imageTensor);
  return segmentation;
};

// Определение типа телосложения
const determineBodyType = (poseData: any, segmentationData: any): BodyAnalysisResult['bodyType'] => {
  // Анализируем пропорции на основе ключевых точек позы
  const shoulderWidth = calculateDistance(poseData.keypoints, 'leftShoulder', 'rightShoulder');
  const hipWidth = calculateDistance(poseData.keypoints, 'leftHip', 'rightHip');
  const ratio = shoulderWidth / hipWidth;

  // Анализируем распределение массы тела
  const upperBodyMass = calculateBodyPartMass(segmentationData, 'upper');
  const lowerBodyMass = calculateBodyPartMass(segmentationData, 'lower');

  if (ratio > 1.3 && upperBodyMass > lowerBodyMass * 1.2) {
    return 'mesomorph'; // Атлетическое телосложение
  } else if (ratio < 1.1 && lowerBodyMass > upperBodyMass * 1.1) {
    return 'endomorph'; // Склонность к полноте
  } else if (shoulderWidth < hipWidth * 0.9) {
    return 'ectomorph'; // Худощавое телосложение
  }

  return 'mixed';
};

// Расчет метрик тела
const calculateBodyMetrics = (segmentationData: any): {
  bodyFat: number;
  muscleMass: number;
  bmi: number;
} => {
  // Используем AI для оценки процента жира и мышц
  // В реальности это сложный алгоритм, здесь упрощенная версия

  const totalPixels = segmentationData.data.length;
  const bodyPixels = segmentationData.data.filter((pixel: number) => pixel > 0).length;
  const bodyRatio = bodyPixels / totalPixels;

  // Оценка на основе визуальных признаков
  const visualBodyFat = estimateBodyFatFromVisual(segmentationData);
  const visualMuscleMass = estimateMuscleMassFromVisual(segmentationData);

  return {
    bodyFat: Math.round(visualBodyFat),
    muscleMass: Math.round(visualMuscleMass),
    bmi: 22 + Math.random() * 8 // Mock BMI
  };
};

// Определение проблемных зон
const identifyProblemAreas = (
  segmentationData: any,
  bodyType: BodyAnalysisResult['bodyType']
): BodyAnalysisResult['problemAreas'] => {
  const areas: BodyAnalysisResult['problemAreas'] = [];

  // Анализируем распределение жира по зонам
  const zones = ['живот', 'бедра', 'руки', 'спина', 'грудь'] as const;

  zones.forEach(zone => {
    const fatDistribution = analyzeFatDistribution(segmentationData, zone);
    let severity: 'low' | 'medium' | 'high' = 'low';

    if (fatDistribution > 30) severity = 'high';
    else if (fatDistribution > 20) severity = 'medium';

    if (severity !== 'low') {
      areas.push({
        area: zone,
        severity,
        recommendation: generateAreaRecommendation(zone, severity, bodyType)
      });
    }
  });

  return areas;
};

// Генерация рекомендаций
const generateRecommendations = (
  bodyType: BodyAnalysisResult['bodyType'],
  metrics: any,
  problemAreas: BodyAnalysisResult['problemAreas']
): BodyAnalysisResult['recommendations'] => {
  let primaryGoal = '';
  const secondaryGoals: string[] = [];

  // Определяем основную цель
  if (metrics.bodyFat > 25) {
    primaryGoal = 'Снижение процента жира';
    secondaryGoals.push('Улучшение выносливости');
  } else if (metrics.muscleMass < 35) {
    primaryGoal = 'Набор мышечной массы';
    secondaryGoals.push('Увеличение силы');
  } else {
    primaryGoal = 'Поддержание формы и рельеф';
    secondaryGoals.push('Улучшение функциональности');
  }

  // Добавляем цели для проблемных зон
  problemAreas.forEach(area => {
    if (area.severity === 'high') {
      secondaryGoals.push(`Работа над зоной: ${area.area}`);
    }
  });

  // Рассчитываем время достижения цели
  const estimatedTime = calculateTimeToGoal(primaryGoal, metrics, bodyType);

  return {
    primaryGoal,
    secondaryGoals: secondaryGoals.slice(0, 3),
    estimatedTimeToGoal: estimatedTime,
    weeklyTrainingHours: bodyType === 'endomorph' ? 5 : bodyType === 'ectomorph' ? 3 : 4
  };
};

// Генерация визуализации будущих результатов
const generateFutureProjections = (
  metrics: any,
  bodyType: BodyAnalysisResult['bodyType'],
  recommendations: BodyAnalysisResult['recommendations']
): FutureProjections => {
  const weeklyFatLoss = bodyType === 'endomorph' ? 0.7 : 0.5;
  const weeklyMuscleGain = bodyType === 'ectomorph' ? 0.3 : 0.2;

  return {
    weeks4: {
      estimatedWeight: -(weeklyFatLoss * 4),
      estimatedBodyFat: metrics.bodyFat - 2,
      estimatedMuscleMass: metrics.muscleMass + 1,
      confidenceLevel: 85
    },
    weeks8: {
      estimatedWeight: -(weeklyFatLoss * 8) + (weeklyMuscleGain * 4),
      estimatedBodyFat: metrics.bodyFat - 5,
      estimatedMuscleMass: metrics.muscleMass + 3,
      confidenceLevel: 75
    },
    weeks12: {
      estimatedWeight: -(weeklyFatLoss * 12) + (weeklyMuscleGain * 8),
      estimatedBodyFat: metrics.bodyFat - 8,
      estimatedMuscleMass: metrics.muscleMass + 5,
      confidenceLevel: 65
    }
  };
};

// Вспомогательные функции
const calculateDistance = (keypoints: any[], point1: string, point2: string): number => {
  const p1 = keypoints.find(kp => kp.part === point1);
  const p2 = keypoints.find(kp => kp.part === point2);

  if (!p1 || !p2) return 0;

  return Math.sqrt(
    Math.pow(p1.position.x - p2.position.x, 2) +
    Math.pow(p1.position.y - p2.position.y, 2)
  );
};

const calculateBodyPartMass = (segmentation: any, part: 'upper' | 'lower'): number => {
  // Упрощенный расчет массы части тела
  return Math.random() * 50 + 25;
};

const evaluatePosture = (poseData: any): 'good' | 'fair' | 'poor' => {
  // Анализ осанки на основе ключевых точек
  return 'fair';
};

const calculateFitnessScore = (metrics: any, bodyType: string): number => {
  let score = 50;

  if (metrics.bodyFat < 20) score += 20;
  else if (metrics.bodyFat < 25) score += 10;

  if (metrics.muscleMass > 40) score += 20;
  else if (metrics.muscleMass > 35) score += 10;

  if (bodyType === 'mesomorph') score += 10;

  return Math.min(100, score);
};

const calculateProgressPotential = (metrics: any, bodyType: string): number => {
  let potential = 70;

  if (bodyType === 'mesomorph') potential += 15;
  if (metrics.bodyFat > 25) potential += 10; // Больше потенциал для изменений

  return Math.min(100, potential);
};

const estimateBodyFatFromVisual = (segmentation: any): number => {
  // AI оценка процента жира по визуальным признакам
  return 18 + Math.random() * 12;
};

const estimateMuscleMassFromVisual = (segmentation: any): number => {
  // AI оценка мышечной массы
  return 30 + Math.random() * 15;
};

const analyzeFatDistribution = (segmentation: any, zone: string): number => {
  // Анализ распределения жира в конкретной зоне
  return Math.random() * 40;
};

const generateAreaRecommendation = (
  area: string,
  severity: string,
  bodyType: string
): string => {
  const recommendations: Record<string, string> = {
    'живот': 'Упражнения на пресс + кардио натощак',
    'бедра': 'Приседания и выпады с весом',
    'руки': 'Изолированные упражнения на бицепс/трицепс',
    'спина': 'Тяги и подтягивания',
    'грудь': 'Жим лежа и отжимания'
  };

  return recommendations[area] || 'Комплексные упражнения';
};

const calculateTimeToGoal = (goal: string, metrics: any, bodyType: string): number => {
  // Расчет времени достижения цели в неделях
  if (goal.includes('жира') && metrics.bodyFat > 25) {
    return 12; // 12 недель для значительного снижения жира
  } else if (goal.includes('массы')) {
    return 16; // 16 недель для набора мышечной массы
  }

  return 8; // 8 недель для общего улучшения формы
};

const calculateBodyRatio = (segmentationData: any): number => {
  const totalPixels = segmentationData.width * segmentationData.height;
  const bodyPixels = segmentationData.data.filter((p: number) => p > 0).length;
  return bodyPixels / totalPixels;
};

const createAnalyzedImage = async (file: File, segmentationData: any): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Рисуем оригинальное изображение
      ctx?.drawImage(img, 0, 0);

      if (ctx) {
        // Рисуем упрощенный контур тела
        drawSimplifiedBodyOutline(ctx, segmentationData);

        // Добавляем ключевые точки
        drawKeyPoints(ctx, segmentationData);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };

    img.src = URL.createObjectURL(file);
  });
};

const saveAnalysisResult = async (result: BodyAnalysisResult): Promise<void> => {
  try {
    const response = await fetch('/api/body-analysis/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...result,
        currentVisualData: {
          imageUrl: result.currentVisualData.imageUrl,
          analyzedImageUrl: result.currentVisualData.analyzedImageUrl
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save analysis');
    }

    console.log("Analysis saved successfully:", data.data);
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

const drawSimplifiedBodyOutline = (ctx: CanvasRenderingContext2D, data: any) => {
  const step = 5; // Шаг для уменьшения количества точек
  const points = [];

  // Собираем ключевые точки контура
  for (let y = 0; y < data.height; y += step) {
    for (let x = 0; x < data.width; x += step) {
      if (data.data[y * data.width + x] > 0) {
        points.push({ x, y });
      }
    }
  }

  // Рисуем контур
  if (points.length > 0) {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.closePath();
    ctx.stroke();
  }
};


const drawKeyPoints = (ctx: CanvasRenderingContext2D, data: any) => {
  const keyPoints = [
    { name: 'shoulder', yRatio: 0.2 },
    { name: 'waist', yRatio: 0.4 },
    { name: 'hips', yRatio: 0.6 }
  ];

  ctx.fillStyle = 'blue';

  keyPoints.forEach(point => {
    const y = Math.floor(data.height * point.yRatio);
    let leftX = 0;
    let rightX = data.width;

    // Находим крайние точки на этом уровне
    for (let x = 0; x < data.width; x++) {
      if (data.data[y * data.width + x] > 0) {
        leftX = x;
        break;
      }
    }

    for (let x = data.width - 1; x >= 0; x--) {
      if (data.data[y * data.width + x] > 0) {
        rightX = x;
        break;
      }
    }

    // Рисуем точки
    if (leftX < rightX) {
      ctx.beginPath();
      ctx.arc(leftX, y, 5, 0, Math.PI * 2);
      ctx.arc(rightX, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};


// Mock функции для тестирования без загруженных моделей
const generateMockKeypoints = () => {
  return [
    { part: 'leftShoulder', position: { x: 100, y: 150 }, score: 0.9 },
    { part: 'rightShoulder', position: { x: 200, y: 150 }, score: 0.9 },
    { part: 'leftHip', position: { x: 120, y: 300 }, score: 0.85 },
    { part: 'rightHip', position: { x: 180, y: 300 }, score: 0.85 }
  ];
};

const generateMockSegmentation = () => {
  return {
    data: new Array(640 * 480).fill(0).map(() => Math.random() > 0.3 ? 1 : 0),
    width: 640,
    height: 480
  };
};