"use client";

import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  error: string;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
      <span className="text-sm text-red-700">{error}</span>
    </div>
  );
}
