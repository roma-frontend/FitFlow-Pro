// app/group-classes/page.tsx (обновленный основной файл)
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/group-classes/PageHeader";
import CalendarSidebar from "@/components/group-classes/CalendarSidebar";
import ClassesList from "@/components/group-classes/ClassesList";
import { LoadingSpinner } from "@/components/group-classes/LoadingSpinner";
import { useGroupClasses } from "@/hooks/useGroupClasses";
import { useUserEnrollment } from "@/hooks/useUserEnrollment";

export default function GroupClassesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const {
    loading,
    enrolling,
    enrollInClass,
    cancelEnrollment,
    getFilteredClasses,
  } = useGroupClasses();

  // Здесь должен быть userId из контекста аутентификации
  const userId = undefined; // Заменить на реальный userId
  const { isUserEnrolled, isUserOnWaitlist } = useUserEnrollment(userId);

  const filteredClasses = getFilteredClasses(selectedDate);

  const handleBack = () => {
    window.history.back();
  };

  const handleSelectToday = () => {
    setSelectedDate(new Date());
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader onBack={handleBack} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <CalendarSidebar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          <ClassesList
            classes={filteredClasses}
            selectedDate={selectedDate}
            onEnroll={enrollInClass}
            onCancel={cancelEnrollment}
            enrolling={enrolling}
            isUserEnrolled={isUserEnrolled}
            isUserOnWaitlist={isUserOnWaitlist}
            onSelectToday={handleSelectToday}
          />
        </div>
      </div>
    </div>
  );
}
