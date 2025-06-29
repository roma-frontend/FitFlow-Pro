// hooks/useMembershipActions.ts
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';

export function useMembershipActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Convex мутации
  const renewMembershipMutation = useMutation(api.memberships.renew);
  const cancelMembershipMutation = useMutation(api.memberships.cancel);
  const freezeMembershipMutation = useMutation(api.memberships.freeze);
  const unfreezeMembershipMutation = useMutation(api.memberships.unfreeze);

  // Продление абонемента
  const renewMembership = async (membershipId: string, planId: string) => {
    setIsProcessing(true);
    try {
      await renewMembershipMutation({ membershipId, planId });
      
      toast({
        title: "Успешно!",
        description: "Абонемент продлен",
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка продления:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось продлить абонемент",
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Отмена абонемента
  const cancelMembership = async (membershipId: string, reason?: string) => {
    setIsProcessing(true);
    try {
      await cancelMembershipMutation({ membershipId, reason });
      
      toast({
        title: "Абонемент отменен",
        description: "Ваш абонемент был успешно отменен",
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка отмены:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отменить абонемент",
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Заморозка абонемента
  const freezeMembership = async (membershipId: string, freezeDays: number) => {
    setIsProcessing(true);
    try {
      await freezeMembershipMutation({ membershipId, freezeDays });
      
      toast({
        title: "Абонемент заморожен",
        description: `Абонемент заморожен на ${freezeDays} дней`,
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка заморозки:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось заморозить абонемент",
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Разморозка абонемента
  const unfreezeMembership = async (membershipId: string) => {
    setIsProcessing(true);
    try {
      await unfreezeMembershipMutation({ membershipId });
      
      toast({
        title: "Абонемент разморожен",
        description: "Ваш абонемент снова активен",
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка разморозки:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось разморозить абонемент",
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    // Функции
    renewMembership,
    cancelMembership,
    freezeMembership,
    unfreezeMembership,
    
    // Состояния
    isProcessing,
  };
}