'use client';

import { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface AudioPlayerContextType {
  currentTrack: string | null;
  isPlaying: boolean;
  playTrack: (trackId: string, audioUrl: string) => void;
  pauseTrack: () => void;
  stopTrack: () => void;
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
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = (trackId: string, audioUrl: string) => {
    // If we're already playing this track, just toggle play/pause
    if (currentTrack === trackId && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // Stop current track if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create new audio element
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
    };

    // Play the new track
    audio.play().then(() => {
      setCurrentTrack(trackId);
      setIsPlaying(true);
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
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        stopTrack
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};