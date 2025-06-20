// utils/faceIdUtils.ts - утилиты для работы с Face ID
export interface FaceIdProfile {
  id: string;
  userId: string;
  created: string;
  lastUsed?: string;
}

export const faceIdUtils = {
  // Проверка поддержки Face ID в браузере
  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  // Получение сохраненного профиля
  getSavedProfile(): FaceIdProfile | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const profileData = localStorage.getItem('faceIdProfile');
      return profileData ? JSON.parse(profileData) : null;
    } catch {
      return null;
    }
  },

  // Сохранение профиля
  saveProfile(profile: FaceIdProfile): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('faceIdProfile', JSON.stringify(profile));
      localStorage.setItem('faceIdEnabled', 'true');
      console.log('✅ Face ID профиль сохранен:', profile.id);
    } catch (error) {
      console.error('❌ Ошибка сохранения Face ID профиля:', error);
    }
  },

  // Удаление профиля
  removeProfile(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('faceIdProfile');
      localStorage.removeItem('faceIdEnabled');
      localStorage.removeItem('faceIdProfileId');
      console.log('🗑️ Face ID профиль удален');
    } catch (error) {
      console.error('❌ Ошибка удаления Face ID профиля:', error);
    }
  },

  // Проверка статуса
  getStatus(): { enabled: boolean; profile: FaceIdProfile | null } {
    const profile = this.getSavedProfile();
    return {
      enabled: !!profile,
      profile
    };
  },

  // Обновление последнего использования
  updateLastUsed(profileId: string): void {
    const profile = this.getSavedProfile();
    if (profile && profile.id === profileId) {
      profile.lastUsed = new Date().toISOString();
      this.saveProfile(profile);
    }
  }
};
