// components/about/timeline/modal/ModalContent.tsx
"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { ModalHeader } from "./ModalHeader";
import { ModalImage } from "./ModalImage";
import { ModalText } from "./ModalText";
import { LoadingOverlay } from "./LoadingOverlay";
import { TimelineEvent } from "../hooks/useTimelineData";

interface ModalContentProps {
  event: TimelineEvent;
  eventIndex: number;
  totalEvents: number;
  direction: 'next' | 'prev' | null;
  isTransitioning: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onEventChange: (index: number, direction: 'next' | 'prev') => void;
  allEvents: TimelineEvent[];
}

export const ModalContent = memo<ModalContentProps>((props) => {
  const {
    event,
    eventIndex,
    totalEvents,
    direction,
    isTransitioning,
    onClose,
    onNext,
    onPrev,
    onEventChange,
    allEvents
  } = props;

  return (
    <motion.div
      className="relative w-full max-w-6xl mx-2 sm:mx-4 my-2 sm:my-4 md:my-8 max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] overflow-hidden bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl modal-content"
      onClick={(e) => e.stopPropagation()}
      style={{ 
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        backgroundColor: '#ffffff' // Принудительно белый фон
      }}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.98, 
        y: -10,
        transition: {
          duration: 0.25,
          ease: "easeInOut"
        }
      }}
    >
      {/* Header with controls */}
      <ModalHeader
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
        isTransitioning={isTransitioning}
      />

      <div className="flex flex-col lg:flex-row h-full relative">
        {/* Image Section */}
        <ModalImage
          event={event}
          eventIndex={eventIndex}
          direction={direction}
          isTransitioning={isTransitioning}
        />

        {/* Text Content */}
        <ModalText
          event={event}
          eventIndex={eventIndex}
          totalEvents={totalEvents}
          direction={direction}
          onNext={onNext}
          onPrev={onPrev}
          onEventChange={onEventChange}
          allEvents={allEvents}
          isTransitioning={isTransitioning}
        />
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isTransitioning} />
    </motion.div>
  );
});

ModalContent.displayName = 'ModalContent';
