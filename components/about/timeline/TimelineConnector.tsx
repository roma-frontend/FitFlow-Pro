// components/about/timeline/TimelineConnector.tsx
"use client";

import { memo } from "react";
import { TimelineEvent } from "./hooks/useTimelineData";

interface TimelineConnectorProps {
  event: TimelineEvent;
}

export const TimelineConnector = memo<TimelineConnectorProps>(({ event }) => {
  return (
    <div className="flex flex-col items-center lg:block">
      <div className={`w-6 h-6 bg-gradient-to-r ${event.yearGradient} rounded-full shadow-lg border-4 border-white relative z-10 timeline-dot`}>
        <div className="absolute inset-1 bg-white rounded-full opacity-30"></div>
      </div>
    </div>
  );
});

TimelineConnector.displayName = 'TimelineConnector';
