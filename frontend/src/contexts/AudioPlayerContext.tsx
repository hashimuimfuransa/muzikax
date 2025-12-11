'use client';

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { incrementTrackPlayCount } from '../services/trackService';

interface Track {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl: string;
  duration?: number; // in seconds
  creatorId?: string; // Add creator ID for linking to artist profile
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isMinimized: boolean;
  playlist: Track[];
  playlists: Playlist[];
  favorites: Track[];
  playTrack: (track: Track) => void;
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  pauseTrack: () => void;
  stopTrack: () => void;
  togglePlayPause: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
  setProgress: (progress: number) => void;
  progress: number;
  duration: number;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  createPlaylist: (name: string) => void;
  addToFavorites: (track: Track) => void;
  removeFromFavorites: (trackId: string) => void;
  setCurrentPlaylist: (tracks: Track[]) => void;
  currentTrackIndex: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasIncrementedPlayCount = useRef<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites from localStorage', e);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const playTrack = (track: Track) => {
    // Validate that we have a valid audio URL
    if (!track.audioUrl || track.audioUrl.trim() === '') {
      console.error('Cannot play track: Invalid audio URL', track);
      return;
    }
    
    // If we're already playing this track, just resume
    if (currentTrack?.id === track.id && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Error resuming track:', error);
      });
      setIsPlaying(true);
      return;
    }

    // Stop current track if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create new audio element
    const audio = new Audio(track.audioUrl);
    audioRef.current = audio;
    
    // Set up event listeners
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => {
      setIsPlaying(false);
      playNextTrack();
    };
    
    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime);
        setDuration(audio.duration);
      }
    };
    
    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };

    // Set the current track immediately
    setCurrentTrack(track);
    setIsMinimized(false); // Expand player when new track starts
    
    // Find track index in playlist if it exists
    const index = playlist.findIndex(t => t.id === track.id);
    if (index !== -1) {
      setCurrentTrackIndex(index);
    }

    // Increment play count for this track (only once per session)
    if (!hasIncrementedPlayCount.current.has(track.id)) {
      hasIncrementedPlayCount.current.add(track.id);
      incrementTrackPlayCount(track.id)
        .then(() => {
          console.log(`Successfully incremented play count for track ${track.id}`);
        })
        .catch((error) => {
          console.error(`Failed to increment play count for track ${track.id}:`, error);
        });
    }

    // Small delay to ensure audio element is properly initialized
    setTimeout(() => {
      // Play the new track
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error playing track:', error);
        setIsPlaying(false);
        setCurrentTrack(null);
      });
    }, 0);
  };

  const playNextTrack = () => {
    if (playlist.length > 0 && currentTrack) {
      const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
      if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
        const nextTrack = playlist[currentIndex + 1];
        playTrack(nextTrack);
        setCurrentTrackIndex(currentIndex + 1);
      }
    }
  };

  const playPreviousTrack = () => {
    if (playlist.length > 0 && currentTrack) {
      const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
      if (currentIndex > 0) {
        const prevTrack = playlist[currentIndex - 1];
        playTrack(prevTrack);
        setCurrentTrackIndex(currentIndex - 1);
      }
    }
  };

  const pauseTrack = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setCurrentTrack(null);
      setProgress(0);
      setDuration(0);
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack(currentTrack);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const closePlayer = () => {
    stopTrack();
    setIsMinimized(false);
  };

  const addToPlaylist = (track: Track) => {
    setPlaylist(prev => {
      // Check if track already exists in playlist
      if (prev.some(t => t.id === track.id)) {
        return prev;
      }
      return [...prev, track];
    });
  };

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist(prev => prev.filter(track => track.id !== trackId));
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      tracks: [...playlist]
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const addToFavorites = (track: Track) => {
    setFavorites(prev => {
      // Check if track already exists in favorites
      if (prev.some(t => t.id === track.id)) {
        return prev;
      }
      return [...prev, track];
    });
  };

  const removeFromFavorites = (trackId: string) => {
    setFavorites(prev => prev.filter(track => track.id !== trackId));
  };

  const setCurrentPlaylist = (tracks: Track[]) => {
    setPlaylist(tracks);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isMinimized,
        playTrack,
        playNextTrack,
        playPreviousTrack,
        pauseTrack,
        stopTrack,
        togglePlayPause,
        toggleMinimize,
        closePlayer,
        progress,
        duration,
        setProgress,
        playlist,
        playlists,
        favorites,
        addToPlaylist,
        removeFromPlaylist,
        createPlaylist,
        addToFavorites,
        removeFromFavorites,
        setCurrentPlaylist,
        currentTrackIndex,
        audioRef
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};