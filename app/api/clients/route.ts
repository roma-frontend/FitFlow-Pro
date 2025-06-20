// app/api/clients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockClients, mockTrainers, mockSessions, Client, Session } from '@/lib/mock-data';

// Расширенный интерфейс клиента для API (убираем конфликтующие поля)
interface ExtendedClient extends Omit<Client, 'joinDate'> {
    birthDate?: string;
    joinDate?: string; // Делаем опциональным
    trainerName?: string | null;
    trainerPhone?: string | null;
    lastVisit?: string | null;
    upcomingSessions?: number;
    nextSession?: Session | null;
    stats?: {
        totalSessions: number;
        completedSessions: number;
        scheduledSessions: number;
        cancelledSessions: number;
        noShowSessions: number;
    };
}

// GET /api/clients - Получение списка клиентов
export async function GET(req: NextRequest) {
    return withPermissions(
        { resource: 'clients', action: 'read' },
        async (authenticatedReq: AuthenticatedRequest) => {
            try {
                console.log('👥 API: получение списка клиентов');

                const { user } = authenticatedReq;
                const url = new URL(req.url);
                const page = parseInt(url.searchParams.get('page') || '1');
                const limit = parseInt(url.searchParams.get('limit') || '10');
                const search = url.searchParams.get('search') || '';
                const status = url.searchParams.get('status');
                const trainerId = url.searchParams.get('trainerId');
                const membershipType = url.searchParams.get('membershipType');
                const sortBy = url.searchParams.get('sortBy') || 'createdAt';
                const sortOrder = url.searchParams.get('sortOrder') || 'desc';

                let clients = [...mockClients];

                // Фильтрация по правам доступа
                if (user.role === 'trainer') {
                    // Тренеры видят только своих клиентов
                    clients = clients.filter((client: Client) => client.trainerId === user.id);
                } else if (user.role === 'client') {
                    // Клиенты видят только себя
                    clients = clients.filter((client: Client) => client.id === user.id);
                }

                // Фильтрация по тренеру (только для админов и менеджеров)
                if (trainerId && user.role !== 'trainer' && user.role !== 'client') {
                    clients = clients.filter((client: Client) => client.trainerId === trainerId);
                }

                // Фильтрация по статусу
                if (status) {
                    clients = clients.filter((client: Client) => client.status === status);
                }

                // Фильтрация по типу членства
                if (membershipType) {
                    clients = clients.filter((client: Client) => client.membershipType === membershipType);
                }

                // Поиск
                if (search) {
                    const searchLower = search.toLowerCase();
                    clients = clients.filter((client: Client) =>
                        client.name.toLowerCase().includes(searchLower) ||
                        client.email.toLowerCase().includes(searchLower) ||
                        client.phone?.toLowerCase().includes(searchLower)
                    );
                }

                // Добавление дополнительной информации
                const enrichedClients: ExtendedClient[] = clients.map((client: Client) => {
                    const trainer = mockTrainers.find(t => t.id === client.trainerId);
                    const clientSessions = mockSessions.filter((s: Session) => s.clientId === client.id);
                    const completedSessions = clientSessions.filter((s: Session) => s.status === 'completed');
                    const upcomingSessions = clientSessions.filter((s: Session) =>
                        s.status === 'scheduled' && new Date(`${s.date}T${s.startTime}`) > new Date()
                    );

                    // Последняя сессия
                    const lastSession = completedSessions.length > 0
                        ? completedSessions
                            .sort((a: Session, b: Session) =>
                                new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime()
                            )[0]
                        : null;

                    return {
                        ...client,
                        trainerName: trainer?.name || null,
                        trainerPhone: trainer?.phone || null,
                        totalSessions: completedSessions.length,
                        lastVisit: lastSession ? `${lastSession.date}T${lastSession.startTime}` : null,
                        upcomingSessions: upcomingSessions.length,
                        nextSession: upcomingSessions.length > 0
                            ? upcomingSessions
                                .sort((a: Session, b: Session) =>
                                    new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()
                                )[0]
                            : null,
                        stats: {
                            totalSessions: clientSessions.length,
                            completedSessions: completedSessions.length,
                            scheduledSessions: upcomingSessions.length,
                            cancelledSessions: clientSessions.filter((s: Session) => s.status === 'cancelled').length,
                            noShowSessions: clientSessions.filter((s: Session) => s.status === 'no-show').length
                        }
                    };
                });

                // Сортировка
                enrichedClients.sort((a, b) => {
                    let aValue: any = a[sortBy as keyof ExtendedClient];
                    let bValue: any = b[sortBy as keyof ExtendedClient];

                    // Обработка дат
                    if (sortBy === 'createdAt' || sortBy === 'lastVisit') {
                        aValue = new Date(aValue || 0).getTime();
                        bValue = new Date(bValue || 0).getTime();
                    }

                    // Обработка строк
                    if (typeof aValue === 'string' && typeof bValue === 'string') {
                        aValue = aValue.toLowerCase();
                        bValue = bValue.toLowerCase();
                    }

                    if (sortOrder === 'asc') {
                        return aValue > bValue ? 1 : -1;
                    } else {
                        return aValue < bValue ? 1 : -1;
                    }
                });

                // Пагинация
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedClients = enrichedClients.slice(startIndex, endIndex);

                // Статистика
                const stats = {
                    total: enrichedClients.length,
                    active: enrichedClients.filter(c => c.status === 'active').length,
                    inactive: enrichedClients.filter(c => c.status === 'inactive').length,
                    suspended: enrichedClients.filter(c => c.status === 'suspended').length,
                    withTrainer: enrichedClients.filter(c => c.trainerId).length,
                    withoutTrainer: enrichedClients.filter(c => !c.trainerId).length,
                    membershipTypes: {
                        basic: enrichedClients.filter(c => c.membershipType === 'basic').length,
                        premium: enrichedClients.filter(c => c.membershipType === 'premium').length,
                        vip: enrichedClients.filter(c => c.membershipType === 'vip').length
                    }
                };

                return NextResponse.json({
                    success: true,
                    data: paginatedClients,
                    pagination: {
                        page,
                        limit,
                        total: enrichedClients.length,
                        pages: Math.ceil(enrichedClients.length / limit)
                    },
                    stats,
                    filters: {
                        search,
                        status,
                        trainerId,
                        membershipType,
                        sortBy,
                        sortOrder
                    }
                });

            } catch (error) {
                console.error('💥 API: ошибка получения клиентов:', error);
                return NextResponse.json(
                    { success: false, error: 'Ошибка получения списка клиентов' },
                    { status: 500 }
                );
            }
        }
    )(req);
}

// POST /api/clients - Создание нового клиента
export async function POST(req: NextRequest) {
    return withPermissions(
        { resource: 'clients', action: 'create' },
        async (authenticatedReq: AuthenticatedRequest) => {
            try {
                console.log('➕ API: создание нового клиента');

                const body = await req.json();
                const { user } = authenticatedReq;

                // Валидация обязательных полей
                if (!body.name || !body.email) {
                    return NextResponse.json(
                        { success: false, error: 'Отсутствуют обязательные поля (имя, email)' },
                        { status: 400 }
                    );
                }

                // Валидация email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(body.email)) {
                    return NextResponse.json(
                        { success: false, error: 'Некорректный формат email' },
                        { status: 400 }
                    );
                }

                // Проверка уникальности email
                const existingUser = [...mockClients, ...mockTrainers].find(u => u.email === body.email);
                if (existingUser) {
                    return NextResponse.json(
                        { success: false, error: 'Пользователь с таким email уже существует' },
                        { status: 409 }
                    );
                }

                // Валидация телефона
                if (body.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(body.phone.replace(/\s/g, ''))) {
                    return NextResponse.json(
                        { success: false, error: 'Некорректный формат телефона' },
                        { status: 400 }
                    );
                }

                // Проверка существования тренера
                let trainer = null;
                if (body.trainerId) {
                    trainer = mockTrainers.find(t => t.id === body.trainerId);
                    if (!trainer) {
                        return NextResponse.json(
                            { success: false, error: 'Указанный тренер не найден' },
                            { status: 404 }
                        );
                    }

                    // Тренеры могут назначать только себя
                    if (user.role === 'trainer' && body.trainerId !== user.id) {
                        return NextResponse.json(
                            { success: false, error: 'Нет прав назначать другого тренера' },
                            { status: 403 }
                        );
                    }
                } else if (user.role === 'trainer') {
                    // Если тренер создает клиента, автоматически назначаем его
                    body.trainerId = user.id;
                    trainer = mockTrainers.find(t => t.id === user.id);
                }

                // Валидация статуса
                const validStatuses = ['active', 'inactive', 'suspended'];
                if (body.status && !validStatuses.includes(body.status)) {
                    return NextResponse.json(
                        { success: false, error: 'Некорректный статус клиента' },
                        { status: 400 }
                    );
                }

                // Валидация типа членства
                const validMembershipTypes = ['basic', 'premium', 'vip'];
                if (body.membershipType && !validMembershipTypes.includes(body.membershipType)) {
                    return NextResponse.json(
                        { success: false, error: 'Некорректный тип членства' },
                        { status: 400 }
                    );
                }

                // Валидация даты рождения
                if (body.birthDate) {
                    const birthDate = new Date(body.birthDate);
                    const now = new Date();
                    const age = now.getFullYear() - birthDate.getFullYear();

                    if (isNaN(birthDate.getTime()) || age < 16 || age > 100) {
                        return NextResponse.json(
                            { success: false, error: 'Некорректная дата рождения' },
                            { status: 400 }
                        );
                    }
                }

                // Создаем базовый объект клиента согласно интерфейсу Client
                const newClient: Client = {
                    id: `client_${Date.now()}`,
                    name: body.name.trim(),
                    email: body.email.toLowerCase().trim(),
                    phone: body.phone?.trim() || '',
                    status: body.status || 'active',
                    trainerId: body.trainerId || undefined,
                    membershipType: body.membershipType || 'basic',
                    joinDate: new Date().toISOString().split('T')[0], // Добавляем обязательное поле
                    totalSessions: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: user.id,
                    updatedBy: user.id
                };

                mockClients.push(newClient);

                // Обновление счетчика активных клиентов у тренера
                if (trainer && newClient.status === 'active') {
                    const trainerIndex = mockTrainers.findIndex(t => t.id === body.trainerId);
                    if (trainerIndex !== -1) {
                        mockTrainers[trainerIndex].activeClients += 1;
                    }
                }

                // Подготовка ответа с дополнительной информацией
                const responseClient: ExtendedClient = {
                    ...newClient,
                    ...(body.birthDate && { birthDate: body.birthDate }),
                    trainerName: trainer?.name || null,
                    trainerPhone: trainer?.phone || null,
                    stats: {
                        totalSessions: 0,
                        completedSessions: 0,
                        scheduledSessions: 0,
                        cancelledSessions: 0,
                        noShowSessions: 0
                    }
                };

                console.log(`✅ API: клиент создан - ${newClient.name} (${newClient.email})`);

                return NextResponse.json({
                    success: true,
                    data: responseClient,
                    message: 'Клиент успешно создан'
                });

            } catch (error) {
                console.error('💥 API: ошибка создания клиента:', error);
                                return NextResponse.json(
                    { success: false, error: 'Ошибка создания клиента' },
                    { status: 500 }
                );
            }
        }
    )(req);
}

// PUT /api/clients - Массовое обновление клиентов
export async function PUT(req: NextRequest) {
    return withPermissions(
        { resource: 'clients', action: 'update' },
        async (authenticatedReq: AuthenticatedRequest) => {
            try {
                console.log('🔄 API: массовое обновление клиентов');

                const body = await req.json();
                const { user } = authenticatedReq;
                const { clientIds, updates } = body;

                if (!Array.isArray(clientIds) || clientIds.length === 0) {
                    return NextResponse.json(
                        { success: false, error: 'Не указаны ID клиентов для обновления' },
                        { status: 400 }
                    );
                }

                if (!updates || typeof updates !== 'object') {
                    return NextResponse.json(
                        { success: false, error: 'Не указаны данные для обновления' },
                        { status: 400 }
                    );
                }

                const allowedFields = ['status', 'membershipType', 'trainerId'];
                const updateFields = Object.keys(updates).filter(field => allowedFields.includes(field));

                if (updateFields.length === 0) {
                    return NextResponse.json(
                        { success: false, error: 'Нет допустимых полей для обновления' },
                        { status: 400 }
                    );
                }

                const updatedClients: Client[] = [];
                const errors: string[] = [];

                for (const clientId of clientIds) {
                    const clientIndex = mockClients.findIndex((c: Client) => c.id === clientId);

                    if (clientIndex === -1) {
                        errors.push(`Клиент с ID ${clientId} не найден`);
                        continue;
                    }

                    const client = mockClients[clientIndex];

                    // Проверка прав доступа
                    if (user.role === 'trainer' && client.trainerId !== user.id) {
                        errors.push(`Нет прав на обновление клиента ${client.name}`);
                        continue;
                    }

                    // Валидация обновлений
                    if (updates.status && !['active', 'inactive', 'suspended'].includes(updates.status)) {
                        errors.push(`Некорректный статус для клиента ${client.name}`);
                        continue;
                    }

                    if (updates.membershipType && !['basic', 'premium', 'vip'].includes(updates.membershipType)) {
                        errors.push(`Некорректный тип членства для клиента ${client.name}`);
                        continue;
                    }

                    if (updates.trainerId) {
                        const trainer = mockTrainers.find(t => t.id === updates.trainerId);
                        if (!trainer) {
                            errors.push(`Тренер не найден для клиента ${client.name}`);
                            continue;
                        }

                        // Тренеры могут назначать только себя
                        if (user.role === 'trainer' && updates.trainerId !== user.id) {
                            errors.push(`Нет прав назначать другого тренера для клиента ${client.name}`);
                            continue;
                        }
                    }

                    // Обновление счетчиков при изменении статуса или тренера
                    if (updates.status && updates.status !== client.status) {
                        if (client.trainerId) {
                            const trainerIndex = mockTrainers.findIndex(t => t.id === client.trainerId);
                            if (trainerIndex !== -1) {
                                if (client.status === 'active' && updates.status !== 'active') {
                                    mockTrainers[trainerIndex].activeClients = Math.max(0,
                                        mockTrainers[trainerIndex].activeClients - 1
                                    );
                                } else if (client.status !== 'active' && updates.status === 'active') {
                                    mockTrainers[trainerIndex].activeClients += 1;
                                }
                            }
                        }
                    }

                    if (updates.trainerId && updates.trainerId !== client.trainerId) {
                        // Уменьшаем счетчик у старого тренера
                        if (client.trainerId && client.status === 'active') {
                            const oldTrainerIndex = mockTrainers.findIndex(t => t.id === client.trainerId);
                            if (oldTrainerIndex !== -1) {
                                mockTrainers[oldTrainerIndex].activeClients = Math.max(0,
                                    mockTrainers[oldTrainerIndex].activeClients - 1
                                );
                            }
                        }

                        // Увеличиваем счетчик у нового тренера
                        if ((updates.status || client.status) === 'active') {
                            const newTrainerIndex = mockTrainers.findIndex(t => t.id === updates.trainerId);
                            if (newTrainerIndex !== -1) {
                                mockTrainers[newTrainerIndex].activeClients += 1;
                            }
                        }
                    }

                    // Применение обновлений
                    const updatedClient: Client = {
                        ...client,
                        ...updates,
                        updatedAt: new Date().toISOString(),
                        updatedBy: user.id
                    };

                    mockClients[clientIndex] = updatedClient;
                    updatedClients.push(updatedClient);
                }

                console.log(`✅ API: обновлено ${updatedClients.length} клиентов, ${errors.length} ошибок`);

                return NextResponse.json({
                    success: true,
                    data: {
                        updated: updatedClients.length,
                        errors: errors.length,
                        clients: updatedClients
                    },
                    errors: errors.length > 0 ? errors : undefined,
                    message: `Обновлено ${updatedClients.length} клиентов`
                });

            } catch (error) {
                console.error('💥 API: ошибка массового обновления клиентов:', error);
                return NextResponse.json(
                    { success: false, error: 'Ошибка массового обновления клиентов' },
                    { status: 500 }
                );
            }
        }
    )(req);
}

// DELETE /api/clients - Массовое удаление клиентов
export async function DELETE(req: NextRequest) {
    return withPermissions(
        { resource: 'clients', action: 'delete' },
        async (authenticatedReq: AuthenticatedRequest) => {
            try {
                console.log('🗑️ API: массовое удаление клиентов');

                const body = await req.json();
                const { user } = authenticatedReq;
                const { clientIds, force = false } = body;

                if (!Array.isArray(clientIds) || clientIds.length === 0) {
                    return NextResponse.json(
                        { success: false, error: 'Не указаны ID клиентов для удаления' },
                        { status: 400 }
                    );
                }

                const deletedClients: string[] = [];
                const errors: string[] = [];

                for (const clientId of clientIds) {
                    const clientIndex = mockClients.findIndex((c: Client) => c.id === clientId);

                    if (clientIndex === -1) {
                        errors.push(`Клиент с ID ${clientId} не найден`);
                        continue;
                    }

                    const client = mockClients[clientIndex];

                    // Проверка прав доступа
                    if (user.role === 'trainer' && client.trainerId !== user.id) {
                        errors.push(`Нет прав на удаление клиента ${client.name}`);
                        continue;
                    }

                    // Проверка активных сессий
                    if (!force) {
                        const activeSessions = mockSessions.filter((s: Session) =>
                            s.clientId === clientId &&
                            s.status === 'scheduled' &&
                            new Date(`${s.date}T${s.startTime}`) > new Date()
                        );

                        if (activeSessions.length > 0) {
                            errors.push(`У клиента ${client.name} есть активные сессии`);
                            continue;
                        }
                    }

                    // Мягкое удаление
                    mockClients[clientIndex] = {
                        ...client,
                        status: 'inactive',
                        updatedAt: new Date().toISOString(),
                        updatedBy: user.id
                    };

                    // Обновление счетчика у тренера
                    if (client.trainerId && client.status === 'active') {
                        const trainerIndex = mockTrainers.findIndex(t => t.id === client.trainerId);
                        if (trainerIndex !== -1) {
                            mockTrainers[trainerIndex].activeClients = Math.max(0,
                                mockTrainers[trainerIndex].activeClients - 1
                            );
                        }
                    }

                    deletedClients.push(clientId);
                }

                console.log(`✅ API: удалено ${deletedClients.length} клиентов, ${errors.length} ошибок`);

                return NextResponse.json({
                    success: true,
                    data: {
                        deleted: deletedClients.length,
                        errors: errors.length,
                        clientIds: deletedClients
                    },
                    errors: errors.length > 0 ? errors : undefined,
                    message: `Удалено ${deletedClients.length} клиентов`
                });

            } catch (error) {
                console.error('💥 API: ошибка массового удаления клиентов:', error);
                return NextResponse.json(
                    { success: false, error: 'Ошибка массового удаления клиентов' },
                    { status: 500 }
                );
            }
        }
    )(req);
}

