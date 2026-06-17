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
    this.fetchAll();

    // Refetch every 5 minutes (300,000 ms) in the background
    this.intervalId = setInterval(() => {
      this.fetchAll();
    }, 300000);
  }

  private async fetchAll() {
    try {
      // Fetch in parallel
      const [
        dashRes,
        gateQRes,
        gateFRes,
        aptQRes,
        aptCRes
      ] = await Promise.all([
        fetch('/api/dashboard/stats').catch(() => null),
        fetch('/api/questions?limit=5000').catch(() => null),
        fetch('/api/formulas/info').catch(() => null),
        fetch('/api/aptitude/questions?limit=5000').catch(() => null),
        fetch('/api/aptitude/concepts').catch(() => null),
      ]);

      let updated = false;

      if (dashRes && dashRes.ok) {
        this.data.dashboardStats = await dashRes.json();
        updated = true;
      }
      if (gateQRes && gateQRes.ok) {
        this.data.gateQuestions = await gateQRes.json();
        updated = true;
      }
      if (gateFRes && gateFRes.ok) {
        this.data.gateFormulaInfoMap = await gateFRes.json();
        updated = true;
      }
      if (aptQRes && aptQRes.ok) {
        this.data.aptitudeQuestions = await aptQRes.json();
        updated = true;
      }
      if (aptCRes && aptCRes.ok) {
        this.data.aptitudeConcepts = await aptCRes.json();
        updated = true;
      }

      if (updated) {
        this.saveToLocal();
        this.notify();
      }
    } catch (e) {
      console.error('Failed to fetch global cache', e);
    }
  }
}

export const globalCache = new CacheManager();
