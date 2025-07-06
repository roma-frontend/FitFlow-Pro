// app/admin/profile/page.tsx

"use client"

import dynamic from 'next/dynamic';

const AdminProfilePageClient = dynamic(
  () => import('./AdminProfilePage'),
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
  return <AdminProfilePageClient />;
}