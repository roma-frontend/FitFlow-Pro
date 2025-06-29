import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, Shield } from "lucide-react";

export function MembershipBenefits({ features }: { features: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Ваши преимущества
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}