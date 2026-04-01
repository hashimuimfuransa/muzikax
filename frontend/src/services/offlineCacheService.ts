/**
 * Offline Data Cache Service
 * Caches essential data before user goes offline
 * Provides cached data when offline
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface OfflineData {
  recentTracks?: any[];
  popularTracks?: any[];
  homepageSlides?: any[];
  trendingCreators?: any[];
  lastSyncTime?: number;
}

interface OfflineCache {
  monthlyPopularTracks: CacheEntry<any[]> | null;
  trendingTracks: CacheEntry<any[]> | null;
  creatorProfiles: Map<string, CacheEntry<any>>;
  creatorTracks: Map<string, CacheEntry<any[]>>;
  trackDetails: Map<string, CacheEntry<any>>;
}

const CACHE_DURATION = {
  MONTHLY_POPULAR: 30 * 60 * 1000, // 30 minutes
  TRENDING: 30 * 60 * 1000, // 30 minutes
  CREATOR_PROFILE: 60 * 60 * 1000, // 1 hour
  CREATOR_TRACKS: 60 * 60 * 1000, // 1 hour
  TRACK_DETAILS: 60 * 60 * 1000, // 1 hour
};

class OfflineCacheService {
  private cache: OfflineCache = {
    monthlyPopularTracks: null,
    trendingTracks: null,
    creatorProfiles: new Map(),
    creatorTracks: new Map(),
    trackDetails: new Map(),
  };
  private offlineData: OfflineData | null = null;

  /**
   * Cache monthly popular tracks
   */
  cacheMonthlyPopularTracks(tracks: any[]) {
    this.cache.monthlyPopularTracks = {
      data: tracks,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_DURATION.MONTHLY_POPULAR,
    };
    console.log('💾 Cached monthly popular tracks:', tracks.length);
  }

  /**
   * Get cached monthly popular tracks
   */
  getCachedMonthlyPopularTracks(): any[] | null {
    const entry = this.cache.monthlyPopularTracks;
    if (entry && Date.now() < entry.expiry) {
      console.log('✅ Using cached monthly popular tracks');
      return entry.data;
    }
    console.log('⚠️ No valid cached monthly popular tracks');
    return null;
  }

  /**
   * Cache trending tracks
   */
  cacheTrendingTracks(tracks: any[]) {
    this.cache.trendingTracks = {
      data: tracks,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_DURATION.TRENDING,
    };
    console.log('💾 Cached trending tracks:', tracks.length);
  }

  /**
   * Get cached trending tracks
   */
  getCachedTrendingTracks(): any[] | null {
    const entry = this.cache.trendingTracks;
    if (entry && Date.now() < entry.expiry) {
      console.log('✅ Using cached trending tracks');
      return entry.data;
    }
    console.log('⚠️ No valid cached trending tracks');
    return null;
  }

  /**
   * Cache creator profile
   */
  cacheCreatorProfile(creatorId: string, profile: any) {
    this.cache.creatorProfiles.set(creatorId, {
      data: profile,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_DURATION.CREATOR_PROFILE,
    });
    console.log(`💾 Cached creator profile: ${creatorId}`);
  }

  /**
   * Get cached creator profile
   */
  getCachedCreatorProfile(creatorId: string): any | null {
    const entry = this.cache.creatorProfiles.get(creatorId);
    if (entry && Date.now() < entry.expiry) {
      console.log(`✅ Using cached creator profile: ${creatorId}`);
      return entry.data;
    }
    console.log(`⚠️ No valid cached creator profile: ${creatorId}`);
    return null;
  }

  /**
   * Cache creator tracks
   */
  cacheCreatorTracks(creatorId: string, tracks: any[]) {
    this.cache.creatorTracks.set(creatorId, {
      data: tracks,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_DURATION.CREATOR_TRACKS,
    });
    console.log(`💾 Cached creator tracks: ${creatorId}`);
  }

  /**
   * Get cached creator tracks
   */
  getCachedCreatorTracks(creatorId: string): any[] | null {
    const entry = this.cache.creatorTracks.get(creatorId);
    if (entry && Date.now() < entry.expiry) {
      console.log(`✅ Using cached creator tracks: ${creatorId}`);
      return entry.data;
    }
    console.log(`⚠️ No valid cached creator tracks: ${creatorId}`);
    return null;
  }

  /**
   * Cache track details
   */
  cacheTrackDetails(trackId: string, track: any) {
    this.cache.trackDetails.set(trackId, {
      data: track,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_DURATION.TRACK_DETAILS,
    });
    console.log(`💾 Cached track details: ${trackId}`);
  }

  /**
   * Get cached track details
   */
  getCachedTrackDetails(trackId: string): any | null {
    const entry = this.cache.trackDetails.get(trackId);
    if (entry && Date.now() < entry.expiry) {
      console.log(`✅ Using cached track details: ${trackId}`);
      return entry.data;
    }
    console.log(`⚠️ No valid cached track details: ${trackId}`);
    return null;
  }

  /**
   * Pre-cache essential data for offline mode
   * Call this when we detect network is about to go down
   */
  async preCacheEssentialData(fetchFunctions: {
    fetchMonthlyPopular?: () => Promise<any[]>;
    fetchTrending?: () => Promise<any[]>;
  }) {
    console.log('🔄 Pre-caching essential data for offline mode...');
    
    try {
      if (fetchFunctions.fetchMonthlyPopular) {
        const tracks = await fetchFunctions.fetchMonthlyPopular();
        if (tracks && tracks.length > 0) {
          this.cacheMonthlyPopularTracks(tracks);
        }
      }
      
      if (fetchFunctions.fetchTrending) {
        const tracks = await fetchFunctions.fetchTrending();
        if (tracks && tracks.length > 0) {
          this.cacheTrendingTracks(tracks);
        }
      }
      
      console.log('✅ Essential data cached for offline mode');
    } catch (error) {
      console.error('❌ Error pre-caching data:', error);
    }
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.monthlyPopularTracks = null;
    this.cache.trendingTracks = null;
    this.cache.creatorProfiles.clear();
    this.cache.creatorTracks.clear();
    this.cache.trackDetails.clear();
    console.log('🗑️ Cleared all offline cache');
  }

  /**
   * Clear expired entries
   */
  clearExpired() {
    const now = Date.now();
    
    // Clear monthly popular if expired
    if (this.cache.monthlyPopularTracks && now >= this.cache.monthlyPopularTracks.expiry) {
      this.cache.monthlyPopularTracks = null;
    }
    
    // Clear trending if expired
    if (this.cache.trendingTracks && now >= this.cache.trendingTracks.expiry) {
      this.cache.trendingTracks = null;
    }
    
    // Clear expired creator profiles
    this.cache.creatorProfiles.forEach((value, key) => {
      if (now >= value.expiry) {
        this.cache.creatorProfiles.delete(key);
      }
    });
    
    // Clear expired creator tracks
    this.cache.creatorTracks.forEach((value, key) => {
      if (now >= value.expiry) {
        this.cache.creatorTracks.delete(key);
      }
    });
    
    // Clear expired track details
    this.cache.trackDetails.forEach((value, key) => {
      if (now >= value.expiry) {
        this.cache.trackDetails.delete(key);
      }
    });
    
    console.log('🧹 Cleared expired cache entries');
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      monthlyPopularTracks: this.cache.monthlyPopularTracks ? '✓' : '✗',
      trendingTracks: this.cache.trendingTracks ? '✓' : '✗',
      creatorProfiles: this.cache.creatorProfiles.size,
      creatorTracks: this.cache.creatorTracks.size,
      trackDetails: this.cache.trackDetails.size,
    };
  }

  /**
   * Get offline data
   */
  getOfflineData(): OfflineData | null {
    return this.offlineData;
  }

  /**
   * Sync data for offline mode
   */
  async syncData() {
    console.log('🔄 Syncing data for offline mode...');
    
    try {
      // Update offline data with current cached content
      this.offlineData = {
        recentTracks: this.getCachedMonthlyPopularTracks() || undefined,
        popularTracks: this.getCachedTrendingTracks() || undefined,
        homepageSlides: [], // Can be populated from other sources
        trendingCreators: [], // Can be populated from creator profiles
        lastSyncTime: Date.now(),
      };
      
      console.log('✅ Data synced for offline mode');
    } catch (error) {
      console.error('❌ Error syncing data:', error);
    }
  }
}

// Singleton instance
export const offlineCacheService = new OfflineCacheService();
