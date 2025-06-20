"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginCardsSection() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
      <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">Для участников</h3>
          <p className="text-gray-600 mb-6 text-lg">
            Доступ к тренировкам, расписанию и покупкам
          </p>
          <Button
            onClick={() => router.push("/member-login")}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 rounded-xl py-3"
          >
            Войти как участник
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">Для персонала</h3>
          <p className="text-gray-600 mb-6 text-lg">
            Управление залом, клиентами и расписанием
          </p>
          <Button
            onClick={() => router.push("/staff-login")}
            variant="outline"
            className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300 hover:scale-105 rounded-xl py-3"
          >
            Войти как персонал
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
