export class PageTransitionManager {
    private static instance: PageTransitionManager;
    private isTransitioning = false;
  
    static getInstance(): PageTransitionManager {
      if (!PageTransitionManager.instance) {
        PageTransitionManager.instance = new PageTransitionManager();
      }
      return PageTransitionManager.instance;
    }
  
    startTransition(): void {
      if (this.isTransitioning) return;
      
      this.isTransitioning = true;
      document.body.classList.add('page-transition-active');
      
      // Создаем overlay для плавного перехода
      const overlay = document.createElement('div');
      overlay.className = 'transition-loader';
      overlay.innerHTML = `
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Загрузка...</p>
        </div>
      `;
      document.body.appendChild(overlay);
    }
  
    endTransition(): void {
      this.isTransitioning = false;
      document.body.classList.remove('page-transition-active');
      
      const overlay = document.querySelector('.transition-loader');
      if (overlay) {
        overlay.classList.add('hiding');
        setTimeout(() => overlay.remove(), 200);
      }
    }
  
    // Обертка для router.push с плавным переходом
    async navigate(url: string, router: any): Promise<void> {
      this.startTransition();
      
      // Небольшая задержка для отображения анимации
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.push(url);
      
      // Loader будет скрыт на новой странице
      setTimeout(() => this.endTransition(), 500);
    }
  }
  