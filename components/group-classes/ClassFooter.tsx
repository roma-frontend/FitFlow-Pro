// components/group-classes/ClassFooter.tsx
import { Badge } from "@/components/ui/badge";
import { GroupClass } from "./types";

interface ClassFooterProps {
  classItem: GroupClass;
  getActionButton: () => React.ReactNode;
}

export const ClassFooter = ({ classItem, getActionButton }: ClassFooterProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {classItem.waitlist && classItem.waitlist.length > 0 && (
          <p className="text-sm text-gray-600">
            В ожидании: {classItem.waitlist.length}
          </p>
        )}

        {classItem.isRecurring && (
          <Badge variant="outline" className="text-xs">
            Регулярное занятие
          </Badge>
        )}
      </div>

      {getActionButton()}
    </div>
  );
};
