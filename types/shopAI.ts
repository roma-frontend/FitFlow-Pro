// types/shopAI.ts
export interface ShopProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    subCategory?: string;
    brand?: string;
    inStock: number;
    imageUrl?: string;
    isPopular?: boolean;
    rating?: number;
    benefits?: string[];
    tags?: string[];
    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      servingSize?: string;
    };
    usage?: {
      timing?: string;
      dosage?: string;
      instructions?: string;
    };
    targetGoals?: string[];
    allergens?: string[];
    flavors?: string[];
  }
  
  export interface ShopRecommendation {
    product: ShopProduct;
    reason: string;
    confidence: number;
    relevanceScore: number;
    userGoals: string[];
    alternativeOptions?: ShopProduct[];
  }
  
  export interface UserShopProfile {
    goals: string[];
    experience: string;
    budget?: { min: number; max: number };
    preferences: {
      categories: string[];
      brands: string[];
      flavors: string[];
      avoidAllergens: string[];
    };
    currentProducts?: string[];
    purchaseHistory?: string[];
  }
  
  // Define allowed action types
  export type ShopAction = "add_to_cart" | "compare" | "show_details" | "checkout";
  
  // Fixed return type with proper action typing
  export type ShopAIResponse = {
    response: string;
    recommendations?: ShopRecommendation[];
    products?: ShopProduct[];
    action?: ShopAction;
    actionData?: any;
  };