// utils/dateUtils.ts - Утилиты для работы с датами в UserGrid

/**
 * Универсальная функция для безопасного форматирования дат
 * Поддерживает Date, string, number и undefined
 */
export const formatDate = (date: Date | string | number | undefined | null): string => {
    if (!date) return 'Неизвестно';
    
    let dateObj: Date;
    
    try {
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'number') {
        dateObj = new Date(date);
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        return 'Неизвестно';
      }
  
      // Проверяем валидность даты
      if (isNaN(dateObj.getTime())) {
        console.warn('Невалидная дата:', date);
        return 'Неизвестно';
      }
  
      return dateObj.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Ошибка форматирования даты:', error, date);
      return 'Неизвестно';
    }
  };
  
  /**
   * Форматирование относительного времени (например, "2 дня назад")
   */
  export const formatRelativeTime = (date: Date | string | number | undefined | null): string => {
    if (!date) return 'Никогда';
    
    let dateObj: Date;
    
    try {
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'number') {
        dateObj = new Date(date);
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        return 'Никогда';
      }
  
      if (isNaN(dateObj.getTime())) {
        console.warn('Невалидная дата для относительного времени:', date);
        return 'Никогда';
      }
  
      const now = Date.now();
      const diff = now - dateObj.getTime();
      
      // Если дата в будущем
      if (diff < 0) {
        return formatDate(dateObj);
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);
      
      if (minutes < 1) return 'Только что';
      if (minutes < 60) return `${minutes} мин. назад`;
      if (hours < 24) return `${hours} ч. назад`;
      if (days === 0) return 'Сегодня';
      if (days === 1) return 'Вчера';
      if (days < 7) return `${days} дн. назад`;
      if (weeks < 4) return `${weeks} нед. назад`;
      if (months < 12) return `${months} мес. назад`;
      
      return formatDate(dateObj);
    } catch (error) {
      console.error('Ошибка форматирования относительного времени:', error, date);
      return 'Никогда';
    }
  };
  
  /**
   * Форматирование времени для отображения последнего входа
   */
  export const formatLastLogin = (date: Date | string | number | undefined | null): string => {
    if (!date) return 'Никогда не входил';
    
    const relative = formatRelativeTime(date);
    
    // Для очень старых дат показываем точную дату
    if (relative.includes('мес. назад') || relative === formatDate(date)) {
      return `Последний вход: ${formatDate(date)}`;
    }
    
    return `Последний вход: ${relative}`;
  };
  
  /**
   * Проверка валидности даты
   */
  export const isValidDate = (date: any): boolean => {
    if (!date) return false;
    
    try {
      let dateObj: Date;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'number' || typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        return false;
      }
      
      return !isNaN(dateObj.getTime());
    } catch {
      return false;
    }
  };
  
  /**
   * Конвертация различных форматов дат в Date объект
   */
  export const toDate = (date: Date | string | number | undefined | null): Date | null => {
    if (!date) return null;
    
    try {
      if (date instanceof Date) {
        return isValidDate(date) ? date : null;
      }
      
      const dateObj = new Date(date);
      return isValidDate(dateObj) ? dateObj : null;
    } catch {
      return null;
    }
  };
  
  /**
   * Форматирование даты с временем
   */
  export const formatDateTime = (date: Date | string | number | undefined | null): string => {
    if (!date) return 'Неизвестно';
    
    const dateObj = toDate(date);
    if (!dateObj) return 'Неизвестно';
    
    try {
      return dateObj.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Ошибка форматирования даты и времени:', error, date);
      return 'Неизвестно';
    }
  };
  
  /**
   * Получение возраста в годах (полезно для тренеров)
   */
  export const getAge = (birthDate: Date | string | number | undefined | null): number | null => {
    const dateObj = toDate(birthDate);
    if (!dateObj) return null;
    
    const today = new Date();
    const age = today.getFullYear() - dateObj.getFullYear();
    const monthDiff = today.getMonth() - dateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
      return age - 1;
    }
    
    return age;
  };
  
  /**
   * Проверка, была ли дата недавно (в пределах указанного количества дней)
   */
  export const isRecent = (
    date: Date | string | number | undefined | null, 
    days: number = 7
  ): boolean => {
    const dateObj = toDate(date);
    if (!dateObj) return false;
    
    const now = Date.now();
    const diff = now - dateObj.getTime();
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    
    return daysDiff <= days && daysDiff >= 0;
  };
  
  /**
   * Получение цвета статуса в зависимости от даты последнего входа
   */
  export const getLastLoginStatusColor = (lastLogin: Date | string | number | undefined | null): string => {
    if (!lastLogin) return 'text-gray-400';
    
    const dateObj = toDate(lastLogin);
    if (!dateObj) return 'text-gray-400';
    
    const now = Date.now();
    const diff = now - dateObj.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    
    if (days <= 1) return 'text-green-600'; // Очень недавно
    if (days <= 7) return 'text-blue-600';  // Недавно
    if (days <= 30) return 'text-yellow-600'; // Давно
    return 'text-red-600'; // Очень давно
  };
  
  export default {
    formatDate,
    formatRelativeTime,
    formatLastLogin,
    formatDateTime,
    isValidDate,
    toDate,
    getAge,
    isRecent,
    getLastLoginStatusColor
  };