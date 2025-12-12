'use client';

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { incrementTrackPlayCount } from '../services/trackService';
import { useRouter } from 'next/navigation';
import { addTrackToFavorites, removeTrackFromFavorites, getUserFavorites, createPlaylist as createPlaylistService, addTrackToPlaylist as addTrackToPlaylistService, getUserPlaylists } from '../services/userService';

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

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isMinimized: boolean;
  playlist: Track[];
  playlists: Playlist[];
  favorites: Track[];
  comments: Comment[];
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
  addComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  removeComment: (commentId: string) => void;
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasIncrementedPlayCount = useRef<Set<string>>(new Set());
  const router = useRouter();

  // Load favorites and playlists from backend on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load favorites
        const userFavorites = await getUserFavorites();
        setFavorites(userFavorites);
        
        // Load playlists
        const userPlaylists = await getUserPlaylists();
        setPlaylists(userPlaylists);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

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

    // Navigate to full player page
    router.push('/player');

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
      setComments([]); // Clear comments when stopping track
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
    // Check if track already exists in the main playlist
    const existsInMainPlaylist = playlist.some(t => t.id === track.id);
    
    if (!existsInMainPlaylist) {
      setPlaylist(prev => [...prev, track]);
    }
    
    // Also add to the first user playlist if it exists
    if (playlists.length > 0) {
      addTrackToPlaylistService(playlists[0].id, track.id)
        .then(() => {
          console.log('Track added to playlist');
        })
        .catch((error) => {
          console.error('Error adding track to playlist:', error);
        });
    }
  };

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist(prev => prev.filter(track => track.id !== trackId));
  };

  const createPlaylist = async (name: string) => {
    try {
      const newPlaylist = await createPlaylistService(name);
      setPlaylists(prev => [...prev, newPlaylist]);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const addToFavorites = async (track: Track) => {
    try {
      await addTrackToFavorites(track.id);
      setFavorites(prev => {
        // Check if track already exists in favorites
        if (prev.some(t => t.id === track.id)) {
          return prev;
        }
        return [...prev, track];
      });
    } catch (error) {
      console.error('Error adding track to favorites:', error);
    }
  };

  const removeFromFavorites = async (trackId: string) => {
    try {
      await removeTrackFromFavorites(trackId);
      setFavorites(prev => prev.filter(track => track.id !== trackId));
    } catch (error) {
      console.error('Error removing track from favorites:', error);
    }
  };

  const setCurrentPlaylist = (tracks: Track[]) => {
    setPlaylist(tracks);
  };

  const addComment = (comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      ...comment,
      timestamp: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
  };

  const removeComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
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
        comments,
        addToPlaylist,
        removeFromPlaylist,
        createPlaylist,
        addToFavorites,
        removeFromFavorites,
        setCurrentPlaylist,
        currentTrackIndex,
        audioRef,
        addComment,
        removeComment
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};