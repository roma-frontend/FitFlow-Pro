import { Id } from "@/convex/_generated/dataModel";

// Базовые интерфейсы
export interface BaseProduct {
  _id: Id<"products">;
  name: string;
  price: number;
  imageUrl?: string;
  category: string;
  description: string;
  inStock: number;
  isPopular: boolean;
}

export interface CartItem {
  id: Id<"products">;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category: string;
}

export interface PaymentItem {
  productId: Id<"products">;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface OrderItem {
  productId: Id<"products">;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Order {
  _id: Id<"orders">;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  pickupType: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  createdAt: number;
  updatedAt: number;
  paidAt?: number;
}

export interface Receipt {
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
