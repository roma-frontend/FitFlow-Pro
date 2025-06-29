// components/about/timeline/TimelineModal.tsx
"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { memo, useCallback, useState, useRef } from "react";
import { ModalBackdrop } from "./modal/ModalBackdrop";
import { ModalContent } from "./modal/ModalContent";
import { TimelineEvent } from "./hooks/useTimelineData";
import { useOptimizedAnimation } from "./hooks/useOptimizedAnimation";
import { useImagePreloader } from "./hooks/useImagePreloader";

interface TimelineModalProps {
  selectedEvent: number | null;
  events: TimelineEvent[];
  onClose: () => void;
  onEventChange: (index: number) => void;
}

export const TimelineModal = memo<TimelineModalProps>(({
  selectedEvent,
  events,
  onClose,
  onEventChange
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const { getOptimizedDuration } = useOptimizedAnimation();
  const { preloadAdjacentImages, isImagePreloaded } = useImagePreloader(events, selectedEvent);
  // Исправляем типизацию useRef
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const changeEvent = useCallback(async (newIndex: number, dir: 'next' | 'prev') => {
    if (isTransitioning || newIndex === selectedEvent) return;
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    setIsTransitioning(true);
    setDirection(dir);
    
    const targetImage = events[newIndex].image;
    if (!isImagePreloaded(targetImage)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    onEventChange(newIndex);
    preloadAdjacentImages(newIndex);
    
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
      setDirection(null);
    }, getOptimizedDuration(250));
    
  }, [selectedEvent, isTransitioning, getOptimizedDuration, onEventChange, events, isImagePreloaded, preloadAdjacentImages]);

  const nextEvent = useCallback(() => {
    if (selectedEvent !== null) {
      const newIndex = (selectedEvent + 1) % events.length;
      changeEvent(newIndex, 'next');
    }
  }, [selectedEvent, events.length, changeEvent]);

  const prevEvent = useCallback(() => {
    if (selectedEvent !== null) {
      const newIndex = (selectedEvent - 1 + events.length) % events.length;
      changeEvent(newIndex, 'prev');
    }
  }, [selectedEvent, events.length, changeEvent]);

  React.useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  if (selectedEvent === null) return null;

  return (
    <AnimatePresence mode="wait">
      <ModalBackdrop onClose={onClose}>
        <ModalContent
          event={events[selectedEvent]}
          eventIndex={selectedEvent}
          totalEvents={events.length}
          direction={direction}
          isTransitioning={isTransitioning}
          onClose={onClose}
          onNext={nextEvent}
          onPrev={prevEvent}
          onEventChange={changeEvent}
          allEvents={events}
        />
      </ModalBackdrop>
    </AnimatePresence>
  );
});

TimelineModal.displayName = 'TimelineModal';
