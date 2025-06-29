import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Основной вариант - с магическими частицами
export default function SparklesButton({ isLogin }: { isLogin: boolean }) {
  const router = useRouter();
  
  return (
    <div className="text-center mb-8">
      <Button 
        className="
          w-20 h-20 mx-auto mb-4 rounded-3xl p-0
          bg-white/20 backdrop-blur-sm
          relative overflow-hidden
          transition-all duration-500 ease-out
          hover:bg-white/30 hover:scale-110
          hover:shadow-[0_0_40px_rgba(255,255,255,0.6)]
          group
        " 
        onClick={() => router.push("/")}
      >
        {/* Магические частицы */}
        <div className="absolute inset-0 rounded-3xl">
          <span className="
            absolute top-2 left-2 w-1 h-1 bg-white rounded-full
            opacity-0 group-hover:opacity-100
            group-hover:animate-sparkle-1
          " />
          <span className="
            absolute top-4 right-3 w-1.5 h-1.5 bg-blue-300 rounded-full
            opacity-0 group-hover:opacity-100
            group-hover:animate-sparkle-2
          " />
          <span className="
            absolute bottom-3 left-4 w-1 h-1 bg-purple-300 rounded-full
            opacity-0 group-hover:opacity-100
            group-hover:animate-sparkle-3
          " />
          <span className="
            absolute bottom-2 right-2 w-1.5 h-1.5 bg-pink-300 rounded-full
            opacity-0 group-hover:opacity-100
            group-hover:animate-sparkle-4
          " />
        </div>
        
        {/* Радужное свечение */}
        <div className="
          absolute inset-0 rounded-3xl opacity-0
          bg-gradient-to-tr from-blue-400/30 via-purple-400/30 to-pink-400/30
          group-hover:opacity-100 transition-opacity duration-700
          blur-xl group-hover:animate-pulse
        " />
        
        {/* Иконка с анимацией */}
        <Sparkles className="
          h-10 w-10 text-white relative z-10
          transition-all duration-500
          group-hover:text-white
          group-hover:rotate-[25deg] group-hover:scale-110
          group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,1)]
          group-hover:animate-sparkle-icon
        " />
      </Button>
      
      <h1 className="text-2xl font-bold text-white mb-2">
        FitFlow Pro
      </h1>
      <p className="text-blue-100 text-sm">
        {isLogin ? "С возвращением!" : "Добро пожаловать"}
      </p>
    </div>
  );
}

// Вариант 2: С вращающимися звездами
export function SparklesButtonV2({ isLogin }: { isLogin: boolean }) {
  const router = useRouter();
  
  return (
    <div className="text-center mb-8">
      <Button 
        className="
          w-20 h-20 mx-auto mb-4 rounded-3xl p-0
          bg-white/20 backdrop-blur-sm
          relative overflow-hidden
          transition-all duration-300 ease-out
          hover:bg-white/25
          group
        " 
        onClick={() => router.push("/")}
      >
        {/* Вращающиеся звезды вокруг */}
        <div className="
          absolute inset-0 rounded-3xl
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        ">
          <div className="absolute inset-2 animate-spin-slow">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-white text-xs">✦</span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-white text-xs">✦</span>
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-xs">✦</span>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-xs">✦</span>
          </div>
        </div>
        
        {/* Центральная иконка */}
        <Sparkles className="
          h-10 w-10 text-white relative z-10
          transition-all duration-300
          group-hover:scale-125
          group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]
        " />
      </Button>
      
      <h1 className="text-2xl font-bold text-white mb-2">
        FitFlow Pro
      </h1>
      <p className="text-blue-100 text-sm">
        {isLogin ? "С возвращением!" : "Добро пожаловать"}
      </p>
    </div>
  );
}

// Вариант 3: С эффектом северного сияния
export function SparklesButtonV3({ isLogin }: { isLogin: boolean }) {
  const router = useRouter();
  
  return (
    <div className="text-center mb-8">
      <Button 
        className="
          w-20 h-20 mx-auto mb-4 rounded-3xl p-0
          bg-white/20 backdrop-blur-sm
          relative overflow-hidden
          transition-all duration-500 ease-out
          hover:bg-white/30
          group
        " 
        onClick={() => router.push("/")}
      >
        {/* Эффект северного сияния */}
        <div className="
          absolute inset-0 rounded-3xl opacity-0
          group-hover:opacity-100 transition-opacity duration-500
          overflow-hidden
        ">
          <div className="
            absolute inset-0
            bg-gradient-to-t from-blue-500/20 via-green-500/20 to-purple-500/20
            animate-aurora
          " />
        </div>
        
        {/* Мерцающая иконка */}
        <Sparkles className="
          h-10 w-10 text-white relative z-10
          transition-all duration-300
          group-hover:animate-pulse
          group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,1)]
        " />
      </Button>
      
      <h1 className="text-2xl font-bold text-white mb-2">
        FitFlow Pro
      </h1>
      <p className="text-blue-100 text-sm">
        {isLogin ? "С возвращением!" : "Добро пожаловать"}
      </p>
    </div>
  );
}

// Вариант 4: С конфетти эффектом
export function SparklesButtonV4({ isLogin }: { isLogin: boolean }) {
  const router = useRouter();
  
  return (
    <div className="text-center mb-8">
      <Button 
        className="
          w-20 h-20 mx-auto mb-4 rounded-3xl p-0
          bg-white/20 backdrop-blur-sm
          relative overflow-hidden
          transition-all duration-300 ease-out
          hover:bg-white/30 hover:scale-105
          group
          before:absolute before:inset-0 before:rounded-3xl
          before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
          before:translate-y-[-200%] hover:before:translate-y-[200%]
          before:transition-transform before:duration-1000
          before:skew-y-12
        " 
        onClick={() => router.push("/")}
      >
        {/* Фейерверк частиц */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className={`
                absolute w-1 h-1 rounded-full
                opacity-0 group-hover:opacity-100
                ${i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-pink-400'}
                group-hover:animate-confetti-${i + 1}
              `}
              style={{
                left: `${20 + i * 10}%`,
                top: '50%',
              }}
            />
          ))}
        </div>
        
        <Sparkles className="
          h-10 w-10 text-white relative z-10
          transition-all duration-500
          group-hover:rotate-[360deg] group-hover:scale-110
          group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,1)]
        " />
      </Button>
      
      <h1 className="text-2xl font-bold text-white mb-2">
        FitFlow Pro
      </h1>
      <p className="text-blue-100 text-sm">
        {isLogin ? "С возвращением!" : "Добро пожаловать"}
      </p>
    </div>
  );
}