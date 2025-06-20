// components/Footer.tsx - обновленная версия
"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Dumbbell,
  Users,
  Calendar,
  ShoppingCart,
  ArrowUp,
  Send,
  Sparkles,
  Globe,
  Shield,
  Award,
  Zap,
  Star,
  ChevronUp,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PWAStatus } from "./PWAStatus";
import { PWAInstallButton } from "./PWAInstallButton";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Кнопка "Наверх" */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        >
          <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
      )}

      {/* 🎨 ФУТЕР НА ПОЛНУЮ ШИРИНУ */}
      <footer className="relative w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
        </div>

        {/* Основной контент */}
        <div className="relative z-10">
          {/* 🌟 ВЕРХНЯЯ СЕКЦИЯ С ПОДПИСКОЙ */}
          <div className="border-b border-gray-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <div className="flex flex-col md:flex-row items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 animate-pulse">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Оставайтесь в форме с нами!
                    </h3>
                    <p className="text-gray-300 text-lg">
                      Получайте эксклюзивные советы и новости о фитнесе
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Input
                        type="email"
                        placeholder="Ваш email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 h-12 rounded-xl backdrop-blur-sm transition-all duration-300 focus:bg-white/20"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {isSubscribed ? (
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                          Спасибо!
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Подписаться
                        </div>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Анимированная статистика */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="text-3xl font-bold text-blue-400 mb-2 group-hover:text-blue-300 transition-colors">
                      1000+
                    </div>
                    <div className="text-gray-300 text-sm">
                      Довольных клиентов
                    </div>
                  </div>
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="text-3xl font-bold text-green-400 mb-2 group-hover:text-green-300 transition-colors">
                      50+
                    </div>
                    <div className="text-gray-300 text-sm">
                      Профессиональных тренеров
                    </div>
                  </div>
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="text-3xl font-bold text-purple-400 mb-2 group-hover:text-purple-300 transition-colors">
                      24/7
                    </div>
                    <div className="text-gray-300 text-sm">
                      Поддержка клиентов
                    </div>
                  </div>
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="text-3xl font-bold text-yellow-400 mb-2 group-hover:text-yellow-300 transition-colors flex items-center justify-center gap-1">
                      5<Star className="h-6 w-6 fill-current" />
                    </div>
                    <div className="text-gray-300 text-sm">Средний рейтинг</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📋 ОСНОВНАЯ ИНФОРМАЦИОННАЯ СЕКЦИЯ */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* О компании */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Dumbbell className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold">FitFlow Pro</h4>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Современная система управления фитнес-центром с биометрическим
                  доступом, AI-аналитикой и интегрированным магазином.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                    <Shield className="h-3 w-3 mr-1" />
                    Безопасно
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 transition-colors">
                    <Zap className="h-3 w-3 mr-1" />
                    Быстро
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                    <Star className="h-3 w-3 mr-1" />
                    Надежно
                  </Badge>
                </div>
              </div>

              {/* Быстрые ссылки */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  Быстрые ссылки
                </h4>
                <nav className="space-y-3">
                  {[
                    { name: "Тренеры", href: "/trainers", icon: Users },
                    { name: "Программы", href: "/programs", icon: Heart },
                    { name: "Расписание", href: "/schedule", icon: Calendar },
                    { name: "Магазин", href: "/shop", icon: ShoppingCart },
                    { name: "О нас", href: "/about", icon: Award },
                    { name: "Контакты", href: "/contacts", icon: Phone },
                  ].map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 group hover:translate-x-2"
                    >
                      <link.icon className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                      <span className="group-hover:underline">{link.name}</span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Контакты */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-400" />
                  Контакты
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 group hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mt-1 group-hover:bg-green-500/30 transition-colors">
                      <Phone className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        +7 (999) 123-45-67
                      </div>
                      <div className="text-gray-400 text-sm">Круглосуточно</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mt-1 group-hover:bg-blue-500/30 transition-colors">
                      <Mail className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        info@fitflow.pro
                      </div>
                      <div className="text-gray-400 text-sm">
                        Ответим в течение часа
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mt-1 group-hover:bg-purple-500/30 transition-colors">
                      <MapPin className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        ул. Фитнес, 123
                      </div>
                      <div className="text-gray-400 text-sm">
                        Москва, Россия
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center mt-1 group-hover:bg-yellow-500/30 transition-colors">
                      <Clock className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">24/7</div>
                      <div className="text-gray-400 text-sm">
                        Работаем без выходных
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Социальные сети */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold flex items-center gap-2">
                  <Globe className="h-5 w-5 text-pink-400" />
                  Мы в соцсетях
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      name: "Instagram",
                      icon: Instagram,
                      color: "from-pink-500 to-purple-600",
                      followers: "10K",
                      url: "https://instagram.com",
                    },
                    {
                      name: "Facebook",
                      icon: Facebook,
                      color: "from-blue-600 to-blue-700",
                      followers: "5K",
                      url: "https://facebook.com",
                    },
                    {
                      name: "Twitter",
                      icon: Twitter,
                      color: "from-blue-400 to-blue-600",
                      followers: "3K",
                      url: "https://twitter.com",
                    },
                    {
                      name: "YouTube",
                      icon: Youtube,
                      color: "from-red-500 to-red-600",
                      followers: "15K",
                      url: "https://youtube.com",
                    },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative p-4 bg-gradient-to-r ${social.color} rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-lg overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 text-center">
                        <social.icon className="h-6 w-6 text-white mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-white text-sm font-medium">
                          {social.name}
                        </div>
                        <div className="text-white/80 text-xs">
                          {social.followers}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Награды и сертификаты */}
                <div className="space-y-3">
                  <h5 className="text-lg font-semibold text-gray-300">
                    Наши достижения
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                      <Award className="h-4 w-4 text-yellow-400" />
                      <span>Лучший фитнес-центр 2024</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                      <Shield className="h-4 w-4 text-green-400" />
                      <span>ISO 9001:2015</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                      <Star className="h-4 w-4 text-blue-400" />
                      <span>5 звезд на Google</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📱 ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ */}
          <div className="border-t border-gray-700/50 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Полезные ссылки */}
                <div>
                  <h5 className="text-lg font-semibold mb-4 text-gray-300">
                    Полезная информация
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      "Правила клуба",
                      "Безопасность",
                      "FAQ",
                      "Блог",
                      "Карьера",
                      "Партнерам",
                      "Франшиза",
                      "Инвесторам",
                    ].map((link) => (
                      <a
                        key={link}
                        href="#"
                        className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 transform hover:underline"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Мобильное приложение */}
                <div>
                  <h5 className="text-lg font-semibold mb-4 text-gray-300 flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Progressive Web App
                    <PWAStatus showDetails={false} />
                  </h5>
                  <p className="text-gray-400 text-sm mb-4">
                    Установите наше PWA для удобного управления тренировками
                  </p>
                  <div className="flex flex-col gap-3">
                    {/* ✅ PWA кнопка установки */}
                    <PWAInstallButton
                      variant="outline"
                      className="border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-800 w-full"
                      showIcon={true}
                    />

                    {/* Существующие ссылки на App Store */}
                    <a
                      href="#"
                      className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all duration-300 hover:scale-105 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">
                          App Store
                        </div>
                        <div className="text-gray-400 text-xs">
                          Скачать для iOS
                        </div>
                      </div>
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all duration-300 hover:scale-105 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">
                          Google Play
                        </div>
                        <div className="text-gray-400 text-xs">
                          Скачать для Android
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* ✅ PWA статус информация */}
                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">
                        Статус приложения:
                      </span>
                      <PWAStatus showDetails={true} />
                    </div>
                    <p className="text-xs text-gray-400">
                      PWA работает в любом современном браузере
                    </p>
                  </div>
                </div>

                {/* Способы оплаты */}
                <div>
                  <h5 className="text-lg font-semibold mb-4 text-gray-300">
                    Способы оплаты
                  </h5>
                  <p className="text-gray-400 text-sm mb-4">
                    Мы принимаем все популярные способы оплаты
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: "Visa", color: "bg-blue-600" },
                      { name: "MC", color: "bg-red-600" },
                      { name: "МИР", color: "bg-green-600" },
                      { name: "СБП", color: "bg-purple-600" },
                    ].map((payment) => (
                      <div
                        key={payment.name}
                        className={`${payment.color} rounded-lg p-2 text-center text-white text-xs font-bold hover:scale-105 transition-transform duration-300 cursor-pointer`}
                      >
                        {payment.name}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span>Все платежи защищены SSL-шифрованием</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🔒 НИЖНЯЯ ЧАСТЬ */}
          <div className="border-t border-gray-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                    <span>
                      © {currentYear} FitFlow Pro. Сделано с любовью к фитнесу
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href="#"
                      className="hover:text-white transition-colors duration-300 hover:underline"
                    >
                      Политика конфиденциальности
                    </a>
                    <span className="text-gray-600">•</span>
                    <a
                      href="#"
                      className="hover:text-white transition-colors duration-300 hover:underline"
                    >
                      Условия использования
                    </a>
                    <span className="text-gray-600">•</span>
                    <a
                      href="#"
                      className="hover:text-white transition-colors duration-300 hover:underline"
                    >
                      Cookies
                    </a>
                  </div>
                </div>

                {/* Языки и валюта */}
                <div className="flex items-center gap-4 text-sm">
                  <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-colors">
                    <option value="ru" className="bg-gray-800">
                      🇷🇺 Русский
                    </option>
                    <option value="en" className="bg-gray-800">
                      🇺🇸 English
                    </option>
                    <option value="es" className="bg-gray-800">
                      🇪🇸 Español
                    </option>
                  </select>
                  <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-colors">
                    <option value="rub" className="bg-gray-800">
                      ₽ RUB
                    </option>
                    <option value="usd" className="bg-gray-800">
                      $ USD
                    </option>
                    <option value="eur" className="bg-gray-800">
                      € EUR
                    </option>
                  </select>
                </div>
              </div>

              {/* Дополнительная информация о версии */}
              <div className="mt-4 pt-4 border-t border-gray-700/30 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Версия: 2.1.0</span>
                  <span>•</span>
                  <span>
                    Последнее обновление:{" "}
                    {new Date().toLocaleDateString("ru-RU")}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Все системы работают
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Powered by</span>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-400" />
                    <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Next.js & AI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✨ АНИМИРОВАННЫЕ ЧАСТИЦЫ */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-20 animation-delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-20 animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-20 animation-delay-3000"></div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
