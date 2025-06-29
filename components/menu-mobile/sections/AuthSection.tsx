// components/mobile-menu/sections/AuthSection.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  ChevronRight,
  Sparkles,
  Shield,
  LogIn
} from "lucide-react";
import { combineAnimations } from "@/utils/animations";

interface AuthSectionProps {
  onLogin: () => void;
  onRegister: () => void;
  onClose: () => void;
}

export default function AuthSection({ onLogin, onRegister, onClose }: AuthSectionProps) {
  const router = useRouter();

  return (
    <div className="mb-6">
      {/* Заголовок секции */}
      <div className="flex items-center gap-2 text-white/90 mb-4">
        <LogIn className="h-4 w-4" />
        <span className="text-sm font-medium">Вход в систему</span>
      </div>

      <div className="space-y-3">
        {/* Кнопка для участников */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => {
            onClose();
            router.push("/member-login");
          }}
          className={combineAnimations(
            "w-full relative overflow-hidden",
            "bg-white/10 backdrop-blur-sm",
            "border border-white/20",
            "rounded-2xl p-4",
            "group hover:bg-white/15",
            "transform transition-all duration-300",
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Иконка */}
            <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-white" />
            </div>

            {/* Текст */}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-medium text-sm">Участники</h4>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-white/20 text-white rounded-full">
                  Популярно
                </span>
              </div>
              <p className="text-white/60 text-xs mt-0.5">
                Для членов фитнес-клуба
              </p>
            </div>

            {/* Стрелка */}
            <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/60 transform transition-all group-hover:translate-x-1" />
          </div>
        </motion.button>

        {/* Кнопка для персонала */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => {
            onClose();
            router.push("/staff-login");
          }}
          className={combineAnimations(
            "w-full relative overflow-hidden",
            "bg-white/10 backdrop-blur-sm",
            "border border-white/20",
            "rounded-2xl p-4",
            "group hover:bg-white/15",
            "transform transition-all duration-300",
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Иконка */}
            <div className="w-10 h-10 bg-purple-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-5 w-5 text-white" />
            </div>

            {/* Текст */}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-medium text-sm">Персонал</h4>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-white/20 text-white rounded-full flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  Secure
                </span>
              </div>
              <p className="text-white/60 text-xs mt-0.5">
                Для сотрудников и тренеров
              </p>
            </div>

            {/* Стрелка */}
            <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/60 transform transition-all group-hover:translate-x-1" />
          </div>
        </motion.button>

        {/* Разделитель "или" */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-transparent text-white/40 text-xs">
              или
            </span>
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10, rotateX: -30 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          onClick={() => {
            onClose();
            router.push("/register");
          }}
          className={combineAnimations(
            "w-full relative",
            "rounded-2xl p-4",
            "group perspective-1000",
            "transform-gpu transition-all duration-300",
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.7) 0%, rgba(139, 92, 246, 0.7) 50%, rgba(236, 72, 153, 0.7) 100%)',
            boxShadow: '0 10px 40px -10px rgba(99, 102, 241, 0.5), inset 0 -2px 10px rgba(255, 255, 255, 0.3)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative flex items-center justify-center gap-2.5">
            <Sparkles className="h-5 w-5 text-white drop-shadow-lg animate-[spin_3s_linear_infinite]" />
            <span className="text-white tracking-wide text-base drop-shadow-lg">
              Создать новый аккаунт
            </span>
          </div>

          {/* 3D тень */}
          <div className="absolute -bottom-4 left-4 right-4 h-8 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-xl rounded-full transform-gpu transition-all duration-300 group-hover:bottom-[-20px] group-hover:blur-2xl" />
        </motion.button>
      </div>
    </div>
  );
}