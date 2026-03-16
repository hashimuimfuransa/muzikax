'use client';

import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRef, useEffect, useState } from 'react';

interface SoloPlayerProps {
  onClose: () => void;
}

const SoloPlayer = ({ onClose }: SoloPlayerProps) => {
  const { t } = useLanguage();
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playNextTrack,
    playPreviousTrack,
    progress,
    duration,
    setProgress,
    audioRef
  } = useAudioPlayer();

  const progressRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Prevent scrolling when solo player is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!currentTrack || !isMounted) return null;

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newProgress = percent * duration;
    
    setProgress(newProgress);
    
    if (audioRef && audioRef.current) {
      audioRef.current.currentTime = newProgress;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-500">
      {/* Background with blurred thumbnail */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-40 scale-110"
        style={{ backgroundImage: `url(${currentTrack.coverImage})` }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 z-10 p-2 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-lg px-8 flex flex-col items-center">
        {/* Track Thumbnail */}
        <div className={`relative aspect-square w-full mb-12 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 transition-transform duration-700 ${isPlaying ? 'scale-100' : 'scale-95'}`}>
          <img 
            src={currentTrack.coverImage} 
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Track Info */}
        <div className="text-center mb-10 w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 truncate px-4">
            {currentTrack.title}
          </h2>
          <p className="text-xl text-white/60 truncate px-4">
            {currentTrack.artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-10">
          <div 
            ref={progressRef}
            onClick={handleProgressClick}
            className="group relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden mb-3"
          >
            <div 
              className="absolute h-full bg-white transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${(progress / duration) * 100}%` }}
            />
            {/* Hover indicator */}
            <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" 
                 style={{ left: `${(progress / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="flex justify-between text-sm font-medium text-white/40">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 md:gap-12">
          {/* Previous */}
          <button 
            onClick={playPreviousTrack}
            className="text-white/70 hover:text-white transition-transform active:scale-90"
          >
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button 
            onClick={togglePlayPause}
            className="w-24 h-24 flex items-center justify-center bg-white text-black rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button 
            onClick={playNextTrack}
            className="text-white/70 hover:text-white transition-transform active:scale-90"
          >
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6l8.5 6L6 18zm9 0h2v12h-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoloPlayer;
