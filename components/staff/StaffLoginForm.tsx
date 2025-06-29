"use client";

import { memo } from 'react';
import { SmartForm } from "@/components/SmartForm";

interface StaffLoginFormProps {
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
}

export const StaffLoginForm = memo(function StaffLoginForm({
  onSubmit,
  isLoading
}: StaffLoginFormProps) {
  return (
    <SmartForm
      type="staff-login"
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  );
});
