// components/ui/button.tsx - Убеждаемся что кнопки видны
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Базовые стили - ВСЕГДА ВИДИМЫЕ
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600",
        destructive: "bg-red-600 text-white hover:bg-red-700 border border-red-600",
        
        // 🔥 НОВЫЕ СОВРЕМЕННЫЕ ВАРИАНТЫ
        
        // Умный деструктивный с градиентом и анимацией
        destructiveSmart: [
          "bg-gradient-to-r from-red-500 via-red-600 to-red-700", 
          "text-white font-semibold",
          "border border-red-400",
          "hover:from-red-600 hover:via-red-700 hover:to-red-800",
          "hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/25",
          "active:scale-[0.98]",
          "focus:ring-red-500/50",
          "transition-all duration-200 ease-out"
        ],
        
        // Неоновый деструктивный (киберпанк стиль)
        destructiveNeon: [
          "bg-gradient-to-r from-pink-600 via-red-600 to-orange-600",
          "text-white font-bold tracking-wide",
          "border border-pink-400 shadow-lg shadow-pink-500/25",
          "hover:from-pink-500 hover:via-red-500 hover:to-orange-500",
          "hover:shadow-xl hover:shadow-pink-500/40 hover:scale-105",
          "active:scale-95",
          "focus:ring-pink-500/50",
          "transition-all duration-300 ease-out",
          // Неоновый эффект
          "relative overflow-hidden",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
          "before:translate-x-[-100%] hover:before:translate-x-[100%]",
          "before:transition-transform before:duration-700"
        ],
        
        // Глассморфизм деструктивный
        destructiveGlass: [
          "bg-red-500/80 backdrop-blur-sm",
          "text-white font-medium",
          "border border-red-300/50 shadow-lg",
          "hover:bg-red-600/90 hover:border-red-400/60",
          "hover:shadow-xl hover:shadow-red-500/20",
          "active:bg-red-700/80",
          "focus:ring-red-500/30",
          "transition-all duration-200"
        ],
        
        // Минималистичный умный деструктивный
        destructiveMinimal: [
          "bg-red-50 text-red-700 border border-red-200",
          "hover:bg-red-100 hover:text-red-800 hover:border-red-300",
          "hover:shadow-md hover:shadow-red-100",
          "active:bg-red-200",
          "focus:ring-red-500/30",
          "dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
          "dark:hover:bg-red-900/60 dark:hover:text-red-200",
          "transition-all duration-200"
        ],
        
        // 3D эффект деструктивный
        destructive3D: [
          "bg-gradient-to-b from-red-500 to-red-600",
          "text-white font-semibold",
          "border-t border-red-400 border-x border-red-600 border-b-2 border-b-red-800",
          "shadow-lg shadow-red-600/30",
          "hover:from-red-600 hover:to-red-700",
          "hover:border-b-red-900 hover:shadow-xl hover:shadow-red-600/40",
          "hover:translate-y-[-1px]",
          "active:translate-y-0 active:shadow-md active:border-b active:border-b-red-700",
          "transition-all duration-150"
        ],
        
        // Голографический эффект
        destructiveHolo: [
          "bg-gradient-to-r from-red-600 via-pink-600 to-red-600",
          "bg-size-200 animate-gradient-x",
          "text-white font-bold",
          "border border-red-400 shadow-lg",
          "hover:shadow-xl hover:shadow-red-500/30 hover:scale-105",
          "focus:ring-red-500/50",
          "transition-all duration-300"
        ],
        
        // Пульсирующий предупреждающий
        destructivePulse: [
          "bg-red-600 text-white font-semibold",
          "border border-red-500 shadow-lg",
          "hover:bg-red-700 hover:shadow-xl",
          "focus:ring-red-500/50",
          "animate-pulse hover:animate-none",
          "transition-all duration-200"
        ],
        
        outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
        ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
        gradientLightBlue:
          "bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 text-blue-800 hover:from-blue-200 hover:via-blue-300 hover:to-blue-200 border border-blue-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
