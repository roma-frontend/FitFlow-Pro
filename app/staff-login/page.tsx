// app/staff-login/page.tsx
import { Suspense } from "react";
import StaffLoginContent from "./StaffLoginContent";
import { GoogleAuthHandler } from "@/components/auth/GoogleAuthHandler";

// Минимальный скелетон для staff
function StaffMinimalSkeleton() {
  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 lg:bg-gradient-to-br lg:from-blue-50 lg:via-white lg:to-indigo-50" />
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<StaffMinimalSkeleton />}>
      <GoogleAuthHandler />
      <StaffLoginContent />
    </Suspense>
  );
}