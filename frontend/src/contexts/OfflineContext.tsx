'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineStorage, OfflineTrack, downloadAudioAsBlob } from '../utils/offlineStorage';
import { setOnlineState } from '../utils/offlineApi';
import { offlineCacheService } from '../services/offlineCacheService';

interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  offlineTracks: OfflineTrack[];
  isDownloading: boolean;
  downloadProgress: number;
  isMobileApp: boolean;
  checkOnlineStatus: () => void;
  downloadTrackForOffline: (track: any) => Promise<void>;
  removeOfflineTrack: (trackId: string) => Promise<void>;
  isTrackDownloaded: (trackId: string) => boolean;
  toggleFavorite: (trackId: string) => Promise<boolean>;
  clearAllOfflineData: () => Promise<void>;
  getStorageStats: () => Promise<{ trackCount: number; totalSize: number }>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineTracks, setOfflineTracks] = useState<OfflineTrack[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isMobileApp, setIsMobileApp] = useState(false);

  /**
   * Check online status and load offline tracks
   */
  const checkOnlineStatus = useCallback(async () => {
    const online = navigator.onLine;
    setIsOnline(online);
    
    // Sync with offline API utility
    setOnlineState(online);
    
    // Detect if running in a mobile app (Capacitor, Cordova, or standalone PWA)
    const isMobile = (
      typeof window !== 'undefined' &&
      (
        // Capacitor/Cordova
        'Capacitor' in window || 
        'cordova' in window ||
        // Standalone PWA
        window.matchMedia('(display-mode: standalone)').matches ||
        // iOS standalone
        ('standalone' in window.navigator && (window.navigator as any).standalone === true) ||
        // Android standalone
        /Android.*Mozilla/.test(navigator.userAgent) && /Safari.*Mozilla/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
      )
    );
    
    setIsMobileApp(isMobile);
    
    if (!online) {
      setIsOfflineMode(true);
      console.log('🔴 App is now in offline mode');
      if (isMobile) {
        console.log('📱 Mobile app detected - enabling offline player');
      }
      
      // Clear expired cache entries when going offline
      offlineCacheService.clearExpired();
      
      // Log cache stats
      const stats = offlineCacheService.getStats();
      console.log('💾 Offline cache available:', stats);
    } else {
      setIsOfflineMode(false);
      console.log('🟢 App is online');
    }

    // Load offline tracks from IndexedDB
    try {
      await offlineStorage.init();
      const tracks = await offlineStorage.getAllTracks();
      setOfflineTracks(tracks);
      
      if (tracks.length > 0 && !online) {
        console.log(`Loaded ${tracks.length} offline tracks`);
      }
    } catch (error) {
      console.error('Failed to load offline tracks:', error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    checkOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, [checkOnlineStatus]);

  /**
   * Download a track for offline playback
   */
  const downloadTrackForOffline = async (track: any) => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Check if already downloaded
      const existing = await offlineStorage.getTrack(track.id);
      if (existing) {
        console.log('Track already downloaded:', track.title);
        setIsDownloading(false);
        setDownloadProgress(100);
        return;
      }

      // Download audio file as blob
      setDownloadProgress(30);
      const audioBlob = await downloadAudioAsBlob(track.audioUrl || track.stream_url);
      
      setDownloadProgress(70);
      
      // Save to IndexedDB
      await offlineStorage.downloadTrack({
        id: track.id,
        title: track.title,
        artist: track.artist?.name || track.artist_name || 'Unknown Artist',
        album: track.album?.name || track.album_name,
        coverArt: track.coverArt || track.album_cover,
        audioData: audioBlob,
        duration: track.duration,
        downloadDate: Date.now(),
        playCount: 0,
        isFavorite: false
      });

      setDownloadProgress(100);
      
      // Update local state
      const updatedTracks = await offlineStorage.getAllTracks();
      setOfflineTracks(updatedTracks);

      console.log('Track downloaded successfully:', track.title);
    } catch (error) {
      console.error('Failed to download track:', error);
      throw error;
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(0), 2000);
    }
  };

  /**
   * Remove an offline track
   */
  const removeOfflineTrack = async (trackId: string) => {
    try {
      await offlineStorage.deleteTrack(trackId);
      const updatedTracks = await offlineStorage.getAllTracks();
      setOfflineTracks(updatedTracks);
      console.log('Offline track removed:', trackId);
    } catch (error) {
      console.error('Failed to remove offline track:', error);
      throw error;
    }
  };

  /**
   * Check if a track is downloaded
   */
  const isTrackDownloaded = useCallback((trackId: string): boolean => {
    return offlineTracks.some(track => track.id === trackId);
  }, [offlineTracks]);

  /**
   * Toggle favorite status
   */
  const toggleFavorite = async (trackId: string): Promise<boolean> => {
    try {
      const isFavorite = await offlineStorage.toggleFavorite(trackId);
      const updatedTracks = await offlineStorage.getAllTracks();
      setOfflineTracks(updatedTracks);
      return isFavorite;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return false;
    }
  };

  /**
   * Clear all offline data
   */
  const clearAllOfflineData = async () => {
    try {
      await offlineStorage.clearAll();
      setOfflineTracks([]);
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      throw error;
    }
  };

  /**
   * Get storage statistics
   */
  const getStorageStats = async (): Promise<{ trackCount: number; totalSize: number }> => {
    try {
      return await offlineStorage.getStorageStats();
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { trackCount: 0, totalSize: 0 };
    }
  };

  return (
    <OfflineContext.Provider value={{
      isOnline,
      isOfflineMode,
      offlineTracks,
      isDownloading,
      downloadProgress,
      isMobileApp,
      checkOnlineStatus,
      downloadTrackForOffline,
      removeOfflineTrack,
      isTrackDownloaded,
      toggleFavorite,
      clearAllOfflineData,
      getStorageStats
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
