// lib/face-id-storage.ts - Умное хранилище Face ID профилей
import jwt from 'jsonwebtoken';

export interface FaceIdProfile {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  descriptor: number[]; // Биометрический дескриптор лица
  confidence: number;
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution: string;
  };
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  usageCount: number;
  isActive: boolean;
  version: string;
}

// В production используйте Redis или другое хранилище
// Это временное решение для демонстрации
const FACE_ID_STORAGE = new Map<string, FaceIdProfile>();

// Дополнительный индекс для быстрого поиска по userId
const USER_ID_INDEX = new Map<string, string[]>(); // userId -> profileIds[]

export const faceIdStorage = {
  // Создание нового профиля
  async createProfile(data: {
    userId: string;
    userEmail: string;
    userName: string;
    userRole: string;
    descriptor: number[];
    confidence: number;
    deviceInfo: any;
  }): Promise<FaceIdProfile> {
    const profileId = `face_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const profile: FaceIdProfile = {
      id: profileId,
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      userRole: data.userRole,
      descriptor: data.descriptor,
      confidence: data.confidence,
      deviceInfo: data.deviceInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      isActive: true,
      version: '1.0'
    };

    // Сохраняем профиль
    FACE_ID_STORAGE.set(profileId, profile);
    
    // Обновляем индекс
    const existingProfiles = USER_ID_INDEX.get(data.userId) || [];
    existingProfiles.push(profileId);
    USER_ID_INDEX.set(data.userId, existingProfiles);
    
    console.log('✅ Face ID профиль создан:', {
      profileId,
      userId: data.userId,
      email: data.userEmail
    });
    
    return profile;
  },

  // Поиск профиля по ID
  async getProfile(profileId: string): Promise<FaceIdProfile | null> {
    return FACE_ID_STORAGE.get(profileId) || null;
  },

  // Поиск всех профилей пользователя
  async getUserProfiles(userId: string): Promise<FaceIdProfile[]> {
    const profileIds = USER_ID_INDEX.get(userId) || [];
    const profiles: FaceIdProfile[] = [];
    
    for (const id of profileIds) {
      const profile = FACE_ID_STORAGE.get(id);
      if (profile && profile.isActive) {
        profiles.push(profile);
      }
    }
    
    return profiles;
  },

  // Поиск профиля по дескриптору (с порогом схожести)
  async findByDescriptor(descriptor: number[], threshold: number = 0.6): Promise<{
    profile: FaceIdProfile;
    similarity: number;
  } | null> {
    let bestMatch: { profile: FaceIdProfile; similarity: number } | null = null;
    let highestSimilarity = 0;

    for (const profile of FACE_ID_STORAGE.values()) {
      if (!profile.isActive) continue;
      
      const similarity = this.calculateSimilarity(descriptor, profile.descriptor);
      
      if (similarity > threshold && similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = { profile, similarity };
      }
    }

    return bestMatch;
  },

  // Расчет схожести между дескрипторами (косинусное сходство)
  calculateSimilarity(desc1: number[], desc2: number[]): number {
    if (desc1.length !== desc2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < desc1.length; i++) {
      dotProduct += desc1[i] * desc2[i];
      norm1 += desc1[i] * desc1[i];
      norm2 += desc2[i] * desc2[i];
    }
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    // Косинусное сходство в диапазоне [-1, 1], нормализуем к [0, 1]
    const cosineSimilarity = dotProduct / (norm1 * norm2);
    return (cosineSimilarity + 1) / 2;
  },

  // Обновление профиля
  async updateProfile(profileId: string, updates: Partial<FaceIdProfile>): Promise<boolean> {
    const profile = FACE_ID_STORAGE.get(profileId);
    if (!profile) return false;
    
    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    FACE_ID_STORAGE.set(profileId, updatedProfile);
    return true;
  },

  // Обновление статистики использования
  async updateUsageStats(profileId: string): Promise<void> {
    const profile = FACE_ID_STORAGE.get(profileId);
    if (!profile) return;
    
    profile.lastUsedAt = new Date().toISOString();
    profile.usageCount += 1;
    profile.updatedAt = new Date().toISOString();
    
    FACE_ID_STORAGE.set(profileId, profile);
  },

  // Деактивация профиля
  async deactivateProfile(profileId: string): Promise<boolean> {
    const profile = FACE_ID_STORAGE.get(profileId);
    if (!profile) return false;
    
    profile.isActive = false;
    profile.updatedAt = new Date().toISOString();
    
    FACE_ID_STORAGE.set(profileId, profile);
    return true;
  },

  // Деактивация всех профилей пользователя
  async deactivateUserProfiles(userId: string): Promise<number> {
    const profiles = await this.getUserProfiles(userId);
    let deactivatedCount = 0;
    
    for (const profile of profiles) {
      if (await this.deactivateProfile(profile.id)) {
        deactivatedCount++;
      }
    }
    
    return deactivatedCount;
  },

  // Создание токена для Face ID сессии
  createFaceIdToken(profile: FaceIdProfile): string {
    const payload = {
      profileId: profile.id,
      userId: profile.userId,
      userName: profile.userName,
      userEmail: profile.userEmail,
      userRole: profile.userRole,
      type: 'face_id_session'
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
  },

  // Валидация токена Face ID
  async validateFaceIdToken(token: string): Promise<FaceIdProfile | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      if (decoded.type !== 'face_id_session' || !decoded.profileId) {
        return null;
      }
      
      const profile = await this.getProfile(decoded.profileId);
      return profile && profile.isActive ? profile : null;
    } catch (error) {
      console.error('❌ Ошибка валидации Face ID токена:', error);
      return null;
    }
  },

  // Очистка устаревших профилей
  async cleanupOldProfiles(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let deletedCount = 0;
    
    for (const [profileId, profile] of FACE_ID_STORAGE.entries()) {
      const lastUsed = profile.lastUsedAt || profile.createdAt;
      const lastUsedDate = new Date(lastUsed);
      
      if (lastUsedDate < cutoffDate) {
        FACE_ID_STORAGE.delete(profileId);
        
        // Обновляем индекс
        const userProfiles = USER_ID_INDEX.get(profile.userId) || [];
        const updatedProfiles = userProfiles.filter(id => id !== profileId);
        
        if (updatedProfiles.length > 0) {
          USER_ID_INDEX.set(profile.userId, updatedProfiles);
        } else {
          USER_ID_INDEX.delete(profile.userId);
        }
        
        deletedCount++;
      }
    }
    
    return deletedCount;
  },

  // Статистика
  async getStats(): Promise<{
    totalProfiles: number;
    activeProfiles: number;
    totalUsers: number;
    averageUsageCount: number;
  }> {
    const profiles = Array.from(FACE_ID_STORAGE.values());
    const activeProfiles = profiles.filter(p => p.isActive);
    
    const totalUsage = profiles.reduce((sum, p) => sum + p.usageCount, 0);
    const averageUsage = profiles.length > 0 ? totalUsage / profiles.length : 0;
    
    return {
      totalProfiles: profiles.length,
      activeProfiles: activeProfiles.length,
      totalUsers: USER_ID_INDEX.size,
      averageUsageCount: Math.round(averageUsage * 10) / 10
    };
  }
};

// Экспортируем тип для использования в других модулях
export type FaceIdStorage = typeof faceIdStorage;