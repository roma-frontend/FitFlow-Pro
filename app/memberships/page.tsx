// app/memberships/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMemberships, useMembershipManagement } from "@/hooks/useMemberships";
import { MembershipDebug } from "@/components/MembershipDebug";
import { PaymentForm } from "./components/PaymentForm";
import { CurrentMembershipCard } from "./components/CurrentMembershipCard";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, ArrowLeft, Gift, Info, Loader2, ChevronRight, Shield, TrendingUp, Sparkles, CreditCard } from "lucide-react";
import { membershipPlanTemplates } from "./constants/membershipPlanTemplates";
import { MembershipBenefits } from "./components/MembershipBenefits";
import { CancelMembershipModal } from "./components/CancelMembershipModal";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function MembershipsPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // Добавляем состояние для модального окна
  const [showCancelModal, setShowCancelModal] = useState(false);

  const {
    currentMembership: fetchedMembership,
    plans,
    isLoading,
    isLoadingMembership,
    isLoadingPlans,
    error,
    refetch
  } = useMemberships(user?.id);

  const [currentMembership, setCurrentMembership] = useState(fetchedMembership);

  useEffect(() => {
    setCurrentMembership(fetchedMembership);
  }, [fetchedMembership]);

  const {
    renewMembership,
    cancelMembership,
    isRenewing,
    isCancelling
  } = useMembershipManagement();

  const isExpiringSoon = currentMembership?.remainingDays !== undefined
    ? currentMembership.remainingDays <= 7 && currentMembership.remainingDays > 0
    : false;
  const isActionProcessing = isRenewing || isCancelling;
  const isPaymentProcessing = false;

  const [selectedTab, setSelectedTab] = useState("current");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Обновляем логику переключения табов
  useEffect(() => {
    if (!isLoadingMembership) {
      if (currentMembership) {
        setSelectedTab("current");
      } else {
        setSelectedTab("available");
      }
    }
  }, [currentMembership, isLoadingMembership]);

  const handlePurchase = async (planId: string) => {
    if (!user?.id) {
      toast({ variant: "destructive", title: "Ошибка", description: "Необходимо войти в систему" });
      return;
    }
    const plan = plans.find(p => p._id === planId);
    if (!plan) {
      toast({ variant: "destructive", title: "Ошибка", description: "План не найден" });
      return;
    }
    const planTemplate = membershipPlanTemplates.find(t => t.type === plan.type);
    const enrichedPlan = { ...plan, ...planTemplate };
    setSelectedPlan(enrichedPlan);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async (membershipId: string) => {
    setShowPaymentForm(false);
    setSelectedPlan(null);

    setTimeout(async () => {
      await refetch();
      setSelectedTab("current");
    }, 500);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handleRenew = async () => {
    if (!currentMembership) return;
    try {
      const currentPlan = plans.find(p => p.type === currentMembership.type);
      if (!currentPlan) throw new Error("План абонемента не найден");

      const success = await renewMembership(currentMembership._id, currentPlan._id);
      if (success) {
        // Добавляем задержку для корректного обновления
        setTimeout(async () => {
          await refetch();
        }, 500);
      }
    } catch (error) {
      console.error("Ошибка продления:", error);
    }
  };

  const handleCancelClick = () => {
    console.log("🔴 Открываем модальное окно отмены");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!currentMembership) return;

    try {
      await cancelMembership(currentMembership._id);
      setShowCancelModal(false);

      toast({
        title: "Успешно",
        description: "Абонемент успешно отменен"
      });

      const result = await refetch();
      console.log("🔍 После отмены, результат refetch:", result);
      console.log("🔍 fetchedMembership после отмены:", fetchedMembership);

      setTimeout(() => {
        setSelectedTab("available");
      }, 500);

    } catch (error) {
      setShowCancelModal(false);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось отменить абонемент"
      });
    }
  };

  const getCurrentPlanTemplate = (type: string) => {
    return membershipPlanTemplates.find(template => template.type === type);
  };

  const getDaysLeftColor = (days: number) => {
    if (days > 14) return "text-green-600";
    if (days > 7) return "text-yellow-600";
    return "text-red-600";
  };

  const getDaysLeftMessage = (days: number) => {
    if (days > 14) return "Абонемент активен";
    if (days > 7) return "Скоро истекает";
    if (days > 0) return "Срочно продлите!";
    return "Абонемент истек";
  };

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    if (error) {
      toast({ variant: "destructive", title: "Ошибка", description: error });
    }
  }, [error, toast]);

  // Добавляем логирование для отладки
  useEffect(() => {
    console.log("🔍 Состояние компонента:", {
      currentMembership,
      isLoadingMembership,
      selectedTab,
      showCancelModal
    });
  }, [currentMembership, isLoadingMembership, selectedTab, showCancelModal]);

  if (isLoading || isLoadingMembership) {
    return (
      <div className="min-h-[100lvh] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка абонементов...</p>
        </div>
      </div>
    );
  }

  if (showPaymentForm && selectedPlan) {
    return (
      <div className="min-h-[100lvh] bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

          <div className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <button
                  onClick={handleBack}
                  className="group p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                  aria-label="Назад"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </button>

                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>

                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm bg-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Оплата абонемента</h1>
                  <p className="text-sm text-gray-600">Безопасная оплата через Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </header >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PaymentForm
            plan={selectedPlan}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={handleBack}
                className="group p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                aria-label="Назад"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>

              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>

                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm bg-green-400" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Абонементы</h1>
                <p className="hidden md:inline-block text-sm text-gray-600">Выберите подходящий тарифный план</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <Gift className="h-3 w-3 mr-1" />
                Скидка для новых клиентов
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {process.env.NODE_ENV === "development" && (
          <MembershipDebug
            plans={plans}
            isLoadingPlans={isLoadingPlans}
            error={error || null}
          />
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="current" className="data-[state=active]:bg-gradient-to-r from-blue-500 to-indigo-500 data-[state=active]:text-white">
              <ChevronRight className="h-4 w-4 mr-2" />
              Текущий абонемент
            </TabsTrigger>
            <TabsTrigger value="available" className="data-[state=active]:bg-gradient-to-r from-blue-500 to-indigo-500 data-[state=active]:text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              Доступные планы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {currentMembership ? (
              <>
                <CurrentMembershipCard
                  membership={currentMembership}
                  planTemplate={getCurrentPlanTemplate(currentMembership.type)}
                  onRenew={handleRenew}
                  onUpgrade={() => setSelectedTab("available")}
                  onCancel={handleCancelClick}
                  isExpiringSoon={isExpiringSoon}
                  isActionProcessing={isActionProcessing}
                  getDaysLeftColor={getDaysLeftColor}
                  getDaysLeftMessage={getDaysLeftMessage}
                />
                <MembershipBenefits features={getCurrentPlanTemplate(currentMembership.type)?.features || []} />
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    У вас нет активного абонемента
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Выберите подходящий план и начните тренировки уже сегодня!
                  </p>
                  <Button onClick={() => setSelectedTab("available")}>
                    Выбрать абонемент
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Специальное предложение!</strong> При покупке годового абонемента скидка 25% + подарочный набор для тренировок.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {membershipPlanTemplates.map(plan => {
                const Icon = plan.icon;
                const isCurrentPlan = currentMembership?.type === plan.type;
                const dbPlan = plans.find(p => p.type === plan.type);
                const finalPrice = plan.discount
                  ? Math.round(plan.price * (100 - plan.discount) / 100)
                  : plan.price;
                return (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${plan.popular ? "ring-2 ring-blue-500" : ""}`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                        Популярный
                      </div>
                    )}
                    {plan.discount && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-3 py-1 rounded-br-lg">
                        -{plan.discount}%
                      </div>
                    )}
                    <div className={`h-2 bg-gradient-to-r ${plan.color}`} />
                    <CardHeader className="text-center pb-2">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold">{finalPrice.toLocaleString()}</span>
                          <span className="text-gray-600">₽</span>
                        </div>
                        {plan.discount && (
                          <p className="text-sm text-gray-500 line-through">
                            {plan.price.toLocaleString()} ₽
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          {plan.duration === 365 ? "в год" : "в месяц"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                        {plan.features.length > 4 && (
                          <p className="text-sm text-blue-600 font-medium">
                            + еще {plan.features.length - 4} преимуществ
                          </p>
                        )}
                      </div>
                      {plan.limitations && (
                        <div className="space-y-2 pt-2 border-t">
                          {plan.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                              <span className="text-sm text-gray-500">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        className={`w-full ${isCurrentPlan
                          ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                          : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                          }`}
                        disabled={isCurrentPlan || !dbPlan || isPaymentProcessing}
                        onClick={() => dbPlan && handlePurchase(dbPlan._id)}
                      >
                        {isPaymentProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Обработка...
                          </>
                        ) : isCurrentPlan ? (
                          "Текущий план"
                        ) : (
                          <>
                            Выбрать план
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Часто задаваемые вопросы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Можно ли заморозить абонемент?</h4>
                  <p className="text-sm text-gray-600">
                    Да, вы можете заморозить абонемент на срок до 30 дней для годовых планов и до 7 дней для месячных.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Как работает автопродление?</h4>
                  <p className="text-sm text-gray-600">
                    При включенном автопродлении оплата списывается автоматически за день до окончания текущего периода.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Можно ли вернуть деньги?</h4>
                  <p className="text-sm text-gray-600">
                    Возврат возможен в течение 14 дней с момента покупки при условии неиспользования абонемента.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Модальное окно отмены */}
        <CancelMembershipModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
          isProcessing={isCancelling}
          membershipName={getCurrentPlanTemplate(currentMembership?.type || "")?.name || ""}
          remainingDays={currentMembership?.remainingDays || 0}
        />
      </div>
    </div>
  );
}

export default function MembershipsPage() {
  return (
    <Elements stripe={stripePromise}>
      <MembershipsPageContent />
    </Elements>
  );
}