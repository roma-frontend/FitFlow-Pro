// app/admin/users/components/tabs/HierarchyTab.tsx
"use client";

import React from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MobileHierarchyTab } from "./MobileHierarchyTab";
import { TabletHierarchyTab } from "./TabletHierarchyTab";
import { DesktopHierarchyTab } from "./DesktopHierarchyTab";

export const HierarchyTab = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1280px)");

  if (isMobile) return <MobileHierarchyTab />;
  if (isTablet) return <TabletHierarchyTab />;
  return <DesktopHierarchyTab />;
};