// components/messages/MessageHeader.tsx
"use client";

import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Phone, Video, Search, Wifi, WifiOff } from 'lucide-react';

export interface MessageHeaderProps {
  /** Имя пользователя или название чата */
  title: string;
  /** Статус пользователя (онлайн, был в сети и т.д.) */
  subtitle?: string;
  /** URL аватара */
  avatarUrl?: string;
  /** Онлайн ли пользователь */
  isOnline?: boolean;
  /** Показывать ли кнопку "Назад" */
  showBackButton?: boolean;
  /** Показывать ли кнопки действий (звонок, видео и т.д.) */
  showActions?: boolean;
  /** Обработчик нажатия на кнопку "Назад" */
  onBack?: () => void;
  /** Обработчик нажатия на аватар/заголовок */
  onTitleClick?: () => void;
  /** Обработчик нажатия на кнопку звонка */
  onCall?: () => void;
  /** Обработчик нажатия на кнопку видеозвонка */
  onVideoCall?: () => void;
  /** Обработчик нажатия на кнопку поиска */
  onSearch?: () => void;
  /** Обработчик нажатия на кнопку меню */
  onMenu?: () => void;
}

export function MessageHeader({
  title,
  subtitle,
  avatarUrl,
  isOnline = false,
  showBackButton = true,
  showActions = true,
  onBack,
  onTitleClick,
  onCall,
  onVideoCall,
  onSearch,
  onMenu
}: MessageHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm">
      {/* Декоративная линия */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Левая часть */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Кнопка назад с анимацией */}
            {showBackButton && (
              <button
                onClick={onBack}
                className="group p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 sm:hidden transform hover:scale-105 active:scale-95"
                aria-label="Назад"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
            )}

            {/* Аватар с онлайн статусом */}
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={title}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover cursor-pointer ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105"
                  onClick={onTitleClick}
                />
              ) : (
                <div 
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center cursor-pointer ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105"
                  onClick={onTitleClick}
                >
                  <span className="text-sm sm:text-base font-bold text-white">
                    {title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Индикатор онлайн статуса */}
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${
                isOnline 
                  ? 'bg-green-400 animate-pulse' 
                  : 'bg-gray-300'
              }`} />
            </div>

            {/* Информация о чате с анимацией */}
            <div 
              className="min-w-0 flex-1 cursor-pointer group"
              onClick={onTitleClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate transition-all duration-300 ${
                isHovered ? 'from-blue-600 to-purple-600' : ''
              }`}>
                {title}
              </h1>
              {subtitle && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isOnline ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-gray-400" />
                  )}
                  <p className="text-sm text-gray-500 truncate">
                    {subtitle}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Правая часть - действия с крутыми эффектами */}
          {showActions && (
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Кнопка поиска */}
              {onSearch && (
                <button
                  onClick={onSearch}
                  className="group p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 hidden sm:block transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Поиск"
                >
                  <Search className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </button>
              )}

              {/* Кнопка звонка */}
              {onCall && (
                <button
                  onClick={onCall}
                  className="group p-2.5 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Позвонить"
                >
                  <Phone className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                </button>
              )}

              {/* Кнопка видеозвонка */}
              {onVideoCall && (
                <button
                  onClick={onVideoCall}
                  className="group p-2.5 hover:bg-purple-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Видеозвонок"
                >
                  <Video className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                </button>
              )}

              {/* Кнопка меню */}
              {onMenu && (
                <button
                  onClick={onMenu}
                  className="group p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Меню"
                >
                  <MoreVertical className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
