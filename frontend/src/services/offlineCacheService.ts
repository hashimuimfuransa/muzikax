/**
 * Offline Data Cache Service
 * Manages cached data from backend for offline viewing
 */

export interface CachedData {
  data: any;
  timestamp: number;
  expiresAt: number;
}

export interface OfflineData {
  recentTracks?: any[];
  popularTracks?: any[];
  trendingCreators?: any[];
  homepageSlides?: any[];
  lastSyncTime?: number;
}

const CACHE_PREFIX = 'muzikax_cache_';
const DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

class OfflineCacheService {
  private isOnline: boolean = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🟢 Back online - syncing data...');
      this.syncData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('🔴 Gone offline - using cached data');
    });
  }

  /**
   * Cache data from backend
   */
  async cacheData(key: string, data: any, expiryMs: number = DEFAULT_EXPIRY): Promise<void> {
    try {
      const cacheEntry: CachedData = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + expiryMs,
      };

      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheEntry));
      console.log(`✅ Cached data for key: ${key}`);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  /**
   * Get cached data (returns null if expired or not found)
   */
  getCachedData<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      
      if (!cached) {
        return null;
      }

      const entry: CachedData = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() > entry.expiresAt) {
        console.log(`⏰ Cache expired for key: ${key}`);
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      console.log(`✅ Retrieved cached data for key: ${key}`);
      return entry.data as T;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  /**
   * Get offline data bundle for loading screen
   */
  getOfflineData(): OfflineData {
    const offlineData: OfflineData = {
      recentTracks: this.getCachedData<any[]>('recent_tracks') || undefined,
      popularTracks: this.getCachedData<any[]>('popular_tracks') || undefined,
      trendingCreators: this.getCachedData<any[]>('trending_creators') || undefined,
      homepageSlides: this.getCachedData<any[]>('homepage_slides') || undefined,
      lastSyncTime: this.getCachedData<number>('last_sync_time') || undefined,
    };

    return offlineData;
  }

  /**
   * Sync fresh data when online
   */
  async syncData(): Promise<void> {
    if (!this.isOnline) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Fetch critical data in parallel
      const endpoints = [
        { key: 'recent_tracks', url: '/api/tracks/recent', limit: 10 },
        { key: 'popular_tracks', url: '/api/tracks/popular', limit: 10 },
        { key: 'trending_creators', url: '/api/users/creators', limit: 5 },
        { key: 'homepage_slides', url: '/api/homepage/slides', limit: 5 },
      ];

      const promises = endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`${API_URL}${endpoint.url}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            const data = await response.json();
            await this.cacheData(endpoint.key, data, DEFAULT_EXPIRY);
          }
        } catch (error) {
          console.warn(`Failed to sync ${endpoint.key}:`, error);
        }
      });

      await Promise.all(promises);
      
      // Update last sync time
      await this.cacheData('last_sync_time', Date.now(), DEFAULT_EXPIRY);
      
      console.log('✅ Data sync complete');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalKeys: number; totalSize: number; oldestEntry: string | null } {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    let totalSize = 0;
    let oldestTime = Date.now();
    let oldestKey = null;

    cacheKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
        
        try {
          const entry: CachedData = JSON.parse(value);
          if (entry.timestamp < oldestTime) {
            oldestTime = entry.timestamp;
            oldestKey = key.replace(CACHE_PREFIX, '');
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });

    return {
      totalKeys: cacheKeys.length,
      totalSize: Math.round(totalSize / 1024), // KB
      oldestEntry: oldestKey,
    };
  }
}

// Export singleton instance
export const offlineCacheService = new OfflineCacheService();

// Auto-sync on initial load if online
if (navigator.onLine) {
  setTimeout(() => {
    offlineCacheService.syncData();
  }, 1000); // Wait 1 second after page load
}
