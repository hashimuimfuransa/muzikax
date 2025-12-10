'use client';

import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { useEffect, useRef, useState } from 'react';

const ModernAudioPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    isMinimized,
    togglePlayPause,
    toggleMinimize,
    closePlayer,
    progress,
    duration,
    setProgress,
    playNextTrack,
    playPreviousTrack,
    addToFavorites,
    removeFromFavorites,
    addToPlaylist,
    favorites,
    audioRef
  } = useAudioPlayer();

  const progressRef = useRef<HTMLDivElement>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if current track is in favorites
  useEffect(() => {
    if (currentTrack) {
      setIsFavorite(favorites.some(track => track.id === currentTrack.id));
    }
  }, [currentTrack, favorites]);

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !currentTrack || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newProgress = percent * duration;
    
    // Update progress in context
    setProgress(newProgress);
    
    // Seek in audio element by accessing it through the context
    if (audioRef && audioRef.current) {
      audioRef.current.currentTime = newProgress;
    }
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    if (!currentTrack) return;
    
    if (isFavorite) {
      // Remove from favorites
      removeFromFavorites(currentTrack.id);
    } else {
      // Add to favorites
      addToFavorites(currentTrack);
    }
    setIsFavorite(!isFavorite);
  };

  // Don't render if there's no current track
  if (!currentTrack) return null;

  return (
    <>
      {/* Minimized Player */}
      {isMinimized && (
        <div className="fixed bottom-4 right-4 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50">
          <div className="flex items-center p-3">
            <div className="relative">
              <img 
                src={currentTrack.coverImage} 
                alt={currentTrack.title} 
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                <button 
                  onClick={togglePlayPause}
                  className="text-white hover:text-[#FF4D67] transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">{currentTrack.title}</h4>
              <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleMinimize}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5"></path>
                </svg>
              </button>
              
              <button 
                onClick={closePlayer}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Player Modal */}
      {!isMinimized && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-white font-bold">Now Playing</h3>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={toggleMinimize}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <button 
                  onClick={closePlayer}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Album Art */}
            <div className="p-6 flex justify-center">
              <div className="relative">
                <img 
                  src={currentTrack.coverImage} 
                  alt={currentTrack.title} 
                  className="w-64 h-64 rounded-2xl object-cover shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
              </div>
            </div>
            
            {/* Track Info */}
            <div className="px-6 pb-4 text-center">
              <h2 className="text-2xl font-bold text-white truncate">{currentTrack.title}</h2>
              <p className="text-[#FF4D67] mt-1">{currentTrack.artist}</p>
            </div>
            
            {/* Progress Bar */}
            <div className="px-6 pb-4">
              <div 
                ref={progressRef}
                onClick={handleProgressClick}
                className="w-full h-1.5 bg-gray-700 rounded-full cursor-pointer group"
              >
                <div 
                  className="h-full bg-[#FF4D67] rounded-full relative"
                  style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#FF4D67] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="px-6 pb-6">
              <div className="flex justify-center items-center space-x-8">
                <button 
                  onClick={playPreviousTrack}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"></path>
                  </svg>
                </button>
                
                <button 
                  onClick={togglePlayPause}
                  className="w-12 h-12 rounded-full bg-[#FF4D67] flex items-center justify-center text-white hover:bg-[#ff3350] transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                    </svg>
                  )}
                </button>
                
                <button 
                  onClick={playNextTrack}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"></path>
                  </svg>
                </button>
              </div>
              
              <div className="flex justify-center items-center mt-6 space-x-6">
                <button 
                  onClick={toggleFavorite}
                  className={`text-gray-400 hover:text-white transition-colors ${isFavorite ? 'text-red-500' : ''}`}
                >
                  <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </button>
                
                <button 
                  onClick={() => addToPlaylist(currentTrack)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModernAudioPlayer;