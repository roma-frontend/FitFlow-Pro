// app/member-login/page.tsx
import { Suspense } from "react";
import MemberLoginContent from "./MemberLoginContent";

export default function MemberLoginPage() {
  return (
    <Suspense>
      <MemberLoginContent />
    </Suspense>
  );
}