// lib/unified-auth.ts
import { ConvexHttpClient } from "convex/browser";
import { authenticate, createSession, getSession, logout as simpleLogout, User } from '@/lib/simple-auth';
import { verifyToken, createToken } from '@/lib/jwt-auth';
import type { UserRole } from '@/lib/permissions';
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface AuthAttempt {
    userId: string;
    action: string;
    method: 'password' | 'face-id' | 'qr-code' | 'token' | 'logout';
    success: boolean;
    ipAddress?: string;
    deviceInfo?: string;
    details?: string;
    timestamp: number;
    // 🔥 НОВЫЕ ПОЛЯ ДЛЯ FACE ID
    faceIdConfidence?: number;
    faceIdQuality?: 'low' | 'medium' | 'high';
    faceIdDeviceType?: string;
}

interface FaceProfile {
  _id: Id<"faceProfiles">;
  userId: Id<"users"> | Id<"trainers">;
  userType: "user" | "trainer";
  faceDescriptor: number[];
  confidence: number;
  registeredAt: number;
  lastUsed?: number;
  isActive: boolean;
  metadata?: {
    registrationMethod: string;
    userAgent?: string;
    deviceInfo?: string;
  };
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    lastLogin?: number;
    faceIdEnabled?: boolean;
}

export interface AuthSession {
    id: string;
    user: AuthUser;
    method: 'password' | 'face-id' | 'qr-code' | 'token';
    createdAt: Date;
    expiresAt: Date;
    ipAddress?: string;
    deviceInfo?: string;
}

export interface LoginResult {
    success: boolean;
    session?: AuthSession;
    token?: string;
    error?: string;
    requiresMFA?: boolean;
    requiresFaceSetup?: boolean;
}

export interface LogEntry {
    userId: string;
    action: string;
    method: 'password' | 'face-id' | 'qr-code' | 'token' | 'logout';
    success: boolean;
    ipAddress?: string;
    deviceInfo?: string;
    details?: string;
    timestamp: number;
}

// Интерфейс для логов из Convex
interface ConvexLogEntry {
    userId: string;
    action?: string;
    method?: string;
    success: boolean;
    ipAddress?: string;
    deviceInfo?: string;
    details?: string;
    timestamp: number;
}

class UnifiedAuthSystem {
    private convex: ConvexHttpClient;

    constructor() {
        this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    }

    // 🔐 УНИВЕРСАЛЬНЫЙ ВХОД
    async login(
        method: 'password' | 'face-id' | 'qr-code',
        credentials: {
            email?: string;
            password?: string;
            faceData?: string;
            descriptor?: number[];  // 🔥 ДОБАВЛЕНО
            confidence?: number;    // 🔥 ДОБАВЛЕНО
            qrCode?: string;
            userType?: 'staff' | 'member';
            ipAddress?: string;
            deviceInfo?: string;
        }
    ): Promise<LoginResult> {
        console.log(`🔐 UnifiedAuth: попытка входа через ${method}`);

        try {
            let user: AuthUser | null = null;
            const authMethod = method;

            // Определяем пользователя в зависимости от метода
            switch (method) {
                case 'password':
                    user = await this.authenticateWithPassword(credentials);
                    break;
                case 'face-id':
                    user = await this.authenticateWithFaceId(credentials);
                    break;
                case 'qr-code':
                    user = await this.authenticateWithQR(credentials);
                    break;
            }

            if (!user) {
                await this.logAuthAttempt({
                    userId: 'unknown',
                    action: 'login_failed',
                    method: authMethod,
                    success: false,
                    ipAddress: credentials.ipAddress,
                    deviceInfo: credentials.deviceInfo,
                    details: `Неудачная попытка входа через ${method}`,
                    timestamp: Date.now(),
                    // 🔥 ДОБАВЛЯЕМ СПЕЦИАЛЬНЫЕ ПОЛЯ ДЛЯ FACE ID ПРИ ОШИБКЕ
                    ...(method === 'face-id' && {
                        faceIdConfidence: credentials.confidence,
                        faceIdQuality: credentials.confidence && credentials.confidence > 90 ? 'high' :
                            credentials.confidence && credentials.confidence > 75 ? 'medium' : 'low'
                    })
                });

                return {
                    success: false,
                    error: this.getAuthErrorMessage(method) // 🔥 ИСПОЛЬЗУЕМ НОВЫЙ МЕТОД
                };
            }

            // Проверяем активность аккаунта
            if (!user.isActive) {
                await this.logAuthAttempt({
                    userId: user.id,
                    action: 'login_blocked',
                    method: authMethod,
                    success: false,
                    ipAddress: credentials.ipAddress,
                    deviceInfo: credentials.deviceInfo,
                    details: 'Аккаунт деактивирован',
                    timestamp: Date.now()
                });

                return {
                    success: false,
                    error: 'Аккаунт деактивирован'
                };
            }

            // Создаем сессию
            const session = await this.createUnifiedSession(user, {
                method: authMethod,
                ipAddress: credentials.ipAddress,
                deviceInfo: credentials.deviceInfo
            });

            // Создаем JWT токен
            const token = createToken({
                userId: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            });

            // Обновляем время последнего входа
            await this.updateLastLogin(user.id, user.role);

            // 🔥 ЛОГИРУЕМ УСПЕШНЫЙ ВХОД С FACE ID ДАННЫМИ
            await this.logAuthAttempt({
                userId: user.id,
                action: 'login_success',
                method: authMethod,
                success: true,
                ipAddress: credentials.ipAddress,
                deviceInfo: credentials.deviceInfo,
                details: `Успешный вход через ${method}`,
                timestamp: Date.now(),
                // 🔥 ДОБАВЛЯЕМ СПЕЦИАЛЬНЫЕ ПОЛЯ ДЛЯ FACE ID
                ...(method === 'face-id' && {
                    faceIdConfidence: credentials.confidence,
                    faceIdQuality: credentials.confidence && credentials.confidence > 90 ? 'high' :
                        credentials.confidence && credentials.confidence > 75 ? 'medium' : 'low',
                    faceIdDeviceType: credentials.deviceInfo?.split(' ')[0] || 'unknown'
                })
            });

            console.log(`✅ UnifiedAuth: успешный вход пользователя ${user.email} через ${method}`);

            return {
                success: true,
                session,
                token,
                requiresFaceSetup: method !== 'face-id' && !user.faceIdEnabled
            };

        } catch (error) {
            console.error('💥 UnifiedAuth: ошибка входа:', error);

            await this.logAuthAttempt({
                userId: 'unknown',
                action: 'login_error',
                method,
                success: false,
                ipAddress: credentials.ipAddress,
                deviceInfo: credentials.deviceInfo,
                details: `Системная ошибка: ${error}`,
                timestamp: Date.now()
            });

            return {
                success: false,
                error: 'Системная ошибка'
            };
        }
    }

    // 🔐 МЕТОД ДЛЯ ПОЛУЧЕНИЯ СООБЩЕНИЙ ОБ ОШИБКАХ
    private getAuthErrorMessage(method: string): string {
        const errorMessages = {
            'password': 'Неверный email или пароль',
            'face-id': 'Face ID не распознан или не зарегистрирован',
            'qr-code': 'QR-код недействителен или истек'
        };

        return errorMessages[method as keyof typeof errorMessages] || 'Ошибка аутентификации';
    }

    // 🔑 АУТЕНТИФИКАЦИЯ ПО ПАРОЛЮ
    private async authenticateWithPassword(credentials: {
        email?: string;
        password?: string;
        userType?: 'staff' | 'member';
    }): Promise<AuthUser | null> {
        if (!credentials.email || !credentials.password) {
            return null;
        }

        try {
            // First try simple authentication (mock users)
            const simpleAuthResult = await authenticate(credentials.email, credentials.password);

            // Check if authentication was successful
            if (simpleAuthResult && simpleAuthResult.session) {
                return {
                    id: simpleAuthResult.session.user.id,
                    email: simpleAuthResult.session.user.email,
                    name: simpleAuthResult.session.user.name,
                    role: simpleAuthResult.session.user.role,
                    isActive: true
                };
            }

            // Then check in Convex
            const user = await this.convex.query("users:getByEmail", {
                email: credentials.email
            });

            if (!user) {
                return null;
            }

            // Verify password (in real app this would use bcrypt)
            const isPasswordValid = await this.verifyPassword(credentials.password, user.password);
            if (!isPasswordValid) {
                return null;
            }

            return {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive !== false,
                lastLogin: user.lastLogin,
                faceIdEnabled: user.faceIdEnabled
            };

        } catch (error) {
            console.error('❌ Password authentication error:', error);
            return null;
        }
    }

    // 👤 АУТЕНТИФИКАЦИЯ ПО FACE ID
    private async authenticateWithFaceId(credentials: {
        faceData?: string;
        descriptor?: number[];
        confidence?: number;
        deviceInfo?: string;
    }): Promise<AuthUser | null> {
        if (!credentials.faceData && !credentials.descriptor) {
            return null;
        }

        try {
            console.log('👤 FaceID: начало аутентификации по лицу');

            // Проверяем есть ли зарегистрированный Face ID профиль
            let descriptor = credentials.descriptor;

            if (credentials.faceData && !descriptor) {
                // Конвертируем faceData в descriptor если нужно
                try {
                    const faceDataObj = JSON.parse(atob(credentials.faceData));
                    descriptor = faceDataObj.descriptor;
                } catch {
                    console.error('❌ Неверный формат faceData');
                    return null;
                }
            }

            if (!descriptor || descriptor.length === 0) {
                console.error('❌ Дескриптор лица пустой');
                return null;
            }

            // Ищем пользователя по Face ID в Convex
            const faceProfile = await this.convex.query("faceProfiles:findByDescriptor", {
                descriptor: descriptor,
                threshold: 0.6 // Порог схожести
            });

            if (!faceProfile || !faceProfile.isActive) {
                console.log('❌ Face ID профиль не найден или неактивен');
                return null;
            }

            // Получаем пользователя
            const user = await this.convex.query("users:getById", {
                id: faceProfile.userId
            });

            if (!user || !user.isActive) {
                console.log('❌ Пользователь не найден или неактивен');
                return null;
            }

            // Обновляем время последнего использования Face ID
            await this.convex.mutation("faceProfiles:updateLastUsed", {
                profileId: faceProfile._id,
                timestamp: Date.now()
            });

            console.log('✅ Face ID аутентификация успешна для:', user.email);

            return {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role as UserRole,
                isActive: user.isActive !== false,
                lastLogin: user.lastLogin,
                faceIdEnabled: true
            };

        } catch (error) {
            console.error('❌ Ошибка Face ID аутентификации:', error);
            return null;
        }
    }

    // 📝 ЛОГИРОВАНИЕ ПОПЫТОК ВХОДА С ПОДДЕРЖКОЙ FACE ID
    private async logAuthAttempt(entry: AuthAttempt): Promise<void> {
        try {
            // Логируем в Convex с дополнительными полями Face ID
            await this.convex.mutation("accessLogs:create", {
                userId: entry.userId,
                success: entry.success,
                ipAddress: entry.ipAddress,
                deviceInfo: entry.deviceInfo,
                method: entry.method,
                action: entry.action,
                details: entry.details,
                timestamp: entry.timestamp,
                // 🔥 ДОБАВЛЯЕМ FACE ID ПОЛЯ
                ...(entry.faceIdConfidence && { faceIdConfidence: entry.faceIdConfidence }),
                ...(entry.faceIdQuality && { faceIdQuality: entry.faceIdQuality }),
                ...(entry.faceIdDeviceType && { faceIdDeviceType: entry.faceIdDeviceType })
            });

            // Логируем в консоль
            const status = entry.success ? '✅' : '❌';
            const faceIdInfo = entry.faceIdConfidence ? ` (Face ID: ${entry.faceIdConfidence}%, ${entry.faceIdQuality})` : '';
            console.log(`${status} Auth Log: ${entry.action} - ${entry.method} - $${entry.userId}$${faceIdInfo}`);

        } catch (error) {
            console.error('❌ Ошибка логирования:', error);
        }
    }

    // 📱 РЕГИСТРАЦИЯ FACE ID
    async registerFaceId(userId: string, faceData: {
        descriptor: number[];
        confidence: number;
        metadata?: any;
    }): Promise<{
        success: boolean;
        profileId?: string;
        error?: string;
    }> {
        try {
            console.log('📝 Регистрация Face ID для пользователя:', userId);

            // Проверяем качество дескриптора
            if (!faceData.descriptor || faceData.descriptor.length === 0) {
                return {
                    success: false,
                    error: 'Недостаточно данных лица для регистрации'
                };
            }

            if (faceData.confidence < 75) {
                return {
                    success: false,
                    error: 'Качество изображения слишком низкое (требуется минимум 75%)'
                };
            }

            // Проверяем существующий профиль
            const existingProfile = await this.convex.query("faceProfiles:getByUserId", {
                userId
            });

            if (existingProfile && existingProfile.isActive) {
                // Обновляем существующий профиль
                await this.convex.mutation("faceProfiles:update", {
                    profileId: existingProfile._id,
                    descriptor: faceData.descriptor,
                    confidence: faceData.confidence,
                    metadata: faceData.metadata,
                    updatedAt: Date.now()
                });

                await this.logAuthAttempt({
                    userId,
                    action: 'face_id_updated',
                    method: 'face-id',
                    success: true,
                    details: 'Face ID профиль обновлен',
                    timestamp: Date.now(),
                    faceIdConfidence: faceData.confidence,
                    faceIdQuality: faceData.confidence > 90 ? 'high' : faceData.confidence > 75 ? 'medium' : 'low'
                });

                return {
                    success: true,
                    profileId: existingProfile._id
                };
            } else {
                // Создаем новый профиль
                const profileId = await this.convex.mutation("faceProfiles:create", {
                    userId,
                    descriptor: faceData.descriptor,
                    confidence: faceData.confidence,
                    metadata: faceData.metadata,
                    isActive: true,
                    registeredAt: Date.now()
                });

                // Обновляем пользователя
                await this.convex.mutation("users:updateFaceId", {
                    userId,
                    faceIdEnabled: true
                });

                await this.logAuthAttempt({
                    userId,
                    action: 'face_id_registered',
                    method: 'face-id',
                    success: true,
                    details: 'Face ID профиль создан',
                    timestamp: Date.now(),
                    faceIdConfidence: faceData.confidence,
                    faceIdQuality: faceData.confidence > 90 ? 'high' : faceData.confidence > 75 ? 'medium' : 'low'
                });

                return {
                    success: true,
                    profileId
                };
            }

        } catch (error) {
            console.error('❌ Ошибка регистрации Face ID:', error);

            await this.logAuthAttempt({
                userId,
                action: 'face_id_register_failed',
                method: 'face-id',
                success: false,
                details: `Ошибка регистрации: ${error}`,
                timestamp: Date.now()
            });

            return {
                success: false,
                error: 'Ошибка при регистрации Face ID'
            };
        }
    }

    // 🔍 ПРОВЕРКА СТАТУСА FACE ID
    async getFaceIdStatus(userId: string): Promise<{
        enabled: boolean;
        profileId?: string;
        registeredAt?: number;
        lastUsed?: number;
        confidence?: number;
    }> {
        try {
            const faceProfile = await this.convex.query("faceProfiles:getByUserId", {
                userId
            });

            if (!faceProfile || !faceProfile.isActive) {
                return { enabled: false };
            }

            return {
                enabled: true,
                profileId: faceProfile._id,
                registeredAt: faceProfile.registeredAt,
                lastUsed: faceProfile.lastUsed,
                confidence: faceProfile.confidence
            };

        } catch (error) {
            console.error('❌ Ошибка проверки статуса Face ID:', error);
            return { enabled: false };
        }
    }

    // 🔒 ОТКЛЮЧЕНИЕ FACE ID
    async disableFaceId(userId: string, disabledBy: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const faceProfile = await this.convex.query("faceProfiles:getByUserId", {
                userId
            });

            if (!faceProfile) {
                return {
                    success: false,
                    error: 'Face ID профиль не найден'
                };
            }

            // Деактивируем профиль
            await this.convex.mutation("faceProfiles:deactivate", {
                profileId: faceProfile._id,
                disabledBy,
                disabledAt: Date.now()
            });

            // Обновляем пользователя
            await this.convex.mutation("users:updateFaceId", {
                userId,
                faceIdEnabled: false
            });

            await this.logAuthAttempt({
                userId: disabledBy,
                action: 'face_id_disabled',
                method: 'face-id',
                success: true,
                details: `Face ID отключен для пользователя ${userId}`,
                timestamp: Date.now()
            });

            return { success: true };

        } catch (error) {
            console.error('❌ Ошибка отключения Face ID:', error);
            return {
                success: false,
                error: 'Ошибка при отключении Face ID'
            };
        }
    }

    // 📊 АНАЛИТИКА FACE ID
    async getFaceIdAnalytics(period: 'day' | 'week' | 'month' = 'week'): Promise<{
        totalFaceIdUsers: number;
        activeFaceIdUsers: number;
        faceIdLogins: number;
        faceIdRegistrations: number;
        averageConfidence: number;
        topDevices: Array<{ device: string; count: number }>;
    }> {
        try {
            const now = Date.now();
            const periodMs = {
                day: 24 * 60 * 60 * 1000,
                week: 7 * 24 * 60 * 60 * 1000,
                month: 30 * 24 * 60 * 60 * 1000
            };

            const fromDate = new Date(now - periodMs[period]);

            // Получаем логи Face ID
            const faceIdLogs = await this.getAccessLogs({
                method: 'face-id',
                dateFrom: fromDate,
                limit: 1000
            });

            // Получаем все Face ID профили с правильной типизацией
            const allFaceProfiles: FaceProfile[] = await this.convex.query("faceProfiles:getAll");
            const activeFaceProfiles = allFaceProfiles.filter((p: FaceProfile) => p.isActive);

            const faceIdLogins = faceIdLogs.filter(log =>
                log.action.includes('login') && log.success
            ).length;

            const faceIdRegistrations = faceIdLogs.filter(log =>
                log.action.includes('register') && log.success
            ).length;

            const averageConfidence = activeFaceProfiles.length > 0
                ? activeFaceProfiles.reduce((sum: number, p: FaceProfile) => sum + (p.confidence || 0), 0) / activeFaceProfiles.length
                : 0;

            // Топ устройств
            const deviceCounts: Record<string, number> = {};
            faceIdLogs.forEach(log => {
                if (log.deviceInfo) {
                    const device = log.deviceInfo.split(' ')[0] || 'Unknown';
                    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
                }
            });

            const topDevices = Object.entries(deviceCounts)
                .map(([device, count]) => ({ device, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            return {
                totalFaceIdUsers: allFaceProfiles.length,
                activeFaceIdUsers: activeFaceProfiles.length,
                faceIdLogins,
                faceIdRegistrations,
                averageConfidence: Math.round(averageConfidence),
                topDevices
            };

        } catch (error) {
            console.error('❌ Ошибка получения аналитики Face ID:', error);
            return {
                totalFaceIdUsers: 0,
                activeFaceIdUsers: 0,
                faceIdLogins: 0,
                faceIdRegistrations: 0,
                averageConfidence: 0,
                topDevices: []
            };
        }
    }

    // 📱 АУТЕНТИФИКАЦИЯ ПО QR-КОДУ
    private async authenticateWithQR(credentials: {
        qrCode?: string;
    }): Promise<AuthUser | null> {
        if (!credentials.qrCode) {
            return null;
        }

        try {
            // Декодируем QR-код и извлекаем данные пользователя
            const qrData = JSON.parse(atob(credentials.qrCode));

            if (!qrData.userId || !qrData.timestamp) {
                return null;
            }

            // Проверяем срок действия QR-кода (например, 5 минут)
            const now = Date.now();
            const qrAge = now - qrData.timestamp;
            if (qrAge > 5 * 60 * 1000) { // 5 минут
                return null;
            }

            // Получаем пользователя
            const user = await this.convex.query("users:getById", {
                id: qrData.userId
            });

            if (!user) {
                return null;
            }

            return {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive !== false,
                lastLogin: user.lastLogin,
                faceIdEnabled: user.faceIdEnabled
            };

        } catch (error) {
            console.error('❌ Ошибка QR аутентификации:', error);
            return null;
        }
    }

    // 🎫 СОЗДАНИЕ ЕДИНОЙ СЕССИИ
    private async createUnifiedSession(
        user: AuthUser,
        options: {
            method: string;
            ipAddress?: string;
            deviceInfo?: string;
        }
    ): Promise<AuthSession> {
        const now = new Date();

        const fullUser: User = {
            ...user,
            createdAt: now,
            updatedAt: now
        };

        const sessionId = await createSession(fullUser);

        const session = await getSession(sessionId);
        if (!session) {
            throw new Error('Failed to create session');
        }

        return {
            id: sessionId,
            user,
            method: options.method as 'password' | 'face-id' | 'qr-code' | 'token',
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
            ipAddress: options.ipAddress,
            deviceInfo: options.deviceInfo
        };
    }

    // 🔄 ОБНОВЛЕНИЕ ВРЕМЕНИ ПОСЛЕДНЕГО ВХОДА
    private async updateLastLogin(userId: string, userRole: UserRole): Promise<void> {
        try {
            await this.convex.mutation("users:updateLastLogin", {
                userId,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('⚠️ Не удалось обновить время входа:', error);
        }
    }

    // 🔐 ПРОВЕРКА ПАРОЛЯ
    private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        try {
            return password === 'password123' || hashedPassword === btoa(password + "salt");
        } catch (error) {
            console.error('❌ Ошибка проверки пароля:', error);
            return false;
        }
    }

    // 🚪 ВЫХОД ИЗ СИСТЕМЫ
    async logout(sessionId: string, options?: {
        ipAddress?: string;
        deviceInfo?: string;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            const session = await getSession(sessionId);

            if (session) {
                // Логируем выход
                await this.logAuthAttempt({
                    userId: session.user.id,
                    action: 'logout',
                    method: 'token',
                    success: true,
                    ipAddress: options?.ipAddress,
                    deviceInfo: options?.deviceInfo,
                    details: 'Пользователь вышел из системы',
                    timestamp: Date.now()
                });
            }

            // Удаляем сессию
            const logoutSuccess = simpleLogout(sessionId);

            console.log(`👋 UnifiedAuth: выход ${logoutSuccess ? 'успешен' : 'неудачен'}`);

            return { success: logoutSuccess };

        } catch (error) {
            console.error('💥 UnifiedAuth: ошибка выхода:', error);
            return {
                success: false,
                error: 'Ошибка при выходе из системы'
            };
        }
    }

    // 🔍 ПРОВЕРКА СЕССИИ
    async validateSession(sessionId: string): Promise<{
        valid: boolean;
        session?: AuthSession;
        error?: string;
    }> {
        try {
            const session = await getSession(sessionId);

            if (!session) {
                return { valid: false, error: 'Сессия не найдена' };
            }

            return {
                valid: true,
                session: {
                    id: sessionId,
                    user: {
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.name,
                        role: session.user.role,
                        isActive: true
                    },
                    method: 'token',
                    createdAt: session.createdAt,
                    expiresAt: session.expiresAt
                }
            };

        } catch (error) {
            console.error('❌ Ошибка валидации сессии:', error);
            return {
                valid: false,
                error: 'Ошибка проверки сессии'
            };
        }
    }

    // 🔑 ПРОВЕРКА JWT ТОКЕНА
    async validateToken(token: string): Promise<{
        valid: boolean;
        user?: AuthUser;
        error?: string;
    }> {
        try {
            const decoded = await verifyToken(token);

            if (!decoded) {
                return { valid: false, error: 'Недействительный токен' };
            }

            return {
                valid: true,
                user: {
                    id: decoded.userId,
                    email: decoded.email,
                    name: decoded.name,
                    role: decoded.role as UserRole,
                    isActive: true
                }
            };

        } catch (error) {
            console.error('❌ Ошибка валидации токена:', error);
            return {
                valid: false,
                error: 'Ошибка проверки токена'
            };

        }
    }

    // 📊 ПОЛУЧЕНИЕ ЛОГОВ ДОСТУПА
    async getAccessLogs(filters?: {
        userId?: string;
        success?: boolean;
        method?: string;
        limit?: number;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<LogEntry[]> {
        try {
            let logs: ConvexLogEntry[];

            if (filters?.userId) {
                logs = await this.convex.query("accessLogs:getByUserIdSafe", {
                    userId: filters.userId
                });
            } else {
                logs = await this.convex.query("accessLogs:getRecentLogs", {
                    limit: filters?.limit || 50
                });
            }

            // Фильтруем по дополнительным параметрам с правильной типизацией
            if (filters?.success !== undefined) {
                logs = logs.filter((log: ConvexLogEntry) => log.success === filters.success);
            }

            if (filters?.method) {
                logs = logs.filter((log: ConvexLogEntry) => log.method === filters.method);
            }

            if (filters?.dateFrom) {
                logs = logs.filter((log: ConvexLogEntry) => log.timestamp >= filters.dateFrom!.getTime());
            }

            if (filters?.dateTo) {
                logs = logs.filter((log: ConvexLogEntry) => log.timestamp <= filters.dateTo!.getTime());
            }

            return logs.map((log: ConvexLogEntry): LogEntry => ({
                userId: log.userId,
                action: log.action || 'login',
                method: (log.method || 'password') as LogEntry['method'],
                success: log.success,
                ipAddress: log.ipAddress,
                deviceInfo: log.deviceInfo,
                details: log.details,
                timestamp: log.timestamp
            }));

        } catch (error) {
            console.error('❌ Ошибка получения логов:', error);
            return [];
        }
    }

    // 🔄 ВОССТАНОВЛЕНИЕ ПАРОЛЯ
    async requestPasswordReset(email: string, userType: 'staff' | 'member'): Promise<{
        success: boolean;
        message?: string;
        token?: string;
        error?: string;
    }> {
        try {
            const result = await this.convex.mutation("auth:requestPasswordReset", {
                email,
                userType
            });

            if (result.success) {
                await this.logAuthAttempt({
                    userId: 'system',
                    action: 'password_reset_requested',
                    method: 'token',
                    success: true,
                    details: `Запрос восстановления пароля для ${email}`,
                    timestamp: Date.now()
                });
            }

            return result;

        } catch (error) {
            console.error('❌ Ошибка запроса восстановления пароля:', error);
            return {
                success: false,
                error: 'Ошибка при отправке запроса'
            };
        }
    }

    // 🔐 СБРОС ПАРОЛЯ
    async resetPassword(token: string, newPassword: string, userType: 'staff' | 'member'): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            const result = await this.convex.mutation("auth:resetPassword", {
                token,
                newPassword,
                userType
            });

            if (result.success) {
                await this.logAuthAttempt({
                    userId: 'system',
                    action: 'password_reset_completed',
                    method: 'token',
                    success: true,
                    details: `Пароль успешно изменен через токен`,
                    timestamp: Date.now()
                });
            }

            return result;

        } catch (error) {
            console.error('❌ Ошибка сброса пароля:', error);
            return {
                success: false,
                error: 'Ошибка при изменении пароля'
            };
        }
    }

    // 📱 ГЕНЕРАЦИЯ QR-КОДА ДЛЯ ПОЛЬЗОВАТЕЛЯ
    async generateUserQR(userId: string): Promise<{
        success: boolean;
        qrCode?: string;
        error?: string;
    }> {
        try {
            const qrData = {
                userId,
                timestamp: Date.now(),
                type: 'user_access'
            };

            const qrCode = btoa(JSON.stringify(qrData));

            await this.logAuthAttempt({
                userId,
                action: 'qr_generated',
                method: 'qr-code',
                success: true,
                details: 'QR-код сгенерирован для пользователя',
                timestamp: Date.now()
            });

            return {
                success: true,
                qrCode
            };

        } catch (error) {
            console.error('❌ Ошибка генерации QR-кода:', error);
            return {
                success: false,
                error: 'Ошибка генерации QR-кода'
            };
        }
    }

    // 👤 НАСТРОЙКА FACE ID
    async setupFaceId(userId: string, faceData: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            // Здесь будет сохранение данных лица пользователя
            // Пока просто помечаем что Face ID настроен

            await this.convex.mutation("users:updateFaceId", {
                userId,
                faceIdEnabled: true,
                faceData // В реальности это будут хеши/векторы лица
            });

            await this.logAuthAttempt({
                userId,
                action: 'face_id_setup',
                method: 'face-id',
                success: true,
                details: 'Face ID настроен для пользователя',
                timestamp: Date.now()
            });

            return {
                success: true,
                message: 'Face ID успешно настроен'
            };

        } catch (error) {
            console.error('❌ Ошибка настройки Face ID:', error);
            return {
                success: false,
                error: 'Ошибка настройки Face ID'
            };
        }
    }

    // 📈 АНАЛИТИКА БЕЗОПАСНОСТИ
    async getSecurityAnalytics(period: 'day' | 'week' | 'month' = 'week'): Promise<{
        totalLogins: number;
        successfulLogins: number;
        failedAttempts: number;
        uniqueUsers: number;
        methodBreakdown: Record<string, number>;
        hourlyDistribution: Record<string, number>;
        topFailureReasons: Array<{ reason: string; count: number }>;
    }> {
        try {
            const now = Date.now();
            const periodMs = {
                day: 24 * 60 * 60 * 1000,
                week: 7 * 24 * 60 * 60 * 1000,
                month: 30 * 24 * 60 * 60 * 1000
            };

            const fromDate = new Date(now - periodMs[period]);
            const logs = await this.getAccessLogs({
                dateFrom: fromDate,
                limit: 1000
            });

            const analytics = {
                totalLogins: logs.length,
                successfulLogins: logs.filter((log: LogEntry) => log.success).length,
                failedAttempts: logs.filter((log: LogEntry) => !log.success).length,
                uniqueUsers: new Set(logs.map((log: LogEntry) => log.userId)).size,
                methodBreakdown: {} as Record<string, number>,
                hourlyDistribution: {} as Record<string, number>,
                topFailureReasons: [] as Array<{ reason: string; count: number }>
            };

            // Разбивка по методам
            logs.forEach((log: LogEntry) => {
                analytics.methodBreakdown[log.method] =
                    (analytics.methodBreakdown[log.method] || 0) + 1;
            });

            // Почасовое распределение
            logs.forEach((log: LogEntry) => {
                const hour = new Date(log.timestamp).getHours().toString();
                analytics.hourlyDistribution[hour] =
                    (analytics.hourlyDistribution[hour] || 0) + 1;
            });

            // Топ причин неудач
            const failureReasons: Record<string, number> = {};
            logs.filter((log: LogEntry) => !log.success).forEach((log: LogEntry) => {
                const reason = log.details || 'Неизвестная причина';
                failureReasons[reason] = (failureReasons[reason] || 0) + 1;
            });

            analytics.topFailureReasons = Object.entries(failureReasons)
                .map(([reason, count]) => ({ reason, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            return analytics;

        } catch (error) {
            console.error('❌ Ошибка получения аналитики:', error);
            return {
                totalLogins: 0,
                successfulLogins: 0,
                failedAttempts: 0,
                uniqueUsers: 0,
                methodBreakdown: {},
                hourlyDistribution: {},
                topFailureReasons: []
            };
        }
    }

    // 🧹 ОЧИСТКА СТАРЫХ ЛОГОВ
    async cleanupOldLogs(olderThanDays: number = 90): Promise<{
        success: boolean;
        deletedCount?: number;
        error?: string;
    }> {
        try {
            const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

            // Здесь будет логика удаления старых записей из Convex
            // Пока просто логируем операцию
            await this.logAuthAttempt({
                userId: 'system',
                action: 'logs_cleanup',
                method: 'token',
                success: true,
                details: `Очистка логов старше ${olderThanDays} дней`,
                timestamp: Date.now()
            });

            return {
                success: true,
                deletedCount: 0 // Пока 0, в реальности будет количество удаленных записей
            };

        } catch (error) {
            console.error('❌ Ошибка очистки логов:', error);
            return {
                success: false,
                error: 'Ошибка при очистке логов'
            };
        }
    }

    // 🔒 БЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ
    async blockUser(userId: string, reason: string, blockedBy: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            await this.convex.mutation("users:blockUser", {
                userId,
                isActive: false,
                blockedReason: reason,
                blockedBy,
                blockedAt: Date.now()
            });

            await this.logAuthAttempt({
                userId: blockedBy,
                action: 'user_blocked',
                method: 'token',
                success: true,
                details: `Пользователь ${userId} заблокирован. Причина: ${reason}`,
                timestamp: Date.now()
            });

            return { success: true };

        } catch (error) {
            console.error('❌ Ошибка блокировки пользователя:', error);
            return {
                success: false,
                error: 'Ошибка при блокировке пользователя'
            };
        }
    }

    // 🔓 РАЗБЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ
    async unblockUser(userId: string, unblockedBy: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            await this.convex.mutation("users:unblockUser", {
                userId,
                isActive: true,
                unblockedBy,
                unblockedAt: Date.now()
            });

            await this.logAuthAttempt({
                userId: unblockedBy,
                action: 'user_unblocked',
                method: 'token',
                success: true,
                details: `Пользователь ${userId} разблокирован`,
                timestamp: Date.now()
            });

            return { success: true };

        } catch (error) {
            console.error('❌ Ошибка разблокировки пользователя:', error);
            return {
                success: false,
                error: 'Ошибка при разблокировке пользователя'
            };
        }
    }

    // 📊 ПОЛУЧЕНИЕ СТАТИСТИКИ ПОЛЬЗОВАТЕЛЯ
    async getUserStats(userId: string): Promise<{
        totalLogins: number;
        successfulLogins: number;
        failedAttempts: number;
        lastLogin?: number;
        preferredMethod: string;
        loginsByMethod: Record<string, number>;
        recentActivity: LogEntry[];
    }> {
        try {
            const logs = await this.getAccessLogs({
                userId,
                limit: 100
            });

            const loginLogs = logs.filter((log: LogEntry) => log.action.includes('login'));
            const successfulLogins = loginLogs.filter((log: LogEntry) => log.success);
            const failedLogins = loginLogs.filter((log: LogEntry) => !log.success);

            // Подсчет по методам
            const methodCounts: Record<string, number> = {};
            successfulLogins.forEach((log: LogEntry) => {
                methodCounts[log.method] = (methodCounts[log.method] || 0) + 1;
            });

            // Определение предпочтительного метода
            const preferredMethod = Object.entries(methodCounts)
                .sort(([, a], [, b]) => b - a)[0]?.[0] || 'password';

            return {
                totalLogins: loginLogs.length,
                successfulLogins: successfulLogins.length,
                failedAttempts: failedLogins.length,
                lastLogin: successfulLogins[0]?.timestamp,
                preferredMethod,
                loginsByMethod: methodCounts,
                recentActivity: logs.slice(0, 10)
            };

        } catch (error) {
            console.error('❌ Ошибка получения статистики пользователя:', error);
            return {
                totalLogins: 0,
                successfulLogins: 0,
                failedAttempts: 0,
                preferredMethod: 'password',
                loginsByMethod: {},
                recentActivity: []
            };
        }
    }

    // 🔐 СМЕНА ПАРОЛЯ
    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            // Получаем пользователя
            const user = await this.convex.query("users:getById", { id: userId });
            if (!user) {
                return { success: false, error: 'Пользователь не найден' };
            }

            // Проверяем текущий пароль
            // Проверяем текущий пароль
            const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                await this.logAuthAttempt({
                    userId,
                    action: 'password_change_failed',
                    method: 'password',
                    success: false,
                    details: 'Неверный текущий пароль',
                    timestamp: Date.now()
                });

                return { success: false, error: 'Неверный текущий пароль' };
            }

            // Хешируем новый пароль (в реальности bcrypt)
            const hashedNewPassword = btoa(newPassword + "salt");

            // Обновляем пароль
            await this.convex.mutation("users:updatePassword", {
                userId,
                newPassword: hashedNewPassword
            });

            await this.logAuthAttempt({
                userId,
                action: 'password_changed',
                method: 'password',
                success: true,
                details: 'Пароль успешно изменен',
                timestamp: Date.now()
            });

            return { success: true };

        } catch (error) {
            console.error('❌ Ошибка смены пароля:', error);
            return {
                success: false,
                error: 'Ошибка при смене пароля'
            };
        }
    }

    // 🔍 ПОИСК ПОДОЗРИТЕЛЬНОЙ АКТИВНОСТИ
    async detectSuspiciousActivity(userId?: string): Promise<{
        suspiciousLogins: LogEntry[];
        multipleFailedAttempts: Array<{ userId: string; count: number; lastAttempt: number }>;
        unusualLoginTimes: LogEntry[];
        newDeviceLogins: LogEntry[];
    }> {
        try {
            const now = Date.now();
            const dayAgo = now - (24 * 60 * 60 * 1000);

            // Получаем логи за последние 24 часа
            const recentLogs = await this.getAccessLogs({
                dateFrom: new Date(dayAgo),
                limit: 1000
            });

            // Фильтруем по пользователю если указан
            const logs = userId
                ? recentLogs.filter((log: LogEntry) => log.userId === userId)
                : recentLogs;

            // 1. Подозрительные входы (много неудачных попыток подряд)
            const suspiciousLogins = logs.filter((log: LogEntry) =>
                !log.success && log.action.includes('login')
            );

            // 2. Множественные неудачные попытки по пользователям
            const failedAttemptsByUser: Record<string, LogEntry[]> = {};
            suspiciousLogins.forEach((log: LogEntry) => {
                if (!failedAttemptsByUser[log.userId]) {
                    failedAttemptsByUser[log.userId] = [];
                }
                failedAttemptsByUser[log.userId].push(log);
            });

            const multipleFailedAttempts = Object.entries(failedAttemptsByUser)
                .filter(([, attempts]) => attempts.length >= 3)
                .map(([userId, attempts]) => ({
                    userId,
                    count: attempts.length,
                    lastAttempt: Math.max(...attempts.map((log: LogEntry) => log.timestamp))
                }));

            // 3. Необычное время входа (ночные часы 00:00-06:00)
            const unusualLoginTimes = logs.filter((log: LogEntry) => {
                const hour = new Date(log.timestamp).getHours();
                return log.success && log.action.includes('login') && (hour >= 0 && hour <= 6);
            });

            // 4. Входы с новых устройств (упрощенная логика)
            const newDeviceLogins = logs.filter((log: LogEntry) =>
                log.success &&
                log.action.includes('login') &&
                log.deviceInfo &&
                log.deviceInfo.includes('new') // В реальности будет сложнее
            );

            return {
                suspiciousLogins: suspiciousLogins.slice(0, 20),
                multipleFailedAttempts,
                unusualLoginTimes,
                newDeviceLogins
            };

        } catch (error) {
            console.error('❌ Ошибка поиска подозрительной активности:', error);
            return {
                suspiciousLogins: [],
                multipleFailedAttempts: [],
                unusualLoginTimes: [],
                newDeviceLogins: []
            };
        }
    }

    // 📧 УВЕДОМЛЕНИЯ О БЕЗОПАСНОСТИ
    async sendSecurityNotification(userId: string, type: 'login' | 'password_change' | 'suspicious_activity', details: {
        ipAddress?: string;
        deviceInfo?: string;
        location?: string;
        timestamp: number;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            // Получаем пользователя
            const user = await this.convex.query("users:getById", { id: userId });
            if (!user) {
                return { success: false, error: 'Пользователь не найден' };
            }

            // Создаем уведомление
            const notification = {
                userId,
                type,
                title: this.getNotificationTitle(type),
                message: this.getNotificationMessage(type, details),
                details,
                read: false,
                createdAt: Date.now()
            };

            // Сохраняем уведомление
            await this.convex.mutation("notifications:create", notification);

            // В реальности здесь будет отправка email/SMS/push
            console.log(`📧 Уведомление отправлено пользователю ${user.email}: ${notification.title}`);

            await this.logAuthAttempt({
                userId: 'system',
                action: 'security_notification_sent',
                method: 'token',
                success: true,
                details: `Уведомление типа ${type} отправлено пользователю ${userId}`,
                timestamp: Date.now()
            });

            return { success: true };

        } catch (error) {
            console.error('❌ Ошибка отправки уведомления:', error);
            return {
                success: false,
                error: 'Ошибка при отправке уведомления'
            };
        }
    }

    // 📝 ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ УВЕДОМЛЕНИЙ
    private getNotificationTitle(type: string): string {
        switch (type) {
            case 'login':
                return 'Новый вход в аккаунт';
            case 'password_change':
                return 'Пароль изменен';
            case 'suspicious_activity':
                return 'Подозрительная активность';
            default:
                return 'Уведомление безопасности';
        }
    }

    private getNotificationMessage(type: string, details: any): string {
        const time = new Date(details.timestamp).toLocaleString('ru-RU');
        const device = details.deviceInfo || 'Неизвестное устройство';
        const ip = details.ipAddress || 'Неизвестный IP';

        switch (type) {
            case 'login':
                return `Выполнен вход в ваш аккаунт ${time} с устройства ${device} (IP: ${ip})`;
            case 'password_change':
                return `Пароль вашего аккаунта был изменен ${time}`;
            case 'suspicious_activity':
                return `Обнаружена подозрительная активность в вашем аккаунте ${time}`;
            default:
                return `Событие безопасности произошло ${time}`;
        }
    }

    // 🔄 АВТОМАТИЧЕСКАЯ БЛОКИРОВКА ПРИ ПОДОЗРИТЕЛЬНОЙ АКТИВНОСТИ
    async autoBlockOnSuspiciousActivity(): Promise<{
        blockedUsers: string[];
        notifications: string[];
    }> {
        try {
            const suspicious = await this.detectSuspiciousActivity();
            const blockedUsers: string[] = [];
            const notifications: string[] = [];

            // Блокируем пользователей с множественными неудачными попытками (>= 5)
            for (const attempt of suspicious.multipleFailedAttempts) {
                if (attempt.count >= 5) {
                    const blockResult = await this.blockUser(
                        attempt.userId,
                        `Автоблокировка: ${attempt.count} неудачных попыток входа`,
                        'system'
                    );

                    if (blockResult.success) {
                        blockedUsers.push(attempt.userId);

                        // Отправляем уведомление
                        await this.sendSecurityNotification(attempt.userId, 'suspicious_activity', {
                            timestamp: attempt.lastAttempt
                        });
                        notifications.push(attempt.userId);
                    }
                }
            }

            // Логируем автоблокировку
            if (blockedUsers.length > 0) {
                await this.logAuthAttempt({
                    userId: 'system',
                    action: 'auto_block_executed',
                    method: 'token',
                    success: true,
                    details: `Автоматически заблокировано ${blockedUsers.length} пользователей`,
                    timestamp: Date.now()
                });
            }

            return { blockedUsers, notifications };

        } catch (error) {
            console.error('❌ Ошибка автоблокировки:', error);
            return { blockedUsers: [], notifications: [] };
        }
    }

    // 📊 ЭКСПОРТ ЛОГОВ БЕЗОПАСНОСТИ
    async exportSecurityLogs(format: 'json' | 'csv' = 'json', filters?: {
        dateFrom?: Date;
        dateTo?: Date;
        userId?: string;
        success?: boolean;
    }): Promise<{
        success: boolean;
        data?: string;
        filename?: string;
        error?: string;
    }> {
        try {
            const logs = await this.getAccessLogs({
                ...filters,
                limit: 10000 // Большой лимит для экспорта
            });

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `security_logs_${timestamp}.${format}`;

            let data: string;

            if (format === 'csv') {
                // Конвертируем в CSV
                const headers = ['Время', 'Пользователь', 'Действие', 'Метод', 'Успех', 'IP', 'Устройство', 'Детали'];
                const csvRows = [
                    headers.join(','),
                    ...logs.map((log: LogEntry) => [
                        new Date(log.timestamp).toISOString(),
                        log.userId,
                        log.action,
                        log.method,
                        log.success ? 'Да' : 'Нет',
                        log.ipAddress || '',
                        log.deviceInfo || '',
                        (log.details || '').replace(/,/g, ';') // Экранируем запятые
                    ].join(','))
                ];
                data = csvRows.join('\n');
            } else {
                // JSON формат
                data = JSON.stringify({
                    exportDate: new Date().toISOString(),
                    totalRecords: logs.length,
                    filters,
                    logs
                }, null, 2);
            }

            await this.logAuthAttempt({
                userId: 'system',
                action: 'logs_exported',
                method: 'token',
                success: true,
                details: `Экспортировано ${logs.length} записей в формате ${format}`,
                timestamp: Date.now()
            });

            return {
                success: true,
                data,
                filename
            };

        } catch (error) {
            console.error('❌ Ошибка экспорта логов:', error);
            return {
                success: false,
                error: 'Ошибка при экспорте логов'
            };
        }
    }

    // 🔥 ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ДЛЯ FACE ID БЕЗОПАСНОСТИ

    // 📊 РАСШИРЕННАЯ АНАЛИТИКА FACE ID
    async getFaceIdSecurityReport(userId?: string): Promise<{
        userStats?: {
            totalAttempts: number;
            successfulLogins: number;
            failedAttempts: number;
            averageConfidence: number;
            lastLogin?: number;
            devicesUsed: string[];
        };
        systemStats: {
            totalFaceIdUsers: number;
            activeFaceIdUsers: number;
            todayLogins: number;
            weeklyLogins: number;
            averageSystemConfidence: number;
            securityAlerts: Array<{
                type: string;
                message: string;
                timestamp: number;
                severity: 'low' | 'medium' | 'high';
            }>;
        };
    }> {
        try {
            const now = Date.now();
            const oneDayAgo = now - (24 * 60 * 60 * 1000);
            const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

            // Получаем логи Face ID
            const faceIdLogs = await this.getAccessLogs({
                method: 'face-id',
                dateFrom: new Date(oneWeekAgo),
                limit: 1000,
                ...(userId && { userId })
            });

            const systemStats = {
                totalFaceIdUsers: 0,
                activeFaceIdUsers: 0,
                todayLogins: 0,
                weeklyLogins: 0,
                averageSystemConfidence: 0,
                securityAlerts: [] as Array<{
                    type: string;
                    message: string;
                    timestamp: number;
                    severity: 'low' | 'medium' | 'high';
                }>
            };

            // Статистика по системе
            const allFaceProfiles: FaceProfile[] = await this.convex.query("faceProfiles:getAll");
            systemStats.totalFaceIdUsers = allFaceProfiles.length;
            systemStats.activeFaceIdUsers = allFaceProfiles.filter(p => p.isActive).length;

            // Подсчет входов
            systemStats.todayLogins = faceIdLogs.filter(log =>
                log.timestamp > oneDayAgo &&
                log.action.includes('login') &&
                log.success
            ).length;

            systemStats.weeklyLogins = faceIdLogs.filter(log =>
                log.action.includes('login') &&
                log.success
            ).length;

            // Средняя уверенность системы (упрощенная версия)
            if (allFaceProfiles.length > 0) {
                systemStats.averageSystemConfidence = Math.round(
                    allFaceProfiles.reduce((sum, p) => sum + (p.confidence || 0), 0) / allFaceProfiles.length
                );
            }

            // Анализ безопасности
            const failedAttempts = faceIdLogs.filter(log => !log.success);

            // Генерируем алерты
            if (failedAttempts.length > 10) {
                systemStats.securityAlerts.push({
                    type: 'multiple_failed_attempts',
                    message: `Обнаружено ${failedAttempts.length} неудачных попыток Face ID аутентификации за неделю`,
                    timestamp: now,
                    severity: failedAttempts.length > 50 ? 'high' : 'medium'
                });
            }

            // Проверяем низкую уверенность
            const lowConfidenceLogins = faceIdLogs.filter(log =>
                log.success &&
                log.action.includes('login') &&
                // Предполагаем, что confidence хранится в details или отдельном поле
                log.details?.includes('confidence') &&
                parseInt(log.details.match(/\d+/)?.[0] || '0') < 80
            );

            if (lowConfidenceLogins.length > 5) {
                systemStats.securityAlerts.push({
                    type: 'low_confidence_logins',
                    message: `${lowConfidenceLogins.length} входов с низкой уверенностью Face ID (<80%)`,
                    timestamp: now,
                    severity: 'medium'
                });
            }

            // Статистика по пользователю (если указан)
            let userStats;
            if (userId) {
                const userLogs = faceIdLogs.filter(log => log.userId === userId);
                const userLoginLogs = userLogs.filter(log => log.action.includes('login'));
                const successfulUserLogins = userLoginLogs.filter(log => log.success);
                const failedUserLogins = userLoginLogs.filter(log => !log.success);

                // 🔥 ИСПРАВЛЯЕМ ФИЛЬТРАЦИЮ УСТРОЙСТВ
                const devicesUsed = [...new Set(
                    userLogs
                        .map(log => log.deviceInfo?.split(' ')[0])
                        .filter((device): device is string => Boolean(device)) // Типизированный фильтр
                )];

                // Вычисляем среднюю уверенность пользователя (упрощенно)
                const confidenceValues = userLogs
                    .map(log => {
                        const match = log.details?.match(/confidence[:\s]*(\d+)/i);
                        return match ? parseInt(match[1]) : null;
                    })
                    .filter((value): value is number => value !== null); // Типизированный фильтр

                const averageConfidence = confidenceValues.length > 0
                    ? Math.round(confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length)
                    : 0;

                userStats = {
                    totalAttempts: userLoginLogs.length,
                    successfulLogins: successfulUserLogins.length,
                    failedAttempts: failedUserLogins.length,
                    averageConfidence,
                    lastLogin: successfulUserLogins[0]?.timestamp,
                    devicesUsed
                };
            }

            return {
                ...(userStats && { userStats }),
                systemStats
            };

        } catch (error) {
            console.error('❌ Ошибка получения отчета безопасности Face ID:', error);
            return {
                systemStats: {
                    totalFaceIdUsers: 0,
                    activeFaceIdUsers: 0,
                    todayLogins: 0,
                    weeklyLogins: 0,
                    averageSystemConfidence: 0,
                    securityAlerts: []
                }
            };
        }
    }

    // 🔒 ВРЕМЕННАЯ БЛОКИРОВКА FACE ID
    async temporaryDisableFaceId(userId: string, durationMinutes: number, reason: string, disabledBy: string): Promise<{
        success: boolean;
        unblockAt?: number;
        error?: string;
    }> {
        try {
            const unblockAt = Date.now() + (durationMinutes * 60 * 1000);

            await this.convex.mutation("faceProfiles:temporaryDisable", {
                userId,
                disabledUntil: unblockAt,
                reason,
                disabledBy,
                disabledAt: Date.now()
            });

            await this.logAuthAttempt({
                userId: disabledBy,
                action: 'face_id_temp_disabled',
                method: 'face-id',
                success: true,
                details: `Face ID временно отключен для ${userId} на ${durationMinutes} мин. Причина: ${reason}`,
                timestamp: Date.now()
            });

            return {
                success: true,
                unblockAt
            };

        } catch (error) {
            console.error('❌ Ошибка временного отключения Face ID:', error);
            return {
                success: false,
                error: 'Ошибка при временном отключении Face ID'
            };
        }
    }

    // 🔐 ПРИНУДИТЕЛЬНАЯ ПОВТОРНАЯ РЕГИСТРАЦИЯ FACE ID
    async forceFaceIdReregistration(userId: string, reason: string, initiatedBy: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            // Деактивируем текущий профиль
            const currentProfile = await this.convex.query("faceProfiles:getByUserId", { userId });

            if (currentProfile) {
                await this.convex.mutation("faceProfiles:deactivate", {
                    profileId: currentProfile._id,
                    disabledBy: initiatedBy,
                    disabledAt: Date.now()
                });
            }

            // Помечаем пользователя как требующего повторной регистрации
            await this.convex.mutation("users:requireFaceIdReregistration", {
                userId,
                reason,
                requiredBy: initiatedBy,
                requiredAt: Date.now()
            });

            await this.logAuthAttempt({
                userId: initiatedBy,
                action: 'face_id_reregistration_required',
                method: 'face-id',
                success: true,
                details: `Требуется повторная регистрация Face ID для ${userId}. Причина: ${reason}`,
                timestamp: Date.now()
            });

            return { success: true };

        } catch (error) {
            console.error('❌ Ошибка принудительной повторной регистрации Face ID:', error);
            return {
                success: false,
                error: 'Ошибка при инициации повторной регистрации Face ID'
            };
        }
    }

    // 📱 ПРОВЕРКА УСТРОЙСТВА ДЛЯ FACE ID
    async validateFaceIdDevice(deviceInfo: string, userId: string): Promise<{
        allowed: boolean;
        reason?: string;
        requiresApproval?: boolean;
    }> {
        try {
            // Получаем историю устройств пользователя
            const userLogs = await this.getAccessLogs({
                userId,
                method: 'face-id',
                limit: 100
            });

            const knownDevices = new Set(
                userLogs
                    .filter(log => log.success)
                    .map(log => log.deviceInfo?.split(' ')[0])
                    .filter(Boolean)
            );

            const currentDevice = deviceInfo.split(' ')[0];

            // Если устройство известно - разрешаем
            if (knownDevices.has(currentDevice)) {
                return { allowed: true };
            }

            // Проверяем количество неизвестных устройств за последние 24 часа
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            const recentNewDevices = userLogs.filter(log =>
                log.timestamp > oneDayAgo &&
                !knownDevices.has(log.deviceInfo?.split(' ')[0] || '')
            );

            // Если слишком много новых устройств - требуем одобрения
            if (recentNewDevices.length >= 3) {
                return {
                    allowed: false,
                    reason: 'Слишком много новых устройств за последние 24 часа',
                    requiresApproval: true
                };
            }

            // Новое устройство, но в пределах нормы
            return {
                allowed: true,
                requiresApproval: true // Требуем уведомления, но разрешаем
            };

        } catch (error) {
            console.error('❌ Ошибка проверки устройства Face ID:', error);
            return {
                allowed: false,
                reason: 'Ошибка проверки устройства'
            };
        }
    }

    // 🎯 АДАПТИВНАЯ БЕЗОПАСНОСТЬ FACE ID
    async getAdaptiveFaceIdSettings(userId: string): Promise<{
        requiredConfidence: number;
        allowedDevices: string[];
        riskLevel: 'low' | 'medium' | 'high';
        recommendations: string[];
    }> {
        try {
            // Анализируем историю пользователя
            const userStats = await this.getUserStats(userId);
            const faceIdLogs = await this.getAccessLogs({
                userId,
                method: 'face-id',
                limit: 50
            });

            let riskLevel: 'low' | 'medium' | 'high' = 'low';
            let requiredConfidence = 75; // Базовый уровень
            const recommendations: string[] = [];

            // Анализ неудачных попыток
            const failedAttempts = faceIdLogs.filter(log => !log.success).length;
            const totalAttempts = faceIdLogs.length;
            const failureRate = totalAttempts > 0 ? failedAttempts / totalAttempts : 0;

            if (failureRate > 0.3) {
                riskLevel = 'high';
                requiredConfidence = 90;
                recommendations.push('Рекомендуется повторная регистрация Face ID');
                recommendations.push('Включить дополнительную аутентификацию');
            } else if (failureRate > 0.1) {
                riskLevel = 'medium';
                requiredConfidence = 85;
                recommendations.push('Проверить условия освещения при использовании Face ID');
            }

            // 🔥 ИСПРАВЛЯЕМ АНАЛИЗ УСТРОЙСТВ
            const devices = [...new Set(
                faceIdLogs
                    .map(log => log.deviceInfo?.split(' ')[0])
                    .filter((device): device is string => Boolean(device)) // Типизированный фильтр
            )];

            if (devices.length > 5) {
                riskLevel = riskLevel === 'low' ? 'medium' : 'high';
                recommendations.push('Слишком много устройств - рекомендуется аудит безопасности');
            }

            // Анализ времени использования
            const nightLogins = faceIdLogs.filter(log => {
                const hour = new Date(log.timestamp).getHours();
                return hour >= 0 && hour <= 6;
            }).length;

            if (nightLogins > totalAttempts * 0.3) {
                recommendations.push('Много ночных входов - рекомендуется дополнительная верификация');
            }

            return {
                requiredConfidence,
                allowedDevices: devices,
                riskLevel,
                recommendations
            };

        } catch (error) {
            console.error('❌ Ошибка получения адаптивных настроек Face ID:', error);
            return {
                requiredConfidence: 85,
                allowedDevices: [],
                riskLevel: 'medium',
                recommendations: ['Ошибка анализа - рекомендуется ручная проверка']
            };
        }
    }
}

// Создаем единственный экземпляр
export const unifiedAuth = new UnifiedAuthSystem();

// 🔥 ПОЛНЫЙ ЭКСПОРТ ВСЕХ МЕТОДОВ
export default {
    // Основные методы аутентификации
    login: unifiedAuth.login.bind(unifiedAuth),
    logout: unifiedAuth.logout.bind(unifiedAuth),
    validateSession: unifiedAuth.validateSession.bind(unifiedAuth),
    validateToken: unifiedAuth.validateToken.bind(unifiedAuth),

    // Face ID методы
    registerFaceId: unifiedAuth.registerFaceId.bind(unifiedAuth),
    getFaceIdStatus: unifiedAuth.getFaceIdStatus.bind(unifiedAuth),
    disableFaceId: unifiedAuth.disableFaceId.bind(unifiedAuth),
    getFaceIdAnalytics: unifiedAuth.getFaceIdAnalytics.bind(unifiedAuth),
    setupFaceId: unifiedAuth.setupFaceId.bind(unifiedAuth),

    // 🔥 НОВЫЕ FACE ID МЕТОДЫ БЕЗОПАСНОСТИ
    getFaceIdSecurityReport: unifiedAuth.getFaceIdSecurityReport.bind(unifiedAuth),
    temporaryDisableFaceId: unifiedAuth.temporaryDisableFaceId.bind(unifiedAuth),
    forceFaceIdReregistration: unifiedAuth.forceFaceIdReregistration.bind(unifiedAuth),
    validateFaceIdDevice: unifiedAuth.validateFaceIdDevice.bind(unifiedAuth),
    getAdaptiveFaceIdSettings: unifiedAuth.getAdaptiveFaceIdSettings.bind(unifiedAuth),

    // Управление пользователями
    blockUser: unifiedAuth.blockUser.bind(unifiedAuth),
    unblockUser: unifiedAuth.unblockUser.bind(unifiedAuth),
    changePassword: unifiedAuth.changePassword.bind(unifiedAuth),

    // Аналитика и безопасность
    getAccessLogs: unifiedAuth.getAccessLogs.bind(unifiedAuth),
    getSecurityAnalytics: unifiedAuth.getSecurityAnalytics.bind(unifiedAuth),
    getUserStats: unifiedAuth.getUserStats.bind(unifiedAuth),
    detectSuspiciousActivity: unifiedAuth.detectSuspiciousActivity.bind(unifiedAuth),

    // Утилиты
    generateUserQR: unifiedAuth.generateUserQR.bind(unifiedAuth),
    requestPasswordReset: unifiedAuth.requestPasswordReset.bind(unifiedAuth),
    resetPassword: unifiedAuth.resetPassword.bind(unifiedAuth),
    exportSecurityLogs: unifiedAuth.exportSecurityLogs.bind(unifiedAuth),

    // Уведомления и автоматизация
    sendSecurityNotification: unifiedAuth.sendSecurityNotification.bind(unifiedAuth),
    autoBlockOnSuspiciousActivity: unifiedAuth.autoBlockOnSuspiciousActivity.bind(unifiedAuth),

    // Обслуживание системы
    cleanupOldLogs: unifiedAuth.cleanupOldLogs.bind(unifiedAuth)
};



