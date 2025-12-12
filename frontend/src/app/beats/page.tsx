'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTrendingTracks } from '../../hooks/useTracks'
import { useAudioPlayer } from '../../contexts/AudioPlayerContext'

interface Track {
  id: string
  title: string
  artist: string
  album?: string
  plays: number
  likes: number
  coverImage: string
  duration?: string
  category?: string
}

export default function PopularBeats() {
  const { tracks: trendingTracksData, loading: trendingLoading, refresh: refreshTrendingTracks } = useTrendingTracks(20)
  const { favorites, favoritesLoading, addToFavorites, removeFromFavorites } = useAudioPlayer()
  
  // State for tracking which tracks are favorited
  const [favoriteStatus, setFavoriteStatus] = useState<Record<string, boolean>>({})
  
  // Update favorite status when favorites change or when favorites are loaded
  useEffect(() => {
    if (!favoritesLoading) {
      const status: Record<string, boolean> = {}
      favorites.forEach(track => {
        status[track.id] = true
      })
      setFavoriteStatus(status)
    }
  }, [favorites, favoritesLoading])

  // Listen for favorites loaded event to update favorite status
  useEffect(() => {
    const handleFavoritesLoaded = () => {
      const status: Record<string, boolean> = {}
      favorites.forEach(track => {
        status[track.id] = true
      })
      setFavoriteStatus(status)
    }

    // Add event listener
    window.addEventListener('favoritesLoaded', handleFavoritesLoaded)

    // Clean up event listener
    return () => {
      window.removeEventListener('favoritesLoaded', handleFavoritesLoaded)
    }
  }, [favorites])
  
  // Toggle favorite status for a track
  const toggleFavorite = (trackId: string, track: any) => {
    if (favoriteStatus[trackId]) {
      // Remove from favorites
      removeFromFavorites(trackId)
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
      })
    }
  }
  
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
        
        // Refresh trending tracks to update like counts
        refreshTrendingTracks()
      }
    }
    
    // Add event listener
    window.addEventListener('trackUpdated', handleTrackUpdate as EventListener)
    
    // Clean up event listener
    return () => {
      window.removeEventListener('trackUpdated', handleTrackUpdate as EventListener)
    }
  }, [refreshTrendingTracks])
  
  // Mock data for beats
  const beatTracks: Track[] = [
    {
      id: '1',
      title: 'Afro Trap Beat',
      artist: 'Beat Master',
      plays: 14200,
      likes: 1100,
      coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '2:45',
      category: 'beats'
    },
    {
      id: '2',
      title: 'Urban Beats Collection',
      artist: 'City Producer',
      plays: 3200,
      likes: 280,
      coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:47',
      category: 'beats'
    },
    {
      id: '3',
      title: 'Rwandan Vibes Beat',
      artist: 'Kizito Beats',
      plays: 9800,
      likes: 756,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:22',
      category: 'beats'
    },
    {
      id: '4',
      title: 'Mountain Echo Beat',
      artist: 'Divine Beats',
      plays: 7600,
      likes: 540,
      coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '4:15',
      category: 'beats'
    },
    {
      id: '5',
      title: 'City Lights Beat',
      artist: 'Benji Flavours',
      plays: 12600,
      likes: 920,
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:18',
      category: 'beats'
    },
    {
      id: '6',
      title: 'Sunset Dreams Beat',
      artist: 'Remy Kayitesi',
      plays: 6700,
      likes: 480,
      coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '5:01',
      category: 'beats'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative py-8 sm:py-12 lg:py-16 overflow-hidden">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900/60"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-3 sm:mb-4">
              Popular Beats
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8">
              Discover the hottest beats from Rwandan producers and beat makers
            </p>
          </div>
        </div>
      </div>

      {/* Beats Grid */}
      <div className="container mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {beatTracks.map((track) => (
            <div key={track.id} className="group card-bg rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
              <div className="relative">
                <img 
                  src={track.coverImage} 
                  alt={track.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                </div>
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Since this is mock data, we'll create a mock track object
                      const mockTrack = {
                        _id: track.id,
                        title: track.title,
                        creatorId: { name: track.artist },
                        coverURL: track.coverImage,
                        audioURL: ''
                      };
                      toggleFavorite(track.id, mockTrack);
                    }}
                    className="p-1.5 sm:p-2 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  >
                    <svg 
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${favoriteStatus[track.id] ? 'text-red-500 fill-current scale-110' : 'stroke-current'}`}
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
              
              <div className="p-4 sm:p-5">
                <h3 className="font-bold text-white text-lg mb-1 truncate">{track.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-1 truncate">{track.artist}</p>
                {track.album && <p className="text-gray-500 text-xs sm:text-sm mb-3 truncate">{track.album}</p>}
                
                <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                  <span>{track.plays.toLocaleString()} plays</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                    </svg>
                    <span>{track.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}