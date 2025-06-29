"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";
import { faqs } from "./constants/FAQ";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FAQItem({ question, answer, isOpen, onToggle, index }: FAQItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // Обновляем высоту при изменении состояния
  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setHeight(isOpen ? scrollHeight : 0);
    }
  }, [isOpen]);

  // Обновляем высоту при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current && isOpen) {
        setHeight(contentRef.current.scrollHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  return (
    <Card className="border-2 rounded-2xl overflow-hidden bg-white/90 border-gray-200/60 hover:border-blue-300/60 transition-colors duration-300 ease-out">
      <CardContent className="p-0">
        <button
          onClick={onToggle}
          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <h3 className="font-semibold text-gray-900 pr-4 text-md sm:text-lg leading-relaxed">
            {question}
          </h3>

          <div
            className={combineAnimations(
              "flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 border border-gray-200",
              "flex items-center justify-center transition-all duration-300 ease-out",
              "hover:bg-blue-50 hover:border-blue-200",
              isOpen ? "rotate-180 bg-blue-50 border-blue-200" : "rotate-0"
            )}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-blue-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </button>

        {/* Контейнер с анимацией высоты */}
        <div
          className="overflow-hidden transition-all duration-400 ease-out"
          style={{
            height: `${height}px`,
          }}
        >
          <div ref={contentRef} className="px-6 pb-6">
            <div
              className={combineAnimations(
                "transition-all duration-300 ease-out",
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              )}
            >
              {/* Декоративная линия */}
              <div
                className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 transition-all duration-400 ease-out origin-left"
                style={{
                  transform: `scaleX(${isOpen ? 1 : 0})`,
                }}
              />
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {answer}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Обработчик переключения
  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  }, []);

  return (
    <div ref={sectionRef} className="mb-16 relative">
      {/* Упрощенные фоновые элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl" />
      </div>

      {/* Заголовок */}
      <div className="text-center mb-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
          <div
            className={combineAnimations(
              "w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
              "rounded-2xl flex items-center justify-center relative",
              "transform transition-all duration-700 ease-out will-change-transform",
              "hover:scale-110 hover:rotate-12",
              "shadow-xl shadow-violet-200/40"
            )}
          >
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Часто задаваемые вопросы
          </h2>
        </div>

        <div className="relative">
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Ответы на самые популярные вопросы наших клиентов
          </p>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
        </div>
      </div>

      {/* Список FAQ */}
      <div className="max-w-4xl mx-auto space-y-4 relative z-10">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
