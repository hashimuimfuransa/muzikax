'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
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

const MixesHorizontalScroll = ({ title = 'Popular Mixes', viewAllLink = '/mixes' }: MixesHorizontalScrollProps) => {
  const [mixes, setMixes] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentTrack, isPlaying, playTrack, setCurrentPlaylist, favorites, favoritesLoading, addToFavorites, removeFromFavorites } = useAudioPlayer();

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
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <Link href={viewAllLink} className="text-[#FF4D67] hover:text-[#FFCB2B] transition-colors">
            View All
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
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <Link href={viewAllLink} className="text-[#FF4D67] hover:text-[#FFCB2B] transition-colors">
            View All
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <Link href={viewAllLink} className="text-[#FF4D67] hover:text-[#FFCB2B] transition-colors">
          View All
        </Link>
      </div>
      <div className="flex overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex space-x-4">
          {mixes.map((track) => {
            const artistName = typeof track.creatorId === 'object' && track.creatorId !== null 
              ? (track.creatorId as any).name 
              : 'Unknown Artist';
            
            return (
              <div 
                key={track._id} 
                className="flex-shrink-0 w-64 group card-bg rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10"
              >
                <div className="relative">
                  {track.coverURL ? (
                    <img
                      src={track.coverURL}
                      alt={track.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {track.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handlePlayTrack(track)}
                      className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                      disabled={!track.audioURL}
                    >
                      {currentTrack?.id === track._id && isPlaying ? (
                        <FaPause className="w-5 h-5" />
                      ) : (
                        <FaPlay className="w-5 h-5 ml-1" />
                      )}
                    </button>
                  </div>
                  
                  {/* Favorite Button */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track._id, track);
                      }}
                      className="p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      <FaHeart 
                        className={`w-4 h-4 ${favoriteStatus[track._id] ? 'text-red-500 fill-current scale-110' : 'text-white'}`}
                      />
                    </button>
                  </div>
                </div>
                
                {/* Track Info */}
                <div className="p-4">
                  <h3 className="font-bold text-white text-lg mb-1 truncate" title={track.title}>
                    {track.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-1 truncate" title={artistName}>
                    {artistName}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{(track.plays || 0).toLocaleString()} plays</span>
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
    </section>
  );
};

export default MixesHorizontalScroll;