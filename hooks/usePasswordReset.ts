// hooks/usePasswordReset.ts
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function usePasswordReset() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const requestResetMutation = useMutation(api.auth.requestPasswordReset);
  const resetPasswordMutation = useMutation(api.auth.resetPassword);

  const requestReset = async (email: string, userType: 'staff' | 'member') => {
    setIsLoading(true);
    try {
      const result = await requestResetMutation({
        email: email.toLowerCase(),
        userType
      });
      
      if (result.success) {
        toast({
          title: 'Запрос отправлен',
          description: 'Проверьте вашу почту для восстановления пароля',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: result.error || 'Не удалось отправить запрос',
        });
      }
      
      return result;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось отправить запрос на восстановление',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (
    token: string, 
    newPassword: string, 
    userType: 'staff' | 'member'
  ) => {
    setIsLoading(true);
    try {
      const result = await resetPasswordMutation({
        token,
        newPassword,
        userType
      });
      
      if (result.success) {
        toast({
          title: 'Пароль изменен',
          description: 'Ваш пароль успешно обновлен',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: result.error || 'Не удалось изменить пароль',
        });
      }
      
      return result;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось изменить пароль',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    requestReset, 
    resetPassword, 
    isLoading 
  };
}
