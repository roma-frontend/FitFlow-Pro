import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Shield, Users, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AuthStatus } from "@/types/home"; // Используем type import

interface QuickActionsSectionProps {
  authStatus: AuthStatus | null;
  onDashboardRedirect: () => void;
}

export default function QuickActionsSection({ authStatus, onDashboardRedirect }: QuickActionsSectionProps) {
  const router = useRouter();

  return (
    <div className="mb-16">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-300 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-center justify-center text-2xl">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            Быстрые действия
          </CardTitle>
          <CardDescription className="text-center text-lg">
            {authStatus?.authenticated
              ? "Популярные действия для вашей роли"
              : "Популярные действия для участников клуба"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authStatus?.authenticated ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button
                onClick={onDashboardRedirect}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center bg-white hover:bg-blue-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
              >
                <Shield className="h-8 w-8 mb-2 text-blue-600" />
                <span className="text-base font-semibold">Мой дашборд</span>
              </Button>

              <Button
                onClick={() => router.push("/trainers")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center bg-white hover:bg-green-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
              >
                <Users className="h-8 w-8 mb-2 text-green-600" />
                <span className="text-base font-semibold">Тренеры</span>
              </Button>

              <Button
                onClick={() => router.push("/programs")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center bg-white hover:bg-purple-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
              >
                <Heart className="h-8 w-8 mb-2 text-purple-600" />
                <span className="text-base font-semibold">Программы</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button
                onClick={() => router.push("/trainers")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center bg-white hover:bg-green-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
              >
                <Users className="h-8 w-8 mb-2 text-green-600" />
                <span className="text-base font-semibold">Выбрать тренера</span>
              </Button>

              <Button
                onClick={() => router.push("/member-login")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center bg-white hover:bg-blue-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
              >
                <Calendar className="h-8 w-8 mb-2 text-blue-600" />
                <span className="text-base font-semibold">Мои тренировки</span>
              </Button>

              <Button
                onClick={() => router.push("/programs")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center bg-white hover:bg-purple-50 transition-all duration-300 hover:scale-105 rounded-xl border-2"
              >
                <Heart className="h-8 w-8 mb-2 text-purple-600" />
                <span className="text-base font-semibold">Групповые занятия</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
