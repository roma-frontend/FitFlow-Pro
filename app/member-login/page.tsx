// app/member-login/page.tsx
import { Suspense } from 'react';
import MemberLoginContent from "./MemberLoginContent";

export default function MemberLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 animate-pulse" />}>
      <MemberLoginContent />
    </Suspense>
  );
}