import { Id } from "@/convex/_generated/dataModel";

// Тип для элементов платежа в нашей системе
export interface ShopPaymentItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

// Тип для Stripe Payment Intent
export interface StripePaymentData {
  amount: number;
  currency: string;
  metadata: {
    userId: string;
    userEmail: string;
    userName: string;
    orderId: string;
    pickupType: string;
    notes?: string;
    itemsCount: string;
  };
}

// Тип для чека
export interface PaymentReceipt {
  receiptId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  paidAt: string;
  customer: {
    email: string;
    name: string;
    userId?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  pickupType?: string;
  notes?: string;
  company: {
    name: string;
    address: string;
    inn: string;
    phone: string;
    email?: string;
  };
}