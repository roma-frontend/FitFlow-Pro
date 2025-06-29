// utils/adaptive.ts - Утилиты для адаптивности
export const adaptiveUtils = {
  // Получение оптимального размера шрифта
  getFontSize: (base: number, isMobile: boolean, isTablet: boolean) => {
    if (isMobile) return Math.max(base - 2, 12);
    if (isTablet) return Math.max(base - 1, 13);
    return base;
  },

  // Получение оптимальных отступов
  getPadding: (base: number, isMobile: boolean, isTablet: boolean) => {
    if (isMobile) return Math.max(base * 0.75, 8);
    if (isTablet) return Math.max(base * 0.875, 12);
    return base;
  },

  // Получение оптимального количества колонок
  getColumns: (maxCols: number, isMobile: boolean, isTablet: boolean) => {
    if (isMobile) return 1;
    if (isTablet) return Math.min(maxCols, 2);
    return maxCols;
  },

  // Определение нужно ли использовать компактный режим
  shouldUseCompactMode: (isMobile: boolean, isTablet: boolean) => {
    return isMobile || isTablet;
  },

  // Получение оптимальной высоты элементов
  getOptimalHeight: (base: number, isMobile: boolean) => {
        return isMobile ? Math.max(base + 8, 44) : base; // 44px минимум для touch targets
  },

  // Получение адаптивных классов анимации
  getAnimationClasses: (isMobile: boolean, prefersReducedMotion: boolean) => {
    if (prefersReducedMotion) return '';
    return isMobile 
      ? 'transition-all duration-200 ease-out'
      : 'transition-all duration-300 ease-in-out';
  },

  // Определение оптимального размера модальных окон
  getModalSize: (isMobile: boolean, isTablet: boolean) => {
    if (isMobile) return 'full';
    if (isTablet) return 'lg';
    return 'xl';
  },

  // Получение адаптивных breakpoints
  getBreakpointClasses: (classes: {
    mobile: string;
    tablet: string;
    desktop: string;
  }) => {
    return `${classes.mobile} md:${classes.tablet} lg:${classes.desktop}`;
  }
};

