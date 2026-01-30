'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useAudioPlayer } from '../../contexts/AudioPlayerContext'
import { getRecentlyPlayed } from '../../services/recentlyPlayedService'

interface Track {
  _id: string
  id: string
  title: string
  artist: string
  album?: string
  plays: number
  likes: number
  coverImage: string
  coverURL?: string
  duration?: number
  audioUrl: string
  creatorId?: string
  playedAt: string
}

export default function RecentlyPlayed() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { currentTrack, isPlaying, playTrack, setCurrentPlaylist, favorites, favoritesLoading, addToFavorites, removeFromFavorites } = useAudioPlayer()

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

  // Listen for favorites loaded event to update favorite status
  useEffect(() => {
    const handleFavoritesLoaded = () => {
      const status: Record<string, boolean> = {};
      favorites.forEach(track => {
        status[track.id] = true;
      });
      setFavoriteStatus(status);
    };

    // Add event listener
    window.addEventListener('favoritesLoaded', handleFavoritesLoaded);

    // Clean up event listener
    return () => {
      window.removeEventListener('favoritesLoaded', handleFavoritesLoaded);
    };
  }, [favorites]);

  // Toggle favorite status for a track
  const toggleFavorite = (trackId: string) => {
    if (favoriteStatus[trackId]) {
      // Remove from favorites
      removeFromFavorites(trackId);
    } else {
      // Add to favorites
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        addToFavorites({
          id: track._id,
          title: track.title,
          artist: track.artist,
          coverImage: track.coverImage,
          audioUrl: track.audioUrl,
          creatorId: track.creatorId
        });
      }
    }
  };

  // Listen for track updates (when favorites are added/removed)
  useEffect(() => {
    const handleTrackUpdate = (event: CustomEvent) => {
      const detail = event.detail;
      if (detail && detail.trackId) {
        // Update favorite status if provided
        if (detail.isFavorite !== undefined) {
          setFavoriteStatus(prev => ({
            ...prev,
            [detail.trackId]: detail.isFavorite
          }));
        }
        
        // Re-fetch recently played tracks to update like counts
        fetchRecentlyPlayed();
      }
    };

    // Add event listener
    window.addEventListener('trackUpdated', handleTrackUpdate as EventListener);

    // Clean up event listener
    return () => {
      window.removeEventListener('trackUpdated', handleTrackUpdate as EventListener);
    };
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    // Don't redirect while loading
    if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to login
      router.push('/login')
    }
  }, [isAuthenticated, router, isLoading])

  // Fetch recently played tracks
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchRecentlyPlayed()
    }
  }, [isAuthenticated, isLoading])

  const fetchRecentlyPlayed = async () => {
    try {
      setLoading(true)
      const tracksData = await getRecentlyPlayed()
      
      // Transform the data to match our Track interface
      const transformedTracks = tracksData.map((track: any) => ({
        _id: track._id,
        id: track._id,
        title: track.title,
        artist: typeof track.creatorId === 'object' && track.creatorId !== null ? track.creatorId.name : 'Unknown Artist',
        album: '',
        plays: track.plays,
        likes: track.likes,
        coverImage: track.coverURL || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        coverURL: track.coverURL,
        duration: undefined,
        audioUrl: track.audioURL,
        creatorId: typeof track.creatorId === 'object' && track.creatorId !== null ? track.creatorId._id : track.creatorId,
        playedAt: track.playedAt
      }))

      setTracks(transformedTracks)
    } catch (error) {
      console.error('Error fetching recently played tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Don't render the recently played if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-2">
                Recently Played
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Your recently played tracks
              </p>
            </div>
            <button 
              onClick={() => router.push('/explore')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-transparent border border-[#FF4D67] text-[#FF4D67] hover:bg-[#FF4D67]/10 rounded-full text-xs sm:text-sm font-medium transition-colors"
            >
              Explore More
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="text-white text-sm">Loading recently played tracks...</div>
            </div>
          ) : tracks.length === 0 ? (
            // Empty State
            <div className="card-bg rounded-2xl p-8 sm:p-12 text-center border border-gray-700/50">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">No recently played tracks</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start listening to music and your recently played tracks will appear here
              </p>
              <button 
                onClick={() => router.push('/explore')}
                className="px-5 py-2.5 sm:px-6 sm:py-3 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                Explore Music
              </button>
            </div>
          ) : (
            // Recently Played List
            <div className="space-y-4">
              {tracks.map((track) => (
                <div key={track.id} className="card-bg rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50">
                  <div className="relative">
                    <img 
                      src={track.coverImage} 
                      alt={track.title} 
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                    />
                    <button 
                      onClick={() => {
                        playTrack(track);
                        
                        // Set the current playlist to all recently played tracks
                        setCurrentPlaylist(tracks);
                      }}
                      className="absolute inset-0 w-full h-full rounded-lg bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm sm:text-base truncate">{track.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">{track.artist}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Played {new Date(track.playedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs sm:text-sm hidden sm:block">
                      {track.duration ? `${Math.floor(track.duration / 60)}:${Math.floor(track.duration % 60).toString().padStart(2, '0')}` : '3:45'}
                    </span>
                    <button 
                      onClick={() => toggleFavorite(track.id)}
                      className="p-1.5 sm:p-2 rounded-full hover:bg-gray-800/50 transition-all duration-300 hover:scale-110"
                    >
                      <svg 
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${favoriteStatus[track.id] ? 'text-red-500 fill-current scale-110' : 'text-[#FF4D67] stroke-current'}`}
                        fill={favoriteStatus[track.id] ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}