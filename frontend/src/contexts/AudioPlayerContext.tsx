'use client';

import { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl: string;
  duration?: number; // in seconds
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isMinimized: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  stopTrack: () => void;
  togglePlayPause: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
  setProgress: (progress: number) => void;
  progress: number;
  duration: number;
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = (track: Track) => {
    // If we're already playing this track, just resume
    if (currentTrack?.id === track.id && audioRef.current) {
      audioRef.current.play();
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
      setCurrentTrack(null);
      setProgress(0);
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

    // Play the new track
    audio.play().then(() => {
      setCurrentTrack(track);
      setIsPlaying(true);
      setIsMinimized(false); // Expand player when new track starts
    }).catch((error) => {
      console.error('Error playing track:', error);
      setIsPlaying(false);
      setCurrentTrack(null);
    });
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

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isMinimized,
        playTrack,
        pauseTrack,
        stopTrack,
        togglePlayPause,
        toggleMinimize,
        closePlayer,
        progress,
        duration,
        setProgress
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};