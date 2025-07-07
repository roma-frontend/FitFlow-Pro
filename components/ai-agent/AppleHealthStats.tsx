import React from 'react';
import { motion } from 'framer-motion';
import { Apple, Sparkles } from 'lucide-react';
import type { ActivityData } from './types';

interface AppleHealthStatsProps {
  data: ActivityData;
}

const AppleHealthStats: React.FC<AppleHealthStatsProps> = ({ data }) => {
  const stats = [
    { value: data.steps.toLocaleString(), label: "Шаги", icon: "👟", color: "from-green-500 to-emerald-600" },
    { value: data.heartRate, label: "Пульс", icon: "❤️", color: "from-red-500 to-pink-600" },
    { value: Math.round(data.activeEnergy), label: "Ккал", icon: "🔥", color: "from-orange-500 to-red-600" },
    { value: data.sleepHours.toFixed(1), label: "Сон", icon: "💤", color: "from-indigo-500 to-purple-600" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl p-6 mb-6 shadow-xl border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-2xl flex items-center justify-center shadow">
            <Apple className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Apple Health</h3>
            <p className="text-sm text-gray-500">Сегодня</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">
          {new Date(data.lastSync).toLocaleTimeString('ru', { 
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl text-white shadow relative overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <Sparkles className="h-4 w-4 opacity-60" />
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-white/80 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AppleHealthStats;