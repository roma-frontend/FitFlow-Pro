"use client";

import { ConvexProvider } from "convex/react";
import { ReactNode } from "react";

// Попробуем разные импорты в зависимости от версии
let ConvexClient: any;
try {
  // Для новых версий
  ConvexClient = require("convex/browser").ConvexClient;
} catch {
  try {
    // Для старых версий
    ConvexClient = require("convex/react").ConvexReactClient;
  } catch {
    throw new Error("Не удалось импортировать Convex клиент");
  }
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL не установлен");
}

const convex = new ConvexClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
