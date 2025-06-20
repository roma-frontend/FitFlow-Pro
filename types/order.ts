export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  userId?: string;
  memberId?: string;
  items: OrderItem[];
  totalAmount: number;
  pickupType: string;
  notes?: string;
  status: string;
  paymentStatus: string;
  paymentIntentId?: string;
  paymentId?: string;
  paymentMethod?: string;
  orderTime: number;
  estimatedReadyTime?: number;
  completedTime?: number;
  paidAt?: number;
}
