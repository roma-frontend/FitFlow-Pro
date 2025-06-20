"use client";

import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

interface OtherAuthOptionsProps {
  loading: boolean;
}

export const OtherAuthOptions = memo(function OtherAuthOptions({ loading }: OtherAuthOptionsProps) {
  const router = useRouter()
  return (
    <div className="pt-6 border-t border-gray-200">
      <div className="text-center space-y-3">
        <p className="text-xs text-gray-500">Другие варианты входа</p>
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => (router.push("/staff-login"))}
            className="w-full h-10"
            disabled={loading}
          >
            🛡️ Вход для персонала
          </Button>
          <Button
            variant="ghost"
            onClick={() => (router.push("/"))}
            className="w-full h-8 text-xs"
            disabled={loading}
          >
            ← На главную страницу
          </Button>
        </div>
      </div>
    </div>
  );
});
