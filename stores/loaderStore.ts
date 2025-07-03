// stores/loaderStore.ts
import { create } from "zustand"

// 🔧 ИСПРАВЛЕНО: добавили "logout" в тип и экспортируем его
export type LoaderType = "login" | "logout" | null

interface LoaderState {
    loaderType: LoaderType;
    loaderProps?: any;
    showLoader: (type: LoaderType, props?: any) => void;
    hideLoader: () => void;
}

export const useLoaderStore = create<LoaderState>((set) => ({
    loaderType: null,
    loaderProps: undefined,
    showLoader: (type, props) => set({ loaderType: type, loaderProps: props }),
    hideLoader: () => set({ loaderType: null, loaderProps: undefined })
}));