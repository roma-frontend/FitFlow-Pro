// app/admin/users/components/UsersPageTabs.tsx
"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, Zap, Sparkles } from "lucide-react";
import { UsersTab } from './tabs/UsersTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { ActionsTab } from './tabs/ActionsTab';
import { HierarchyTab } from './tabs/HierarchyTab';

export const UsersPageTabs = React.memo(() => {
  return (
    <Tabs defaultValue="users" className="space-y-8">
      {/* Tab Navigation */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
        <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2">
          <TabsTrigger 
            value="users" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Пользователи</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Аналитика</span>
          </TabsTrigger>
          <TabsTrigger 
            value="actions" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Действия</span>
          </TabsTrigger>
          <TabsTrigger 
            value="hierarchy" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Роли</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab Content */}
      <TabsContent value="users" className="space-y-8">
        <UsersTab />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-8">
        <AnalyticsTab />
      </TabsContent>

      <TabsContent value="actions" className="space-y-8">
        <ActionsTab />
      </TabsContent>

      <TabsContent value="hierarchy" className="space-y-8">
        <HierarchyTab />
      </TabsContent>
    </Tabs>
  );
});

UsersPageTabs.displayName = 'UsersPageTabs';
