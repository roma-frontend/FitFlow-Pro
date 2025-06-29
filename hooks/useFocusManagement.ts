import { useEffect, useRef } from 'react';

export function useFocusManagement(isOpen: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущий фокус
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      // Возвращаем фокус при закрытии
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  return {
    restoreFocus: () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  };
}
