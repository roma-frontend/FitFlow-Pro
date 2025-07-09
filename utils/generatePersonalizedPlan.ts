// utils/generatePersonalizedPlan.ts

import { Id } from '@/convex/_generated/dataModel';
import type { BodyAnalysisResult, PersonalizedPlan } from '@/types/bodyAnalysis';

export async function generatePersonalizedPlan(
    analysis: BodyAnalysisResult
): Promise<PersonalizedPlan> {
    const planId = `plan-${Date.now()}` as Id<'personalizedPlans'>;
    // В реальном приложении здесь был бы вызов API для получения данных о тренерах,
    // программах и продуктах. Сейчас используем mock данные.

    // Подбираем тренера на основе типа телосложения и целей
    const trainer = selectTrainer(analysis);

    // Подбираем программу тренировок
    const trainingProgram = selectTrainingProgram(analysis);

    // Создаем план питания
    const nutritionPlan = createNutritionPlan(analysis);

    // Подбираем спортивное питание
    const recommendedProducts = selectSupplements(analysis);

    // Рекомендуем абонемент
    const membershipRecommendation = selectMembership(analysis);

    // Формируем прогноз результатов
    const projectedResults = createProjectedResults(analysis);

    return {
        _id: planId,
        analysisId: analysis._id,
        recommendedTrainer: trainer,
        trainingProgram,
        nutritionPlan,
        recommendedProducts,
        membershipRecommendation,
        projectedResults,
    };
}

function selectTrainer(analysis: BodyAnalysisResult) {
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
        if (trainer.bodyTypes.includes(analysis.bodyType)) {
            score += 40;
        }

        // Соответствие целям
        const primaryGoal = analysis.recommendations.primaryGoal.toLowerCase();
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

function selectTrainingProgram(analysis: BodyAnalysisResult) {
    const programs = {
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
                    sets: 1, // исправлено на number
                    reps: '30 мин',
                    intensity: 'high',
                    category: 'cardio',
                    restTime: '60 сек',
                    targetMuscles: ['Ноги', 'Кардиоваскулярная система']
                },
                {
                    id: 'ex-2',
                    name: 'Приседания',
                    sets: 3, // исправлено на number
                    reps: '15',
                    intensity: 'medium',
                    category: 'strength',
                    restTime: '45 сек',
                    targetMuscles: ['Квадрицепсы', 'Ягодицы', 'Бедра']
                },
                {
                    id: 'ex-3',
                    name: 'Берпи',
                    sets: 4, // исправлено на number
                    reps: '10',
                    intensity: 'high',
                    category: 'hiit',
                    restTime: '60 сек',
                    targetMuscles: ['Все тело', 'Кардиоваскулярная система']
                },
                {
                    id: 'ex-4',
                    name: 'Планка',
                    sets: 3, // исправлено на number
                    reps: '60 сек',
                    intensity: 'medium',
                    category: 'core',
                    restTime: '30 сек',
                    targetMuscles: ['Пресс', 'Кор', 'Плечи']
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
                    sets: 4, // исправлено на number
                    reps: '8',
                    intensity: 'high',
                    category: 'strength',
                    restTime: '2 мин',
                    targetMuscles: ['Грудь', 'Трицепсы', 'Плечи']
                },
                {
                    id: 'ex-6',
                    name: 'Приседания со штангой',
                    sets: 4, // исправлено на number
                    reps: '10',
                    intensity: 'high',
                    category: 'strength',
                    restTime: '3 мин',
                    targetMuscles: ['Квадрицепсы', 'Ягодицы', 'Бедра', 'Кор']
                },
                {
                    id: 'ex-7',
                    name: 'Становая тяга',
                    sets: 3, // исправлено на number
                    reps: '6',
                    intensity: 'high',
                    category: 'strength',
                    restTime: '3 мин',
                    targetMuscles: ['Спина', 'Ягодицы', 'Бедра', 'Трапеции']
                },
                {
                    id: 'ex-8',
                    name: 'Подтягивания',
                    sets: 3, // исправлено на number
                    reps: '8',
                    intensity: 'medium',
                    category: 'strength',
                    restTime: '90 сек',
                    targetMuscles: ['Широчайшие', 'Бицепсы', 'Плечи']
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
                    intensity: 'medium',
                    category: 'functional',
                    restTime: '45 сек',
                    targetMuscles: ['Квадрицепсы', 'Ягодицы', 'Икры']
                },
                {
                    id: 'ex-10',
                    name: 'Отжимания',
                    sets: 3,
                    reps: '15',
                    intensity: 'medium',
                    category: 'strength',
                    restTime: '60 сек',
                    targetMuscles: ['Грудь', 'Трицепсы', 'Плечи', 'Кор']
                },
                {
                    id: 'ex-11',
                    name: 'Русские скручивания',
                    sets: 3,
                    reps: '20',
                    intensity: 'medium',
                    category: 'core',
                    restTime: '30 сек',
                    targetMuscles: ['Пресс', 'Косые мышцы']
                },
                {
                    id: 'ex-12',
                    name: 'Растяжка',
                    sets: 1,
                    reps: '15 мин',
                    intensity: 'low',
                    category: 'flexibility',
                    restTime: '0 сек',
                    targetMuscles: ['Все тело', 'Суставы']
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
                    sets: 6, // исправлено на number
                    reps: '30 сек',
                    intensity: 'high',
                    category: 'cardio',
                    restTime: '2 мин',
                    targetMuscles: ['Ноги', 'Кардиоваскулярная система']
                },
                {
                    id: 'ex-14',
                    name: 'Плиометрические прыжки',
                    sets: 4, // исправлено на number
                    reps: '10',
                    intensity: 'high',
                    category: 'plyometric',
                    restTime: '90 сек',
                    targetMuscles: ['Ноги', 'Взрывная сила', 'Кор']
                },
                {
                    id: 'ex-15',
                    name: 'Лестница координации',
                    sets: 5, // исправлено на number
                    reps: '45 сек',
                    intensity: 'medium',
                    category: 'agility',
                    restTime: '60 сек',
                    targetMuscles: ['Ноги', 'Координация', 'Ловкость']
                },
                {
                    id: 'ex-16',
                    name: 'Круговая тренировка',
                    sets: 3, // исправлено на number
                    reps: '20 мин',
                    intensity: 'high',
                    category: 'circuit',
                    restTime: '3 мин',
                    targetMuscles: ['Все тело', 'Выносливость']
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