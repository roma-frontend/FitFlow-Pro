import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, X } from 'lucide-react';
import { useCartStore, CartItem } from '@/stores/cartStore'; // ИСПРАВЛЕНО: импортируем интерфейс из store
import { getProductImage } from '@/utils/productUtils';
import { formatPrice } from '@/utils/priceUtils';

interface CartItemProps {
  item: CartItem;
}

const CartItemComponent = memo(({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  const productForImage = {
    _id: item.id,
    name: item.name,
    imageUrl: item.imageUrl,
    category: item.category
  };

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      {/* Product Image */}
      <img
        src={getProductImage(productForImage)}
        alt={item.name}
        className="w-16 h-16 object-cover rounded"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = getProductImage({ ...productForImage, imageUrl: undefined });
        }}
      />

      {/* Product Info */}
      <div className="flex-1">
        <h4 className="font-medium">{item.name}</h4>
        <p className="text-sm text-gray-600">{formatPrice(item.price)} за шт.</p>
        {item.nutrition?.calories && (
          <p className="text-xs text-gray-500">
            {item.nutrition.calories} ккал
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <QuantityControls
        quantity={item.quantity}
        maxQuantity={item.inStock}
        onQuantityChange={handleQuantityChange}
      />

      {/* Price and Remove */}
      <div className="text-right">
        <p className="font-bold">
          {formatPrice(item.price * item.quantity)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="text-red-600 hover:text-red-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

const QuantityControls = memo(({ 
  quantity, 
  maxQuantity, 
  onQuantityChange 
}: {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
}) => (
  <div className="flex items-center space-x-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => onQuantityChange(quantity - 1)}
      disabled={quantity <= 1}
    >
      <Minus className="h-4 w-4" />
    </Button>

    <span className="w-8 text-center font-medium">{quantity}</span>

    <Button
      variant="outline"
      size="sm"
      onClick={() => onQuantityChange(quantity + 1)}
      disabled={quantity >= maxQuantity}
    >
      <Plus className="h-4 w-4" />
    </Button>
  </div>
));

CartItemComponent.displayName = 'CartItem';
QuantityControls.displayName = 'QuantityControls';

export default CartItemComponent;
