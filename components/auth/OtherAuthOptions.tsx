"use client";

import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { GoogleLoginButton } from './GoogleLoginButton';
import { Eye } from 'lucide-react';

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
          <GoogleLoginButton isStaff={false} disabled={loading} className='rounded-lg text-sm'/>

          <Button
          variant="outline"
            onClick={() => router.push("/auth/face-auth")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="h-5 w-5" />
            <span className="font-medium">Face ID вход</span>
          </Button>
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
