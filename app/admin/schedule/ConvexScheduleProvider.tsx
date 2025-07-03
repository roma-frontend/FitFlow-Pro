// app/admin/schedule/ConvexScheduleProvider.tsx
"use client";

import { ConvexProvider } from "convex/react";
import { ConvexHttpClient } from "convex/browser";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function ConvexScheduleProvider({ children }: { children: ReactNode }) {
  if (!convexUrl) {
    console.error("NEXT_PUBLIC_CONVEX_URL is not set");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Convex configuration error</p>
          <p className="text-sm text-gray-600">Please set NEXT_PUBLIC_CONVEX_URL in your environment</p>
        </div>
      </div>
    );
  }

  const client = new ConvexHttpClient(convexUrl);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}