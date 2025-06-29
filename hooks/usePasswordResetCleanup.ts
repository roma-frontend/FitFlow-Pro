// hooks/usePasswordResetCleanup.ts
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function usePasswordResetCleanup() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const cleanupMutation = useMutation(api.auth.cleanupExpiredTokens);

  const cleanup = async () => {
    setIsLoading(true);
    try {
      const result = await cleanupMutation({});
      
      if (result.success) {
        toast({
          title: 'Очистка завершена',
          description: result.message,
        });
      }
      
      return result;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка очистки',
        description: 'Не удалось очистить истекшие токены',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { cleanup, isLoading };
}
