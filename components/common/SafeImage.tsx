"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  fallbackText?: string;
  priority?: boolean;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  sizes,
  fallbackText,
  priority = false,
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Если нет src или произошла ошибка, показываем fallback
  if (!src || imageError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <div className="text-center p-2">
          {fallbackText ? (
            <div className="text-xs font-medium break-words">
              {fallbackText}
            </div>
          ) : (
            <div className="text-2xl">📦</div>
          )}
        </div>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onError: () => {
      console.log('❌ Image failed to load:', src);
      setImageError(true);
      setIsLoading(false);
    },
    onLoad: () => {
      console.log('✅ Image loaded successfully:', src);
      setIsLoading(false);
    },
    priority,
    ...(sizes && { sizes }),
  };

  if (fill) {
    return (
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Загрузка...</div>
          </div>
        )}
        <Image
          {...imageProps}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400 text-xs">Загрузка...</div>
        </div>
      )}
      <Image
        {...imageProps}
        width={width}
        height={height}
      />
    </div>
  );
}
