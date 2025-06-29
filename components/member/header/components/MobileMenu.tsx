// components/member/header/components/MobileMenu.tsx
"use client";

import React from 'react';
import { X, Menu, Plus, QrCode, User, Settings, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NavigationItem, MobileMenuProps } from '../types';

export function MobileMenu({
  isOpen,
  onClose,
  navigationItems,
  user,
  onNavigation,
  onLogout
}: MobileMenuProps) {
  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() 
    : 'JD';

  const handleNavigation = (href: string) => {
    onNavigation(href);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-out ${
      isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{ zIndex: 50 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Menu className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Меню</h2>
              <p className="text-xs text-gray-600">FitFlow Pro</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 h-8 w-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Navigation Items */}
          <nav className="flex-1 py-4">
            <div className="space-y-1 px-4">
              {navigationItems.filter(item => item.visible).map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.href}
                    className={`transform transition-all duration-300 ease-out ${
                      isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                    }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left p-4 h-auto rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                      onClick={() => handleNavigation(item.href)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-green-200 transition-all duration-200">
                          <IconComponent className="h-5 w-5 text-gray-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900 block">
                            {item.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            Перейти в раздел
                          </span>
                        </div>
                        {item.badge && (
                          <Badge 
                            className={`text-xs px-2 py-1 ${
                              item.badgeColor || 'bg-orange-500 text-white'
                            }`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 px-4">
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-900 mb-3">Быстрые действия</p>
                <div className="space-y-2">
                  <div
                    className={`transform transition-all duration-300 ease-out ${
                      isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isOpen ? `${(navigationItems.length + 1) * 50}ms` : '0ms'
                    }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left p-4 h-auto rounded-xl border-blue-200 hover:bg-blue-50 transition-all duration-200"
                      onClick={() => handleNavigation('/booking')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Plus className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-blue-700">Записаться на тренировку</span>
                      </div>
                    </Button>
                  </div>
                  
                  <div
                    className={`transform transition-all duration-300 ease-out ${
                      isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isOpen ? `${(navigationItems.length + 2) * 50}ms` : '0ms'
                    }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left p-4 h-auto rounded-xl border-green-200 hover:bg-green-50 transition-all duration-200"
                      onClick={() => handleNavigation('/qr-code')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <QrCode className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium text-green-700">Показать QR-код</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
