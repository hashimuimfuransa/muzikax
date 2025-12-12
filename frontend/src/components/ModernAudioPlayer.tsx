'use client';

import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import PlaylistSelectionModal from './PlaylistSelectionModal'; // Added import

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
    favorites,
    audioRef
  } = useAudioPlayer();
  
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const progressRef = useRef<HTMLDivElement>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false); // Added state for modal

  // Check if current track is in favorites
  useEffect(() => {
    if (currentTrack) {
      setIsFavorite(favorites.some(track => track.id === currentTrack.id));
    }
  }, [currentTrack, favorites]);

  // Toast notification effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
      setToast({message: 'Removed from favorites!', type: 'success'});
    } else {
      // Add to favorites
      addToFavorites(currentTrack);
      setToast({message: 'Added to favorites!', type: 'success'});
    }
    setIsFavorite(!isFavorite);
  };

  // Navigate to full player page
  const goToFullPlayer = () => {
    router.push('/player');
  };

  // Handle adding to playlist
  const handleAddToPlaylist = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setIsPlaylistModalOpen(true);
  };

  // Handle track added to playlist
  const handleTrackAdded = () => {
    setToast({message: 'Added to playlist!', type: 'success'});
  };

  // No longer redirect to full player page automatically
  // The player will stay minimized and visible on all pages
  // Users can click the expand button to go to the full player page

  // Don't render if there's no current track
  if (!currentTrack) return null;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.message}
        </div>
      )}
      
      {/* Playlist Selection Modal */}
      <PlaylistSelectionModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onTrackAdded={handleTrackAdded}
      />
      
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
                onClick={handleAddToPlaylist} // Changed to use the new function
                className="text-gray-400 hover:text-white transition-colors"
                title="Add to playlist"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd"></path>
                </svg>
              </button>
              
              <button 
                onClick={goToFullPlayer}
                className="text-gray-400 hover:text-white transition-colors"
                title="Expand player"
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

      {/* Full Player - Only show when on the player page */}
      {!isMinimized && currentTrack && (
        <div className="hidden">
          {/* This div ensures the component renders but doesn't display anything */}
          {/* The actual full player is rendered on the /player page */}
        </div>
      )}
    </>
  );
};

export default ModernAudioPlayer;