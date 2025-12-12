'use client';

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { incrementTrackPlayCount } from '../services/trackService';
import { useRouter } from 'next/navigation';
import { addTrackToFavorites, removeTrackFromFavorites, getUserFavorites, createPlaylist as createPlaylistService, addTrackToPlaylist as addTrackToPlaylistService, getUserPlaylists } from '../services/userService';

// Add this function to handle recently played tracks
const addRecentlyPlayedTrack = async (trackId: string) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recently-played`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ trackId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add track to recently played');
    }

    return true;
  } catch (error) {
    console.error('Error adding track to recently played:', error);
    return false;
  }
};

interface Track {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl: string;
  duration?: number; // in seconds
  creatorId?: string; // Add creator ID for linking to artist profile
  albumId?: string; // Add album ID for album playback logic
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
  playTrack: (track: Track, contextPlaylist?: Track[], albumContext?: { albumId: string, tracks: Track[] }) => void;
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
  const currentPlaybackContext = useRef<{ 
    type: 'playlist' | 'album' | 'single'; 
    data?: any 
  }>({ type: 'single' });

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

  const playTrack = (track: Track, contextPlaylist?: Track[], albumContext?: { albumId: string, tracks: Track[] }) => {
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

    // Set the playback context
    if (albumContext) {
      currentPlaybackContext.current = { 
        type: 'album', 
        data: albumContext 
      };
      // Set the playlist to the album tracks
      setPlaylist(albumContext.tracks);
      const index = albumContext.tracks.findIndex(t => t.id === track.id);
      setCurrentTrackIndex(index >= 0 ? index : 0);
    } else if (contextPlaylist && contextPlaylist.length > 0) {
      currentPlaybackContext.current = { 
        type: 'playlist', 
        data: contextPlaylist 
      };
      setPlaylist(contextPlaylist);
      const index = contextPlaylist.findIndex(t => t.id === track.id);
      setCurrentTrackIndex(index >= 0 ? index : 0);
    } else {
      currentPlaybackContext.current = { type: 'single' };
      // For single track, create a playlist with just this track
      setPlaylist([track]);
      setCurrentTrackIndex(0);
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
    
    // Add to recently played
    addRecentlyPlayedTrack(track.id);
    
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
    const context = currentPlaybackContext.current;
    
    // If we're in album context, play next track in album
    if (context.type === 'album' && context.data) {
      const { tracks } = context.data;
      const currentIndex = tracks.findIndex((track: Track) => track.id === currentTrack?.id);
      
      if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
        const nextTrack = tracks[currentIndex + 1];
        playTrack(nextTrack, undefined, context.data);
        return;
      }
    }
    
    // If we're in playlist context, play next track in playlist
    if (context.type === 'playlist' && context.data) {
      const currentIndex = context.data.findIndex((track: Track) => track.id === currentTrack?.id);
      
      if (currentIndex !== -1 && currentIndex < context.data.length - 1) {
        const nextTrack = context.data[currentIndex + 1];
        playTrack(nextTrack, context.data);
        return;
      }
    }
    
    // If we're in single track context or at the end of playlist/album, 
    // play next track in the main playlist
    if (playlist.length > 0 && currentTrack) {
      const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
      if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
        const nextTrack = playlist[currentIndex + 1];
        playTrack(nextTrack, playlist);
        setCurrentTrackIndex(currentIndex + 1);
        return;
      }
    }
    
    // If we reach here, we're at the end of the queue and not in album/playlist context
    // We could either stop or loop back to the beginning
    // For now, we'll stop
    stopTrack();
  };

  const playPreviousTrack = () => {
    const context = currentPlaybackContext.current;
    
    // If we're in album context, play previous track in album
    if (context.type === 'album' && context.data) {
      const { tracks } = context.data;
      const currentIndex = tracks.findIndex((track: Track) => track.id === currentTrack?.id);
      
      if (currentIndex > 0) {
        const prevTrack = tracks[currentIndex - 1];
        playTrack(prevTrack, undefined, context.data);
        return;
      }
    }
    
    // If we're in playlist context, play previous track in playlist
    if (context.type === 'playlist' && context.data) {
      const currentIndex = context.data.findIndex((track: Track) => track.id === currentTrack?.id);
      
      if (currentIndex > 0) {
        const prevTrack = context.data[currentIndex - 1];
        playTrack(prevTrack, context.data);
        return;
      }
    }
    
    // If we're in single track context or at the beginning of playlist/album, 
    // play previous track in the main playlist
    if (playlist.length > 0 && currentTrack) {
      const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
      if (currentIndex > 0) {
        const prevTrack = playlist[currentIndex - 1];
        playTrack(prevTrack, playlist);
        setCurrentTrackIndex(currentIndex - 1);
        return;
      }
    }
    
    // If we reach here, we're at the beginning of the queue
    // We could either stop or go to the end
    // For now, we'll restart the current track if there is one
    if (currentTrack) {
      playTrack(currentTrack, playlist);
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
      currentPlaybackContext.current = { type: 'single' }; // Reset context
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack(currentTrack, playlist);
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