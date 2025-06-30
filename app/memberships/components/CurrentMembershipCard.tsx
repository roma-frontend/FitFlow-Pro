import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  RefreshCw, 
  Sparkles, 
  Activity,
  Award,
  ChevronRight,
  Shield,
  Zap,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

export function CurrentMembershipCard({
    membership,
    planTemplate,
    onRenew,
    onUpgrade,
    onCancel,
    isExpiringSoon,
    isActionProcessing,
    getDaysLeftColor,
    getDaysLeftMessage,
}: {
    membership: any;
    planTemplate: any;
    onRenew: () => void;
    onUpgrade: () => void;
    onCancel: () => void;
    isExpiringSoon: boolean;
    isActionProcessing: boolean;
    getDaysLeftColor: (days: number) => string;
    getDaysLeftMessage: (days: number) => string;
}) {
    const daysPercentage = Math.max(0, Math.min(100, ((membership.remainingDays || 0) / 30) * 100));
    const isActive = membership.status === "active";
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
                {/* Декоративный фон */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
                </div>

                {/* Верхний градиент */}
                <div className={`h-1 bg-gradient-to-r ${planTemplate?.color || "from-gray-500 to-gray-600"}`} />
                
                <CardHeader className="relative pb-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${planTemplate?.color || "from-gray-500 to-gray-600"} flex items-center justify-center shadow-lg`}>
                                    {planTemplate?.icon ? (
                                        <planTemplate.icon className="h-7 w-7 text-white" />
                                    ) : (
                                        <Award className="h-7 w-7 text-white" />
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        {planTemplate?.name || membership.type}
                                    </CardTitle>
                                    <CardDescription className="text-gray-600">
                                        {planTemplate?.description}
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            <Badge 
                                className={`${
                                    isActive 
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg" 
                                        : "bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-lg"
                                } px-3 py-1.5 font-semibold`}
                            >
                                <span className="flex items-center gap-1.5">
                                    {isActive ? (
                                        <>
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            Активен
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="h-3 w-3" />
                                            Истек
                                        </>
                                    )}
                                </span>
                            </Badge>
                        </motion.div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 relative">
                    {/* Прогресс дней с улучшенным дизайном */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Осталось дней</p>
                                    <p className={`text-xs ${getDaysLeftColor(membership.remainingDays || 0)}`}>
                                        {getDaysLeftMessage(membership.remainingDays || 0)}
                                    </p>
                                </div>
                            </div>
                            <motion.div
                                key={membership.remainingDays}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring" }}
                                className="text-right"
                            >
                                <span className={`text-3xl font-bold ${getDaysLeftColor(membership.remainingDays || 0)}`}>
                                    {membership.remainingDays || 0}
                                </span>
                                <span className="text-sm text-gray-500 ml-1">
                                    {membership.remainingDays === 1 ? "день" : "дней"}
                                </span>
                            </motion.div>
                        </div>
                        
                        {/* Красивый прогресс-бар */}
                        <div className="relative">
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${daysPercentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full bg-gradient-to-r ${
                                        membership.remainingDays > 14 
                                            ? "from-green-400 to-emerald-500" 
                                            : membership.remainingDays > 7 
                                            ? "from-yellow-400 to-orange-500"
                                            : "from-red-400 to-rose-500"
                                    } relative`}
                                >
                                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                                </motion.div>
                            </div>
                            {/* Индикатор на прогресс-баре */}
                            <motion.div
                                initial={{ left: 0 }}
                                animate={{ left: `${daysPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="absolute -top-1 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-lg transform -translate-x-1/2"
                                style={{ top: '-0.25rem' }}
                            >
                                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Даты в новом стиле */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="group cursor-pointer"
                        >
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Начало</p>
                                        <p className="font-bold text-gray-900">
                                            {new Date(membership.startDate).toLocaleDateString("ru-RU")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="group cursor-pointer"
                        >
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Clock className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Окончание</p>
                                        <p className="font-bold text-gray-900">
                                            {new Date(membership.expiresAt).toLocaleDateString("ru-RU")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Статистика в новом дизайне */}
                    {membership.usageStats && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                                <h4 className="font-bold text-gray-900">Статистика посещений</h4>
                                <Sparkles className="h-4 w-4 text-yellow-500 ml-auto" />
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="text-center group">
                                    <div className="bg-white rounded-xl p-3 shadow-sm group-hover:shadow-md transition-all duration-300">
                                        <motion.p
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.6, type: "spring" }}
                                            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                                        >
                                            {membership.usageStats.visitsThisMonth}
                                        </motion.p>
                                        <p className="text-xs text-gray-600 mt-1">В этом месяце</p>
                                    </div>
                                </div>
                                
                                <div className="text-center group">
                                    <div className="bg-white rounded-xl p-3 shadow-sm group-hover:shadow-md transition-all duration-300">
                                        <motion.p
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.7, type: "spring" }}
                                            className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                                        >
                                            {membership.usageStats.totalVisits}
                                        </motion.p>
                                        <p className="text-xs text-gray-600 mt-1">Всего визитов</p>
                                    </div>
                                </div>
                                
                                <div className="text-center group">
                                    <div className="bg-white rounded-xl p-3 shadow-sm group-hover:shadow-md transition-all duration-300">
                                        <motion.p
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.8, type: "spring" }}
                                            className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                                        >
                                            {membership.usageStats.favoriteTime}
                                        </motion.p>
                                        <p className="text-xs text-gray-600 mt-1">Любимое время</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Действия с новым дизайном */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        {isExpiringSoon && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.9 }}
                                className="flex-1"
                            >
                                <Button
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                                    onClick={onRenew}
                                    disabled={isActionProcessing}
                                    size="lg"
                                >
                                    {isActionProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Продление...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                                            Продлить абонемент
                                            <Zap className="h-4 w-4 ml-2 text-yellow-300" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        )}
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1 }}
                            className="flex-1"
                        >
                            <Button
                                variant="outline"
                                className="w-full border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 group"
                                onClick={onUpgrade}
                                size="lg"
                            >
                                <TrendingUp className="h-5 w-5 mr-2 text-blue-600 group-hover:scale-110 transition-transform" />
                                Улучшить план
                                <ChevronRight className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Button>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.1 }}
                        >
                            <Button
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition-all duration-300"
                                onClick={onCancel}
                                disabled={isActionProcessing}
                                size="lg"
                            >
                                {isActionProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2" />
                                        Отмена...
                                    </>
                                ) : (
                                    "Отменить"
                                )}
                            </Button>
                        </motion.div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}