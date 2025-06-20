// components/member/header/hooks/useNavigation.ts
"use client";

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useNavigation() {
  const router = useRouter();

  const handleNavigation = useCallback((href: string) => {
    if (href.startsWith('http')) {
      // External link
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      // Internal navigation
      router.push(href);
    }
  }, [router]);

  return {
    handleNavigation
  };
}
