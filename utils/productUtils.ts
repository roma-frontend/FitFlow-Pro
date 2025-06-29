interface Product {
    _id: string;
    name: string;
    category: string;
    imageUrl?: string;
}

export const getProductImage = (product: Product): string => {
    if (product.imageUrl) {
        return product.imageUrl;
    }

    const defaultImages = {
        drinks: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop",
        supplements: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        snacks: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop",
        merchandise: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop"
    };

    return defaultImages[product.category as keyof typeof defaultImages] || defaultImages.supplements;
};

export const getCategoryName = (category: string): string => {
    const categoryNames = {
        drinks: "Напитки",
        supplements: "Спортивное питание",
        snacks: "Снеки",
        merchandise: "Мерч"
    };

    return categoryNames[category as keyof typeof categoryNames] || category;
};

export const getRoleDisplayName = (role: string): string => {
    const roleNames = {
        'admin': 'Администратор',
        'super-admin': 'Супер Администратор',
        'manager': 'Менеджер',
        'trainer': 'Тренер',
        'member': 'Участник'
    };

    return roleNames[role as keyof typeof roleNames] || role;
};
export const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ru-RU')} ₽`;
};

export const calculateTotal = (items: Array<{ price: number; quantity: number }>): number => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const formatCurrency = (amount: number, currency = '₽'): string => {
    return `${amount.toLocaleString('ru-RU')} ${currency}`;
};
