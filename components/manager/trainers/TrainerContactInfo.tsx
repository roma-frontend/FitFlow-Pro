// components/manager/trainers/TrainerContactInfo.tsx
"use client";

import { Mail, Phone } from "lucide-react";

interface TrainerContactInfoProps {
  email: string;
  phone: string;
}

export default function TrainerContactInfo({ email, phone }: TrainerContactInfoProps) {
  return (
    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        <span className="truncate">{email}</span>
      </div>
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        <span>{phone}</span>
      </div>
    </div>
  );
}
