// hooks/useMembershipPayment.ts
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PaymentData {
    planId: string;
    userId: string;
    userEmail: string;
    userName: string;
    userPhone?: string;
    autoRenew?: boolean;
}

interface PaymentResult {
    clientSecret: string;
    paymentIntentId: string;
    membershipOrderId: string;
    plan: {
        id: string;
        name: string;
        price: number;
        duration: number;
    };
}

interface ConfirmResult {
    success: boolean;
    receipt: any;
    membership: any;
    order: any;
}

export function useMembershipPayment() {
    const [isCreatingPayment, setIsCreatingPayment] = useState(false);
    const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Создание платежного намерения
    const createPaymentIntent = async (data: PaymentData): Promise<PaymentResult> => {
        setIsCreatingPayment(true);
        setError(null);

        try {
            console.log('🚀 Creating payment intent for membership:', data);

            const response = await fetch('/api/memberships/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    id: data.planId,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Ошибка создания платежа');
            }

            console.log('✅ Payment intent created:', result);
            return result;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка создания платежа';
            setError(errorMessage);

            toast({
                variant: "destructive",
                title: "Ошибка создания платежа",
                description: errorMessage,
            });

            throw err;
        } finally {
            setIsCreatingPayment(false);
        }
    };

    // Подтверждение платежа
    const confirmPayment = async (
        paymentIntentId: string,
        membershipOrderId: string
    ): Promise<ConfirmResult> => {
        setIsConfirmingPayment(true);
        setError(null);

        try {
            console.log('🔄 Confirming membership payment:', { paymentIntentId, membershipOrderId });

            const response = await fetch('/api/memberships/confirm-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentIntentId,
                    membershipOrderId
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Ошибка подтверждения платежа');
            }

            console.log('✅ Payment confirmed:', result);

            toast({
                title: "Поздравляем!",
                description: "Абонемент успешно приобретен",
            });

            return result;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка подтверждения платежа';
            setError(errorMessage);

            toast({
                variant: "destructive",
                title: "Ошибка подтверждения платежа",
                description: errorMessage,
            });

            throw err;
        } finally {
            setIsConfirmingPayment(false);
        }
    };

    // Полный процесс покупки абонемента
    const purchaseMembership = async (
        stripe: any,
        elements: any,
        paymentData: PaymentData
    ): Promise<{ success: boolean; membershipId?: string }> => {
        try {
            // 1. Создаем PaymentIntent
            const paymentResult = await createPaymentIntent(paymentData);

            // 2. Получаем элемент карты
            const cardElement = elements.getElement('card');
            if (!cardElement) {
                throw new Error('Элемент карты не найден');
            }

            // 3. Подтверждаем платеж в Stripe
            const { error: stripeError } = await stripe.confirmCardPayment(
                paymentResult.clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: paymentData.userName,
                            email: paymentData.userEmail,
                            phone: paymentData.userPhone,
                        },
                    },
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            // 4. Подтверждаем платеж на сервере
            const confirmResult = await confirmPayment(
                paymentResult.paymentIntentId,
                paymentResult.membershipOrderId
            );

            return {
                success: true,
                membershipId: confirmResult.membership._id
            };

        } catch (err) {
            console.error('❌ Purchase failed:', err);
            return { success: false };
        }
    };

    return {
        createPaymentIntent,
        confirmPayment,
        purchaseMembership,
        isCreatingPayment,
        isConfirmingPayment,
        isProcessing: isCreatingPayment || isConfirmingPayment,
        error,
        clearError: () => setError(null),
    };
}

