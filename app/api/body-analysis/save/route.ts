import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
    try {
        console.log("🔄 API POST /body-analysis/save: Начало сохранения анализа тела");

        const body = await request.json();
        console.log("📦 Получены данные:", {
            bodyType: body.bodyType,
            userId: body.userId,
            // Остальные поля для логирования
        });

        // Расширенная валидация данных
        if (!body.userId) {
            throw new Error("Отсутствует обязательное поле: userId");
        }

        if (!body.bodyType || !['ectomorph', 'mesomorph', 'endomorph', 'mixed'].includes(body.bodyType)) {
            throw new Error("Некорректный тип телосложения");
        }

        // Подготовка данных для сохранения
        const analysisData = {
            userId: body.userId,
            bodyType: body.bodyType,
            estimatedBodyFat: Number(body.estimatedBodyFat) || 0,
            estimatedMuscleMass: Number(body.estimatedMuscleMass) || 0,
            posture: body.posture || 'fair',
            fitnessScore: Number(body.fitnessScore) || 0,
            progressPotential: Number(body.progressPotential) || 0,
            problemAreas: Array.isArray(body.problemAreas) ? body.problemAreas : [],
            recommendations: body.recommendations || {
                primaryGoal: '',
                secondaryGoals: [],
                estimatedTimeToGoal: 0,
                weeklyTrainingHours: 0
            },
            currentVisualData: {
                imageUrl: body.currentVisualData?.imageUrl || '',
                analyzedImageUrl: body.currentVisualData?.analyzedImageUrl || '',
            },
            futureProjections: body.futureProjections || {
                weeks4: { estimatedWeight: 0, estimatedBodyFat: 0, estimatedMuscleMass: 0, confidenceLevel: 0 },
                weeks8: { estimatedWeight: 0, estimatedBodyFat: 0, estimatedMuscleMass: 0, confidenceLevel: 0 },
                weeks12: { estimatedWeight: 0, estimatedBodyFat: 0, estimatedMuscleMass: 0, confidenceLevel: 0 }
            },
            // Добавляем timestamp
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        console.log("📞 Вызываем Convex mutation для сохранения");
        const result = await convex.mutation("bodyAnalysis:saveBodyAnalysis", analysisData);

        console.log("✅ Анализ тела успешно сохранен, ID:", result._id);

        return NextResponse.json({
            success: true,
            data: {
                analysisId: result._id,
                createdAt: result._creationTime
            },
            message: 'Анализ тела успешно сохранен'
        }, { status: 201 });
    } catch (error) {
        console.error("❌ Ошибка сохранения:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка сохранения',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            },
            { status: 500 }
        );
    }
}