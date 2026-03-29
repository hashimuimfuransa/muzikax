/**
 * IndexedDB Offline Storage for Music Tracks
 * Provides offline playback capability by caching audio files and metadata
 */

const DB_NAME = 'MuzikaXOfflineDB';
const DB_VERSION = 1;
const TRACKS_STORE = 'tracks';
const PLAYLISTS_STORE = 'playlists';

export interface OfflineTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverArt?: string;
  audioData: Blob;
  duration?: number;
  downloadDate: number;
  playCount: number;
  isFavorite: boolean;
}

export interface OfflinePlaylist {
  id: string;
  name: string;
  trackIds: string[];
  createdDate: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
        this.initPromise = null;
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create tracks store
        if (!db.objectStoreNames.contains(TRACKS_STORE)) {
          const tracksStore = db.createObjectStore(TRACKS_STORE, { keyPath: 'id' });
          tracksStore.createIndex('artist', 'artist', { unique: false });
          tracksStore.createIndex('title', 'title', { unique: false });
          tracksStore.createIndex('downloadDate', 'downloadDate', { unique: false });
          tracksStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        }

        // Create playlists store
        if (!db.objectStoreNames.contains(PLAYLISTS_STORE)) {
          const playlistsStore = db.createObjectStore(PLAYLISTS_STORE, { keyPath: 'id' });
          playlistsStore.createIndex('name', 'name', { unique: false });
          playlistsStore.createIndex('createdDate', 'createdDate', { unique: false });
        }

        console.log('Database schema upgraded');
      };
    });

    return this.initPromise;
  }

  /**
   * Download and cache a track for offline playback
   */
  async downloadTrack(track: OfflineTrack): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRACKS_STORE], 'readwrite');
      const store = transaction.objectStore(TRACKS_STORE);

      track.downloadDate = Date.now();
      track.playCount = 0;
      track.isFavorite = false;

      const request = store.put(track);

      request.onsuccess = () => {
        console.log(`Track downloaded: ${track.title}`);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to download track:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get a cached track by ID
   */
  async getTrack(trackId: string): Promise<OfflineTrack | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRACKS_STORE], 'readonly');
      const store = transaction.objectStore(TRACKS_STORE);
      const request = store.get(trackId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get all offline tracks
   */
  async getAllTracks(): Promise<OfflineTrack[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRACKS_STORE], 'readonly');
      const store = transaction.objectStore(TRACKS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Delete a cached track
   */
  async deleteTrack(trackId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRACKS_STORE], 'readwrite');
      const store = transaction.objectStore(TRACKS_STORE);
      const request = store.delete(trackId);

      request.onsuccess = () => {
        console.log(`Track deleted: ${trackId}`);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Update track play count
   */
  async updatePlayCount(trackId: string): Promise<void> {
    const track = await this.getTrack(trackId);
    if (track) {
      track.playCount += 1;
      await this.downloadTrack(track);
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(trackId: string): Promise<boolean> {
    const track = await this.getTrack(trackId);
    if (track) {
      track.isFavorite = !track.isFavorite;
      await this.downloadTrack(track);
      return track.isFavorite;
    }
    return false;
  }

  /**
   * Get favorite tracks
   */
  async getFavoriteTracks(): Promise<OfflineTrack[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRACKS_STORE], 'readonly');
      const store = transaction.objectStore(TRACKS_STORE);
      const index = store.index('isFavorite');
      const range = IDBKeyRange.only(true);
      const request = index.getAll(range);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Create an offline playlist
   */
  async createPlaylist(name: string, trackIds: string[]): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const playlist: OfflinePlaylist = {
      id: `playlist_${Date.now()}`,
      name,
      trackIds,
      createdDate: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PLAYLISTS_STORE], 'readwrite');
      const store = transaction.objectStore(PLAYLISTS_STORE);
      const request = store.put(playlist);

      request.onsuccess = () => {
        console.log(`Playlist created: ${name}`);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get all playlists
   */
  async getAllPlaylists(): Promise<OfflinePlaylist[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PLAYLISTS_STORE], 'readonly');
      const store = transaction.objectStore(PLAYLISTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PLAYLISTS_STORE], 'readwrite');
      const store = transaction.objectStore(PLAYLISTS_STORE);
      const request = store.delete(playlistId);

      request.onsuccess = () => {
        console.log(`Playlist deleted: ${playlistId}`);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Clear all cached data
   */
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRACKS_STORE, PLAYLISTS_STORE], 'readwrite');
      const tracksStore = transaction.objectStore(TRACKS_STORE);
      const playlistsStore = transaction.objectStore(PLAYLISTS_STORE);

      tracksStore.clear();
      playlistsStore.clear();

      transaction.oncomplete = () => {
        console.log('All offline data cleared');
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{ trackCount: number; totalSize: number }> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tracks = await this.getAllTracks();
    let totalSize = 0;

    tracks.forEach(track => {
      if (track.audioData instanceof Blob) {
        totalSize += track.audioData.size;
      }
    });

    return {
      trackCount: tracks.length,
      totalSize
    };
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();

// Helper function to download audio file as blob
export async function downloadAudioAsBlob(url: string): Promise<Blob> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.blob();
  } catch (error) {
    console.error('Failed to download audio:', error);
    throw error;
  }
}
