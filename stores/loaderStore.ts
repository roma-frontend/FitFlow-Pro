import { create } from "zustand"

type LoaderType = "login" | "logout" | null

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
