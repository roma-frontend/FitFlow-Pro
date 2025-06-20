// components/about/AboutContact.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Car,
  Bus,
  Navigation,
  ExternalLink
} from "lucide-react";

export function AboutContact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const contactInfo = [
    {
      icon: MapPin,
      title: "Адрес",
      details: "ул. Фитнес, 123, г. Москва",
      subtext: "Центральный район, рядом с метро",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Phone,
      title: "Телефон",
      details: "+7 (495) 123-45-67",
      subtext: "Звоните с 6:00 до 24:00",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Mail,
      title: "Email",
      details: "info@fitaccess.ru",
      subtext: "Ответим в течение часа",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Clock,
      title: "Режим работы",
      details: "Пн-Вс: 06:00 - 24:00",
      subtext: "Без выходных и праздников",
      color: "from-orange-500 to-red-500"
    }
  ];

  const transportOptions = [
    {
      icon: Bus,
      title: "Общественный транспорт",
      description: "Метро 'Спортивная' - 3 минуты пешком",
      details: "Автобусы: 15, 22, 45"
    },
    {
      icon: Car,
      title: "На автомобиле",
      description: "Бесплатная парковка на 100 мест",
      details: "Охраняемая территория"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Как нас найти
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Мы находимся в самом центре города и легко добраться любым транспортом
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6">
            <motion.h3
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl font-bold text-gray-900 mb-6"
            >
              Контактная информация
            </motion.h3>

            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <info.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {info.title}
                        </h4>
                        <p className="text-gray-800 font-medium mb-1">
                          {info.details}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {info.subtext}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Transport Options */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-8"
            >
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                Как добраться
              </h4>
              
              <div className="space-y-4">
                {transportOptions.map((option, index) => (
                  <Card key={index} className="hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                          <option.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">
                            {option.title}
                          </h5>
                          <p className="text-gray-700 text-sm mb-1">
                            {option.description}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {option.details}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-gray-100 to-blue-100 rounded-2xl h-96 flex items-center justify-center relative overflow-hidden">
              {/* Placeholder for map */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Интерактивная карта
                </h3>
                <p className="text-gray-600 mb-4">
                  Точное расположение нашего фитнес-центра
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                  <Navigation className="h-4 w-4 mr-2" />
                  Открыть в картах
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-8 h-8 bg-blue-500/20 rounded-full"></div>
              <div className="absolute bottom-6 right-6 w-12 h-12 bg-green-500/20 rounded-full"></div>
              <div className="absolute top-1/3 right-8 w-6 h-6 bg-purple-500/20 rounded-full"></div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button variant="outline" className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                Позвонить
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Написать
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
