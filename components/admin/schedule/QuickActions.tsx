// components/admin/schedule/QuickActions.tsx
import React, { memo } from "react";
import { OptimizedQuickActions } from "./OptimizedQuickActions";
import { ScheduleEvent } from "./types";

interface QuickActionsProps {
  events: ScheduleEvent[];
  stats: any;
  onBulkAction: (action: string, eventIds: string[]) => void;
}

const QuickActions = memo(function QuickActions(props: QuickActionsProps) {
  return <OptimizedQuickActions {...props} />;
});

export default QuickActions;
