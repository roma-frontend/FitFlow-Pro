// stores/aiShopStore.ts
import { ShopProduct, ShopRecommendation, UserShopProfile } from '@/types/shopAI';
import { compareProductsDetailed, generatePersonalizedRecommendations, generateRecommendationsByGoals, searchProductsIntelligently } from '@/utils/shopAILogic';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AIShopContext {
  userProfile: UserShopProfile;
  currentProducts: ShopProduct[];
  recommendations: ShopRecommendation[];
  cartItems: any[];
  searchQuery?: string;
  selectedCategory?: string;
  conversationMode: 'discovery' | 'recommendation' | 'comparison' | 'purchase' | 'support';
  lastRecommendationContext?: {
    goals: string[];
    budget?: { min: number; max: number };
    experience: string;
  };
  isOpen: boolean; // Добавлено новое поле
}

interface AIShopStore extends AIShopContext {
  // Actions
  setUserProfile: (profile: Partial<UserShopProfile>) => void;
  setCurrentProducts: (products: ShopProduct[]) => void;
  setRecommendations: (recommendations: ShopRecommendation[]) => void;
  setConversationMode: (mode: AIShopContext['conversationMode']) => void;
  updateCartContext: (items: any[]) => void;
  resetShopContext: () => void;
  
  // Новые методы для управления открытием/закрытием
  openAgent: () => void;
  closeAgent: () => void;
  toggleAgent: () => void;
  
  // AI Methods
  analyzeUserGoals: (goals: string[]) => Promise<ShopRecommendation[]>;
  findProductsByQuery: (query: string) => Promise<ShopProduct[]>;
  compareProducts: (productIds: string[]) => Promise<any>;
  getPersonalizedRecommendations: () => Promise<ShopRecommendation[]>;
}

export const useAIShopStore = create<AIShopStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      userProfile: {
        goals: [],
        experience: 'beginner',
        preferences: {
          categories: [],
          brands: [],
          flavors: [],
          avoidAllergens: [],
        },
      },
      currentProducts: [],
      recommendations: [],
      cartItems: [],
      conversationMode: 'discovery',
      isOpen: false, // Начальное состояние

      // Actions
      setUserProfile: (profile) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        })),

      setCurrentProducts: (products) => set({ currentProducts: products }),

      setRecommendations: (recommendations) => set({ recommendations }),

      setConversationMode: (mode) => set({ conversationMode: mode }),

      updateCartContext: (items) => set({ cartItems: items }),

      resetShopContext: () =>
        set({
          userProfile: {
            goals: [],
            experience: 'beginner',
            preferences: {
              categories: [],
              brands: [],
              flavors: [],
              avoidAllergens: [],
            },
          },
          recommendations: [],
          conversationMode: 'discovery',
        }),

      // Новые методы для управления открытием/закрытием
      openAgent: () => set({ isOpen: true }),
      closeAgent: () => set({ isOpen: false }),
      toggleAgent: () => set((state) => ({ isOpen: !state.isOpen })),

      // AI Methods
      analyzeUserGoals: async (goals) => {
        const { currentProducts, userProfile } = get();
        return await generateRecommendationsByGoals(goals, currentProducts, userProfile);
      },

      findProductsByQuery: async (query) => {
        const { currentProducts } = get();
        return searchProductsIntelligently(query, currentProducts);
      },

      compareProducts: async (productIds) => {
        const { currentProducts } = get();
        return compareProductsDetailed(productIds, currentProducts);
      },

      getPersonalizedRecommendations: async () => {
        const { userProfile, currentProducts, cartItems } = get();
        return await generatePersonalizedRecommendations(userProfile, currentProducts, cartItems);
      },
    }),
    { name: 'AIShopStore' }
  )
);