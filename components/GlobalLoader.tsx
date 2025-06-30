"use client";

import { useLoaderStore } from "@/stores/loaderStore";
import StaffLoginLoader from "@/app/staff-login/components/StaffLoginLoader";
import StaffLogoutLoader from "@/app/staff-login/components/StaffLogoutLoader";

export function GlobalLoader() {
  const { loaderType, loaderProps } = useLoaderStore();
  
  console.log('🔄 GlobalLoader состояние:', { loaderType, loaderProps }); // ✅ Отладка
  
  if (!loaderType) return null;
  
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(255,255,255,0.96)"
    }}>
      {loaderType === "login" && loaderProps && (
        <StaffLoginLoader {...loaderProps} />
      )}
      {loaderType === "logout" && loaderProps && (
        <StaffLogoutLoader {...loaderProps} />
      )}
    </div>
  );
}