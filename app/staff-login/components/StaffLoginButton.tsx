import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Вариант 1: С пульсацией и свечением
export function ShieldButtonV1() {
  const router = useRouter();
  
  return (
    <div className="text-center mb-8">
      <Button 
        className="
          w-20 h-20 mx-auto mb-4 rounded-3xl p-0
          bg-white/20 backdrop-blur-sm
          relative overflow-hidden
          transition-all duration-300 ease-out
          hover:bg-white/30 hover:scale-110
          hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]
          group
        " 
        onClick={() => router.push("/")}
      >
        {/* Пульсирующий эффект */}
        <div className="absolute inset-0 rounded-3xl bg-white/20 animate-ping" />
        
        {/* Градиентное свечение при hover */}
        <div className="
          absolute inset-0 rounded-3xl opacity-0
          bg-gradient-to-r from-blue-400/40 via-purple-400/40 to-blue-400/40
          group-hover:opacity-100 transition-opacity duration-500
          blur-xl
        " />
        
        {/* Иконка */}
        <Shield className="
          h-10 w-10 text-white relative z-10
          transition-all duration-300
          group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]
          group-hover:rotate-12
        " />
      </Button>
      
      <h1 className="text-2xl font-bold text-white mb-2">
        Staff Portal
      </h1>
      <p className="text-blue-100 text-sm">
        Панель управления FitFlow Pro
      </p>
    </div>
  );
}

// Вариант 2: С вращающимся бордером
export function ShieldButtonV2() {
  const router = useRouter();
  
  return (
    <div className="text-center mb-8">
      <div className="relative w-20 h-20 mx-auto mb-4">
        {/* Вращающийся градиентный бордер */}
        <div className="
          absolute inset-0 rounded-3xl
          bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
          animate-spin-slow opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        " />
        
        <Button 
          className="
            absolute inset-[2px] w-[calc(100%-4px)] h-[calc(100%-4px)]
            bg-white/20 backdrop-blur-sm rounded-3xl p-0
            transition-all duration-300 ease-out
            hover:bg-white/30 hover:scale-105
            group flex items-center justify-center
          " 
          onClick={() => router.push("/")}
        >
          <Shield className="
            h-10 w-10 text-white
            transition-all duration-300
            group-hover:scale-110
            group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]
          " />
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2">
        Staff Portal
      </h1>
      <p className="text-blue-100 text-sm">
        Панель управления FitFlow Pro
      </p>
    </div>
  );
}

// Вариант 3: С ripple эффектом
export function ShieldButtonV3() {
  const router = useRouter();
  
  return (
    <div className="text-center mb-8">
      <Button 
        className="
          w-20 h-20 mx-auto mb-4 rounded-3xl p-0
          bg-white/20 backdrop-blur-sm
          relative overflow-hidden
          transition-all duration-500 ease-out
          hover:bg-white/25
          group
        " 
        onClick={() => router.push("/")}
      >
        {/* Ripple эффект */}
        <span className="
          absolute inset-0 rounded-3xl
          before:absolute before:inset-0 before:rounded-3xl
          before:bg-white/30 before:scale-0
          group-hover:before:scale-100
          before:transition-transform before:duration-500
        " />
        
        {/* Внутреннее свечение */}
        <span className="
          absolute inset-0 rounded-3xl
          bg-gradient-radial from-white/20 to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        " />
        
        {/* Иконка с 3D эффектом */}
        <Shield className="
          h-10 w-10 text-white relative z-10
          transition-all duration-300
          group-hover:text-white
          group-hover:transform group-hover:translateZ-10
          group-hover:drop-shadow-[0_5px_15px_rgba(255,255,255,0.7)]
        " />
      </Button>
      
      <h1 className="text-2xl font-bold text-white mb-2">
        Staff Portal
      </h1>
      <p className="text-blue-100 text-sm">
        Панель управления FitFlow Pro
      </p>
    </div>
  );
}

// Основной компонент (используйте тот вариант, который больше нравится)
export default function ShieldButton() {
  const router = useRouter();
  
  return (
    <div className="text-center mb-8">
      <Button 
        className="
          w-20 h-20 mx-auto mb-4 rounded-3xl p-0
          bg-white/20 backdrop-blur-sm
          relative overflow-hidden
          transition-all duration-300 ease-out
          hover:bg-white/30 hover:scale-110
          hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]
          group
          before:absolute before:inset-0 before:rounded-3xl
          before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
          before:translate-x-[-200%] hover:before:translate-x-[200%]
          before:transition-transform before:duration-700
        " 
        onClick={() => router.push("/")}
      >
        <Shield className="
          h-10 w-10 text-white relative z-10
          transition-all duration-300
          group-hover:rotate-12 group-hover:scale-110
          group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]
        " />
      </Button>
      
      <h1 className="text-2xl font-bold text-white mb-2">
        Staff Portal
      </h1>
      <p className="text-blue-100 text-sm">
        Панель управления FitFlow Pro
      </p>
    </div>
  );
}