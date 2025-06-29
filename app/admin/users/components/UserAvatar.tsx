// app/admin/users/components/UserAvatar.tsx
"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  photoUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const fallbackSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export const UserAvatar = React.memo<UserAvatarProps>(({ 
  photoUrl, 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {photoUrl && photoUrl.trim() ? (
        <AvatarImage src={photoUrl} alt={name} />
      ) : null}
      <AvatarFallback className={`bg-gradient-to-br from-blue-500 to-purple-600 text-white ${fallbackSizeClasses[size]}`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
});

UserAvatar.displayName = 'UserAvatar';
