// components/member/MemberHeader.tsx
"use client";

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { User } from '@/types/user';
import { useNavigation, useNotifications } from './header/hooks';
import { navigationItems } from './header/config/navigationItems';
import { 
  Navigation,
  QuickActions,
  NotificationsDropdown,
  UserProfileDropdown,
  MobileMenu
} from './header/components';
import { Logo } from '../MainHeader';
import { useAuth } from '@/hooks/useAuth';

interface MemberHeaderProps {
  user?: User;
  onLogout?: () => void;
}

export function MemberHeader({ user, onLogout }: MemberHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { handleNavigation } = useNavigation();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { logout } = useAuth()

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const openMobileMenu = () => setMobileMenuOpen(true);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-gradient-to-r from-blue-500 to-indigo-500 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-blue-600/95 supports-[backdrop-filter]:via-blue-600/95 supports-[backdrop-filter]:to-indigo-500/95">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <Navigation 
              items={navigationItems} 
              onNavigation={handleNavigation} 
            />

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Quick Actions */}
              <QuickActions onNavigation={handleNavigation} />

              {/* Notifications */}
              <div className="hidden sm:block relative">
                <NotificationsDropdown
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onNavigation={handleNavigation}
                />
              </div>

              {/* User Profile */}
              <div>
                <UserProfileDropdown
                  user={user}
                  onNavigation={handleNavigation}
                  onLogout={onLogout || logout}
                />
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/20 hover:text-white p-2 h-9 w-9 rounded-lg transition-all"
                onClick={openMobileMenu}
                aria-label="Открыть меню"
              >
                <Menu className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        navigationItems={navigationItems}
        user={user}
        onNavigation={handleNavigation}
        onLogout={onLogout || logout}
      />
    </>
  );
}
