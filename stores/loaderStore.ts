// stores/loaderStore.ts
import { create } from "zustand"

export type LoaderType = "login" | "logout" | null

interface LoaderState {
    loaderType: LoaderType;
    loaderProps?: any;
    isLoaderActive: boolean; // Добавляем computed свойство
    showLoader: (type: LoaderType, props?: any) => void;
    hideLoader: () => void;
}

export const useLoaderStore = create<LoaderState>((set, get) => ({
    loaderType: null,
    loaderProps: undefined,

    // Computed свойство для проверки активности loader
    get isLoaderActive() {
        return get().loaderType !== null;
    },

    showLoader: (type, props) => set({ loaderType: type, loaderProps: props }),
    hideLoader: () => set({ loaderType: null, loaderProps: undefined })
}));