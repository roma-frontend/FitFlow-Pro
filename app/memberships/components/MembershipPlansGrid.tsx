import { MembershipPlanCard } from "./MembershipPlanCard";

export function MembershipPlansGrid({ plans, currentType, onPurchase, disabled }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan: any) => (
        <MembershipPlanCard
          key={plan.id}
          plan={plan}
          isCurrent={currentType === plan.type}
          onPurchase={() => onPurchase(plan)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}