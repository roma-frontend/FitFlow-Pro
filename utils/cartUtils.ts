// utils/cartUtils.ts
import { Id } from "@/convex/_generated/dataModel";
import { ShopProduct } from "@/hooks/useShopProductsAPI";
import { CartItem } from "@/stores/cartStore";

export function productToAddCartData(product: ShopProduct): Omit<CartItem, 'quantity'> {
  return {
    id: product._id as Id<"products">,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    category: product.category,
    inStock: product.inStock,
    nutrition: product.nutrition,
  };
}

export function cartItemToPaymentItem(cartItem: CartItem) {
  return {
    productId: cartItem.id,
    productName: cartItem.name,
    quantity: cartItem.quantity,
    price: cartItem.price,
    totalPrice: cartItem.price * cartItem.quantity,
  };
}

export function validateProductId(productId: any): productId is Id<"products"> {
  return typeof productId === 'string' && productId.startsWith('k') && productId.length > 10;
}
