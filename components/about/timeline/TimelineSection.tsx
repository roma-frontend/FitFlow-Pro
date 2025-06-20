// components/about/timeline/TimelineSection.tsx
"use client";

import { memo } from "react";
import { TimelineItem } from "./TimelineItem";
import { TimelineConnector } from "./TimelineConnector";
import { TimelineEvent } from "./hooks/useTimelineData";

interface TimelineSectionProps {
  events: TimelineEvent[];
  isInView: boolean;
  onEventClick: (index: number) => void;
}

export const TimelineSection = memo<TimelineSectionProps>(({ 
  events, 
  isInView, 
  onEventClick 
}) => {
  return (
    <div className="relative">
      {/* Central line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 hidden lg:block"></div>

      <div className="space-y-16">
        {events.map((event, index) => (
          <div
            key={event.year}
            className={`flex items-center gap-8 ${
              index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
            } flex-col lg:gap-16`}
          >
            {/* Content Card */}
            <TimelineItem
              event={event}
              index={index}
              isInView={isInView}
              onClick={() => onEventClick(index)}
            />
            
            {/* Timeline connector */}
            <TimelineConnector event={event} />
            
            {/* Image */}
            <TimelineItem
              event={event}
              index={index}
              isInView={isInView}
              onClick={() => onEventClick(index)}
              isImageVariant
            />
          </div>
        ))}
      </div>
    </div>
  );
});

TimelineSection.displayName = 'TimelineSection';
