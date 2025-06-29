import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type OrderStep = 'shop' | 'cart' | 'checkout' | 'payment' | 'confirm' | 'success';

interface ShopStore {
  // Шаги заказа
  orderStep: OrderStep;
  setOrderStep: (step: OrderStep) => void;
  
  // Данные заказа
  pickupType: string;
  setPickupType: (type: string) => void;
  
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  
  // Способ оплаты
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  
  // Чек
  receipt: any;
  setReceipt: (receipt: any) => void;
  
  // Отображение чека
  showReceipt: boolean;
  setShowReceipt: (show: boolean) => void;
  
  // Сброс состояния
  resetOrder: () => void;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set) => ({
      // Шаги заказа
      orderStep: 'shop',
      setOrderStep: (step) => set({ orderStep: step }),
      
      // Данные заказа
      pickupType: 'pickup',
      setPickupType: (type) => set({ pickupType: type }),
      
      orderNotes: '',
      setOrderNotes: (notes) => set({ orderNotes: notes }),
      
      // Способ оплаты
      paymentMethod: 'card',
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      
      // Чек
      receipt: null,
      setReceipt: (receipt) => set({ receipt }),
      
      // Отображение чека
      showReceipt: false,
      setShowReceipt: (show) => set({ showReceipt: show }),
      
      // Сброс состояния
      resetOrder: () => set({
        orderStep: 'shop',
        pickupType: 'pickup',
        orderNotes: '',
        paymentMethod: 'card',
        receipt: null,
        showReceipt: false,
      }),
    }),
    {
      name: 'shop-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Не сохраняем чувствительные данные
      partialize: (state) => ({
        orderStep: state.orderStep,
        pickupType: state.pickupType,
        orderNotes: state.orderNotes,
        paymentMethod: state.paymentMethod,
        // receipt и showReceipt не сохраняем в localStorage
      }),
    }
  )
);