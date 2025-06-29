"use client";

import { HelpCircle } from "lucide-react";

interface PersonalizedTooltipsProps {
  userRole: string;
}

export function PersonalizedTooltips({ userRole }: PersonalizedTooltipsProps) {
  if (userRole !== 'trainer') return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-start gap-2">
          <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-blue-900 mb-1">Совет тренера</div>
            <div className="text-blue-700">
              Не забудьте обновить программы тренировок для ваших клиентов
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
