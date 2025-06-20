// hooks/useTokenVerification.ts
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useTokenVerification(
  token: string | null,
  userType: 'staff' | 'member' | null
) {
  const result = useQuery(
    api.auth.verifyResetToken,
    token && userType ? { token, userType } : 'skip'
  );

  return {
    isValid: result?.success || false,
    userData: result?.success ? result : null,
    isLoading: result === undefined,
    error: result?.error
  };
}
