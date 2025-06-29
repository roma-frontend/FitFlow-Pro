// components/ui/input.tsx - Исправленная версия
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'transparent';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Базовые стили - ВСЕГДА ВИДИМЫЕ
          "flex h-10 w-full rounded-md px-3 py-2 text-sm",
          "border border-input bg-background text-foreground",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-200",
          
          // Варианты
          variant === 'default' && [
            "bg-white border-gray-300 text-gray-900",
            "focus:border-blue-500 focus:ring-blue-500/20",
            "dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          ],
          
          variant === 'transparent' && [
            "transparent-input",
            "backdrop-blur-sm",
            "focus:bg-white/20 focus:border-white/40"
          ],
          
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
