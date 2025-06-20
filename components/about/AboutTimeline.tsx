// components/about/AboutTimeline.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { TimelineSection } from "./timeline/TimelineSection";
import { TimelineModal } from "./timeline/TimelineModal";
import { FutureVisionCard } from "./timeline/FutureVisionCard";
import { useTimelineData } from "./timeline/hooks/useTimelineData";

export function AboutTimeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const { timelineEvents } = useTimelineData();

  const openModal = useCallback((index: number) => {
    setSelectedEvent(index);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setSelectedEvent(null);
    document.body.style.overflow = 'unset';
  }, []);

  return (
    <>
      <section className="py-24 bg-gradient-to-br from-white to-gray-50">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Наша история успеха
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              От небольшого зала до ведущего фитнес-центра города — путь длиной в 8 лет
            </p>
          </motion.div>

          {/* Timeline */}
          <TimelineSection 
            events={timelineEvents}
            isInView={isInView}
            onEventClick={openModal}
          />

          {/* Future Vision */}
          <FutureVisionCard isInView={isInView} />
        </div>
      </section>

      {/* Modal */}
      <TimelineModal
        selectedEvent={selectedEvent}
        events={timelineEvents}
        onClose={closeModal}
        onEventChange={setSelectedEvent}
      />
    </>
  );
}
