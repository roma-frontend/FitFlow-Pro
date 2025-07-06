// app/manager/profile/page.tsx
"use client"

import dynamic from 'next/dynamic';

const ProfilePageClient = dynamic(
  () => import('./ProfilePageClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-[100lvh] bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }
);

export default function ProfilePage() {
  return <ProfilePageClient />;
}