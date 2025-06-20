// Обновленные утилиты для анимаций с will-change
export const ANIMATION_CLASSES = {
  hover: {
    scale: "hover:scale-105",
    scaleSmall: "hover:scale-[1.02]",
    translateY: "hover:-translate-y-2",
    translateYSmall: "hover:-translate-y-1",
    shadow: "hover:shadow-xl",
    shadowLarge: "hover:shadow-2xl",
    rotate: "hover:rotate-6",
    rotateSmall: "hover:rotate-3",
  },
  transition: {
    all: "transition-all duration-300",
    allSlow: "transition-all duration-500",
    allFast: "transition-all duration-200",
    transform: "transition-transform duration-300",
    transformSlow: "transition-transform duration-500",
    colors: "transition-colors duration-300",
    opacity: "transition-opacity duration-300",
    smooth: "transition-all duration-700 ease-out",
  },
  willChange: {
    transform: "will-change-transform",
    opacity: "will-change-opacity",
    auto: "will-change-auto",
    scroll: "will-change-scroll-position",
  },
  gradient: {
    blue: "from-blue-600 to-indigo-600",
    green: "from-green-600 to-emerald-600",
    purple: "from-purple-600 to-pink-600",
    orange: "from-orange-600 to-red-600",
    rainbow: "from-blue-500 via-purple-600 to-pink-500",
  },
  animation: {
    fadeInUp: "animate-fade-in-up",
    bounce: "animate-bounce",
    pulse: "animate-pulse",
    spin: "animate-spin",
  }
} as const;

export const combineAnimations = (...classes: string[]) => {
  return classes.join(" ");
};
