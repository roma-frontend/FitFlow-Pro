// hooks/useClientOnly.ts (новый файл)
import { useEffect, useState } from 'react';

export function useClientOnly() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
