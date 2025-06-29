// components/trainer/header/TrainerAvatar.tsx (обновленная версия)
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TrainerAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10", 
  lg: "h-12 w-12"
};

export default function TrainerAvatar({ 
  name, 
  imageUrl, 
  size = "md", 
  className = "" 
}: TrainerAvatarProps) {
  const getInitials = (name?: string): string => {
    if (!name) return "T";
    
    const words = name.split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name || "Тренер"} />}
      <AvatarFallback className="bg-blue-500 text-white font-medium">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
