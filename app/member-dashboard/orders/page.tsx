"use client";

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { useRouter } from 'next/navigation';
import Receipt from '@/components/Receipt';
import { Order } from '@/types/order';

// Компоненты
import OrdersPageSkeleton from '@/components/skeletons/OrdersPageSkeleton';
import OrderFilters from '@/components/orders/OrderFilters';
import OrderCard from '@/components/orders/OrderCard';
import EmptyOrders from '@/components/orders/EmptyOrders';
import ReceiptModal from '@/components/orders/ReceiptModal';

// ✅ UI компоненты из shadcn/ui и иконки из lucide-react
import { Button } from "@/components/ui/button";
import { ChevronLeft, LayoutDashboard, Receipt as ReceiptIcon, ArrowLeft } from 'lucide-react';

// ✅ Правильные типы для React компонентов
interface User {
  id: string;
  email: string;
  name: string;
  role: 'member' | 'client' | 'admin' | 'super-admin' | 'manager' | 'trainer' | 'staff';
}

interface DashboardReturnButtonProps {
  user: User | null;
  onNavigate: (url: string) => void;
}

// Красивая кнопка возврата в дашборд с правильной типизацией
const DashboardReturnButton: React.FC<DashboardReturnButtonProps> = ({ user, onNavigate }) => {
  // ✅ Правильная типизация для Record
  const dashboardMap: Record<string, string> = {
    'member': '/member-dashboard',
    'client': '/member-dashboard',
    'admin': '/admin',
    'super-admin': '/admin',
    'manager': '/manager-dashboard',
    'trainer': '/trainer-dashboard',
    'staff': '/staff-dashboard'
  };

  const labelMap: Record<string, string> = {
    'member': 'Дашборд участника',
    'client': 'Дашборд участника',
    'admin': 'Панель администратора',
    'super-admin': 'Панель администратора',
    'manager': 'Дашборд менеджера',
    'trainer': 'Дашборд тренера',
    'staff': 'Дашборд сотрудника'
  };

  const getDashboardUrl = (): string => {
    if (!user?.role) return '/';
    return dashboardMap[user.role] || '/dashboard';
  };

  const getDashboardLabel = (): string => {
    if (!user?.role) return 'Главная';
    return labelMap[user.role] || 'Дашборд';
  };

  return (
    <div className="mb-8">
      <Button
        onClick={() => onNavigate(getDashboardUrl())}
        variant="outline"
        className="group flex items-center gap-3 px-6 py-3 h-auto bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 hover:from-blue-100/90 hover:via-white hover:to-indigo-100/90 border border-blue-200/60 hover:border-blue-300/80 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-0.5 backdrop-blur-sm"
      >
        {/* Иконка стрелки назад с анимацией */}
        <div className="p-2 bg-white/90 group-hover:bg-blue-50 rounded-lg shadow-sm group-hover:shadow transition-all duration-200">
          <ArrowLeft className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors duration-200 group-hover:-translate-x-0.5 transform" />
        </div>
        
        
        {/* Текст с градиентом */}
        <div className="flex flex-col items-start">
          <span className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
            Вернуться назад
          </span>
        </div>
        
      </Button>
    </div>
  );
};

// ✅ Интерфейс для статистики заказов
interface OrderStats {
  total: number;
  completed: number;
  pending: number;
}

// ✅ Компонент статистики с правильной типизацией
interface OrderStatsProps {
  orders: Order[];
}

const OrderStatsCards: React.FC<OrderStatsProps> = ({ orders }) => {
  const stats: OrderStats = {
    total: orders.length,
    completed: orders.filter(order => 
      order.status === 'completed' || order.status === 'paid'
    ).length,
    pending: orders.filter(order => 
      order.status === 'pending' || order.status === 'processing'
    ).length
  };

  if (stats.total === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/60 shadow-sm">
        <div className="text-sm text-gray-600">Всего заказов</div>
        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/60 shadow-sm">
        <div className="text-sm text-gray-600">Завершенных</div>
        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/60 shadow-sm">
        <div className="text-sm text-gray-600">В обработке</div>
        <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
      </div>
    </div>
  );
};

// ✅ Основной компонент страницы заказов с правильной типизацией
const OrdersPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { orders, loading } = useOrders(user?.id);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  // Фильтрация через кастомный хук
  const filteredOrders = useOrderFilters({ orders, searchTerm, statusFilter });

  // ✅ Мемоизированные обработчики с правильной типизацией
  const handleViewReceipt = useCallback((order: Order): void => {
    setSelectedOrder(order);
    setShowReceipt(true);
  }, []);

  const handlePrintReceipt = useCallback((order: Order): void => {
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  }, []);

  const handleCloseReceipt = useCallback((): void => {
    setShowReceipt(false);
    setSelectedOrder(null);
  }, []);

  const handleNavigation = useCallback((url: string): void => {
    router.push(url);
  }, [router]);

  // ✅ ИСПРАВЛЕННАЯ ЛОГИКА - явное приведение к boolean
  const hasFilters: boolean = Boolean(searchTerm) || statusFilter !== 'all';

  if (loading) {
    return <OrdersPageSkeleton />;
  }

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30">
      <div className="max-w-6xl mx-auto p-6">
        {/* ✨ КРАСИВАЯ КНОПКА ВОЗВРАТА В ДАШБОРД */}
        <DashboardReturnButton 
          user={user} 
          onNavigate={handleNavigation} 
        />

        {/* Заголовок с улучшенным дизайном */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            {/* Иконка заказов */}
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <ReceiptIcon className="h-5 md:h-8 w-5 md:w-8 text-white" />
            </div>
            
            <div>
              <h1 className="text-xl lg:text-3xl 2xl:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                История заказов
              </h1>
              <p className="text-lg text-gray-600">
                Просматривайте и скачивайте чеки ваших покупок
              </p>
            </div>
          </div>

          {/* Статистика заказов */}
          {orders && <OrderStatsCards orders={orders} />}
        </div>

        {/* Фильтры */}
        <div className="mb-8">
          <OrderFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
          />
        </div>

        {/* Список заказов */}
        {filteredOrders.length === 0 ? (
          <EmptyOrders hasFilters={hasFilters} />
        ) : (
          <div className="space-y-6">
            {/* Заголовок списка */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {hasFilters ? 'Результаты поиска' : 'Ваши заказы'}
              </h2>
              <div className="text-sm text-gray-500">
                Показано {filteredOrders.length} из {orders?.length || 0} заказов
              </div>
            </div>

            {/* Карточки заказов */}
            <div className="space-y-4">
              {filteredOrders.map((order: Order, index: number) => (
                <div
                  key={order._id}
                  className="transform transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <OrderCard
                    order={order}
                    onViewReceipt={handleViewReceipt}
                    onPrintReceipt={handlePrintReceipt}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Модальное окно с чеком */}
        {showReceipt && selectedOrder && (
          <ReceiptModal
            order={selectedOrder}
            user={user}
            onClose={handleCloseReceipt}
            onPrint={handlePrintReceipt}
          />
        )}

        {/* Скрытый чек для печати */}
        {selectedOrder && !showReceipt && (
          <div className="hidden print:block">
            <Receipt 
              receipt={{
                receiptId: selectedOrder._id.slice(-8),
                orderId: selectedOrder._id,
                paymentId: selectedOrder.paymentId || selectedOrder.paymentIntentId || 'unknown',
                amount: selectedOrder.totalAmount,
                currency: 'RUB',
                paidAt: selectedOrder.paidAt ? new Date(selectedOrder.paidAt).toISOString() : new Date(selectedOrder.orderTime).toISOString(),
                customer: {
                  email: user?.email || 'customer@FitFlow-Pro.ru',
                  name: user?.name || 'Покупатель',
                },
                items: selectedOrder.items.map(item => ({
                  name: item.productName,
                  quantity: item.quantity,
                  price: item.price,
                  total: item.totalPrice,
                })),
                company: {
                  name: 'FitFlow-Pro',
                  address: 'г. Москва, ул. Примерная, д. 1',
                  inn: '1234567890',
                  phone: '+7 (495) 123-45-67',
                },
              }} 
            />
          </div>
        )}
      </div>

      {/* CSS анимации */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;
