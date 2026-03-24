/**
 * Data Preloader Service
 * Fetches critical data before app initialization completes
 */

export interface PreloadedData {
  recentTracks: any[];
  popularTracks: any[];
  trendingCreators: any[];
  homepageSlides: any[];
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class DataPreloaderService {
  private data: PreloadedData = {
    recentTracks: [],
    popularTracks: [],
    trendingCreators: [],
    homepageSlides: [],
    isLoading: false,
    isReady: false,
    error: null,
  };

  private listeners: Set<() => void> = new Set();

  /**
   * Subscribe to data changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all subscribers
   */
  private notify() {
    this.listeners.forEach(callback => callback());
  }

  /**
   * Get current data state
   */
  getData(): PreloadedData {
    return { ...this.data };
  }

  /**
   * Check if data is ready
   */
  isReady(): boolean {
    return this.data.isReady;
  }

  /**
   * Fetch all critical data with timeout
   */
  async preloadData(timeoutMs: number = 10000): Promise<PreloadedData> {
    // If already loaded, return immediately
    if (this.data.isReady) {
      console.log('✅ Data already preloaded');
      return this.getData();
    }

    // If currently loading, wait for it
    if (this.data.isLoading) {
      console.log('⏳ Already loading, waiting...');
      return new Promise((resolve) => {
        const checkReady = () => {
          if (this.data.isReady || this.data.error) {
            resolve(this.getData());
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });
    }

    this.data.isLoading = true;
    this.data.error = null;
    this.notify();

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      console.log('🚀 Starting data preload...');

      // Fetch all endpoints in parallel
      const endpoints = [
        { key: 'recentTracks', url: '/api/tracks/recent', limit: 12 },
        { key: 'popularTracks', url: '/api/tracks/popular', limit: 12 },
        { key: 'trendingCreators', url: '/api/users/creators', limit: 6 },
        { key: 'homepageSlides', url: '/api/homepage/slides', limit: 5 },
      ];

      const promises = endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`${API_URL}${endpoint.url}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });

          if (response.ok) {
            const result = await response.json();
            // Handle different response structures
            const dataArray: any[] = Array.isArray(result) ? result : 
                             result.data || result.tracks || result.creators || result.slides || [];
            
            (this.data as any)[endpoint.key] = dataArray.slice(0, endpoint.limit);
            console.log(`✅ Loaded ${dataArray.length} ${endpoint.key}`);
          } else {
            console.warn(`Failed to load ${endpoint.url}: ${response.status}`);
            (this.data as any)[endpoint.key] = [];
          }
        } catch (error) {
          console.warn(`Error fetching ${endpoint.url}:`, error);
          (this.data as any)[endpoint.key] = [];
        }
      });

      await Promise.all(promises);
      clearTimeout(timeoutId);

      // Mark as ready
      this.data.isLoading = false;
      this.data.isReady = true;
      this.notify();

      console.log('✅ All data preloaded successfully!');
      return this.getData();

    } catch (error) {
      console.error('❌ Preload failed:', error);
      this.data.isLoading = false;
      this.data.error = error instanceof Error ? error.message : 'Unknown error';
      this.data.isReady = false; // Allow retry
      this.notify();
      
      throw error;
    }
  }

  /**
   * Force reload data
   */
  async reloadData(): Promise<PreloadedData> {
    this.data.isReady = false;
    return this.preloadData();
  }

  /**
   * Clear all data
   */
  clearData() {
    this.data = {
      recentTracks: [],
      popularTracks: [],
      trendingCreators: [],
      homepageSlides: [],
      isLoading: false,
      isReady: false,
      error: null,
    };
    this.notify();
  }

  /**
   * Get minimum data required for home page
   */
  hasMinimumData(): boolean {
    const minTracks = this.data.recentTracks.length > 0 || this.data.popularTracks.length > 0;
    const minSlides = this.data.homepageSlides.length > 0;
    return minTracks || minSlides;
  }
}

// Export singleton instance
export const dataPreloaderService = new DataPreloaderService();
