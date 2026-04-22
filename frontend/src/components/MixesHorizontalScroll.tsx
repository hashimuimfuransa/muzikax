'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaPlay, FaPause, FaHeart } from 'react-icons/fa';

interface Track {
  _id: string;
  title: string;
  creatorId: {
    name: string;
    _id: string;
  } | string;
  coverURL?: string;
  audioURL: string;
  plays?: number;
  likes?: number;
  type?: 'song' | 'beat' | 'mix';
}

interface MixesHorizontalScrollProps {
  title?: string;
  viewAllLink?: string;
}

const MixesHorizontalScroll = ({ title, viewAllLink = '/mixes' }: MixesHorizontalScrollProps) => {
  const { t } = useLanguage();
  const displayTitle = title || t('popularMixes');
  const [mixes, setMixes] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentTrack, isPlaying, playTrack, setCurrentPlaylist, favorites, favoritesLoading, addToFavorites, removeFromFavorites } = useAudioPlayer();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position and update button states
  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Initial check and add event listener
  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      // Also check on window resize
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, [mixes]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of typical card + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // State for tracking which tracks are favorited
  const [favoriteStatus, setFavoriteStatus] = useState<Record<string, boolean>>({});

  // Update favorite status when favorites change or when favorites are loaded
  useEffect(() => {
    if (!favoritesLoading) {
      const status: Record<string, boolean> = {};
      favorites.forEach(track => {
        status[track.id] = true;
      });
      setFavoriteStatus(status);
    }
  }, [favorites, favoritesLoading]);

  // Fetch mixes from API
  useEffect(() => {
    const fetchMixes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/type?type=mix&limit=20`);
        
        if (response.ok) {
          const data: Track[] = await response.json();
          
          // Filter out tracks without audio URLs
          const filteredData = data.filter((track: any) => 
            track.audioURL && track.audioURL.trim() !== ''
          );
          
          setMixes(filteredData);
        } else {
          throw new Error(`Failed to fetch mixes: ${response.status}`);
        }
      } catch (err: any) {
        console.error('Error fetching mixes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMixes();
  }, []);

  // Toggle favorite status for a track
  const toggleFavorite = (trackId: string, track: any) => {
    if (favoriteStatus[trackId]) {
      // Remove from favorites
      removeFromFavorites(trackId);
    } else {
      // Add to favorites
      addToFavorites({
        id: track._id,
        title: track.title,
        artist: typeof track.creatorId === 'object' && track.creatorId !== null 
          ? (track.creatorId as any).name 
          : 'Unknown Artist',
        coverImage: track.coverURL || '',
        audioUrl: track.audioURL || '',
        creatorId: typeof track.creatorId === 'object' && track.creatorId !== null 
          ? (track.creatorId as any)._id 
          : track.creatorId
      });
    }
  };

  // Play a track and set the playlist
  const handlePlayTrack = (track: Track) => {
    const trackToPlay = {
      id: track._id,
      title: track.title,
      artist: typeof track.creatorId === 'object' && track.creatorId !== null 
        ? (track.creatorId as any).name 
        : 'Unknown Artist',
      coverImage: track.coverURL || '',
      audioUrl: track.audioURL,
      creatorId: typeof track.creatorId === 'object' && track.creatorId !== null 
        ? (track.creatorId as any)._id 
        : track.creatorId
    };

    playTrack(trackToPlay);

    // Set the current playlist to all mixes
    const playlistTracks = mixes
      .filter((t) => t.audioURL) // Only tracks with audio
      .map((t) => ({
        id: t._id,
        title: t.title,
        artist: typeof t.creatorId === 'object' && t.creatorId !== null 
          ? (t.creatorId as any).name 
          : 'Unknown Artist',
        coverImage: t.coverURL || '',
        audioUrl: t.audioURL,
        creatorId: typeof t.creatorId === 'object' && t.creatorId !== null 
          ? (t.creatorId as any)._id 
          : t.creatorId
      }));
      
    setCurrentPlaylist(playlistTracks);
  };

  if (loading) {
    return (
      <section className="px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{displayTitle}</h2>
          <Link href={viewAllLink} className="text-[#FF8C00] hover:text-[#FFB020] transition-colors">
            {t('viewAll')}
          </Link>
        </div>
        <div className="flex overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex space-x-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-64 bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse">
                <div className="w-full h-40 bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{displayTitle}</h2>
          <Link href={viewAllLink} className="text-[#FF8C00] hover:text-[#FFB020] transition-colors">
            {t('viewAll')}
          </Link>
        </div>
        <div className="text-red-500">Error loading mixes: {error}</div>
      </section>
    );
  }

  if (mixes.length === 0) {
    return null; // Don't render anything if there are no mixes
  }

  return (
    <section className="px-4 md:px-6 py-8">
      <div className="flex justify-between items-center mb-6 group">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent transition-all duration-300 group-hover:from-amber-400 group-hover:via-orange-500 group-hover:to-amber-600">
              {displayTitle}
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 group-hover:w-full" />
          </span>
        </h2>
        <Link href={viewAllLink} className="text-xs font-semibold text-white/70 hover:text-amber-300 transition-all duration-300 uppercase tracking-widest hover:underline decoration-amber-400 decoration-2 underline-offset-4 relative group/btn overflow-hidden">
          <span className="relative z-10">{t('viewAll')}</span>
          <span className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left" />
        </Link>
      </div>
      <div className="relative group/scroll">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-4 scrollbar-hide -mx-4 md:-mx-6 px-4 md:px-6 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-4">
            {mixes.map((track) => {
              const artistName = typeof track.creatorId === 'object' && track.creatorId !== null 
                ? (track.creatorId as any).name 
                : 'Unknown Artist';
              
              const isActive = currentTrack?.id === track._id;
              
              return (
                <div 
                  key={track._id} 
                  className={`flex-shrink-0 w-64 group/card bg-[#0a0604] rounded-2xl overflow-hidden transition-all duration-500 border border-[#1F2937] hover:border-[#374151] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#F59E0B]/20 ${
                    isActive ? 'ring-2 ring-[#F59E0B] shadow-lg shadow-[#F59E0B]/30 scale-[1.02]' : ''
                  }`}
                >
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                  
                  <div className="relative">
                    {track.coverURL ? (
                      <img
                        src={track.coverURL}
                        alt={track.title}
                        className="w-full h-40 object-cover transition-transform duration-500 group-hover/card:scale-110"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-[#F59E0B] to-[#FFB020] flex items-center justify-center transition-transform duration-500 group-hover/card:scale-110">
                        <span className="text-2xl font-bold text-black">
                          {track.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className="w-12 h-12 rounded-full bg-[#F59E0B] flex items-center justify-center text-black opacity-0 group-hover/card:opacity-100 transform translate-y-2 group-hover/card:translate-y-0 transition-all duration-300 shadow-lg shadow-[#F59E0B]/30 hover:shadow-[#F59E0B]/50 hover:scale-110"
                        disabled={!track.audioURL}
                      >
                        {isActive && isPlaying ? (
                          <FaPause className="w-5 h-5" />
                        ) : (
                          <FaPlay className="w-5 h-5 ml-1" />
                        )}
                      </button>
                    </div>
                    
                    {/* Now Playing Badge */}
                    {isActive && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-[#F59E0B] text-black text-[10px] font-bold rounded-full shadow-lg animate-pulse">
                        ▶ {t('nowPlaying')}
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track._id, track);
                        }}
                        className="p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover/card:opacity-100 transition-all duration-300 hover:scale-110"
                      >
                        <FaHeart 
                          className={`w-4 h-4 ${favoriteStatus[track._id] ? 'text-red-500 fill-current scale-110' : 'text-white'}`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  {/* Track Info */}
                  <div className="p-4">
                    <h3 className={`font-bold text-lg mb-1 truncate transition-colors duration-300 ${
                      isActive ? 'text-[#F59E0B]' : 'text-white group-hover/card:text-white'
                    }`} title={track.title}>
                      {track.title}
                    </h3>
                    <p className="text-[#9CA3AF] text-sm mb-1 truncate group-hover/card:text-[#F5DEB3] transition-colors" title={artistName}>
                      {artistName}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-white/10">
                      <span className="group-hover/card:text-amber-400/80 transition-colors">{(track.plays || 0).toLocaleString()} {t('plays')}</span>
                      <div className="flex items-center gap-1">
                        <FaHeart className="w-3 h-3" />
                        <span>{track.likes || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Buttons with Modern Styling */}
        <button 
          className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-800/80 backdrop-blur-lg flex items-center justify-center text-white shadow-xl hover:bg-[#F59E0B]/80 transition-all duration-300 hover:scale-110 opacity-0 group-hover/scroll:opacity-100"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button 
          className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-800/80 backdrop-blur-lg flex items-center justify-center text-white shadow-xl hover:bg-[#F59E0B]/80 transition-all duration-300 hover:scale-110 opacity-0 group-hover/scroll:opacity-100"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </section>
  );
};

export default MixesHorizontalScroll;