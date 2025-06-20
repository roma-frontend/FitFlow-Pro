// hooks/usePasswordResetLogs.ts
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function usePasswordResetLogs(
  limit: number = 50,
  userType?: 'staff' | 'member'
) {
  const logs = useQuery(api.auth.getPasswordResetLogs, {
    limit,
    userType
  });

  return {
    logs,
    isLoading: logs === undefined,
    error: logs === null
  };
}
