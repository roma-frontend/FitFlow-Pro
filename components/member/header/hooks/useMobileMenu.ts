// components/member/header/hooks/useMobileMenu.ts (обновленная версия)
import { useState, useCallback } from 'react';

export const useMobileMenu = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const openMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
    // Небольшая задержка для запуска анимации после рендера
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsAnimating(false);
    // Ждем завершения анимации перед удалением из DOM
    setTimeout(() => {
      setMobileMenuOpen(false);
    }, 300);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    if (mobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }, [mobileMenuOpen, openMobileMenu, closeMobileMenu]);

  return {
    mobileMenuOpen,
    isAnimating,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu
  };
};
