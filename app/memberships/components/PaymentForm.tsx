"use client";
import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Lock, CreditCard, ArrowLeft, Sparkles } from "lucide-react";
import { useMembershipPayment } from "@/hooks/useMembershipPayment";

export function PaymentForm({
  plan,
  onSuccess,
  onCancel,
}: {
  plan: any;
  onSuccess: (membershipId: string) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { toast } = useToast();
  const { purchaseMembership, isProcessing } = useMembershipPayment();

  const [customerData, setCustomerData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [autoRenew, setAutoRenew] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !user) {
      toast({ variant: "destructive", title: "Ошибка", description: "Ошибка инициализации платежной системы" });
      return;
    }
    if (!customerData.name || !customerData.email) {
      toast({ variant: "destructive", title: "Ошибка", description: "Пожалуйста, заполните все обязательные поля" });
      return;
    }
    try {
      const result = await purchaseMembership(stripe, elements, {
        planId: plan._id,
        userId: user.id,
        userEmail: customerData.email,
        userName: customerData.name,
        userPhone: customerData.phone,
        autoRenew,
      });
      if (result.success && result.membershipId) onSuccess(result.membershipId);
    } catch (error) {
      console.error("Ошибка покупки:", error);
    }
  };

  const finalPrice = plan.discount ? Math.round(plan.price * (100 - plan.discount) / 100) : plan.price;

  return (
    <div className="max-w-lg mx-auto rounded-2xl shadow-2xl overflow-hidden bg-white/90 backdrop-blur-lg animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-6 flex items-center gap-4 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Button>
        <div className="flex items-center gap-3 mx-auto">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Оплата абонемента</h2>
            <p className="text-sm text-indigo-100">Безопасная оплата через Stripe</p>
          </div>
        </div>
      </div>
      {/* Plan Info */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 via-white to-indigo-50">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${plan.color}`}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{plan.name}</div>
            <div className="text-xs text-gray-500">{plan.duration === 365 ? "Годовой план" : "Месячный план"}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-700">{finalPrice.toLocaleString()} ₽</div>
          {plan.discount && (
            <div className="text-xs text-gray-400 line-through">{plan.price.toLocaleString()} ₽</div>
          )}
        </div>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Имя и фамилия *</Label>
            <Input
              id="name"
              value={customerData.name}
              onChange={e => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
              required
              autoComplete="name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={customerData.email}
              onChange={e => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              value={customerData.phone}
              onChange={e => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
              autoComplete="tel"
            />
          </div>
        </div>
        <div>
          <Label>Данные карты *</Label>
          <div className="mt-1 p-3 border rounded-lg bg-gray-50">
            <CardElement options={{ style: { base: { fontSize: "16px", color: "#222", "::placeholder": { color: "#aab7c4" } } } }} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="autoRenew" checked={autoRenew} onCheckedChange={checked => setAutoRenew(!!checked)} />
          <Label htmlFor="autoRenew" className="text-sm mb-0">Включить автопродление</Label>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isProcessing}>
            Отмена
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg text-white"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Обработка...
              </>
            ) : (
              <>Оплатить {finalPrice.toLocaleString()} ₽</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}