export interface GlobalCacheData {
  dashboardStats: any;
  gateQuestions: any;
  gateFormulaInfoMap: any;
  aptitudeQuestions: any;
  aptitudeConcepts: any;
}

class CacheManager {
  public data: GlobalCacheData = {
    dashboardStats: null,
    gateQuestions: null,
    gateFormulaInfoMap: null,
    aptitudeQuestions: null,
    aptitudeConcepts: null,
  };

  private listeners = new Set<() => void>();
  private initialized = false;
  private intervalId: any = null;
  private abortController: AbortController | null = null;
  private isFetching = false;

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private saveToLocal() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('swaseekh_cache_data', JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save cache to localStorage, might be out of quota', e);
    }
  }

  private loadFromLocal() {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('swaseekh_cache_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data = { ...this.data, ...parsed };
        this.notify();
      }
    } catch (e) {
      console.warn('Failed to load cache from localStorage', e);
    }
  }

  public init() {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;
    this.initialized = true;

    this.loadFromLocal();
    // Delay initial fetch slightly to let the critical page load finish first
    setTimeout(() => {
      this.fetchAll();
    }, 2000);

    // Refetch every 5 minutes (300,000 ms) in the background
    this.intervalId = setInterval(() => {
      this.fetchAll();
    }, 300000);
  }

  public pauseBackgroundSync() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private async fetchAll() {
    if (this.isFetching) return;
    this.isFetching = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      const endpoints = [
        { key: 'dashboardStats', url: '/api/dashboard/stats' },
        { key: 'gateQuestions', url: '/api/questions?limit=5000' },
        { key: 'gateFormulaInfoMap', url: '/api/formulas/info' },
        { key: 'aptitudeQuestions', url: '/api/aptitude/questions?limit=5000' },
        { key: 'aptitudeConcepts', url: '/api/aptitude/concepts' },
      ];

      for (const ep of endpoints) {
        if (signal.aborted) {
          console.log(`[GlobalCache] Background sync aborted to prioritize user action.`);
          break;
        }

        try {
          const res = await fetch(ep.url, { signal });
          if (res.ok) {
            this.data[ep.key as keyof GlobalCacheData] = await res.json();
            this.saveToLocal();
            this.notify();
          }
        } catch (e: any) {
          if (e.name === 'AbortError') {
            console.log(`[GlobalCache] Background sync aborted during ${ep.key}.`);
            break;
          } else {
            console.warn(`[GlobalCache] Failed to fetch ${ep.key}`, e);
          }
        }
      }
    } finally {
      this.isFetching = false;
    }
  }
}

export const globalCache = new CacheManager();
