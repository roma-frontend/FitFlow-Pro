// components/ui/confirm-toast.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ConfirmToastOptions {
    title: string;
    description: string;
    confirmText: string;
    cancelText?: string;
    variant?: 'default' | 'destructive' | 'success';
    icon?: React.ReactNode;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
}

export function useConfirmToast() {
    const { toast, dismiss } = useToast();
    const [pendingToastId, setPendingToastId] = useState<string | null>(null);

    const showConfirmToast = ({
        title,
        description,
        confirmText,
        cancelText = "Отмена",
        variant = 'default',
        icon,
        onConfirm,
        onCancel
    }: ConfirmToastOptions) => {
        const toastId = Math.random().toString(36).substr(2, 9);
        setPendingToastId(toastId);

        const handleConfirm = async () => {
            dismiss(toastId);
            setPendingToastId(null);

            try {
                await onConfirm();
            } catch (error) {
                console.error("Ошибка при выполнении действия:", error);
            }
        };

        const handleCancel = () => {
            dismiss(toastId);
            setPendingToastId(null);
            if (onCancel) onCancel();
        };

        const getVariantStyles = () => {
            switch (variant) {
                case 'destructive':
                    return {
                        bgClass: "border-red-200 bg-red-50",
                        buttonClass: "bg-red-600 hover:bg-red-700 text-white",
                        iconColor: "text-red-600"
                    };
                case 'success':
                    return {
                        bgClass: "border-green-200 bg-green-50",
                        buttonClass: "bg-green-600 hover:bg-green-700 text-white",
                        iconColor: "text-green-600"
                    };
                default:
                    return {
                        bgClass: "border-blue-200 bg-blue-50",
                        buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
                        iconColor: "text-blue-600"
                    };
            }
        };

        const styles = getVariantStyles();

        toast({
            title: (
                <div className="flex items-center gap-2">
                    {icon && <span className={styles.iconColor}>{icon}</span>}
                    {title}
                </div>
            ) as any,
            description: (
                <div className="space-y-3">
                    <p className="text-sm text-gray-700">{description}</p>
                    <div className="flex gap-2 pt-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleConfirm}
                            className={`flex-1 ${styles.buttonClass}`}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            ) as any,
            duration: 10000,
            className: `${styles.bgClass} border-2`,
        });

        return toastId;
    };

    return { showConfirmToast, pendingToastId };
}
