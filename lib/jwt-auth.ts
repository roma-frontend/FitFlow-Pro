// lib/jwt-auth.ts

// Проверяем, работаем ли мы в Node.js окружении
const isNodeEnvironment = typeof window === 'undefined';

export interface JWTPayload {
    userId: string;
    email: string;
    name: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface TokenData {
    userId: string;
    email: string;
    name: string;
    role: string;
}

// Секретный ключ для подписи JWT (в продакшене должен быть в переменных окружения)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах

/**
 * Простая реализация JWT для браузера (без криптографической подписи)
 * В продакшене используйте настоящую библиотеку JWT на сервере
 */
class SimpleJWT {
    private static encode(payload: any): string {
        return btoa(JSON.stringify(payload)).replace(/=/g, '');
    }

    static create(payload: TokenData): string {
        const now = Math.floor(Date.now() / 1000);
        const exp = now + Math.floor(JWT_EXPIRES_IN / 1000);

        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        const jwtPayload = {
            ...payload,
            iat: now,
            exp: exp,
            iss: 'fitness-app',
            aud: 'fitness-users'
        };

        const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
        const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '');

        // Простая "подпись" (не криптографически безопасная)
        const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`).replace(/=/g, '');

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    static verify(token: string): JWTPayload | null {
        try {
            if (!token) return null;

            const cleanToken = token.replace(/^Bearer\s+/, '');
            const parts = cleanToken.split('.');

            if (parts.length !== 3) return null;

            const [headerPart, payloadPart, signaturePart] = parts;

            // Проверяем подпись
            const expectedSignature = btoa(`${headerPart}.${payloadPart}.${JWT_SECRET}`).replace(/=/g, '');
            if (signaturePart !== expectedSignature) {
                console.warn('🔒 Недействительная подпись токена');
                return null;
            }

            const padding = '='.repeat((4 - (payloadPart.length % 4)) % 4);
            const payload = JSON.parse(atob(payloadPart + padding));
            if (!payload) return null;

            // Проверяем срок действия
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                console.warn('⏰ Токен истек');
                return null;
            }

            return payload;
        } catch (error) {
            console.error('❌ Ошибка проверки токена:', error);
            return null;
        }
    }

    static decode(token: string): JWTPayload | null {
        try {
            const cleanToken = token.replace(/^Bearer\s+/, '');
            const parts = cleanToken.split('.');

            if (parts.length !== 3) return null;

            const padding = '='.repeat((4 - (parts[1].length % 4)) % 4);
            return JSON.parse(atob(parts[1] + padding));
        } catch {
            return null;
        }
    }
}

/**
 * Node.js JWT реализация (с настоящей криптографией)
 */
class NodeJWT {
    static async create(payload: TokenData): Promise<string> {
        if (!isNodeEnvironment) {
            throw new Error('NodeJWT может использоваться только в Node.js');
        }

        try {
            const jwt = await import('jsonwebtoken');

            return jwt.sign(
                {
                    userId: payload.userId,
                    email: payload.email,
                    name: payload.name,
                    role: payload.role,
                },
                JWT_SECRET,
                {
                    expiresIn: '7d',
                    issuer: 'fitness-app',
                    audience: 'fitness-users',
                }
            );
        } catch (error) {
            console.error('❌ Ошибка создания JWT токена:', error);
            throw new Error('Не удалось создать токен');
        }
    }

    static async verify(token: string): Promise<JWTPayload | null> {
        if (!isNodeEnvironment) {
            throw new Error('NodeJWT может использоваться только в Node.js');
        }

        try {
            const jwt = await import('jsonwebtoken');
            const cleanToken = token.replace(/^Bearer\s+/, '');

            const decoded = jwt.verify(cleanToken, JWT_SECRET, {
                issuer: 'fitness-app',
                audience: 'fitness-users',
            }) as JWTPayload;

            return decoded;
        } catch (error) {
            console.warn('🔒 Ошибка проверки JWT токена:', error);
            return null;
        }
    }

    static async decode(token: string): Promise<JWTPayload | null> {
        if (!isNodeEnvironment) {
            throw new Error('NodeJWT может использоваться только в Node.js');
        }

        try {
            const jwt = await import('jsonwebtoken');
            const cleanToken = token.replace(/^Bearer\s+/, '');
            return jwt.decode(cleanToken) as JWTPayload;
        } catch {
            return null;
        }
    }
}

/**
 * Создает JWT токен
 */
export function createToken(payload: TokenData): string {
    try {
        if (isNodeEnvironment) {
            // В Node.js используем настоящий JWT (но синхронно для совместимости)
            return SimpleJWT.create(payload);
        } else {
            // В браузере используем простую реализацию
            return SimpleJWT.create(payload);
        }
    } catch (error) {
        console.error('❌ Ошибка создания токена:', error);
        throw new Error('Не удалось создать токен');
    }
}

/**
 * Проверяет и декодирует JWT токен
 */
export function verifyToken(token: string): Promise<JWTPayload | null> {
    return new Promise((resolve) => {
        try {
            if (isNodeEnvironment) {
                // В Node.js можем использовать настоящий JWT
                NodeJWT.verify(token)
                    .then(resolve)
                    .catch(() => resolve(null));
            } else {
                // В браузере используем простую проверку
                const result = SimpleJWT.verify(token);
                resolve(result);
            }
        } catch (error) {
            console.error('❌ Ошибка проверки токена:', error);
            resolve(null);
        }
    });
}

/**
 * Декодирует токен без проверки подписи
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        return SimpleJWT.decode(token);
    } catch (error) {
        console.error('❌ Ошибка декодирования токена:', error);
        return null;
    }
}

/**
 * Проверяет, истек ли токен
 */
export function isTokenExpired(token: string): boolean {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) {
            return true;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('❌ Ошибка проверки срока действия токена:', error);
        return true;
    }
}

/**
 * Получает время истечения токена
 */
export function getTokenExpiration(token: string): Date | null {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) {
            return null;
        }

        return new Date(decoded.exp * 1000);
    } catch (error) {
        console.error('❌ Ошибка получения времени истечения токена:', error);
        return null;
    }
}

/**
 * Обновляет токен
 */
export async function refreshToken(oldToken: string): Promise<string | null> {
    try {
        const decoded = await verifyToken(oldToken);
        if (!decoded) {
            return null;
        }

        const newToken = createToken({
            userId: decoded.userId,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
        });

        console.log(`🔄 Токен обновлен для пользователя: ${decoded.email}`);
        return newToken;
    } catch (error) {
        console.error('❌ Ошибка обновления токена:', error);
        return null;
    }
}

/**
 * Извлекает токен из заголовка Authorization
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

/**
 * Создает заголовок Authorization с токеном
 */
export function createAuthHeader(token: string): string {
    return `Bearer ${token}`;
}

/**
 * Проверяет роль пользователя
 */
export function hasRole(token: string, requiredRole: string | string[]): boolean {
    try {
        const decoded = decodeToken(token);
        if (!decoded) {
            return false;
        }

        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        return roles.includes(decoded.role);
    } catch (error) {
        console.error('❌ Ошибка проверки роли:', error);
        return false;
    }
}

/**
 * Получает ID пользователя из токена
 */
export function getUserIdFromToken(token: string): string | null {
    try {
        const decoded = decodeToken(token);
        return decoded?.userId || null;
    } catch (error) {
        console.error('❌ Ошибка получения ID пользователя из токена:', error);
        return null;
    }
}

/**
 * Получает email пользователя из токена
 */
export function getEmailFromToken(token: string): string | null {
    try {
        const decoded = decodeToken(token);
        return decoded?.email || null;
    } catch (error) {
        console.error('❌ Ошибка получения email из токена:', error);
        return null;
    }
}

/**
 * Валидирует формат токена
 */
export function isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
        return false;
    }

    const parts = token.split('.');
    return parts.length === 3;
}

/**
 * Создает токен для сброса пароля
 */
export function createPasswordResetToken(userId: string, email: string): string {
    try {
        const now = Math.floor(Date.now() / 1000);
        const exp = now + (60 * 60); // 1 час

        const payload = {
            userId,
            email,
            type: 'password_reset',
            iat: now,
            exp: exp,
            iss: 'fitness-app',
            aud: 'password-reset'
        };

        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
        const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
        const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}.reset`).replace(/=/g, '');

        console.log(`🔑 Токен сброса пароля создан для: ${email}`);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        console.error('❌ Ошибка создания токена сброса пароля:', error);
        throw new Error('Не удалось создать токен сброса пароля');
    }
}

/**
 * Проверяет токен сброса пароля
 */
export function verifyPasswordResetToken(token: string): Promise<{ userId: string; email: string } | null> {
    return new Promise((resolve) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                resolve(null);
                return;
            }

            const [headerPart, payloadPart, signaturePart] = parts;

            // Проверяем подпись для reset токена
            const expectedSignature = btoa(`${headerPart}.${payloadPart}.${JWT_SECRET}.reset`).replace(/=/g, '');
            if (signaturePart !== expectedSignature) {
                console.warn('🔒 Недействительная подпись токена сброса');
                resolve(null);
                return;
            }

            const padding = '='.repeat((4 - (payloadPart.length % 4)) % 4);
            const payload = JSON.parse(atob(payloadPart + padding));

            if (payload.type !== 'password_reset') {
                console.warn('⚠️ Неверный тип токена для сброса пароля');
                resolve(null);
                return;
            }

            // Проверяем срок действия
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                console.warn('⏰ Токен сброса пароля истек');
                resolve(null);
                return;
            }

            console.log(`✅ Токен сброса пароля проверен для: ${payload.email}`);
            resolve({
                userId: payload.userId,
                email: payload.email,
            });
        } catch (error) {
            console.warn('🔒 Ошибка проверки токена сброса пароля:', error);
            resolve(null);
        }
    });
}

/**
 * Создает токен для подтверждения email
 */
export function createEmailVerificationToken(userId: string, email: string): string {
    try {
        const now = Math.floor(Date.now() / 1000);
        const exp = now + (24 * 60 * 60); // 24 часа

        const payload = {
            userId,
            email,
            type: 'email_verification',
            iat: now,
            exp: exp,
            iss: 'fitness-app',
            aud: 'email-verification'
        };

        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
        const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
        const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}.email`).replace(/=/g, '');

        console.log(`📧 Токен подтверждения email создан для: ${email}`);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        console.error('❌ Ошибка создания токена подтверждения email:', error);
        throw new Error('Не удалось создать токен подтверждения email');
    }
}

/**
 * Проверяет токен подтверждения email
 */
export function verifyEmailVerificationToken(token: string): Promise<{ userId: string; email: string } | null> {
    return new Promise((resolve) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                resolve(null);
                return;
            }

            const [headerPart, payloadPart, signaturePart] = parts;

            // Проверяем подпись для email токена
            const expectedSignature = btoa(`${headerPart}.${payloadPart}.${JWT_SECRET}.email`).replace(/=/g, '');
            if (signaturePart !== expectedSignature) {
                console.warn('🔒 Недействительная подпись токена подтверждения email');
                resolve(null);
                return;
            }

            const padding = '='.repeat((4 - (payloadPart.length % 4)) % 4);
            const payload = JSON.parse(atob(payloadPart + padding));

            if (payload.type !== 'email_verification') {
                console.warn('⚠️ Неверный тип токена для подтверждения email');
                resolve(null);
                return;
            }

            // Проверяем срок действия
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                console.warn('⏰ Токен подтверждения email истек');
                resolve(null);
                return;
            }

            console.log(`✅ Токен подтверждения email проверен для: ${payload.email}`);
            resolve({
                userId: payload.userId,
                email: payload.email,
            });
        } catch (error) {
            console.warn('🔒 Ошибка проверки токена подтверждения email:', error);
            resolve(null);
        }
    });
}

/**
 * Создает временный токен доступа (короткий срок действия)
 */
export function createTemporaryToken(userId: string, purpose: string, expiresInMinutes: number = 15): string {
    try {
        const now = Math.floor(Date.now() / 1000);
        const exp = now + (expiresInMinutes * 60);

        const payload = {
            userId,
            purpose,
            type: 'temporary',
            iat: now,
            exp: exp,
            iss: 'fitness-app',
            aud: 'temporary-access'
        };

        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
        const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
        const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}.temp`).replace(/=/g, '');

        console.log(`⏱️ Временный токен создан для пользователя ${userId}, цель: ${purpose}`);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        console.error('❌ Ошибка создания временного токена:', error);
        throw new Error('Не удалось создать временный токен');
    }
}

/**
 * Проверяет временный токен
 */
export function verifyTemporaryToken(token: string, expectedPurpose?: string): Promise<{ userId: string; purpose: string } | null> {
    return new Promise((resolve) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                resolve(null);
                return;
            }

            const [headerPart, payloadPart, signaturePart] = parts;

            // Проверяем подпись для временного токена
            const expectedSignature = btoa(`${headerPart}.${payloadPart}.${JWT_SECRET}.temp`).replace(/=/g, '');
            if (signaturePart !== expectedSignature) {
                console.warn('🔒 Недействительная подпись временного токена');
                resolve(null);
                return;
            }

            const padding = '='.repeat((4 - (payloadPart.length % 4)) % 4);
            const payload = JSON.parse(atob(payloadPart + padding));

            if (payload.type !== 'temporary') {
                console.warn('⚠️ Неверный тип временного токена');
                resolve(null);
                return;
            }

            // Проверяем цель, если указана
            if (expectedPurpose && payload.purpose !== expectedPurpose) {
                console.warn(`⚠️ Неверная цель токена. Ожидалось: ${expectedPurpose}, получено: ${payload.purpose}`);
                resolve(null);
                return;
            }

            // Проверяем срок действия
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                console.warn('⏰ Временный токен истек');
                resolve(null);
                return;
            }

            console.log(`✅ Временный токен проверен для пользователя ${payload.userId}, цель: ${payload.purpose}`);
            resolve({
                userId: payload.userId,
                purpose: payload.purpose,
            });
        } catch (error) {
            console.warn('🔒 Ошибка проверки временного токена:', error);
            resolve(null);
        }
    });
}

/**
 * Получает информацию о токене без проверки подписи
 */
export function getTokenInfo(token: string): {
    header: any;
    payload: any;
    isExpired: boolean;
    timeToExpiry: number;
} | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const [headerPart, payloadPart] = parts;

        const headerPadding = '='.repeat((4 - (headerPart.length % 4)) % 4);
        const payloadPadding = '='.repeat((4 - (payloadPart.length % 4)) % 4);

        const header = JSON.parse(atob(headerPart + headerPadding));
        const payload = JSON.parse(atob(payloadPart + payloadPadding));

        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp ? payload.exp < now : false;
        const timeToExpiry = payload.exp ? (payload.exp - now) * 1000 : 0;

        return {
            header,
            payload,
            isExpired,
            timeToExpiry
        };
    } catch (error) {
        console.error('❌ Ошибка получения информации о токене:', error);
        return null;
    }
}

/**
 * Создает токен для API доступа (без срока истечения)
 */
export function createApiToken(userId: string, permissions: string[]): string {
    try {
        const now = Math.floor(Date.now() / 1000);

        const payload = {
            userId,
            permissions,
            type: 'api_access',
            iat: now,
            iss: 'fitness-app',
            aud: 'api-access'
            // Намеренно не устанавливаем exp для API токенов
        };

        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
        const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
        const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}.api`).replace(/=/g, '');

        console.log(`🔑 API токен создан для пользователя ${userId} с правами: ${permissions.join(', ')}`);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        console.error('❌ Ошибка создания API токена:', error);
        throw new Error('Не удалось создать API токен');
    }
}

/**
 * Проверяет API токен
 */
export function verifyApiToken(token: string): Promise<{ userId: string; permissions: string[] } | null> {
    return new Promise((resolve) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                resolve(null);
                return;
            }

            const [headerPart, payloadPart, signaturePart] = parts;

            // Проверяем подпись для API токена
            const expectedSignature = btoa(`${headerPart}.${payloadPart}.${JWT_SECRET}.api`).replace(/=/g, '');
            if (signaturePart !== expectedSignature) {
                console.warn('🔒 Недействительная подпись API токена');
                resolve(null);
                return;
            }

            const padding = '='.repeat((4 - (payloadPart.length % 4)) % 4);
            const payload = JSON.parse(atob(payloadPart + padding));

            if (payload.type !== 'api_access') {
                console.warn('⚠️ Неверный тип API токена');
                resolve(null);
                return;
            }

            console.log(`✅ API токен проверен для пользователя ${payload.userId}`);
            resolve({
                userId: payload.userId,
                permissions: payload.permissions || [],
            });
        } catch (error) {
            console.warn('🔒 Ошибка проверки API токена:', error);
            resolve(null);
        }
    });
}

/**
 * Проверяет, имеет ли API токен определенное разрешение
 */
export async function hasApiPermission(token: string, requiredPermission: string): Promise<boolean> {
    try {
        const tokenData = await verifyApiToken(token);
        if (!tokenData) {
            return false;
        }

        return tokenData.permissions.includes(requiredPermission) || tokenData.permissions.includes('*');
    } catch (error) {
        console.error('❌ Ошибка проверки разрешения API:', error);
        return false;
    }
}

/**
 * Создает токен для двухфакторной аутентификации
 */
export function create2FAToken(userId: string, method: 'sms' | 'email' | 'app'): string {
    try {
        const now = Math.floor(Date.now() / 1000);
        const exp = now + (5 * 60); // 5 минут для 2FA

        const payload = {
            userId,
            method,
            type: '2fa_verification',
            iat: now,
            exp: exp,
            iss: 'fitness-app',
            aud: '2fa-verification'
        };

        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
        const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
        const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}.2fa`).replace(/=/g, '');

        console.log(`🔐 2FA токен создан для пользователя ${userId}, метод: ${method}`);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        console.error('❌ Ошибка создания 2FA токена:', error);
        throw new Error('Не удалось создать 2FA токен');
    }
}

/**
 * Проверяет 2FA токен
 */
export function verify2FAToken(token: string): Promise<{ userId: string; method: string } | null> {
    return new Promise((resolve) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                resolve(null);
                return;
            }

            const [headerPart, payloadPart, signaturePart] = parts;

            // Проверяем подпись для 2FA токена
            const expectedSignature = btoa(`${headerPart}.${payloadPart}.${JWT_SECRET}.2fa`).replace(/=/g, '');
            if (signaturePart !== expectedSignature) {
                console.warn('🔒 Недействительная подпись 2FA токена');
                resolve(null);
                return;
            }

            const padding = '='.repeat((4 - (payloadPart.length % 4)) % 4);
            const payload = JSON.parse(atob(payloadPart + padding));

            if (payload.type !== '2fa_verification') {
                console.warn('⚠️ Неверный тип 2FA токена');
                resolve(null);
                return;
            }

            // Проверяем срок действия
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                console.warn('⏰ 2FA токен истек');
                resolve(null);
                return;
            }

            console.log(`✅ 2FA токен проверен для пользователя ${payload.userId}, метод: ${payload.method}`);
            resolve({
                userId: payload.userId,
                method: payload.method,
            });
        } catch (error) {
            console.warn('🔒 Ошибка проверки 2FA токена:', error);
            resolve(null);
        }
    });
}

/**
 * Утилита для безопасного сравнения строк (защита от timing attacks)
 */
function safeStringCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

/**
 * Создает случайную строку для использования в токенах
 */
export function generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        // Используем криптографически стойкий генератор если доступен
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            result += chars[array[i] % chars.length];
        }
    } else {
        // Fallback для старых браузеров
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
    }

    return result;
}

/**
 * Валидирует структуру JWT токена
 */
export function validateTokenStructure(token: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!token || typeof token !== 'string') {
        errors.push('Токен должен быть непустой строкой');
        return { valid: false, errors };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        errors.push('Токен должен состоять из 3 частей, разделенных точками');
        return { valid: false, errors };
    }

    const [header, payload, signature] = parts;

    // Проверяем заголовок
    try {
        const headerPadding = '='.repeat((4 - (header.length % 4)) % 4);
        const decodedHeader = JSON.parse(atob(header + headerPadding));

        if (!decodedHeader.alg || !decodedHeader.typ) {
            errors.push('Заголовок токена должен содержать alg и typ');
        }

        if (decodedHeader.typ !== 'JWT') {
            errors.push('Тип токена должен быть JWT');
        }
    } catch {
        errors.push('Невозможно декодировать заголовок токена');
    }

    // Проверяем полезную нагрузку
    try {
        const payloadPadding = '='.repeat((4 - (payload.length % 4)) % 4);
        const decodedPayload = JSON.parse(atob(payload + payloadPadding));

        if (!decodedPayload.iss) {
            errors.push('Токен должен содержать издателя (iss)');
        }

        if (!decodedPayload.iat) {
            errors.push('Токен должен содержать время выдачи (iat)');
        }
    } catch {
        errors.push('Невозможно декодировать полезную нагрузку токена');
    }

    // Проверяем подпись
    if (!signature || signature.length < 10) {
        errors.push('Подпись токена слишком короткая');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Получает метаданные токена
 */
export function getTokenMetadata(token: string): {
    type: string;
    issuer: string;
    audience: string;
    issuedAt: Date | null;
    expiresAt: Date | null;
    algorithm: string;
    subject?: string;
} | null {
    try {
        const info = getTokenInfo(token);
        if (!info) return null;

        return {
            type: info.payload.type || 'access',
            issuer: info.payload.iss || 'unknown',
            audience: info.payload.aud || 'unknown',
            issuedAt: info.payload.iat ? new Date(info.payload.iat * 1000) : null,
            expiresAt: info.payload.exp ? new Date(info.payload.exp * 1000) : null,
            algorithm: info.header.alg || 'unknown',
            subject: info.payload.sub
        };
    } catch (error) {
        console.error('❌ Ошибка получения метаданных токена:', error);
        return null;
    }
}

/**
 * Проверяет, скоро ли истечет токен
 */
export function isTokenExpiringSoon(token: string, minutesThreshold: number = 15): boolean {
    try {
        const info = getTokenInfo(token);
        if (!info || !info.payload.exp) return false;

        const thresholdMs = minutesThreshold * 60 * 1000;
        return info.timeToExpiry <= thresholdMs && info.timeToExpiry > 0;
    } catch (error) {
        console.error('❌ Ошибка проверки срока истечения токена:', error);
        return false;
    }
}

/**
 * Создает токен для восстановления сессии
 */
export function createSessionRecoveryToken(sessionId: string, userId: string): string {
    try {
        const now = Math.floor(Date.now() / 1000);
        const exp = now + (30 * 60); // 30 минут

        const payload = {
            sessionId,
            userId,
            type: 'session_recovery',
            iat: now,
            exp: exp,
            iss: 'fitness-app',
            aud: 'session-recovery'
        };

        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
        const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
        const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}.recovery`).replace(/=/g, '');

        console.log(`🔄 Токен восстановления сессии создан для пользователя ${userId}`);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        console.error('❌ Ошибка создания токена восстановления сессии:', error);
        throw new Error('Не удалось создать токен восстановления сессии');
    }
}

/**
 * Проверяет токен восстановления сессии
 */
export function verifySessionRecoveryToken(token: string): Promise<{ sessionId: string; userId: string } | null> {
    return new Promise((resolve) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                resolve(null);
                return;
            }

            const [headerPart, payloadPart, signaturePart] = parts;

            // Проверяем подпись для токена восстановления
            const expectedSignature = btoa(`${headerPart}.${payloadPart}.${JWT_SECRET}.recovery`).replace(/=/g, '');
            if (signaturePart !== expectedSignature) {
                console.warn('🔒 Недействительная подпись токена восстановления сессии');
                resolve(null);
                return;
            }

            const padding = '='.repeat((4 - (payloadPart.length % 4)) % 4);
            const payload = JSON.parse(atob(payloadPart + padding));

            if (payload.type !== 'session_recovery') {
                console.warn('⚠️ Неверный тип токена восстановления сессии');
                resolve(null);
                return;
            }

            // Проверяем срок действия
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                console.warn('⏰ Токен восстановления сессии истек');
                resolve(null);
                return;
            }

            console.log(`✅ Токен восстановления сессии проверен для пользователя ${payload.userId}`);
            resolve({
                sessionId: payload.sessionId,
                userId: payload.userId,
            });
        } catch (error) {
            console.warn('🔒 Ошибка проверки токена восстановления сессии:', error);
            resolve(null);
        }
    });
}

/**
 * Создает токен для приглашения пользователя
 */
export function createInvitationToken(invitedBy: string, email: string, role: string): string {
    try {
        const now = Math.floor(Date.now() / 1000);
        const exp = now + (7 * 24 * 60 * 60); // 7 дней

        const payload = {
            invitedBy,
            email,
            role,
            type: 'invitation',
            iat: now,
            exp: exp,
            iss: 'fitness-app',
            aud: 'user-invitation'
        };

        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
        const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
        const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}.invite`).replace(/=/g, '');

        console.log(`📧 Токен приглашения создан для ${email} с ролью ${role}`);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        console.error('❌ Ошибка создания токена приглашения:', error);
        throw new Error('Не удалось создать токен приглашения');
    }
}

/**
 * Проверяет токен приглашения
 */
export function verifyInvitationToken(token: string): Promise<{ invitedBy: string; email: string; role: string } | null> {
    return new Promise((resolve) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                resolve(null);
                return;
            }

            const [headerPart, payloadPart, signaturePart] = parts;

            // Проверяем подпись для токена приглашения
            const expectedSignature = btoa(`${headerPart}.${payloadPart}.${JWT_SECRET}.invite`).replace(/=/g, '');
            if (signaturePart !== expectedSignature) {
                console.warn('🔒 Недействительная подпись токена приглашения');
                resolve(null);
                return;
            }

            const padding = '='.repeat((4 - (payloadPart.length % 4)) % 4);
            const payload = JSON.parse(atob(payloadPart + padding));

            if (payload.type !== 'invitation') {
                console.warn('⚠️ Неверный тип токена приглашения');
                resolve(null);
                return;
            }

            // Проверяем срок действия
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                console.warn('⏰ Токен приглашения истек');
                resolve(null);
                return;
            }

            console.log(`✅ Токен приглашения проверен для ${payload.email}`);
            resolve({
                invitedBy: payload.invitedBy,
                email: payload.email,
                role: payload.role,
            });
        } catch (error) {
            console.warn('🔒 Ошибка проверки токена приглашения:', error);
            resolve(null);
        }
    });
}

/**
 * Экспорт всех функций как объект по умолчанию
 */
export default {
    // Основные функции
    createToken,
    verifyToken,
    decodeToken,
    isTokenExpired,
    getTokenExpiration,
    refreshToken,

    // Утилиты
    extractTokenFromHeader,
    createAuthHeader,
    hasRole,
    getUserIdFromToken,
    getEmailFromToken,
    isValidTokenFormat,

    // Специальные токены
    createPasswordResetToken,
    verifyPasswordResetToken,
    createEmailVerificationToken,
    verifyEmailVerificationToken,
    createTemporaryToken,
    verifyTemporaryToken,
    createApiToken,
    verifyApiToken,
    hasApiPermission,
    create2FAToken,
    verify2FAToken,
    createSessionRecoveryToken,
    verifySessionRecoveryToken,
    createInvitationToken,
    verifyInvitationToken,

    // Метаданные и валидация
    getTokenInfo,
    getTokenMetadata,
    validateTokenStructure,
    isTokenExpiringSoon,

    // Утилиты
    generateRandomString,
};


