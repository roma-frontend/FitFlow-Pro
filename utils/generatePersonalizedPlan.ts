// utils/generatePersonalizedPlan.ts

import { Id } from '@/convex/_generated/dataModel';
import type { BodyAnalysisResult, PersonalizedPlan } from '@/types/bodyAnalysis';

// Define the Exercise type locally to ensure it matches your implementation
interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  restTime: number;
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Define the TrainingProgram type locally
interface TrainingProgram {
  id: string;
  name: string;
  duration: number;
  sessionsPerWeek: number;
  focusAreas: string[];
  exercises: Exercise[];
}

export async function generatePersonalizedPlan(
    analysis: BodyAnalysisResult
): Promise<PersonalizedPlan> {
    const validatedAnalysis = {
        ...analysis,
        recommendations: {
            primaryGoal: analysis.recommendations?.primaryGoal || 'Общее улучшение формы',
            secondaryGoals: analysis.recommendations?.secondaryGoals || [],
            estimatedTimeToGoal: analysis.recommendations?.estimatedTimeToGoal || 12,
            weeklyTrainingHours: analysis.recommendations?.weeklyTrainingHours || 4,
        },
        bodyType: analysis.bodyType || 'mixed',
        estimatedBodyFat: analysis.estimatedBodyFat || 25,
        estimatedMuscleMass: analysis.estimatedMuscleMass || 30,
        fitnessScore: analysis.fitnessScore || 50,
        progressPotential: analysis.progressPotential || 70,
        futureProjections: analysis.futureProjections || {
            weeks4: { 
                estimatedWeight: -2, 
                estimatedBodyFat: 23, 
                estimatedMuscleMass: 31, 
                confidenceLevel: 80 
            },
            weeks8: { 
                estimatedWeight: -4, 
                estimatedBodyFat: 21, 
                estimatedMuscleMass: 32, 
                confidenceLevel: 75 
            },
            weeks12: { 
                estimatedWeight: -6, 
                estimatedBodyFat: 19, 
                estimatedMuscleMass: 33, 
                confidenceLevel: 70 
            }
        }
    };

    const planId = `plan-${Date.now()}` as Id<'personalizedPlans'>;

    // Генерация плана
    return {
        _id: planId,
        analysisId: analysis._id,
        recommendedTrainer: selectTrainer(validatedAnalysis),
        trainingProgram: selectTrainingProgram(validatedAnalysis),
        nutritionPlan: createNutritionPlan(validatedAnalysis),
        recommendedProducts: selectSupplements(validatedAnalysis),
        membershipRecommendation: selectMembership(validatedAnalysis),
        projectedResults: createProjectedResults(validatedAnalysis),
    };
}

function selectTrainer(analysis: BodyAnalysisResult) {
    // Проверяем наличие необходимых данных
    if (!analysis || !analysis.recommendations || !analysis.recommendations.primaryGoal) {
        console.error('Missing recommendations data in analysis:', analysis);
        // Возвращаем дефолтного тренера
        return {
            id: 'trainer-default',
            name: 'Анна Петрова',
            specialty: 'Универсальный тренинг',
            matchScore: 70,
            reason: 'Опытный тренер для достижения любых целей',
        };
    }

    // База тренеров с их специализациями
    const trainers = [
        {
            id: 'trainer-1',
            name: 'Анна Петрова',
            specialty: 'Трансформация тела и снижение веса',
            bodyTypes: ['endomorph', 'mixed'],
            focus: ['weight_loss', 'toning'],
            experience: 8,
        },
        {
            id: 'trainer-2',
            name: 'Михаил Иванов',
            specialty: 'Набор мышечной массы и силовые тренировки',
            bodyTypes: ['ectomorph', 'mesomorph'],
            focus: ['muscle_gain', 'strength'],
            experience: 10,
        },
        {
            id: 'trainer-3',
            name: 'Елена Сидорова',
            specialty: 'Функциональный тренинг и выносливость',
            bodyTypes: ['mesomorph', 'mixed'],
            focus: ['athletic', 'endurance'],
            experience: 6,
        },
    ];

    // Находим лучшего тренера
    let bestTrainer = trainers[0];
    let maxScore = 0;

    trainers.forEach(trainer => {
        let score = 0;

        // Соответствие типу телосложения
        if (analysis.bodyType && trainer.bodyTypes.includes(analysis.bodyType)) {
            score += 40;
        }

        // Соответствие целям
        const primaryGoal = (analysis.recommendations.primaryGoal || '').toLowerCase();
        trainer.focus.forEach(focus => {
            if (primaryGoal.includes(focus) ||
                (focus === 'weight_loss' && primaryGoal.includes('жир')) ||
                (focus === 'muscle_gain' && primaryGoal.includes('мышц'))) {
                score += 30;
            }
        });

        // Опыт тренера
        score += trainer.experience * 2;

        // Рандомный фактор для разнообразия
        score += Math.random() * 10;

        if (score > maxScore) {
            maxScore = score;
            bestTrainer = trainer;
        }
    });

    return {
        id: bestTrainer.id,
        name: bestTrainer.name,
        specialty: bestTrainer.specialty,
        matchScore: Math.min(95, Math.round(maxScore)),
        reason: `Специализируется на клиентах с типом телосложения ${analysis.bodyType === 'ectomorph' ? 'эктоморф' :
            analysis.bodyType === 'mesomorph' ? 'мезоморф' :
                analysis.bodyType === 'endomorph' ? 'эндоморф' : 'смешанный'
            } и имеет ${bestTrainer.experience} лет опыта в достижении подобных целей`,
    };
}

function selectTrainingProgram(analysis: BodyAnalysisResult): TrainingProgram {
    const programs: Record<string, TrainingProgram> = {
        weight_loss: {
            id: 'prog-1',
            name: 'Интенсивное жиросжигание',
            duration: 12,
            sessionsPerWeek: 4,
            focusAreas: ['Кардио тренировки', 'Силовые упражнения', 'HIIT'],
            exercises: [
                {
                    id: 'ex-1',
                    name: 'Бег на беговой дорожке',
                    sets: 1,
                    reps: '30 мин',
                    category: 'cardio',
                    restTime: 60,
                    muscleGroups: ['Ноги', 'Кардиоваскулярная система'],
                    difficulty: 'beginner'
                },
                {
                    id: 'ex-2',
                    name: 'Приседания',
                    sets: 3,
                    reps: '15',
                    category: 'strength',
                    restTime: 45,
                    muscleGroups: ['Квадрицепсы', 'Ягодицы', 'Бедра'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'ex-3',
                    name: 'Берпи',
                    sets: 4,
                    reps: '10',
                    category: 'hiit',
                    restTime: 60,
                    muscleGroups: ['Все тело', 'Кардиоваскулярная система'],
                    difficulty: 'advanced'
                },
                {
                    id: 'ex-4',
                    name: 'Планка',
                    sets: 3,
                    reps: '60 сек',
                    category: 'core',
                    restTime: 30,
                    muscleGroups: ['Пресс', 'Кор', 'Плечи'],
                    difficulty: 'intermediate'
                }
            ]
        },
        muscle_gain: {
            id: 'prog-2',
            name: 'Массонабор и сила',
            duration: 16,
            sessionsPerWeek: 4,
            focusAreas: ['Силовые тренировки', 'Гипертрофия', 'Прогрессивная нагрузка'],
            exercises: [
                {
                    id: 'ex-5',
                    name: 'Жим лежа',
                    sets: 4,
                    reps: '8',
                    category: 'strength',
                    restTime: 120,
                    muscleGroups: ['Грудь', 'Трицепсы', 'Плечи'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'ex-6',
                    name: 'Приседания со штангой',
                    sets: 4,
                    reps: '10',
                    category: 'strength',
                    restTime: 180,
                    muscleGroups: ['Квадрицепсы', 'Ягодицы', 'Бедра', 'Кор'],
                    difficulty: 'advanced'
                },
                {
                    id: 'ex-7',
                    name: 'Становая тяга',
                    sets: 3,
                    reps: '6',
                    category: 'strength',
                    restTime: 180,
                    muscleGroups: ['Спина', 'Ягодицы', 'Бедра', 'Трапеции'],
                    difficulty: 'advanced'
                },
                {
                    id: 'ex-8',
                    name: 'Подтягивания',
                    sets: 3,
                    reps: '8',
                    category: 'strength',
                    restTime: 90,
                    muscleGroups: ['Широчайшие', 'Бицепсы', 'Плечи'],
                    difficulty: 'intermediate'
                }
            ]
        },
        toning: {
            id: 'prog-3',
            name: 'Тонус и рельеф',
            duration: 8,
            sessionsPerWeek: 3,
            focusAreas: ['Функциональный тренинг', 'Круговые тренировки', 'Растяжка'],
            exercises: [
                {
                    id: 'ex-9',
                    name: 'Выпады',
                    sets: 3,
                    reps: '12',
                    category: 'functional',
                    restTime: 45,
                    muscleGroups: ['Квадрицепсы', 'Ягодицы', 'Икры'],
                    difficulty: 'beginner'
                },
                {
                    id: 'ex-10',
                    name: 'Отжимания',
                    sets: 3,
                    reps: '15',
                    category: 'strength',
                    restTime: 60,
                    muscleGroups: ['Грудь', 'Трицепсы', 'Плечи', 'Кор'],
                    difficulty: 'beginner'
                },
                {
                    id: 'ex-11',
                    name: 'Русские скручивания',
                    sets: 3,
                    reps: '20',
                    category: 'core',
                    restTime: 30,
                    muscleGroups: ['Пресс', 'Косые мышцы'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'ex-12',
                    name: 'Растяжка',
                    sets: 1,
                    reps: '15 мин',
                    category: 'flexibility',
                    restTime: 0,
                    muscleGroups: ['Все тело', 'Суставы'],
                    difficulty: 'beginner'
                }
            ]
        },
        athletic: {
            id: 'prog-4',
            name: 'Атлетическая подготовка',
            duration: 12,
            sessionsPerWeek: 5,
            focusAreas: ['Скорость и ловкость', 'Взрывная сила', 'Выносливость'],
            exercises: [
                {
                    id: 'ex-13',
                    name: 'Спринты',
                    sets: 6,
                    reps: '30 сек',
                    category: 'cardio',
                    restTime: 120,
                    muscleGroups: ['Ноги', 'Кардиоваскулярная система'],
                    difficulty: 'advanced'
                },
                {
                    id: 'ex-14',
                    name: 'Плиометрические прыжки',
                    sets: 4,
                    reps: '10',
                    category: 'plyometric',
                    restTime: 90,
                    muscleGroups: ['Ноги', 'Взрывная сила', 'Кор'],
                    difficulty: 'advanced'
                },
                {
                    id: 'ex-15',
                    name: 'Лестница координации',
                    sets: 5,
                    reps: '45 сек',
                    category: 'agility',
                    restTime: 60,
                    muscleGroups: ['Ноги', 'Координация', 'Ловкость'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'ex-16',
                    name: 'Круговая тренировка',
                    sets: 3,
                    reps: '20 мин',
                    category: 'circuit',
                    restTime: 180,
                    muscleGroups: ['Все тело', 'Выносливость'],
                    difficulty: 'advanced'
                }
            ]
        },
    };

    // Выбираем программу на основе целей
    const primaryGoal = analysis.recommendations.primaryGoal.toLowerCase();
    let selectedProgram = programs.toning; // По умолчанию

    if (primaryGoal.includes('жир') || primaryGoal.includes('вес')) {
        selectedProgram = programs.weight_loss;
    } else if (primaryGoal.includes('мышц') || primaryGoal.includes('масс')) {
        selectedProgram = programs.muscle_gain;
    } else if (primaryGoal.includes('выносливость') || primaryGoal.includes('функциональн')) {
        selectedProgram = programs.athletic;
    }

    // Корректируем на основе типа тела
    if (analysis.bodyType === 'endomorph' && selectedProgram.sessionsPerWeek < 4) {
        selectedProgram = {
            ...selectedProgram,
            sessionsPerWeek: 4 // Больше тренировок для эндоморфов
        };
    }

    return selectedProgram;
}

function createNutritionPlan(analysis: BodyAnalysisResult) {
    // Базовый метаболизм (приблизительный расчет)
    const basalMetabolicRate = 1500; // Базовое значение

    // Корректируем калории на основе целей
    let dailyCalories = basalMetabolicRate;
    const primaryGoal = analysis.recommendations.primaryGoal.toLowerCase();

    if (primaryGoal.includes('жир') || primaryGoal.includes('вес')) {
        dailyCalories = basalMetabolicRate - 300; // Дефицит для похудения
    } else if (primaryGoal.includes('мышц') || primaryGoal.includes('масс')) {
        dailyCalories = basalMetabolicRate + 500; // Профицит для набора массы
    } else {
        dailyCalories = basalMetabolicRate + 100; // Поддержание
    }

    // Рассчитываем макронутриенты
    const proteinPerKg = primaryGoal.includes('мышц') ? 2.2 : 1.8;
    const bodyWeight = 75; // Примерный вес

    const protein = Math.round(bodyWeight * proteinPerKg);
    const fats = Math.round(dailyCalories * 0.25 / 9); // 25% от калорий
    const carbs = Math.round((dailyCalories - (protein * 4) - (fats * 9)) / 4);

    return {
        dailyCalories: Math.round(dailyCalories),
        macros: {
            protein,
            carbs,
            fats,
        },
    };
}

function selectSupplements(analysis: BodyAnalysisResult) {
    const supplements = [];
    const primaryGoal = analysis.recommendations.primaryGoal.toLowerCase();

    // Базовые добавки для всех
    supplements.push({
        productId: 'supp-1',
        name: 'Протеин Whey Gold Standard',
        purpose: 'Восстановление и рост мышц',
        timing: 'После тренировки',
        monthlyBudget: 3500,
        importance: 'essential' as const,
    });

    // Добавки на основе целей
    if (primaryGoal.includes('жир') || primaryGoal.includes('вес')) {
        supplements.push({
            productId: 'supp-2',
            name: 'L-Карнитин',
            purpose: 'Ускорение жиросжигания',
            timing: 'Перед тренировкой',
            monthlyBudget: 2000,
            importance: 'recommended' as const,
        });
        supplements.push({
            productId: 'supp-3',
            name: 'Термогеник',
            purpose: 'Повышение метаболизма',
            timing: 'Утром',
            monthlyBudget: 1500,
            importance: 'optional' as const,
        });
    } else if (primaryGoal.includes('мышц') || primaryGoal.includes('масс')) {
        supplements.push({
            productId: 'supp-4',
            name: 'Креатин моногидрат',
            purpose: 'Увеличение силы и массы',
            timing: 'После тренировки',
            monthlyBudget: 1000,
            importance: 'essential' as const,
        });
        supplements.push({
            productId: 'supp-5',
            name: 'BCAA',
            purpose: 'Защита мышц от катаболизма',
            timing: 'Во время тренировки',
            monthlyBudget: 2500,
            importance: 'recommended' as const,
        });
    }

    // Добавки для восстановления
    if (analysis.recommendations.weeklyTrainingHours >= 4) {
        supplements.push({
            productId: 'supp-6',
            name: 'Глютамин',
            purpose: 'Ускорение восстановления',
            timing: 'Перед сном',
            monthlyBudget: 1800,
            importance: 'optional' as const,
        });
    }

    return supplements;
}

function selectMembership(analysis: BodyAnalysisResult) {
    const memberships = {
        basic: {
            type: 'Basic',
            features: ['Тренажерный зал', 'Групповые занятия'],
            price: 2990,
            savings: 0,
        },
        standard: {
            type: 'Standard',
            features: ['Тренажерный зал', 'Групповые занятия', 'Сауна', 'Консультация тренера'],
            price: 3990,
            savings: 500,
        },
        premium: {
            type: 'Premium',
            features: [
                'Безлимитные тренировки',
                'Персональные тренировки',
                'Консультации нутрициолога',
                'Приоритетная запись',
                'Гостевые визиты',
            ],
            price: 5990,
            savings: 1500,
        },
    };

    // Выбираем абонемент на основе интенсивности программы
    let recommended = memberships.standard;
    let reason = 'Оптимальный выбор для ваших целей';

    if (analysis.recommendations.weeklyTrainingHours >= 5) {
        recommended = memberships.premium;
        reason = 'Включает все необходимые услуги для интенсивной трансформации';
    } else if (analysis.recommendations.weeklyTrainingHours <= 3) {
        recommended = memberships.basic;
        reason = 'Достаточно для начального уровня тренировок';
    }

    // Для серьезных целей рекомендуем премиум
    const primaryGoal = analysis.recommendations.primaryGoal.toLowerCase();
    if ((primaryGoal.includes('10') || primaryGoal.includes('15')) &&
        recommended.type !== 'Premium') {
        recommended = memberships.premium;
        reason = 'Для амбициозных целей требуется максимальная поддержка';
    }

    return {
        ...recommended,
        reason,
    };
}

function createProjectedResults(analysis: BodyAnalysisResult) {
    const baseSuccessProbability = analysis.progressPotential;

    // Корректируем вероятность успеха на основе факторов
    let successProbability = baseSuccessProbability;

    if (analysis.bodyType === 'mesomorph') {
        successProbability += 5; // Мезоморфы легче трансформируются
    }

    if (analysis.fitnessScore > 70) {
        successProbability += 5; // Хорошая начальная форма
    }

    successProbability = Math.min(95, successProbability);

    return {
        week4: `Видимые изменения: -${Math.abs(analysis.futureProjections.weeks4.estimatedWeight)}кг, улучшение самочувствия и энергии`,
        week8: `Заметная трансформация: -${Math.abs(analysis.futureProjections.weeks8.estimatedWeight)}кг, укрепление мышц, повышение выносливости`,
        week12: `Впечатляющий результат: -${Math.abs(analysis.futureProjections.weeks12.estimatedWeight)}кг, новое тело и образ жизни!`,
        successProbability: Math.round(successProbability),
    };
}