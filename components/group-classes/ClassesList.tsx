// components/group-classes/ClassesList.tsx
"use client";

import { memo } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import ClassCard from "./ClassCard";
import { EmptyState } from "./EmptyState";
import { GroupClass } from "./types";

interface ClassesListProps {
  classes: GroupClass[];
  selectedDate: Date;
  onEnroll: (classId: string) => void;
  onCancel: (classId: string) => void;
  enrolling: string | null;
  isUserEnrolled: (classItem: GroupClass) => boolean;
  isUserOnWaitlist: (classItem: GroupClass) => boolean;
  onSelectToday: () => void;
}

const ClassesList = memo(({
  classes,
  selectedDate,
  onEnroll,
  onCancel,
  enrolling,
  isUserEnrolled,
  isUserOnWaitlist,
  onSelectToday,
}: ClassesListProps) => {
  return (
    <div className="lg:col-span-3">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Занятия на{" "}
          {format(selectedDate, "dd MMMM yyyy", { locale: ru })}
        </h2>
        <p className="text-gray-600">
          {classes.length} занятий доступно
        </p>
      </div>

      {classes.length > 0 ? (
        <div className="space-y-4">
          {classes.map((classItem) => (
            <ClassCard
              key={classItem._id}
              classItem={classItem}
              onEnroll={() => onEnroll(classItem._id)}
              onCancel={() => onCancel(classItem._id)}
              isEnrolling={enrolling === classItem._id}
              isUserEnrolled={isUserEnrolled(classItem)}
              isUserOnWaitlist={isUserOnWaitlist(classItem)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onSelectToday={onSelectToday} />
      )}
    </div>
  );
});

ClassesList.displayName = "ClassesList";

export default ClassesList;
