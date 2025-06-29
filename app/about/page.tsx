// app/about/page.tsx - СЕРВЕРНЫЙ компонент
import { Metadata } from "next";
import { AboutPageClient } from "@/components/about/AboutPageClient";

// 🚀 Серверные метаданные
export const metadata: Metadata = {
  title: "О нас - FitFlow-Pros",
  description: "Узнайте больше о FitFlow-Pros - современном фитнес-центре с профессиональными тренерами и передовым оборудованием.",
  keywords: "о нас, фитнес-центр, команда, миссия, ценности, тренеры",
  openGraph: {
    title: "О нас - FitFlow-Pros",
    description: "Узнайте больше о FitFlow-Pros - современном фитнес-центре",
    type: "website",
    siteName: "FitFlow-Pros",
  },
  twitter: {
    card: "summary_large_image",
    title: "О нас - FitFlow-Pros",
    description: "Узнайте больше о FitFlow-Pros - современном фитнес-центре",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// 🚀 Серверный компонент страницы
export default function AboutPage() {
  return <AboutPageClient />;
}
