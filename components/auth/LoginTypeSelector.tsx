// components/auth/LoginTypeSelectorV2.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  ChevronDown,
  Sparkles,
  Shield
} from "lucide-react";
import {  combineAnimations } from "@/utils/animations";

interface LoginOption {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
  badge?: string;
  badgeIcon?: React.ComponentType<{ className?: string }>;
}

const loginOptions: LoginOption[] = [
  {
    href: "/member-login",
    title: "Участники клуба",
    description: "Для членов фитнес-клуба",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-500/20",
    badge: "Популярно"
  },
  {
    href: "/staff-login",
    title: "Персонал",
    description: "Для сотрудников и тренеров",
    icon: Briefcase,
    gradient: "from-purple-500 to-pink-500",
    iconBg: "bg-purple-500/20",
    badge: "Secure",
    badgeIcon: Shield
  }
];

export default function LoginTypeSelectorV2({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const buttonClasses = variant === "mobile" 
    ? "text-white hover:bg-white/20 hover:text-white transition-colors text-xs sm:text-sm px-2 sm:px-3"
    : "text-white hover:bg-white/20 hover:text-white transition-colors text-xs sm:text-sm px-2 sm:px-3";

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className={combineAnimations(
          buttonClasses,
          "bg-blue-500/30 border-2 border-blue-500/50 flex items-center gap-1.5 group"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Вход</span>
        <ChevronDown 
          className={combineAnimations(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop для мобильных */}
          {variant === "mobile" && (
            <div 
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
          )}
          
          <div className={combineAnimations(
            "absolute -right-1/2 mt-2 z-50",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            variant === "mobile" ? "w-[calc(100vw-2rem)] max-w-sm" : "min-w-[340px]"
          )}>
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header - более компактный */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white" />
                  <div className="text-white">
                    <h3 className="font-medium text-sm">Выберите тип входа</h3>
                    <p className="text-[11px] text-blue-100">Для участников или персонала</p>
                  </div>
                </div>
              </div>

              {/* Options - более компактные */}
              <div className="p-2">
                {loginOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Link
                      key={option.href}
                      href={option.href}
                      onClick={() => setIsOpen(false)}
                      className={combineAnimations(
                        "block p-3 rounded-lg",
                        "hover:bg-gray-50",
                        "transform transition-all duration-200",
                        "hover:scale-[1.01] active:scale-[0.99]",
                        "group relative"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Иконка - меньше */}
                        <div className={combineAnimations(
                          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                          option.iconBg
                        )}>
                          <Icon className="h-4 w-4 text-gray-700" />
                        </div>
                        
                        {/* Текст */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {option.title}
                            </h4>
                            {option.badge && (
                              <span className={combineAnimations(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full",
                                "bg-gradient-to-r text-white",
                                option.gradient
                              )}>
                                {option.badgeIcon && <option.badgeIcon className="h-2.5 w-2.5" />}
                                {option.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {option.description}
                          </p>
                        </div>

                        {/* Стрелка */}
                        <ChevronDown className="h-4 w-4 text-gray-400 -rotate-90 transform transition-transform group-hover:translate-x-1 flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}

                {/* Разделитель */}
                <div className="my-2 border-t border-gray-100" />

                {/* Ссылка на регистрацию */}
                <div className="py-2 px-4">
                  <p className="text-xs text-gray-500">
                    Нет аккаунта?{" "}
                    <Link 
                      href="/register" 
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      onClick={() => setIsOpen(false)}
                    >
                      Зарегистрироваться
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}