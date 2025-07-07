import { PageTransitionManager } from "@/utils/pageTransitions";

export function usePageTransition() {
    const manager = PageTransitionManager.getInstance();
    
    return {
      startTransition: () => manager.startTransition(),
      endTransition: () => manager.endTransition(),
      navigate: (url: string, router: any) => manager.navigate(url, router)
    };
  }