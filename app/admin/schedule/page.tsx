"use client";

import React, { memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { ConvexScheduleProvider } from "./ConvexScheduleProvider";

// Dynamic import of the actual page content
const SchedulePageContent = dynamic(
  () => import("./SchedulePageContent"),
  {
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function SchedulePage() {
  return (
    <ConvexScheduleProvider>
      <SchedulePageContent />
    </ConvexScheduleProvider>
  );
}