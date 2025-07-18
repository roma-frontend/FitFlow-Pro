// stores/loaderStore.ts
import { create } from "zustand"

export type LoaderType = "login" | "logout" | null

interface LoaderState {
    loaderType: LoaderType;
    loaderProps?: any;
    isLoaderActive: boolean;
    isVisible: boolean; // ✅ Добавляем свойство isVisible
    showLoader: (type: LoaderType, props?: any) => void;
    hideLoader: () => void;
}

// Функции для управления скроллом
const disableScroll = () => {
    if (typeof window !== 'undefined') {
        document.body.style.overflow = 'hidden';
        // Опционально: предотвращаем скролл на мобильных устройствах
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }
};

const enableScroll = () => {
    if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }
};

export const useLoaderStore = create<LoaderState>((set, get) => ({
    loaderType: null,
    loaderProps: undefined,
    isLoaderActive: false,
    isVisible: false, // ✅ Инициализируем как false

    showLoader: (type, props) => {
        set({ 
            loaderType: type, 
            loaderProps: props,
            isLoaderActive: true,
            isVisible: true // ✅ Устанавливаем isVisible в true
        });
        
        // Отключаем скролл только для login и logout
        if (type === "login" || type === "logout") {
            disableScroll();
        }
    },
    
    hideLoader: () => {
        const currentType = get().loaderType;
        
        set({ 
            loaderType: null, 
            loaderProps: undefined,
            isLoaderActive: false,
            isVisible: false // ✅ Устанавливаем isVisible в false
        });
        
        // Включаем скролл обратно если был отключен
        if (currentType === "login" || currentType === "logout") {
            enableScroll();
        }
    }
}));