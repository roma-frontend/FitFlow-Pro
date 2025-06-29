"use client";

import { useRouter } from "next/navigation";
import { AuthStatus } from "@/types/home";

export function useNavigation(authStatus: AuthStatus | null) {
  const router = useRouter();

  const handleDashboardRedirect = () => {
    if (authStatus?.dashboardUrl) {
      router.push(authStatus.dashboardUrl);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return {
    handleDashboardRedirect,
    navigateTo,
    router
  };
}
