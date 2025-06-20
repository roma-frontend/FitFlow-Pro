"use client";

import { AnalyticsErrorBoundary } from "@/components/analytics/ErrorBoundary";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnalyticsErrorBoundary>
      <div className="space-y-6">
        {children}
      </div>
    </AnalyticsErrorBoundary>
  );
}
