'use client';

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { incrementTrackPlayCount } from '../services/trackService';
import { fetchRecommendedTracks } from '../services/recommendationService';
import { useRouter } from 'next/navigation';
import { addTrackToFavorites, removeTrackFromFavorites, getUserFavorites, createPlaylist as createPlaylistService, addTrackToPlaylist as addTrackToPlaylistService, getUserPlaylists } from '../services/userService';

// Add this function to handle recently played tracks
const addRecentlyPlayedTrack = async (trackId: string) => {
  try {
    // Import the makeAuthenticatedRequest helper from userService
    // We'll implement a simplified version here to avoid circular dependencies
    
    let accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      // If no access token, silently fail without error
      return false;
    }

    // Add authorization header
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ trackId })
    };

    // Make initial request
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recently-played`, requestOptions);

    // If token is expired, try to refresh it
    if (response.status === 401) {
      console.log('Token might be expired, attempting to refresh...');
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            localStorage.setItem('refreshToken', refreshData.refreshToken);
            
            // Retry the request with new token
            requestOptions.headers = {
              ...requestOptions.headers,
              'Authorization': `Bearer ${refreshData.accessToken}`
            };
            
            response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recently-played`, requestOptions);
          }
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
      }
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add track to recently played');
    }

    return true;
  } catch (error) {
    console.error('Error adding track to recently played:', error);
    // Silently fail for unauthorized users to avoid interrupting playback
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
  minimizeAndGoBack: () => void; // Add this new function
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
  
  // Expose the playback context globally so it can be accessed from other components
  useEffect(() => {
    (window as any).audioPlayerContext = currentPlaybackContext;
    return () => {
      delete (window as any).audioPlayerContext;
    };
  }, []);

  // Load favorites and playlists from backend on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if user is authenticated by checking for access token
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          console.log('No access token found, skipping user data load');
          return;
        }
        
        // Load favorites
        const userFavorites = await getUserFavorites();
        setFavorites(userFavorites);
        
        // Load playlists
        const userPlaylists = await getUserPlaylists();
        // Map the playlists to ensure each has a unique id
        const mappedPlaylists = userPlaylists.map((playlist: any) => ({
          ...playlist,
          id: playlist._id || playlist.id, // Use _id if available, otherwise use id
          tracks: playlist.tracks?.map((track: any) => ({
            ...track,
            id: track._id || track.id // Use _id if available, otherwise use id
          })) || []
        }));
        setPlaylists(mappedPlaylists);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Flag to track if the track was explicitly played by user
  const explicitlyPlayedRef = useRef(false);
  
  // Navigate to full player page when a track is played and not minimized
  // Only navigate when explicitly playing a new track, not when auto-playing next track
  useEffect(() => {
    if (currentTrack && !isMinimized && explicitlyPlayedRef.current) {
      router.push('/player');
      // Reset the flag after navigation
      explicitlyPlayedRef.current = false;
    }
  }, [currentTrack, isMinimized, router]);
  
  const playTrack = (track: Track, contextPlaylist?: Track[], albumContext?: { albumId: string, tracks: Track[] }) => {
    console.log('PLAY TRACK CALLED with track:', track);
    console.log('Current track before playTrack:', currentTrack);
    console.log('Current track index before playTrack:', currentTrackIndex);
    
    // Validate that we have a valid audio URL
    if (!track.audioUrl || track.audioUrl.trim() === '') {
      console.error('Cannot play track: Invalid audio URL', track);
      return;
    }
    
    // If we're already playing this track, just resume
    if (currentTrack?.id === track.id && audioRef.current) {
      console.log('Resuming existing track');
      audioRef.current.play().catch(error => {
        console.error('Error resuming track:', error);
      });
      setIsPlaying(true);
      return;
    }

    // Stop current track if playing
    if (audioRef.current) {
      console.log('Stopping current audio');
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
      console.log('Setting album track index to:', index);
      setCurrentTrackIndex(index >= 0 ? index : 0);
    } else if (contextPlaylist && contextPlaylist.length > 0) {
      console.log('Setting playlist context with tracks:', contextPlaylist);
      currentPlaybackContext.current = { 
        type: 'playlist', 
        data: contextPlaylist 
      };
      setPlaylist(contextPlaylist);
      const index = contextPlaylist.findIndex(t => t.id === track.id);
      console.log('Setting playlist track index to:', index);
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
    audio.onplay = () => {
      console.log('Audio started playing');
      setIsPlaying(true);
    };
    audio.onpause = () => {
      console.log('Audio paused');
      setIsPlaying(false);
    };
    audio.onended = () => {
      console.log('AUDIO ONENDED EVENT TRIGGERED');
      console.log('Current track in onended:', currentTrack);
      console.log('Current track index in onended:', currentTrackIndex);
      console.log('Playlist in onended:', playlist);
      console.log('Playback context in onended:', currentPlaybackContext.current);
      setIsPlaying(false);
      // According to the specification, at the end of playback, currentTrack should be set to null
      // but currentTrackIndex should retain its value
      setCurrentTrack(null);
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
    console.log('Setting current track to:', track);
    setCurrentTrack(track);
    
    // Only expand player when new track starts if it was explicitly played by user
    // If it's an automatic playback (next track), preserve the current minimized state
    if (explicitlyPlayedRef.current) {
      setIsMinimized(false); // Expand player when explicitly played by user
    }
    // If explicitlyPlayedRef.current is false, we preserve the current isMinimized state
    
    // Mark this as an explicit play action
    explicitlyPlayedRef.current = true;
    
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

    // Small delay to ensure audio element is properly initialized
    setTimeout(() => {
      // Play the new track
      console.log('Attempting to play audio');
      audio.play().then(() => {
        console.log('Audio play successful');
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error playing track:', error);
        setIsPlaying(false);
        // Only set current track to null if this wasn't an automatic playlist progression
        // During playlist progression, we want to keep the context even if one track fails
        const context = currentPlaybackContext.current;
        const isInPlaylistContext = context.type === 'playlist' || context.type === 'album';
        console.log('Error context type:', context.type);
        console.log('Is in playlist context:', isInPlaylistContext);
        if (!isInPlaylistContext) {
          console.log('Setting current track to null due to error');
          setCurrentTrack(null);
        } else {
          console.log('Keeping current track due to playlist context');
        }
      });
    }, 0);
  };

  const playNextTrack = async () => {
    const context = currentPlaybackContext.current;
    console.log('PLAY NEXT TRACK - Starting execution');
    console.log('Context:', context);
    console.log('Current track:', currentTrack);
    console.log('Playlist:', playlist);
    console.log('Current track index:', currentTrackIndex);
    console.log('Playlist length:', playlist.length);
    
    // When automatically playing next track, reset the explicitly played flag
    // This ensures that automatic playback doesn't trigger full player navigation
    explicitlyPlayedRef.current = false;
    
    // If we're in album context, play next track in album
    if (context.type === 'album' && context.data) {
      console.log('In album context');
      const { tracks } = context.data;
      
      // Find current index based on currentTrack or currentTrackIndex
      let currentIndex = -1;
      if (currentTrack) {
        currentIndex = tracks.findIndex((track: Track) => track.id === currentTrack.id);
      } else {
        // Use the stored index if currentTrack is null
        currentIndex = currentTrackIndex;
      }
      
      console.log('Album current index:', currentIndex);
      
      if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
        const nextTrack = tracks[currentIndex + 1];
        console.log('Playing next album track:', nextTrack);
        playTrack(nextTrack, undefined, context.data);
        // Update the current track index
        setCurrentTrackIndex(currentIndex + 1);
        return;
      } else if (currentIndex !== -1 && currentIndex === tracks.length - 1) {
        // Loop back to the first track in the album
        console.log('Looping back to first track in album');
        const firstTrack = tracks[0];
        playTrack(firstTrack, undefined, context.data);
        // Update the current track index to 0 when looping
        setCurrentTrackIndex(0);
        return;
      }
    }
    
    // If we're in playlist context, play next track in playlist
    // Note: We check context.type === 'playlist' rather than playlist.length > 0
    // because the main playlist state might be temporarily empty while context.data preserves the playlist
    if (context.type === 'playlist' && context.data) {
      console.log('In playlist context');
      
      // Find current index based on currentTrack or currentTrackIndex
      let currentIndex = -1;
      if (currentTrack) {
        currentIndex = context.data.findIndex((track: Track) => track.id === currentTrack.id);
      } else {
        // Use the stored index if currentTrack is null
        currentIndex = currentTrackIndex;
      }
      
      console.log('Playlist current index:', currentIndex);
      console.log('Playlist length:', context.data.length);
      console.log('Is at last track:', currentIndex === context.data.length - 1);
      
      if (currentIndex !== -1 && currentIndex < context.data.length - 1) {
        const nextTrack = context.data[currentIndex + 1];
        console.log('Playing next playlist track:', nextTrack);
        playTrack(nextTrack, context.data);
        // Update the current track index
        setCurrentTrackIndex(currentIndex + 1);
        return;
      } else if (currentIndex !== -1 && currentIndex === context.data.length - 1) {
        // Instead of looping back to the first track, use our recommendation algorithm
        console.log('Using recommendation algorithm for next track');
        
        try {
          // Get recommended tracks based on the current track
          const recommendedTracks = await fetchRecommendedTracks(currentTrack?.id);
          
          if (recommendedTracks && recommendedTracks.length > 0) {
            // Select the first recommended track
            const nextTrack = {
              id: recommendedTracks[0]._id,
              title: recommendedTracks[0].title,
              artist: typeof recommendedTracks[0].creatorId === 'object' && recommendedTracks[0].creatorId !== null
                ? (recommendedTracks[0].creatorId as any).name || 'Unknown Artist'
                : 'Unknown Artist',
              coverImage: recommendedTracks[0].coverURL || '',
              audioUrl: recommendedTracks[0].audioURL,
              duration: 0, // Duration will be set when track loads
              creatorId: typeof recommendedTracks[0].creatorId === 'object' && recommendedTracks[0].creatorId !== null
                ? (recommendedTracks[0].creatorId as any)._id
                : recommendedTracks[0].creatorId
            };
            
            console.log('Playing recommended track:', nextTrack);
            playTrack(nextTrack, [nextTrack]); // Create a new playlist with just this track
            setCurrentTrackIndex(0);
            return;
          } else {
            // If no recommendations, try to play the first track in the playlist as a fallback
            // If that fails, stop playback
            if (playlist.length > 0) {
              console.log('No recommendations found, falling back to first track in playlist');
              const firstTrack = playlist[0];
              playTrack(firstTrack, playlist);
              setCurrentTrackIndex(0);
              return;
            } else {
              console.log('STOPPING TRACK - No recommendations found and no playlist fallback available');
              stopTrack();
            }
          }
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          // If recommendation fails, try to play the first track in the playlist as a fallback
          // If that fails, stop playback
          if (playlist.length > 0) {
            console.log('Recommendation failed, falling back to first track in playlist');
            const firstTrack = playlist[0];
            playTrack(firstTrack, playlist);
            setCurrentTrackIndex(0);
            return;
          } else {
            console.log('STOPPING TRACK - Recommendation failed and no playlist fallback available');
            stopTrack();
          }
        }
      } else if (context.data.length > 0) {
        // Fallback: if we can't determine current position, play first track
        console.log('Fallback: playing first track in playlist');
        const firstTrack = context.data[0];
        playTrack(firstTrack, context.data);
        // Update the current track index to 0
        setCurrentTrackIndex(0);
        return;
      }
    }
    
    // If we're in single track context or at the end of playlist/album, 
    // play next track in the main playlist
    if (playlist.length > 0 && (currentTrack || playlist[currentTrackIndex])) {
      console.log('In main playlist context');
      
      // Find current index based on currentTrack or currentTrackIndex
      let currentIndex = -1;
      if (currentTrack) {
        currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
      } else {
        // Use the stored index if currentTrack is null
        currentIndex = currentTrackIndex;
      }
      
      console.log('Main playlist current index:', currentIndex);
      console.log('Main playlist length:', playlist.length);
      
      if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
        const nextTrack = playlist[currentIndex + 1];
        console.log('Playing next main playlist track:', nextTrack);
        playTrack(nextTrack, playlist);
        setCurrentTrackIndex(currentIndex + 1);
        return;
      } else if (currentIndex !== -1 && currentIndex === playlist.length - 1) {
        // Instead of looping back to the first track, use our recommendation algorithm
        console.log('Using recommendation algorithm for next track');
        
        try {
          // Get recommended tracks based on the current track
          const recommendedTracks = await fetchRecommendedTracks(currentTrack?.id);
          
          if (recommendedTracks && recommendedTracks.length > 0) {
            // Select the first recommended track
            const nextTrack = {
              id: recommendedTracks[0]._id,
              title: recommendedTracks[0].title,
              artist: typeof recommendedTracks[0].creatorId === 'object' && recommendedTracks[0].creatorId !== null
                ? (recommendedTracks[0].creatorId as any).name || 'Unknown Artist'
                : 'Unknown Artist',
              coverImage: recommendedTracks[0].coverURL || '',
              audioUrl: recommendedTracks[0].audioURL,
              duration: 0, // Duration will be set when track loads
              creatorId: typeof recommendedTracks[0].creatorId === 'object' && recommendedTracks[0].creatorId !== null
                ? (recommendedTracks[0].creatorId as any)._id
                : recommendedTracks[0].creatorId
            };
            
            console.log('Playing recommended track:', nextTrack);
            playTrack(nextTrack, [nextTrack]); // Create a new playlist with just this track
            setCurrentTrackIndex(0);
            return;
          } else {
            // If no recommendations, try to play the first track in the playlist as a fallback
            // If that fails, stop playback
            if (playlist.length > 0) {
              console.log('No recommendations found, falling back to first track in playlist');
              const firstTrack = playlist[0];
              playTrack(firstTrack, playlist);
              setCurrentTrackIndex(0);
              return;
            } else {
              console.log('STOPPING TRACK - No recommendations found and no playlist fallback available');
              stopTrack();
            }
          }
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          // If recommendation fails, try to play the first track in the playlist as a fallback
          // If that fails, stop playback
          if (playlist.length > 0) {
            console.log('Recommendation failed, falling back to first track in playlist');
            const firstTrack = playlist[0];
            playTrack(firstTrack, playlist);
            setCurrentTrackIndex(0);
            return;
          } else {
            console.log('STOPPING TRACK - Recommendation failed and no playlist fallback available');
            stopTrack();
          }
        }
      } else if (playlist.length > 0) {
        // Fallback: if we can't determine current position, play first track
        console.log('Fallback: playing first track in main playlist');
        const firstTrack = playlist[0];
        playTrack(firstTrack, playlist);
        // Update the current track index to 0
        setCurrentTrackIndex(0);
        return;
      }
    }
    
    // If we reach here, we're at the end of the queue and not in album/playlist context
    // Use our recommendation algorithm to find the next track
    console.log('END OF QUEUE - Using recommendation algorithm');
    console.log('Current track for recommendations:', currentTrack);
    console.log('Playlist for recommendations:', playlist);
    
    try {
      // Get recommended tracks
      const recommendedTracks = await fetchRecommendedTracks(currentTrack?.id);
      console.log('Recommended tracks received:', recommendedTracks);
      
      if (recommendedTracks && recommendedTracks.length > 0) {
        // Select the first recommended track
        const nextTrack = {
          id: recommendedTracks[0]._id,
          title: recommendedTracks[0].title,
          artist: typeof recommendedTracks[0].creatorId === 'object' && recommendedTracks[0].creatorId !== null
            ? (recommendedTracks[0].creatorId as any).name || 'Unknown Artist'
            : 'Unknown Artist',
          coverImage: recommendedTracks[0].coverURL || '',
          audioUrl: recommendedTracks[0].audioURL,
          duration: 0, // Duration will be set when track loads
          creatorId: typeof recommendedTracks[0].creatorId === 'object' && recommendedTracks[0].creatorId !== null
            ? (recommendedTracks[0].creatorId as any)._id
            : recommendedTracks[0].creatorId
        };
        
        console.log('Playing recommended track:', nextTrack);
        playTrack(nextTrack, [nextTrack]); // Create a new playlist with just this track
        setCurrentTrackIndex(0);
        return;
      } else {
        // If no recommendations, try to play the first track in the playlist as a fallback
        // If that fails, stop playback
        if (playlist.length > 0) {
          console.log('No recommendations found, falling back to first track in playlist');
          const firstTrack = playlist[0];
          playTrack(firstTrack, playlist);
          setCurrentTrackIndex(0);
          return;
        } else {
          console.log('STOPPING TRACK - No recommendations found and no playlist fallback available');
          stopTrack();
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // If recommendation fails, try to play the first track in the playlist as a fallback
      // If that fails, stop playback
      if (playlist.length > 0) {
        console.log('Recommendation failed, falling back to first track in playlist');
        const firstTrack = playlist[0];
        playTrack(firstTrack, playlist);
        setCurrentTrackIndex(0);
        return;
      } else {
        console.log('STOPPING TRACK - Recommendation failed and no playlist fallback available');
        stopTrack();
      }
    }
  };

  const playPreviousTrack = () => {
    const context = currentPlaybackContext.current;
    console.log('PLAY PREVIOUS TRACK - Starting execution');
    console.log('Context:', context);
    console.log('Current track:', currentTrack);
    console.log('Playlist:', playlist);
    console.log('Current track index:', currentTrackIndex);
    
    // If we're in album context, play previous track in album
    if (context.type === 'album' && context.data) {
      console.log('In album context');
      const { tracks } = context.data;
      
      // Find current index based on currentTrack or currentTrackIndex
      let currentIndex = -1;
      if (currentTrack) {
        currentIndex = tracks.findIndex((track: Track) => track.id === currentTrack.id);
      } else {
        // Use the stored index if currentTrack is null
        currentIndex = currentTrackIndex;
      }
      
      console.log('Album current index:', currentIndex);
      
      if (currentIndex > 0) {
        const prevTrack = tracks[currentIndex - 1];
        playTrack(prevTrack, undefined, context.data);
        return;
      } else if (currentIndex === 0 && tracks.length > 1) {
        // Loop to the last track in the album
        console.log('Looping to last track in album');
        const lastTrack = tracks[tracks.length - 1];
        playTrack(lastTrack, undefined, context.data);
        return;
      }
    }
    
    // If we're in playlist context, play previous track in playlist
    if (context.type === 'playlist' && context.data) {
      console.log('In playlist context');
      
      // Find current index based on currentTrack or currentTrackIndex
      let currentIndex = -1;
      if (currentTrack) {
        currentIndex = context.data.findIndex((track: Track) => track.id === currentTrack.id);
      } else {
        // Use the stored index if currentTrack is null
        currentIndex = currentTrackIndex;
      }
      
      console.log('Playlist current index:', currentIndex);
      
      if (currentIndex > 0) {
        const prevTrack = context.data[currentIndex - 1];
        playTrack(prevTrack, context.data);
        return;
      } else if (currentIndex === 0 && context.data.length > 1) {
        // Loop to the last track in the playlist
        console.log('Looping to last track in playlist');
        const lastTrack = context.data[context.data.length - 1];
        playTrack(lastTrack, context.data);
        return;
      } else if (context.data.length > 1) {
        // Fallback: if we can't determine current position, play last track
        console.log('Fallback: playing last track in playlist');
        const lastTrack = context.data[context.data.length - 1];
        playTrack(lastTrack, context.data);
        return;
      }
    }
    
    // If we're in single track context or at the beginning of playlist/album, 
    // play previous track in the main playlist
    if (playlist.length > 0 && (currentTrack || playlist[currentTrackIndex])) {
      console.log('In main playlist context');
      
      // Find current index based on currentTrack or currentTrackIndex
      let currentIndex = -1;
      if (currentTrack) {
        currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
      } else {
        // Use the stored index if currentTrack is null
        currentIndex = currentTrackIndex;
      }
      
      console.log('Main playlist current index:', currentIndex);
      console.log('Main playlist length:', playlist.length);
      
      if (currentIndex > 0) {
        const prevTrack = playlist[currentIndex - 1];
        playTrack(prevTrack, playlist);
        setCurrentTrackIndex(currentIndex - 1);
        return;
      } else if (currentIndex === 0 && playlist.length > 1) {
        // Loop to the last track in the main playlist
        console.log('Looping to last track in main playlist');
        const lastTrack = playlist[playlist.length - 1];
        playTrack(lastTrack, playlist);
        setCurrentTrackIndex(playlist.length - 1);
        return;
      } else if (playlist.length > 1) {
        // Fallback: if we can't determine current position, play last track
        console.log('Fallback: playing last track in main playlist');
        const lastTrack = playlist[playlist.length - 1];
        playTrack(lastTrack, playlist);
        setCurrentTrackIndex(playlist.length - 1);
        return;
      }
    }
    
    // If we reach here, we're at the beginning of the queue
    // We could either stop or go to the end
    // For now, we'll restart the current track if there is one
    if (currentTrack) {
      playTrack(currentTrack, playlist);
    } else if (playlist.length > 0 && playlist[currentTrackIndex]) {
      // Fallback: play the track at the current index
      console.log('Fallback: restarting track at current index');
      playTrack(playlist[currentTrackIndex], playlist);
    }
  };

  const pauseTrack = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopTrack = () => {
    console.log('STOP TRACK CALLED');
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
    const willBeMinimized = !isMinimized;
    setIsMinimized(willBeMinimized);
  };
  
  const minimizeAndGoBack = () => {
    setIsMinimized(true);
    router.back();
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
        .then((result) => {
          if (result) {
            console.log('Track added to playlist');
          } else {
            console.log('Failed to add track to playlist - user may not be authenticated');
          }
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
      if (newPlaylist) {
        setPlaylists(prev => [...prev, newPlaylist]);
        return newPlaylist; // Return the new playlist
      } else {
        console.log('Failed to create playlist - user may not be authenticated');
        return null;
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      return null;
    }
  };

  const addToFavorites = async (track: Track) => {
    try {
      const result = await addTrackToFavorites(track.id);
      if (result) {
        setFavorites(prev => {
          // Check if track already exists in favorites
          if (prev.some(t => t.id === track.id)) {
            return prev;
          }
          return [...prev, track];
        });
        
        // Dispatch a custom event to notify other components that track data may have changed
        window.dispatchEvent(new CustomEvent('trackUpdated', { detail: { trackId: track.id } }));
      } else {
        console.log('Failed to add track to favorites - user may not be authenticated');
      }
    } catch (error) {
      console.error('Error adding track to favorites:', error);
    }
  };

  const removeFromFavorites = async (trackId: string) => {
    try {
      const result = await removeTrackFromFavorites(trackId);
      if (result) {
        setFavorites(prev => prev.filter(track => track.id !== trackId));
        
        // Dispatch a custom event to notify other components that track data may have changed
        window.dispatchEvent(new CustomEvent('trackUpdated', { detail: { trackId } }));
      } else {
        console.log('Failed to remove track from favorites - user may not be authenticated');
      }
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
        minimizeAndGoBack, // Add this new function
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
        createPlaylist, // Export the createPlaylist function
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