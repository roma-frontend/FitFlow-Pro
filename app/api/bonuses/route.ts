// app/api/bonuses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

interface Bonus {
    _id: string;
    _creationTime: number;
    userId: string;
    type: string;
    value: number;
    description?: string;
    expiresAt: number;
    isUsed: boolean;
    category?: string;
    conditions?: Record<string, any>;
    metadata?: Record<string, any>;
}

interface BonusWithStatus extends Bonus {
    isExpired: boolean;
    isActive: boolean;
    isUsed: boolean;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
    try {
        console.log("🔄 API GET: Начало обработки запроса бонусов");

        // Получаем параметры из query
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const type = searchParams.get('type') || 'all';
        const status = searchParams.get('status'); // active, expired, used

        if (!userId) {
            throw new Error("Отсутствует обязательный параметр: userId");
        }

        console.log("📞 API GET: Получаем бонусы для пользователя:", userId, "тип:", type);

        let bonuses: Bonus[] | undefined;

        switch (type) {
            case 'available':
                console.log("📞 API GET: Получаем доступные бонусы");
                bonuses = await convex.query("bonuses:getAvailableBonuses", { userId });
                break;

            case 'used':
                console.log("📞 API GET: Получаем использованные бонусы");
                bonuses = await convex.query("bonuses:getUsedBonuses", { userId });
                break;

            case 'expired':
                console.log("📞 API GET: Получаем просроченные бонусы");
                bonuses = await convex.query("bonuses:getExpiredBonuses", { userId });
                break;

            case 'all':
            default:
                console.log("📞 API GET: Получаем все бонусы пользователя");
                bonuses = await convex.query("bonuses:getUserBonuses", { userId });
                break;
        }

        // Добавляем статус для каждого бонуса
        const now = Date.now();
        const bonusesWithStatus = bonuses?.map((bonus: Bonus) => ({
            ...bonus,
            isExpired: bonus.expiresAt < now,
            isActive: !bonus.isUsed && bonus.expiresAt > now,
            isUsed: bonus.isUsed || false
        })) as BonusWithStatus[] || [];

        // Фильтруем по статусу если указан
        let filteredBonuses = bonusesWithStatus;
        if (status) {
            switch (status) {
                case 'active':
                    filteredBonuses = bonusesWithStatus.filter(bonus => bonus.isActive);
                    break;
                case 'expired':
                    filteredBonuses = bonusesWithStatus.filter(bonus => bonus.isExpired);
                    break;
                case 'used':
                    filteredBonuses = bonusesWithStatus.filter(bonus => bonus.isUsed);
                    break;
            }
        }

        console.log("✅ API GET: Получено бонусов:", filteredBonuses.length);

        return NextResponse.json({
            success: true,
            data: filteredBonuses,
            count: filteredBonuses.length,
            type,
            status
        });
    } catch (error) {
        console.error("❌ API GET: Ошибка:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Ошибка получения бонусов',
                data: []
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log("🔄 API POST: Начало создания бонуса");

        const body = await request.json();
        console.log("📦 API POST: Получены данные:", body);

        // Валидация данных
        if (!body.userId) {
            throw new Error("Отсутствует обязательное поле: userId");
        }

        if (!body.type || !body.value) {
            throw new Error("Отсутствуют обязательные поля: type, value");
        }

        console.log("📞 API POST: Вызываем Convex mutation");

        const result = await convex.mutation("bonuses:createUserBonus", {
            userId: body.userId,
            type: body.type,
            value: body.value,
            description: body.description || '',
            expiresAt: body.expiresAt || (Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней по умолчанию
            category: body.category || 'general',
            conditions: body.conditions || {},
            metadata: body.metadata || {}
        });

        console.log("✅ API POST: Бонус создан:", result);

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Бонус успешно создан'
        }, { status: 201 });
    } catch (error) {
        console.error("❌ API POST: Ошибка:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Ошибка создания бонуса'
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        console.log("🔄 API PUT: Начало обновления бонуса");

        const body = await request.json();
        console.log("📦 API PUT: Получены данные:", body);

        // Валидация данных
        if (!body.userId || !body.bonusId) {
            throw new Error("Отсутствуют обязательные поля: userId, bonusId");
        }

        console.log("📞 API PUT: Вызываем Convex mutation");

        const result = await convex.mutation("bonuses:updateUserBonus", {
            userId: body.userId,
            bonusId: body.bonusId,
            type: body.type,
            value: body.value,
            description: body.description,
            expiresAt: body.expiresAt,
            category: body.category,
            conditions: body.conditions,
            metadata: body.metadata
        });

        console.log("✅ API PUT: Бонус обновлен:", result);

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Бонус успешно обновлен'
        });
    } catch (error) {
        console.error("❌ API PUT: Ошибка:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Ошибка обновления бонуса'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        console.log("🔄 API DELETE: Начало удаления бонуса");

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const bonusId = searchParams.get('bonusId');

        // Валидация данных
        if (!userId || !bonusId) {
            throw new Error("Отсутствуют обязательные параметры: userId, bonusId");
        }

        console.log("📞 API DELETE: Вызываем Convex mutation");

        const result = await convex.mutation("bonuses:deleteUserBonus", {
            userId,
            bonusId
        });

        console.log("✅ API DELETE: Бонус удален:", result);

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Бонус успешно удален'
        });
    } catch (error) {
        console.error("❌ API DELETE: Ошибка:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Ошибка удаления бонуса'
            },
            { status: 500 }
        );
    }
}