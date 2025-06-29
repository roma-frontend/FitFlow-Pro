import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";

export function MembershipPlanCard({ plan, isCurrent, onPurchase, disabled }: any) {
  const Icon = plan.icon;
  const finalPrice = plan.discount ? Math.round(plan.price * (100 - plan.discount) / 100) : plan.price;
  return (
    <Card className={`relative overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 ${plan.popular ? "ring-2 ring-blue-500" : ""}`}>
      {plan.popular && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg">Популярный</div>}
      {plan.discount && <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-3 py-1 rounded-br-lg">-{plan.discount}%</div>}
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
          {plan.discount && <p className="text-sm text-gray-500 line-through">{plan.price.toLocaleString()} ₽</p>}
          <p className="text-sm text-gray-600 mt-1">{plan.duration === 365 ? "в год" : "в месяц"}</p>
        </div>
        <div className="space-y-2">
          {plan.features.slice(0, 4).map((feature: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
          {plan.features.length > 4 && (
            <p className="text-sm text-blue-600 font-medium">+ еще {plan.features.length - 4} преимуществ</p>
          )}
        </div>
        {plan.limitations && (
          <div className="space-y-2 pt-2 border-t">
            {plan.limitations.map((lim: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-500">{lim}</span>
              </div>
            ))}
          </div>
        )}
        <Button
          className={`w-full ${isCurrent ? "bg-gray-200 text-gray-600 cursor-not-allowed" : `bg-gradient-to-r ${plan.color} hover:opacity-90`}`}
          disabled={isCurrent || disabled}
          onClick={onPurchase}
        >
          {isCurrent ? "Текущий план" : <>Выбрать план <ChevronRight className="h-4 w-4 ml-1" /></>}
        </Button>
      </CardContent>
    </Card>
  );
}